import React from 'react'
import { 
  URI_11, 
  PAGE_SIZE_OPTIONS, 
} from '../constants';
import { getLogOfUserUpdate } from '../api'
import { 
  i18n, 
  handleError,
  getUserInfo,
} from '../utils/util';

import { Table, Pagination } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { Search2 } from '../components/Search'


class LogList extends React.Component {

  constructor(props) {
    super(props)

    const currentUser = getUserInfo();
    this.state = {
      search: null,
      page: 1,
      pageSize: (currentUser && currentUser.page) || 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  getLog = () => {
    const { search, page, pageSize } = this.state
    const params = { search, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    getLogOfUserUpdate(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      this.setState({ loading: false })
      handleError(error)
    })
  }

  handleSearch = (search) => {
    this.setState({ search }, this.getLog)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getLog)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getLog)
  }

  componentDidMount() {
    this.getLog()
  }

  render () {

    const columns = [
      {
        title: i18n('syslog.operated_item'),
        dataIndex: 'user_name',
        key: 'user_name'
      },
      {
        title: i18n('syslog.operation'),
        dataIndex: 'action',
        render: (text, record) => {
          return '修改用户'
        }
      },
      {
        title: i18n('syslog.modified_property'),
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: i18n('syslog.before_operation'),
        dataIndex: 'before',
        key: 'before'
      },
      {
        title: i18n('syslog.after_operation'),
        dataIndex: 'after',
        key: 'after'
      },
      {
        title: i18n('syslog.modified_time'),
        dataIndex: 'updatetime',
        key: 'updatetime',
        render: (text, record) => {
          return record.updatetime.slice(0,19).replace('T', ' ')
        }
      },
      {
        title: i18n('syslog.operator'),
        dataIndex: 'requestuser_name',
        key: 'requestuser_name'
      },
    ]

    const { search, page, pageSize, total, list, loading } = this.state

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("menu.log")}>

        <div style={{ marginBottom: '1.5em' }} className="clearfix">
          <Search2
            defaultValue={search}
            onSearch={this.handleSearch}
            style={{ width: '200px',float:'right'}}
            placeholder={[i18n('syslog.operated_item'), i18n('syslog.operator')].join(' / ')}
          />
        </div>

        <Table
          columns={columns}
          dataSource={list}
          loading={loading}
          rowKey={record => record.id}
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
    )
  }

}

export default LogList
