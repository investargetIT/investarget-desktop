import React from 'react'
import { Link } from 'dva/router'
import { i18n, showError } from '../utils/util'
import * as api from '../api'

import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { OrganizationListFilter } from './Filter'
import { Search } from './Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class SelectOrganization extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      filters: {},
      search: null,
      current: 0,
      pageSize: 10,
      _param: {},
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleFiltersChange = (filters) => {
    this.setState({ filters })
  }

  handleFilt = () => {
    let { _params, filters } = this.state
    _params = { ..._params, ...filters }
    this.setState({ _params, page: 1 }, this.getOrg)
  }

  handleReset = () => {
    this.setState({ filters: {}, page: 1, _params: {} }, this.getOrg)
  }

  handleSearchChange = (search) => {
    this.setState({ search })
  }

  handleSearch = () => {
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.getOrg)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getOrg)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getOrg)
  }

  getOrg = () => {
    const { _params, page, pageSize } = this.state
    const params = { ..._params, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getOrg(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  componentDidMount() {
    this.getOrg()
  }

  render() {

    const rowSelection= {
      selectedRowKeys: this.props.value,
      onChange: this.props.onChange,
    }

    const columns = [
      { title: '名称', key: 'orgname', dataIndex: 'orgname' },
      { title: '行业', key: 'industry', dataIndex: 'industry.industry' },
      { title: '货币类型', key: 'currency', dataIndex: 'currency.currency' },
      { title: '轮次', key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return phases.map(p => p.name).join(' ')
      } },
      { title: '股票代码', key: 'orgcode', dataIndex: 'orgcode' },
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <div>
        <OrganizationListFilter value={filters} onChange={this.handleFiltersChange} onSearch={this.handleFilt} onReset={this.handleReset} />
        <Search value={search} onChange={this.handleSearchChange} onSearch={this.handleSearch} />
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
      </div>
    )

  }

}

export default SelectOrganization
