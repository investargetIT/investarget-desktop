import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'
import * as api from '../api'

import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { OrganizationListFilter } from './Filter'
import { Search2 } from './Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class SelectOrganization extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      filters: OrganizationListFilter.defaultValue,
      search: null,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrg)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrg)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getOrg)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getOrg)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getOrg)
  }

  getOrg = () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize }
    if (this.props.traderId) {
      params['trader'] = this.props.traderId
    }
    this.setState({ loading: true })
    api.getOrg(params).then(result => {
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
        <OrganizationListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '24px' }}>
          <Search2 style={{ width: '200px' }} placeholder="机构名、股票代码" defaultValue={search} onSearch={this.handleSearch} />
        </div>
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
      </div>
    )

  }

}

export default connect()(SelectOrganization)
