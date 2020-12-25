import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo, i18n, handleError, hasPerm, getCurrentUser } from '../utils/util';
import { connect } from 'dva';
import { Icon, Table, Pagination, Popconfirm, Select, Button, Modal, Popover } from 'antd';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { Link, withRouter } from 'dva/router';
import { ProjectReportFilter } from '../components/Filter';
import moment from 'moment';
import _ from 'lodash';

const Option = Select.Option;

const actionStyle = {
  float: 'right',
  fontSize: 16,
  textDecoration: 'underline',
  color: '#428bca',
}

function tableToExcel(table, worksheetName) {
  var uri = 'data:application/vnd.ms-excel;base64,'
  var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
  var base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
  var format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

  var ctx = { worksheet: worksheetName, table: table.outerHTML }
  var href = uri + base64(format(template, ctx))
  return href
}

class ProjectReport extends React.Component {

  constructor(props) {
    super(props);

    const settings = this.readSetting();
    let filters = settings ? settings.filters : ProjectReportFilter.defaultValue;

    const { date } = props.location.query;
    if (date) {
      const startEndDate = [moment(date).startOf('week'), moment(date).startOf('week').add('days', 6)];
      filters = { startEndDate };
    }

    this.state = {
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      filters,
      projectListByOrgBd: [],

      loadingUser: false,
      userListByWeeklyReport: [],
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getProjectByOrgBd()
    this.getUserByWeeklyReport();
  }

  getUserByWeeklyReport = async () => {
    try {
      this.setState({ loadingUser: true });
      const { filters: { startEndDate } } = this.state;
      const startTime = startEndDate && startEndDate.length > 1 ? startEndDate[0].format('YYYY-MM-DD') : null;
      const endTime = startEndDate && startEndDate.length > 1 ? startEndDate[1].format('YYYY-MM-DD') : null;
      const page_size = 1000;
      const params = {
        startTime: startTime && hasPerm('BD.admin_getWorkReport') ? `${startTime}T00:00:00` : undefined,
        endTime: endTime && hasPerm('BD.admin_getWorkReport') ? `${endTime}T23:59:59` : undefined,
        sort: 'startTime',
        desc: 1,
        page_size,
      };
      let result = await api.getWorkReport(params);
      const { count: total } = result.data;
      if (total > page_size) {
        result = await api.getWorkReport({ ...params, page_size: total });
      }
      let { data: reportList } = result.data;

      if (reportList.length > 0) {
        const params1 = {
          report: reportList.map(m => m.id),
          page_size,
        };
        let result1 = await api.getWorkReportProjInfo(params1);
        const { count: total1 } = result1.data;
        if (total1 > page_size) {
          result1 = await api.getWorkReportProjInfo({ ...params, page_size: total1 });
        }
        let { data: reportProjInfoList } = result1.data;
        reportProjInfoList = reportProjInfoList.filter(f => f.thisPlan || f.nextPlan);
        reportList = reportList.map(m => {
          const projInfo = reportProjInfoList.filter(f => f.report === m.id);
          return { ...m, projInfo };
        });
      }

      this.setState({ userListByWeeklyReport: reportList });
    } catch (error) {
      handleError(error);
    } finally {
      this.setState({ loadingUser: false });
    }
  }

  getProjectByOrgBd = async () => {
    try {
      this.setState({ loading: true });

      const [start, end] = this.state.filters.startEndDate;
      const startDate = `${start.format('YYYY-MM-DD')}T00:00:00`;
      const endDate = `${end.format('YYYY-MM-DD')}T23:59:59`;

      const stime = startDate;
      const etime = endDate;
      const stimeM = startDate;
      const etimeM = endDate;
      const page_size = 1000;

      const params1 = { stimeM, etimeM, page_size };
      const params2 = { stime, etime, page_size };
      let res = await Promise.all([
        api.getOrgBdList(params1),
        api.getOrgBdList(params2),
      ]);
      res = await Promise.all(res.map((m, idx) => {
        if (m.data.count > 1000) {
          if (idx === 0) {
            return api.getOrgBdList({ ...params1, page_size: m.data.count });
          }
          if (idx === 1) {
            return api.getOrgBdList({ ...params2, page_size: m.data.count })
          }
        } else {
          return new Promise(resolve => {
            resolve(m);
          });
        }
      }));

      const allOrgBds = res.reduce((pre, cur) => pre.concat(cur.data.data), []);
      let orgBds = _.uniqBy(allOrgBds, 'id');

      orgBds = orgBds.filter(f => f.response && ![4, 5, 6].includes(f.response));

      const projs = orgBds.map(m => m.proj);
      const projIds = projs.map(m => m.id);
      const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
      const projOrgBds = uniqueProjIds.map(m => {
        const proj = projs.filter(f => f.id === m)[0];
        const bds = orgBds.filter(f => f.proj.id === m);
        return { proj, orgBds: bds };
      });

      this.setState({ projectListByOrgBd: projOrgBds, loading: false });
      this.writeSetting();
    } catch (error) {
      handleError(error);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProjectByOrgBd);
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getProjectByOrgBd);
  }

