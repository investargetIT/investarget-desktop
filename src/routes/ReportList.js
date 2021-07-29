import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo, i18n, handleError, hasPerm, getCurrentUser, getURLParamValue } from '../utils/util';
import { connect } from 'dva';
import { Icon, Table, Pagination, Popconfirm, Select, Button, Modal } from 'antd';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { Link, withRouter } from 'dva/router';
import { WorkReportFilter } from '../components/Filter';
import moment from 'moment';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const Option = Select.Option;

const actionStyle = {
  float: 'right',
  fontSize: 16,
  textDecoration: 'underline',
  color: '#428bca',
}

class ReportList extends React.Component {

  constructor(props) {
    super(props);

    // const { date } = props.location.query;
    const date = getURLParamValue(props, 'date');
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
      newReportDate: 'this_week',
      displayReportDateModal: false,
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

  handleCreateReportBtnClick = () => {
    this.setState({ displayReportDateModal: false });
    let destination = '/app/report/add';
    if (this.state.newReportDate === 'last_week') {
      const lastWeek = moment().subtract(1, 'weeks').format('YYYY-MM-DD');
      destination += `?date=${lastWeek}`;
    }
    this.props.history.push(destination);
  }

  render() {
    const { location } = this.props;
    const { total, list, loading, page, pageSize } = this.state;
    const columns = [
      { title: '姓名', key: 'user', dataIndex: ['user', 'username'] },
      { title: '开始时间', key: 'startTime', dataIndex: 'startTime', render: text => text.slice(0, 10) },
      { title: '截止时间', key: 'endTime', dataIndex: 'endTime', render: text => text.slice(0, 10) },
      {
        title: '操作', key: 'operation', render: (text, record) => {
          return (
            <div>
              <Link to={`/app/report/${record.id}`} target="_blank" style={{ marginRight: 10 }}>
                <EyeOutlined style={{ fontSize: '16px' }} />
              </Link>
              {record.user.id === getCurrentUser() &&
                <Link to={`/app/report/edit/${record.id}`} style={{ marginRight: 10 }}>
                  <EditOutlined style={{ fontSize: '16px' }} />
                </Link>
              }
              <Popconfirm title={i18n("delete_confirm")} onConfirm={this.deleteReportItem.bind(this, record)}>
                <Button type="link">
                  <DeleteOutlined style={{ fontSize: '16px' }} />
                </Button>
              </Popconfirm>
            </div>
          );
        }
      },
    ]

    // const rightAction = (
    //   <div>
    //     <Select
    //       value={this.state.newReportDate}
    //       className="customized-select-component"
    //       style={{ width: 120 }}
    //       onChange={newReportDate => this.setState({ newReportDate })}
    //     >
    //       <Option value="this_week">填写本周周报</Option>
    //       <Option value="last_week">填写上周周报</Option>
    //     </Select>
    //     <Button type="primary" style={{ marginLeft: 4 }} onClick={this.handleCreateReportBtnClick}>确定</Button>
    //   </div>
    // );

    return (
      <LeftRightLayout
        location={location}
        title="工作报告列表"
        // action={{name: '填写周报', link: "/app/report/add" }}
        right={<a style={actionStyle} onClick={() => this.setState({ displayReportDateModal: true })}>填写周报</a>}
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
        
        <Modal
          title="请选择要填写的周报日期"
          visible={this.state.displayReportDateModal}
          onOk={this.handleCreateReportBtnClick}
          onCancel={() => this.setState({ displayReportDateModal: false })}
        >
          <div style={{ textAlign: 'center' }}>
            <Select
              value={this.state.newReportDate}
              className="customized-select-component"
              style={{ width: 200 }}
              onChange={newReportDate => this.setState({ newReportDate })}
            >
              <Option value="this_week">本周</Option>
              <Option value="last_week">上周</Option>
            </Select>
          </div>
        </Modal>

      </LeftRightLayout>
    );
  }
}

export default connect()(withRouter(ReportList));
