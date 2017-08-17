import React from 'react'
import { URI_11 } from '../constants'
import { getLogOfUserUpdate } from '../api'
import { i18n, handleError } from '../utils/util'

import { Table, Pagination } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { Search2 } from '../components/Search'


class LogList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      search: null,
      page: 1,
      pageSize: 10,
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
        title: "操作对象",
        dataIndex: 'user_name',
        key: 'user_name'
      },
      {
        title: "操作",
        dataIndex: 'action',
        render: (text, record) => {
          return '修改用户'
        }
      },
      {
        title: '修改属性',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '操作前',
        dataIndex: 'before',
        key: 'before'
      },
      {
        title: "操作后",
        dataIndex: 'after',
        key: 'after'
      },
      {
        title: "时间",
        dataIndex: 'updatetime',
        key: 'updatetime',
        render: (text, record) => {
          return record.updatetime.slice(0,19).replace('T', ' ')
        }
      },
      {
        title: "操作者",
        dataIndex: 'requestuser_name',
        key: 'requestuser_name'
      },
    ]

    const { search, page, pageSize, total, list, loading } = this.state

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("log_list")}>

        <div style={{ marginBottom: '1.5em' }}>
          <Search2
            defaultValue={search}
            onSearch={this.handleSearch}
            style={{ width: '200px' }}
            placeholder="操作对象、操作者"
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
          showQuickJumper />

      </LeftRightLayout>
    )
  }

}

export default LogList