  writeSetting = () => {
    const [ start, end ] = this.state.filters.startEndDate;
    const startDate = `${start.format('YYYY-MM-DD')}`;
    const endDate = `${end.format('YYYY-MM-DD')}`;
    const startEndDate = [startDate, endDate];
    const data = { filters: { startEndDate } };
    localStorage.setItem('ProjectReport', JSON.stringify(data));
  }

  readSetting = () => {
    var data = localStorage.getItem('ProjectReport');
    if (!data) return null;
    const parsedData = JSON.parse(data);
    const { filters } = parsedData;
    const { startEndDate } = filters;
    const [ start, end ] = startEndDate;
    parsedData.filters.startEndDate = [moment(start), moment(end)];
    return parsedData;
  }

  downloadExportFile = () => {
    var link = document.createElement('a');
    link.download = '项目报表.xls';

    var table = document.querySelectorAll('table')[0];
    table.border = '1';

    var cells = table.querySelectorAll('td, th');
    cells.forEach(element => {
      element.style.textAlign = 'center';
      element.style.verticalAlign = 'middle';
    });

    link.href = tableToExcel(table, '项目报表');
    link.click();
  }

  downloadUserExcel = () => {
    const link = document.createElement('a');
    link.download = '员工报表.xls';

    const table = document.querySelectorAll('table')[1];
    table.border = '1';

    const cells = table.querySelectorAll('td, th');
    cells.forEach(element => {
      element.style.textAlign = 'center';
      element.style.verticalAlign = 'middle';
    });

    link.href = tableToExcel(table, '员工报表');
    link.click();
  }

  downloadExcel = () => {
    if (this.state.projectListByOrgBd.length > 0) {
      this.downloadExportFile();
    }
    if (this.state.userListByWeeklyReport.length > 0) {
      this.downloadUserExcel();
    }
  }

