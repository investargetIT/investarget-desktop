import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'
import * as api from '../api'
import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { SelectNumber, SelectUser } from './ExtraInput'
import { Search2 } from './Search'

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
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    return (
      <SelectNumber style={{width: '80px'}} options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    )
  }
}



class SelectOrgInvestorAndTrader extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: null,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
      traderMap: {},
      traderOptionsMap: {},
    }
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getUser)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getUser)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getUser)
  }

  getUser = () => {
    const { search, page, pageSize, traderMap } = this.state
    if (this.props.traderId) {
      let params = { search, page_index: page, page_size: pageSize, traderuser: this.props.traderId, orgs: this.props.selectedOrgs }
      this.setState({ loading: true })
      api.getUserRelation(params).then(result => {
        const { count: total, data: _list } = result.data
        const list = _list.map(item => item.investoruser)
        this.setState({ total, list, loading: false })
      }, error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    } else {
      let params = { search, page_index: page, page_size: pageSize, org: this.props.selectedOrgs, groups: this.investorGroupIds }
      this.setState({ loading: true })
      api.getUser(params).then(result => {
        const { count: total, data: list } = result.data
        // const investorList = list.filter(item => !!item.trader_relation)
        const investorList = list
        const _traderMap = {}
        investorList.forEach(item => {
          const investorId = item.id
          const traderId = item.trader_relation && item.trader_relation.traderuser.id
          if (!traderMap[investorId]) {
            _traderMap[investorId] = traderId
          }
        })
        this.setState({ total, list, loading: false, traderMap: { ...traderMap, ..._traderMap } })
      }, error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }
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

  handleSelectChange = (investorIds, rows) => {
    const { traderMap } = this.state
    const value = investorIds.map(investorId => {
      const org = rows.filter(f => f.id === investorId)[0].org.id;
      return {
        investor: investorId,
        trader: this.props.traderId ? this.props.traderId : traderMap[investorId],
        org
      }
    }).filter(item => item.trader != null)
    this.props.onChange(value)
  }

  handleSelect = (record) => {
    echo('record', record);
    // if (!this.props.options && record.trader_relation == null) {
    //   Modal.warning({
    //     title: '请先分配交易师',
    //   })
    // }
  }

  handleTraderOptionsChange = (investorId, traderOptions) => {
    const { traderOptionsMap } = this.state
    this.setState({
      traderOptionsMap: { ...traderOptionsMap, [investorId]: traderOptions }
    })
  }

  getTrader = () => {
    api.getUserDetailLang(this.props.traderId).then(result => {
      const trader = result.data
      this.setState({ trader })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }

  componentDidMount() {
    api.queryUserGroup({ type: 'investor' }).then(data => {
      this.investorGroupIds = data.data.data.map(item => item.id)
      this.getUser()
      if (this.props.traderId) {
        this.getTrader()
      }
    })
  }

  render() {
    const rowSelection = {
      selectedRowKeys: this.props.value.map(item => item.investor),
      onChange: this.handleSelectChange,
      onSelect: this.handleSelect,
    }

    const columns = [
      { title: i18n('user.name'), key: 'username', dataIndex: 'username' },
      { title: i18n('organization.org'), key: 'orgname', dataIndex: 'org.orgname' },
      { title: i18n('user.position'), key: 'title', dataIndex: 'title.name' },
      { title: i18n('user.mobile'), key: 'mobile', dataIndex: 'mobile' },
      { title: i18n('user.email'), key: 'email', dataIndex: 'email' },
      { title: i18n('user.trader'), key: 'transaction', render: (text, record) => {
        if (this.props.traderId) {
          return this.state.trader ? this.state.trader.username : ''
        } else {
          if (this.props.options) {
            return <SelectUser
            style={{width: 100 }}
            mode="single"
            data={this.props.options}
            value={this.state.traderMap[record.id] ? String(this.state.traderMap[record.id]) : ''}
            onChange={this.handleChangeTrader.bind(this, record.id)} />;
          } else {
            const trader = record.trader_relation ? record.trader_relation.traderuser : null
            return trader ? (
              <SelectUserTransaction
                userId={record.id}
                options={this.state.traderOptionsMap[record.id] || []}
                onOptionsChange={this.handleTraderOptionsChange.bind(this, record.id)}
                value={this.state.traderMap[record.id]}
                onChange={this.handleChangeTrader.bind(this, record.id)}
              />
            ) : i18n('common.none')
          }
        }
      }}
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Search2 style={{ width: 250 }} placeholder={[i18n('user.name'), i18n('user.mobile'), i18n('user.email')].join(' / ')} defaultValue={search} onSearch={this.handleSearch} />
        </div>
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} onShowSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
      </div>
    )

  }

}

export default connect()(SelectOrgInvestorAndTrader)
