import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { 
  i18n,
  getUserInfo,
} from '../utils/util';
import * as api from '../api'
import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { SelectNumber } from '../components/ExtraInput'
import { Search } from '../components/Search'
import LeftRightLayout from '../components/LeftRightLayout'
import { isLogin } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }

class SelectTraderToRelation extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: null,
      current: 0,
      pageSize: getUserInfo().page || 10,
      _param: {},
      total: 0,
      list: [],
      loading: false,
      traderMap: {},
      traderOptionsMap: {},
      selectedRowKeys: [],
      page: this.props.location.query.page_index || 1,
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
    this.setState({ loading: true })
    let list, count
    api.queryUserGroup({ type: 'trader'})
    .then(data => {
      const param = {
        groups: data.data.data.map(m => m.id),
        page_index: this.state.page,
        page_size: this.state.pageSize,
        search: this.state.search
      }
      return api.getUser(param)
    })
    .then(data => {
      list = data.data.data
      count = data.data.count
      const requestAll = data.data.data.map(m => api.checkUserRelation(isLogin().id, m.id))
      return Promise.all(requestAll)
    })
    .then(data => {
      data.map((m, i) => list[i]['isMyPartner'] = m.data)
      this.setState({
        loading: false,
        list: list,
        total: count
      })
    })
    .catch(err => this.props.dispatch({
        type: 'app/findError',
        payload: err
    }))
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
    this.getUser()
  }

  handleActionButtonClicked() {
    const currentUser = isLogin()
    this.state.selectedRowKeys.map(m => {
      api.addUserRelation({
        investoruser: currentUser.id,
        traderuser: m,
        relationtype: false
      })
      .then(data => this.props.history.goBack())
      .catch(err => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    })
  }

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleSelectChange,
      getCheckboxProps: record => ({
        disabled: record.isMyPartner
      }),
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
      <LeftRightLayout location={this.props.location} title={i18n('user.select_trader')}>
        <div style={{ marginBottom: '24px', width: '200px' }}>
          <Search value={search} onChange={this.handleSearchChange} onSearch={this.handleSearch} />
        </div>
        <Table
          style={tableStyle}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          rowKey={record => record.id}
          loading={loading}
          pagination={false} />

        <Pagination
          style={paginationStyle}
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handlePageChange}
          showSizeChanger
          onShowSizeChange={this.handlePageSizeChange}
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />

        <div style={{ textAlign: 'center' }}>
          <Button onClick={this.handleActionButtonClicked.bind(this)} type="primary" disabled={this.state.selectedRowKeys.length === 0}>{i18n('common.confirm')}</Button>
          <Button onClick={this.props.history.goBack} style={{ marginLeft: 10 }}>{i18n('common.cancel')}</Button>
        </div>
      </LeftRightLayout>
    )

  }

}

export default connect()(SelectTraderToRelation)
