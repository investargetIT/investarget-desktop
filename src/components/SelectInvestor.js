import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'
import * as api from '../api'
import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { Search2 } from './Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class SelectInvestor extends React.Component {
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

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getInvestor)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getInvestor)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getInvestor)
  }

  getInvestor = () => {
    const { search, page, pageSize } = this.state
    const params = { traderuser: this.props.traderId, search, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getUserRelation(params).then(result => {
      const { count: total, data } = result.data
      const list = data.map(item => item.investoruser)
      this.setState({ loading: false, total, list })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleSelectChange = (value) => {
    this.props.onChange(value.map(item => ({ investor: item, trader: this.props.traderId })))
  }

  componentDidMount() {
    this.getInvestor()
  }

  render() {
    const { search, total, list, loading, page, pageSize } = this.state

    const rowSelection = {
      selectedRowKeys: this.props.value.map(item => item.investor),
      onChange: this.handleSelectChange,
    }

    const columns = [
      { title: '投资人', key: 'username', dataIndex: 'username' },
      { title: '所属机构', key: 'orgname', dataIndex: 'org.orgname' },
      { title: '职位', key: 'title', dataIndex: 'title.name' },
      { title: '电话', key: 'mobile', dataIndex: 'mobile' },
      { title: '邮箱', key: 'email', dataIndex: 'email' },
    ]

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Search2 style={{ width: 200 }} defaultValue={search} onSearch={this.handleSearch} />
        </div>
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} onShowSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
      </div>
    )
  }
}

export default connect()(SelectInvestor)
