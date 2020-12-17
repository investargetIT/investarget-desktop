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
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getProjectByOrgBd()
  }

  getProjectByOrgBd = async () => {
    this.setState({ loading: true });

    const [ start, end ] = this.state.filters.startEndDate;
    const startDate = `${start.format('YYYY-MM-DD')}T00:00:00`;
    const endDate = `${end.format('YYYY-MM-DD')}T23:59:59`;

    const stime = startDate;
    const etime = endDate;
    const stimeM = startDate;
    const etimeM = endDate;
    const page_size = 1000;

    const params1 = { stimeM, etimeM, page_size };
    const params2 = { stime, etime, page_size };
    const res = await Promise.all([
      api.getOrgBdList(params1),
      api.getOrgBdList(params2),
    ]);
    const allOrgBds = res.reduce((pre, cur) => pre.concat(cur.data.data), []);
    let orgBds =  _.uniqBy(allOrgBds, 'id');

    orgBds = orgBds.filter(f => f.response && ![4, 5, 6].includes(f.response));
    window.echo('orgbds', orgBds);

    const projs = orgBds.map(m => m.proj);
    const projIds = projs.map(m => m.id);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    const projOrgBds = uniqueProjIds.map(m => {
      const proj = projs.filter(f => f.id === m)[0];
      const bds = orgBds.filter(f => f.proj.id === m);
      return { proj, orgBds: bds };
    });

    window.echo('projOrgBds', projOrgBds);
    this.setState({ projectListByOrgBd: projOrgBds, loading: false });
    this.writeSetting();
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
    const { filters } = this.state;
    filters.startEndDate = startEndDate;
    const data = { filters };
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
    link.download = 'Projects.xls';

    var table = document.querySelectorAll('table')[0];
    table.border = '1';

    var cells = table.querySelectorAll('td, th');
    cells.forEach(element => {
      element.style.textAlign = 'center';
      element.style.verticalAlign = 'middle';
    });

    link.href = tableToExcel(table, '机构BD');
    link.click();
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
          columns={columns}
          dataSource={this.state.projectListByOrgBd}
          rowKey={record => record.proj.id}
          loading={loading}
          pagination={false}
        />

        {this.state.projectListByOrgBd.length > 0 &&
          <Button
            style={{ marginTop: 16, backgroundColor: 'orange', border: 'none' }}
            type="primary"
            size="large"
            onClick={this.downloadExportFile}>
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
