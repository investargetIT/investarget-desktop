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
      { title: i18n('organization.orgname'), key: 'orgname', dataIndex: 'orgname' },
      { title: i18n('organization.industry'), key: 'industry', dataIndex: 'industry.industry' },
      { title: i18n('organization.currency'), key: 'currency', dataIndex: 'currency.currency' },
      { title: i18n('organization.transaction_phase'), key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return phases.map(p => p.name).join(' ')
      } },
      { title: i18n('organiztion.stock_code'), key: 'orgcode', dataIndex: 'orgcode' },
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <div>
        <OrganizationListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '24px' }}>
          <Search2 style={{ width: '250px' }} placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')} defaultValue={search} onSearch={this.handleSearch} />
        </div>
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
      </div>
    )

  }

}

export default connect()(SelectOrganization)
