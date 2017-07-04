import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'

import { Input, Icon, Table, Button, Pagination, Popconfirm } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { OrganizationListFilter } from '../components/Filter'
import {
  RadioTrueOrFalse,
  CheckboxCurrencyType,
} from '../components/ExtraInput'
const Search = Input.Search






class OrganizationList extends React.Component {

  constructor(props) {
    super(props)
  }

  handleDelete = (id) => {
    this.props.dispatch({ type: 'organizationList/delete', payload: id })
  }


  handleFilterChange = (key, value) => {
    this.props.dispatch({ type: 'organizationList/setFilter', payload: { [key]: value } })
  }

  handleFilt = () => {
    this.props.dispatch({ type: 'organizationList/filt' })
  }

  handleReset = () => {
    this.props.dispatch({ type: 'organizationList/reset' })
  }

  handleSearchChange = (e) => {
    const search = e.target.value
    this.props.dispatch({ type: 'organizationList/setField', payload: { search } })
  }

  handleSearch = (search) => {
    this.props.dispatch({ type: 'organizationList/search' })
  }

  handlePageChange = (page, pageSize) => {
    this.props.dispatch({ type: 'organizationList/changePage', payload: page })
  }

  handleShowSizeChange = (current, pageSize) => {
    this.props.dispatch({ type: 'organizationList/changePageSize', payload: pageSize })
  }

  render() {
    const { location, total, list, loading, page_index, page_size, filter, search } = this.props

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
            <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(null, record.id)}>
              <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title={i18n('organization.org_list')} actionLink="/app/organization/add" actionTitle={i18n('organization.new_org')} />

          <OrganizationListFilter value={filter} onChange={this.handleFilterChange} onSearch={this.handleFilt} onReset={this.handleReset} />

          <div style={{marginBottom: '16px'}}>
            <Search value={search} onChange={this.handleSearchChange} placeholder="输入机构名称或机构代码" style={{width: 200}} onSearch={this.handleSearch} />
          </div>

          <Table
            columns={columns}
            dataSource={list}
            rowKey={record=>record.id}
            loading={loading}
            pagination={false} />

          <Pagination
            className="ant-table-pagination"
            total={total}
            current={page_index}
            pageSize={page_size}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handleShowSizeChange}
            showQuickJumper
          />
        </div>
      </MainLayout>
    )
  }

}


function mapStateToProps(state) {
  return { ...state.organizationList, loading: state.loading.effects['organizationList/get'] }
}

export default connect(mapStateToProps)(OrganizationList)
