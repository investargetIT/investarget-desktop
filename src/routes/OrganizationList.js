import React from 'react'
import { Link } from 'dva/router'
import { i18n, showError } from '../utils/util'
import * as api from '../api'

import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { OrganizationListFilter } from '../components/Filter'
import { Search } from '../components/Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class OrganizationList extends React.Component {

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

  deleteOrg = (id) => {
    this.setState({ loading: true })
    api.deleteOrg(id).then(result => {
      this.getOrg()
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  componentDidMount() {
    this.getOrg()
  }

  render() {

    const columns = [
      { title: '名称', key: 'orgname', dataIndex: 'orgname' },
      { title: '行业', key: 'industry', dataIndex: 'industry.industry' },
      { title: '货币类型', key: 'currency', dataIndex: 'currency.currency' },
      { title: '决策周期（天）', key: 'decisionCycle', dataIndex: 'decisionCycle' },
      { title: '轮次', key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return phases.map(p => p.name).join(' ')
      } },
      { title: '股票代码', key: 'orgcode', dataIndex: 'orgcode' },
      { title: '操作', key: 'action', render: (text, record) => (
          <span>
            <Link to={'/app/organization/' + record.id}>
              <Button disabled={!record.action.get} size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to={'/app/organization/edit/' + record.id}>
              <Button disabled={!record.action.change} size="small" >{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.deleteOrg.bind(null, record.id)}>
              <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle
            title={i18n('organization.org_list')}
            actionLink="/app/organization/add"
            actionTitle={i18n('organization.new_org')}
          />
          <div>
            <OrganizationListFilter value={filters} onChange={this.handleFiltersChange} onSearch={this.handleFilt} onReset={this.handleReset} />
            <Search value={search} onChange={this.handleSearchChange} onSearch={this.handleSearch} />
            <Table style={tableStyle} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
            <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
          </div>
        </div>
      </MainLayout>
    )

  }

}

export default OrganizationList
