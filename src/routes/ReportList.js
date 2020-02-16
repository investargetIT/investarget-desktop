import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo } from '../utils/util';
import { connect } from 'dva';
import { Icon, Table, Pagination } from 'antd';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { Link } from 'dva/router';

class ReportList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  componentDidMount() {
    this.getReportList()
  }

  getReportList = () => {
    const { page, pageSize } = this.state
    const params = { page_index: page, page_size: pageSize }
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
              <Link to={`/app/report/${record.id}`}>
                <Icon type="eye-o" style={{ fontSize: '16px' }} />
              </Link>
              <Link style={{ margin: '0 10px' }}>
                <Icon type="edit" style={{ fontSize: '16px' }} />
              </Link>
              <Link>
                <Icon type="delete" style={{ fontSize: '16px' }} />
              </Link>
            </div>
          );
        }
      },
    ]
    return (
      <LeftRightLayout
        location={location}
        title="工作报告列表"
        action={{name: '填写周报', link: "/app/report/add" }}
      >
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
