import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n, isLogin } from '../utils/util'
import { MyInvestorListFilter } from '../components/Filter'
import { Input, Table, Button, Popconfirm, Pagination, message, Modal } from 'antd'
import * as api from '../api'
import { Link } from 'dva/router'
import { URI_12, URI_13 } from '../constants'
import { connect } from 'dva'

const Search = Input.Search

class MyPartner extends React.Component {

  state = {
    list: [],
    loading: false,
    total: 0,
    pageSize: 10,
    pageIndex: 1
  }
  investorList = []
  redirect = this.props.type === 'investor' && URI_12
  componentDidMount() {
    this.setState({ loading: true })

    let title, param
    if (this.props.type === "investor") {
      title = "investoruser"
      param = { traderuser: isLogin().id}
    } else if (this.props.type == "trader") {
      title = "traderuser"
      param = { investoruser: isLogin().id }
    }

    Promise.all([api.getUserRelation(param), api.getUserFriend()])
    .then(data => {
      const investorRelationShip = data[0].data.data.map(m => m[title])
      const investorIdArr = new Set(investorRelationShip.map(m => m.id))
      const investorList = [...investorIdArr].reduce((acc, value) => {
        acc.push(investorRelationShip.filter(f => f.id === value)[0])
        return acc
      }, [])
      const list = investorList.map(m => {
        let isAlreadyAdded = false
        if (data[1].data.data.filter(f => (f.friend && f.friend.id === m.id) || (f.user && f.user.id === m.id)).length > 0) {
          isAlreadyAdded = true
        }
        return {...m, isAlreadyAdded}
      })
      this.setState({
        list,
        loading: false,
        total: investorList.length
      })
      this.investorList = investorList
    }).catch(err => this.props.dispatch({
      type: 'app/findError',
      payload: err
    }))
  }

  handleSearch(value) {

    let params
    if (typeof value === 'string') {
      // Search
      if (value.length === 0) {
        this.setState({ list: this.investorList })
        return
      }
      params = { search: value }
    } else if (typeof value === 'object') {
      // Filter
      if (value.orgtransactionphases.length === 0 && value.tags.length === 0 && value.currency.length === 0 && !value.userstatus && value.areas.length === 0) {
        this.setState({ list: this.investorList })
        return
      }
      params = value
    }

    this.setState({ loading: true })
    api.getUser(params).then(data => {
      const searchResult = data.data.data.map(m => m.id)
      const newList = []
      this.investorList.map((m, index) => {
        if (searchResult.includes(m.id)) {
          newList.push(m)
        }
      })
      this.setState({
        list: newList,
        loading: false
      })
    }).catch(err => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleDeleteUser(userID) {
    console.log(userID)
  }

  handlePageChange(pageIndex) {
    console.log(pageIndex)
  }

  handleShowSizeChange(pageSize) {
    console.log(pageSize)
  }

  handleAddFriend(userID) {
    const index = this.state.list.map(m => m.id).indexOf(userID)
    if (index < 0) return

    api.addUserFriend([userID])
    .then(() => {
      Modal.success({
        title: i18n('success'),
        content: i18n('request_sent_please_wait'),
      })
      const newList = [...this.state.list]
      newList[index].isAlreadyAdded = true
      this.setState({ list: newList })
    })
    .catch(err => this.props.dispatch({ type: 'app/findError', payload: err }))
  }

  render() {
    const columns = [
      {
        title: i18n("user.name"),
        dataIndex: 'username',
        key: 'username'
      },
      {
        title: i18n("organization.org"),
        dataIndex: 'org.org',
        key: 'org'
      },
      {
        title: i18n("user.position"),
        dataIndex: 'title.name',
        key: 'title'
      },
      {
        title: i18n("user.tags"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? tags.map(t => t.name).join(' ') : null
      }
    ]
    if (this.props.type === 'investor') {
      columns.push({
        title: i18n("user.status"),
        dataIndex: 'userstatus.name',
        key: 'userstatus'
      })
      columns.push({
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
          <span>
            <Link to={'/app/user/' + record.id}>
              <Button size="small">{i18n("common.view")}</Button>
            </Link>
            &nbsp;
          <Link to={'/app/user/edit/' + record.id + '?redirect=' + this.redirect}>
              <Button size="small">{i18n("common.edit")}</Button>
            </Link>
            &nbsp;
            { this.props.type !== 'investor' ?
          <Popconfirm title="Confirm to delete?" onConfirm={this.handleDeleteUser.bind(null, record.id)}>
              <Button type="danger" size="small">{i18n("common.delete")}</Button>
            </Popconfirm>
            : null }
            &nbsp;
            <Button disabled={record.isAlreadyAdded} onClick={this.handleAddFriend.bind(this, record.id)} size="small">{i18n("add_friend")}</Button>
          </span>
        )
      })
    } else {
      columns.push({
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => <Button disabled={record.isAlreadyAdded} onClick={this.handleAddFriend.bind(this, record.id)} size="small">{i18n("add_friend")}</Button>,
      })
    }
    return (
      <div>

        <MyInvestorListFilter onFilter={this.handleSearch.bind(this)} />

        <Search
          size="large"
          style={{ width: 200, marginBottom: '16px', marginTop: '10px' }}
          onSearch={this.handleSearch.bind(this)} />

        <Table
          columns={columns}
          dataSource={this.state.list}
          loading={this.state.loading}
          rowKey={record => record.id}
          pagination={false} />

        <Pagination
          className="ant-table-pagination"
          total={this.state.total}
          current={this.state.pageIndex}
          pageSize={this.state.pageSize}
          onChange={this.handlePageChange}
          onShowSizeChange={this.handleShowSizeChange}
          showSizeChanger
          showQuickJumper />

      </div>
    )
  }
}

export default connect()(MyPartner)