  render() {
    const { location } = this.props;
    const { total, list, loading, page, pageSize } = this.state;
    const columns = [
      { title: '项目名称', key: 'projtitle', dataIndex: 'proj.projtitle' },
      { title: '项目开始时间', key: 'startTime', dataIndex: 'proj.publishDate', render: text => text ? text.slice(0, 16).replace('T', ' ') : '' },
      {
        title: '机构BD更新情况', key: 'orgbd', render: (_, record) => {
          const htmlContent = record.orgBds.map(m => `机构：${m.org ? m.org.orgname : '暂无'}，投资人：${m.username || '暂无'}，职位：${m.usertitle ? m.usertitle.name : '暂无'}，交易师：${m.manager.username}，当前状态：${m.response ? this.props.orgbdres.filter(f => f.id === m.response)[0].name : '暂无'}，最新备注：${(m.BDComments && m.BDComments.length) ? m.BDComments[m.BDComments.length - 1].comments : '暂无'}`).join('\n');
          const contentWithoutLine = htmlContent.replace(/\n/g, ' ');
          return <Popover
            title="机构BD更新情况"
            content={<div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\n/g, '<br>') }}></div>}
          >
            <div style={{color: "#428bca"}}>{contentWithoutLine.length >= 24 ? (contentWithoutLine.substr(0, 22) + "...") : contentWithoutLine}</div>
          </Popover>
        }
      },
    ];

    const columnsForExport = [
      { title: '项目名称', key: 'projtitle', dataIndex: 'proj.projtitle' },
      { title: '项目开始时间', key: 'startTime', dataIndex: 'proj.publishDate', render: text => text ? text.slice(0, 16).replace('T', ' ') : '' },
      {
        title: '机构BD更新情况', key: 'orgbd', render: (_, record) => {
          return record.orgBds.map(m => `机构：${m.org ? m.org.orgname : '暂无'}，投资人：${m.username || '暂无'}，职位：${m.usertitle ? m.usertitle.name : '暂无'}，交易师：${m.manager.username}，当前状态：${m.response ? this.props.orgbdres.filter(f => f.id === m.response)[0].name : '暂无'}，最新备注：${(m.BDComments && m.BDComments.length) ? m.BDComments[m.BDComments.length - 1].comments : '暂无'}。`).join('\r\n');
        }
      },
    ];

    const columnsForUser = [
      { title: '员工姓名', key: 'username', dataIndex: 'user.username' },
      {
        title: '项目名称本周下周计划', key: 'proj_info', render: (_, record) => {
          if (!record.projInfo || record.projInfo.length === 0) return '暂无';
          const htmlContent = record.projInfo.map(m => `项目名称：${m.proj ? m.proj.projtitle : m.projTitle}，本周计划：${m.thisPlan || '暂无'}，下周计划：${m.nextPlan || '暂无'}`).join('\n');
          const contentWithoutLine = htmlContent.replace(/\n/g, ' ');
          return <Popover
            title="项目名称本周下周计划"
            content={<div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\n/g, '<br>') }}></div>}
          >
            <div style={{color: "#428bca"}}>{contentWithoutLine.length >= 24 ? (contentWithoutLine.substr(0, 22) + "...") : contentWithoutLine}</div>
          </Popover>
        }
      },
      {
        title: '市场信息和项目信息汇报', key: 'market', render: (_, record) => {
          if (!record.marketMsgs || record.marketMsgs.length === 0) return '暂无';
          const htmlContent = record.marketMsgs.map(m => m.marketMsg).join('\n');
          const contentWithoutLine = htmlContent.replace(/\n/g, ' ');
          return <Popover
            title="市场信息和项目信息汇报"
            content={<div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\n/g, '<br>') }}></div>}
          >
            <div style={{color: "#428bca"}}>{contentWithoutLine.length >= 24 ? (contentWithoutLine.substr(0, 22) + "...") : contentWithoutLine}</div>
          </Popover>
        }
      },
    ];

    const userColumnsForExport = [
      { title: '员工姓名', key: 'username', dataIndex: 'user.username' },
      {
        title: '项目名称本周下周计划', key: 'proj_info', render: (_, record) => {
          if (!record.projInfo || record.projInfo.length === 0) return '暂无';
          return record.projInfo.map(m => `项目名称：${m.proj ? m.proj.projtitle : m.projTitle}，本周计划：${m.thisPlan || '暂无'}，下周计划：${m.nextPlan || '暂无'}`).join('\r\n');
        }
      },
      {
        title: '市场信息和项目信息汇报', key: 'market', render: (_, record) => {
          if (!record.marketMsgs || record.marketMsgs.length === 0) return '暂无';
          return record.marketMsgs.map(m => m.marketMsg).join('\r\n');
        }
      },
    ];

    return (
      <LeftRightLayout location={location} title="项目报表">

        <ProjectReportFilter
          defaultValue={this.state.filters}
          onSearch={this.handleFilt}
          onReset={this.handleReset}
        />

        <Table
          style={{ display: 'none' }}
          columns={columnsForExport}
          dataSource={this.state.projectListByOrgBd}
          rowKey={record => record.proj.id}
          loading={loading}
          pagination={false}
        />

        <Table
          style={{ display: 'none' }}
          columns={userColumnsForExport}
          dataSource={this.state.userListByWeeklyReport}
          rowKey={record => record.id}
          loading={this.state.loadingUser}
          pagination={false}
        />

        <Table
          columns={columns}
          dataSource={this.state.projectListByOrgBd}
          rowKey={record => record.proj.id}
          loading={loading}
          pagination={false}
        />

        <Table
          style={{ marginTop: 40 }}
          columns={columnsForUser}
          dataSource={this.state.userListByWeeklyReport}
          rowKey={record => record.id}
          loading={this.state.loadingUser}
          pagination={false}
        />

        {(this.state.projectListByOrgBd.length > 0 || this.state.userListByWeeklyReport > 0) && 
          <Button
            style={{ marginTop: 16, backgroundColor: 'orange', border: 'none' }}
            type="primary"
            size="large"
            onClick={this.downloadExcel}>
            {i18n('project_library.export_excel')}
          </Button>
        }

      </LeftRightLayout>
    );
  }
}
function mapStateToProps(state) {
  const { orgbdres } = state.app;
  return { orgbdres };
}
export default connect(mapStateToProps)(withRouter(ProjectReport));
