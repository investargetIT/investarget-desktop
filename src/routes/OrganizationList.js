import React from 'react'
import { Link } from 'dva/router'
import { i18n, hasPerm } from '../utils/util'
import * as api from '../api'
import { connect } from 'dva'
import { Button, Popconfirm, Modal, Table, Pagination, Select } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { OrganizationListFilter } from '../components/Filter'
import { Search2 } from '../components/Search'

const Option = Select.Option

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class OrganizationList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : OrganizationListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

    this.state = {
      filters,
      search,
      page,
      pageSize,
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
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort: this.sort }
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
    this.writeSetting()
  }

  handleSortChange = value => {
    this.sort = value === 'asc' ? true : false
    this.getOrg()
  }

  deleteOrg = (id) => {
    this.setState({ loading: true })
    api.deleteOrg(id).then(result => {
      this.getOrg()
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('OrganizationList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('OrganizationList')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getOrg()
  }

  render() {

    const columns = [
      { title: i18n('organization.name'), key: 'orgname', dataIndex: 'orgname' },
      { title: i18n('organization.industry'), key: 'industry', dataIndex: 'industry.industry' },
      { title: i18n('organization.currency'), key: 'currency', dataIndex: 'currency.currency' },
      { title: i18n('organization.decision_cycle'), key: 'decisionCycle', dataIndex: 'decisionCycle' },
      { title: i18n('organization.transaction_phase'), key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return <span className="span-phase">{phases.map(p => p.name).join(' / ')}</span>
      } },
      { title: i18n('organization.stock_code'), key: 'orgcode', dataIndex: 'orgcode' },
      { title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <span className="span-operation">
            <Link to={'/app/organization/' + record.id}>
              <Button disabled={!record.action.get} size="small" >{i18n("common.view")}</Button>
            </Link>

            <Link to={'/app/organization/edit/' + record.id}>
              <Button disabled={!record.action.change} size="small" >{i18n("common.edit")}</Button>
            </Link>

            <Popconfirm title={i18n('delete_confirm')} onConfirm={this.deleteOrg.bind(null, record.id)}>
              <Button type="danger" disabled={!record.action.delete} size="small">{i18n("common.delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <MainLayout location={this.props.location}>
        <div>
          { hasPerm('org.admin_addorg') || hasPerm('org.user_addorg') ?
          <PageTitle
            title={i18n('organization.org_list')}
            actionLink="/app/organization/add"
            actionTitle={i18n('organization.new_org')} />
          : <PageTitle title={i18n('organization.org_list')} /> }

          <div>
            <OrganizationListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />

            <div style={{ overflow: 'auto' }}>
              <div style={{ marginBottom: '16px', float: 'left' }}>
                <Search2 style={{ width: 250 }} placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')} defaultValue={search} onSearch={this.handleSearch} />
              </div>

              <div style={{ float: 'right' }}>
                {i18n('common.sort_by_created_time')}
                <Select defaultValue="desc" onChange={this.handleSortChange}>
                  <Option value="asc">{i18n('common.asc_order')}</Option>
                  <Option value="desc">{i18n('common.dec_order')}</Option>
                </Select>
              </div>
            </div>

            <Table style={tableStyle} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
            <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
          </div>
        </div>
      </MainLayout>
    )

  }

}

export default connect()(OrganizationList)
