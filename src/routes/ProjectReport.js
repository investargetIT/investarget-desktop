import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo, i18n, handleError, hasPerm, getCurrentUser } from '../utils/util';
import { connect } from 'dva';
import { Icon, Table, Pagination, Popconfirm, Select, Button, Modal, Popover } from 'antd';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { Link, withRouter } from 'dva/router';
import { WorkReportFilter } from '../components/Filter';
import moment from 'moment';
import _ from 'lodash';

const Option = Select.Option;

const actionStyle = {
  float: 'right',
  fontSize: 16,
  textDecoration: 'underline',
  color: '#428bca',
}

class ProjectReport extends React.Component {

  constructor(props) {
    super(props);

    const { date } = props.location.query;
    let filters = WorkReportFilter.defaultValue;
    if (date) {
      const startEndDate = [moment(date).startOf('week'), moment(date).startOf('week').add('days', 6)];
      filters = { startEndDate, search: '' };
    }

    this.state = {
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      filters,
      projectListByOrgBd: [],
    }
    this.startDate = '2019-07-20T00:00:00';
    this.endDate = '2020-12-16T23:59:59';
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getProjectByOrgBd()
  }

  getProjectByOrgBd = async () => {
    this.setState({ loading: true });
    const stime = this.startDate;
    const etime = this.endDate;
    const stimeM = this.startDate;
    const etimeM = this.endDate;
    const page_size = 1000;

    const params1 = { stimeM, etimeM, page_size };
    const params2 = { stime, etime, page_size };
    const res = await Promise.all([
      api.getOrgBdList(params1),
      api.getOrgBdList(params2),
    ]);
    const allOrgBds = res.reduce((pre, cur) => pre.concat(cur.data.data), []);
    const orgBds =  _.uniqBy(allOrgBds, 'id');

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
  }

  getReportList = () => {
    const { page, pageSize, filters: { startEndDate, search } } = this.state;
    const startTime = startEndDate && startEndDate.length > 1 ? startEndDate[0].format('YYYY-MM-DD') : null;
    const endTime = startEndDate && startEndDate.length > 1 ? startEndDate[1].format('YYYY-MM-DD') : null;
    const params = {
      startTime: startTime && hasPerm('BD.admin_getWorkReport') ? `${startTime}T00:00:00` : undefined,
      endTime: endTime && hasPerm('BD.admin_getWorkReport') ? `${endTime}T23:59:59` : undefined,
      search,
      page_index: page,
      page_size: pageSize,
      sort: 'startTime',
      desc: 1,
    };
    this.setState({ loading: true })
    api.getWorkReport(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  deleteReportItem = async item => {
    api.deleteWorkReport(item.id).then(this.getReportList).catch(handleError);
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getReportList);
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getReportList);
  }

  render() {
    const { location } = this.props;
    const { total, list, loading, page, pageSize } = this.state;
    const columns = [
      { title: '项目名称', key: 'projtitle', dataIndex: 'proj.projtitle' },
      { title: '项目开始时间', key: 'startTime', render: () => '2020-10-28 17:40:40' },
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
      { title: '项目开始时间', key: 'startTime', render: () => '2020-10-28 17:40:40' },
      {
        title: '机构BD更新情况', key: 'orgbd', render: (_, record) => {
          return record.orgBds.map(m => `机构：${m.org ? m.org.orgname : '暂无'}，投资人：${m.username || '暂无'}，职位：${m.usertitle ? m.usertitle.name : '暂无'}，交易师：${m.manager.username}，当前状态：${m.response ? this.props.orgbdres.filter(f => f.id === m.response)[0].name : '暂无'}，最新备注：${(m.BDComments && m.BDComments.length) ? m.BDComments[m.BDComments.length - 1].comments : '暂无'}。`).join('\r\n');
        }
      },
    ];

    return (
      <LeftRightLayout location={location} title="项目报表">

        <WorkReportFilter
          defaultValue={this.state.filters}
          onSearch={this.handleFilt}
          onReset={this.handleReset}
        />

        <Table
          columns={columns}
          dataSource={this.state.projectListByOrgBd}
          rowKey={record => record.proj.id}
          loading={loading}
          pagination={false}
        />

        <Table
          style={{ display: 'none' }}
          columns={columnsForExport}
          dataSource={this.state.projectListByOrgBd}
          rowKey={record => record.proj.id}
          loading={loading}
          pagination={false}
        />

      </LeftRightLayout>
    );
  }
}
function mapStateToProps(state) {
  const { orgbdres } = state.app;
  return { orgbdres };
}
export default connect(mapStateToProps)(withRouter(ProjectReport));
