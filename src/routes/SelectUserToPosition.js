import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { 
  i18n, 
  hasPerm, 
  getUserInfo, 
} from '../utils/util';
import * as api from '../api'
import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { SelectNumber } from '../components/ExtraInput'
import { Search } from '../components/Search'
import LeftRightLayout from '../components/LeftRightLayout'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }

class SelectUserToPosition extends React.Component {

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
      selectedRowKeys: []
    }
  }

  handleSearchChange = (search) => {
    this.setState({ search })
  }

  handleSearch = () => {
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.requestData)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.requestData)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.requestData)
  }

  getUser = () => {
    const selectedOrgs = this.props.location.query.orgID
    const { _params, page, pageSize, traderMap } = this.state

    const params = { ..._params, page_index: page, page_size: pageSize, org: selectedOrgs }
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
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  getUserRelation = () => {
    this.setState({ loading: true })
    api.getUserRelation({
      orgs: [this.props.location.query.orgID],
      traderuser: getUserInfo().id
    })
    .then(data => {
      this.setState({
        loading: false,
        total: data.data.count,
        list: data.data.data.map(m => m.investoruser)
      })
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
    // const { traderMap } = this.state
    // const value = investorIds.map(investorId => {
    //   return { investor: investorId, trader: traderMap[investorId] }
    // })
    // this.props.onChange(value)
    this.setState({ selectedRowKeys: investorIds })
  }

  handleTraderOptionsChange = (investorId, traderOptions) => {
    const { traderOptionsMap } = this.state
    this.setState({
      traderOptionsMap: { ...traderOptionsMap, [investorId]: traderOptions }
    })
  }

  componentDidMount() {
    this.requestData()
  }

  // 选择投资人到相应职位用到了修改用户的权限，如果没有管理员修改用户的权限，那么只能修改自己的投资人
  requestData = () => hasPerm('usersys.admin_changeuser') ? this.getUser() : this.getUserRelation()

  handleActionButtonClicked() {
    api.editUser(
      this.state.selectedRowKeys,
      { title: this.props.location.query.titleID }
    ).then(data => this.props.history.goBack())
    .catch(err => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleSelectChange,
      getCheckboxProps: record => ({
        disabled: !record.org || record.org.id !== parseInt(this.props.location.query.orgID, 10)
      })
    }

    const columns = [
      { title: i18n('user.trader'), key: 'username', dataIndex: 'username' },
      { title: i18n('organization.org'), key: 'orgname', dataIndex: 'org.orgname' },
      { title: i18n('user.position'), key: 'title', dataIndex: 'title.name' },
      { title: i18n('user.mobile'), key: 'mobile', dataIndex: 'mobile' },
      { title: i18n('user.email'), key: 'email', dataIndex: 'email' }
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <LeftRightLayout location={this.props.location} title={i18n('user.select_investor')}>
        <Search value={search} onChange={this.handleSearchChange} onSearch={this.handleSearch} />
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} onShowSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
        <div style={{ textAlign: 'center' }}>
          <Button onClick={this.handleActionButtonClicked.bind(this)} type="primary" disabled={this.state.selectedRowKeys.length === 0}>{i18n('common.confirm')}</Button>
          <Button onClick={this.props.history.goBack} style={{ marginLeft: 10 }}>{i18n('common.cancel')}</Button>
        </div>
      </LeftRightLayout>
    )

  }

}

export default connect()(SelectUserToPosition)
