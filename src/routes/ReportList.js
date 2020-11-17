import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo, i18n, handleError, hasPerm, getCurrentUser } from '../utils/util';
import { connect } from 'dva';
import { Icon, Table, Pagination, Popconfirm, Select, Button } from 'antd';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { Link } from 'dva/router';
import { WorkReportFilter } from '../components/Filter';
import moment from 'moment';

const Option = Select.Option;

class ReportList extends React.Component {

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
    }
  }

  componentDidMount() {
    this.getReportList()
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

  handlePageChange = (page) => {
    this.setState({ page }, this.getReportList);
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getReportList);
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

  handleChange = (value) => {
    window.echo('change value', value);
  }

  render() {
    const { location } = this.props;
    const { total, list, loading, page, pageSize } = this.state;
    const columns = [
      { title: '姓名', key: 'user', dataIndex: 'user.username' },
      { title: '开始时间', key: 'startTime', dataIndex: 'startTime', render: text => text.slice(0, 10) },
      { title: '截止时间', key: 'endTime', dataIndex: 'endTime', render: text => text.slice(0, 10) },
      {
        title: '操作', key: 'operation', render: (text, record) => {
          return (
            <div>
              <Link to={`/app/report/${record.id}`} target="_blank" style={{ marginRight: 10 }}>
                <Icon type="eye-o" style={{ fontSize: '16px' }} />
              </Link>
              {record.user.id === getCurrentUser() &&
                <Link to={`/app/report/edit/${record.id}`} style={{ marginRight: 10 }}>
                  <Icon type="edit" style={{ fontSize: '16px' }} />
                </Link>
              }
              <Popconfirm title={i18n("delete_confirm")} onConfirm={this.deleteReportItem.bind(this, record)}>
                <Link>
                  <Icon type="delete" style={{ fontSize: '16px' }} />
                </Link>
              </Popconfirm>
            </div>
          );
        }
      },
    ]

    const rightAction = (
      <div>
        填写
        <Select defaultValue="this_week" style={{ width: 70 }} onChange={this.handleChange}>
          <Option value="this_week">本周</Option>
          <Option value="last_week">上周</Option>
        </Select>
        周报
        <Button type="primary" style={{ marginLeft: 10 }}>确定</Button>
      </div>
    );

    return (
      <LeftRightLayout
        location={location}
        title="工作报告列表"
        // action={{name: '填写周报', link: "/app/report/add" }}
        right={rightAction}
      >

        {/* {hasPerm('BD.admin_getWorkReport') && */}
        <WorkReportFilter
          defaultValue={this.state.filters}
          onSearch={this.handleFilt}
          onReset={this.handleReset}
        />
        {/* } */}

        <Table
          columns={columns}
          dataSource={list}
          rowKey={record => record.id}
          loading={loading}
          pagination={false} />

        <Pagination
          className="ant-table-pagination"
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handlePageChange}
          showSizeChanger
          onShowSizeChange={this.handlePageSizeChange}
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      </LeftRightLayout>
    );
  }
}

export default connect()(ReportList);
