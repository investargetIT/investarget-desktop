import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { MyInvestorListFilter } from '../components/Filter'
import { Input, Table, Button, Popconfirm, Pagination } from 'antd'
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
  componentDidMount() {
    this.setState({ loading: true })

    let title
    if (this.props.type === "investor") {
      title = "investoruser"
    } else if (this.props.type == "trader") {
      title = "traderuser"
    }

    api.getUserRelation().then(data => {
      const investorRelationShip = data.data.data.map(m => m[title])
      const investorIdArr = new Set(investorRelationShip.map(m => m.id))
      const investorList = [...investorIdArr].reduce((acc, value) => {
        acc.push(investorRelationShip.filter(f => f.id === value)[0])
        return acc
      }, [])
      this.setState({
        list: investorList,
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
      console.error(err)
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

  render() {
    const columns = [
      {
        title: i18n("username"),
        dataIndex: 'username',
        key: 'username'
      },
      {
        title: i18n("org"),
        dataIndex: 'org.orgname',
        key: 'org'
      },
      {
        title: i18n("position"),
        dataIndex: 'title.name',
        key: 'title'
      },
      {
        title: i18n("tag"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? tags.map(t => t.name).join(' ') : null
      }
    ]
    if (this.props.type === 'investor') {
      columns.push({
        title: i18n("userstatus"),
        dataIndex: 'userstatus.name',
        key: 'userstatus'
      })
      columns.push({
        title: i18n("action"),
        key: 'action',
        render: (text, record) => (
          <span>
            <Link to={'/app/user/' + record.id}>
              <Button size="small">{i18n("view")}</Button>
            </Link>
            &nbsp;
          <Link to={'/app/user/edit/' + record.id}>
              <Button size="small">{i18n("edit")}</Button>
            </Link>
            &nbsp;
          <Popconfirm title="Confirm to delete?" onConfirm={this.handleDeleteUser.bind(null, record.id)}>
              <Button type="danger" size="small">{i18n("delete")}</Button>
            </Popconfirm>
          </span>
        )
      })
    }
    return (
      <div>

        <MyInvestorListFilter onFilter={this.handleSearch.bind(this)} />

        <Search
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