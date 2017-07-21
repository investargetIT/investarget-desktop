import React from 'react'
import { Link } from 'dva/router'
import { i18n, showError } from '../utils/util'
import * as api from '../api'
import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { SelectNumber } from './ExtraInput'
import { Search } from './Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class SelectUserTransaction extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const param = { investoruser: this.props.userId }
    api.getUserRelation(param).then(result => {
      const data = result.data.data
      var options = []
      data.forEach(item => {
        const trader = item.traderuser
        if (trader) {
          options.push({ label: trader.username, value: trader.id })
        }
      })
      this.props.onOptionsChange(options)
    })
  }

  render() {
    console.log('>>>', this.props)
    return (
      <SelectNumber style={{width: '80px'}} options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    )
  }
}



class SelectUser extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: null,
      current: 0,
      pageSize: 10,
      _param: {},
      total: 0,
      list: [],
      loading: false,
      traderMap: {},
      traderOptionsMap: {},
    }
  }

  handleSearchChange = (search) => {
    this.setState({ search })
  }

  handleSearch = () => {
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.getUser)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getUser)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getUser)
  }

  getUser = () => {
    const { selectedOrgs } = this.props
    const { _params, page, pageSize, traderMap } = this.state

    const params = { ..._params, page_index: page, page_size: pageSize, org: selectedOrgs, groups: [1] }
    this.setState({ loading: true })
    api.getUser(params).then(result => {
      const { count: total, data: list } = result.data
      const investorList = list.filter(item => !!item.trader_relation)
      const _traderMap = {}
      investorList.forEach(item => {
        const investorId = item.id
        const traderId = item.trader_relation.traderuser.id
        if (!traderMap[investorId]) {
          _traderMap[investorId] = traderId
        }
      })
      this.setState({ total, list, loading: false, traderMap: { ...traderMap, ..._traderMap } })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  handleChangeTrader = (investorId, traderId) => {
    let { traderMap } = this.state
    traderMap = { ...traderMap, [investorId]: traderId }
    this.setState({ traderMap })

    const userList = this.props.value
    const index = _.findIndex(userList, function(item) {
      return item.investor == investorId
    })
    if (index > -1) {
      let user = { investor: investorId, trader: traderId }
      this.props.onChange([ ...userList.slice(0, index), user, ...userList.slice(index + 1) ])
    }
  }

  handleSelectChange = (investorIds) => {
    const { traderMap } = this.state
    const value = investorIds.map(investorId => {
      return { investor: investorId, trader: traderMap[investorId] }
    })
    this.props.onChange(value)
  }

  handleTraderOptionsChange = (investorId, traderOptions) => {
    const { traderOptionsMap } = this.state
    this.setState({
      traderOptionsMap: { ...traderOptionsMap, [investorId]: traderOptions }
    })
  }

  componentDidMount() {
    this.getUser()
  }

  render() {
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
      { title: '交易师', key: 'transaction', render: (text, record) => {
        const trader = record.trader_relation && record.trader_relation.traderuser
        return trader ? (
          <SelectUserTransaction
            userId={record.id}
            options={this.state.traderOptionsMap[record.id] || []}
            onOptionsChange={this.handleTraderOptionsChange.bind(this, record.id)}
            value={this.state.traderMap[record.id]}
            onChange={this.handleChangeTrader.bind(this, record.id)}
          />
        ) : null
      }}
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <div>
        <Search value={search} onChange={this.handleSearchChange} onSearch={this.handleSearch} />
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} onShowSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
      </div>
    )

  }

}

export default SelectUser
