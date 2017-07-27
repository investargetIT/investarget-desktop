import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { UserListFilter } from '../components/Filter'
import { Input, Table, Button, Popconfirm, Pagination } from 'antd'
import * as api from '../api'
import { Link } from 'dva/router'

const Search = Input.Search

class MyInvestor extends React.Component {

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
    api.getUserRelation().then(data => {
      this.setState({
        list: data.data.data,
        loading: false,
        total: data.data.count
      })
      this.investorList = data.data.data
    })
  }

  handleFilterChange(key, value) {
    console.log(key, value)
  }

  handleSearch(value) {
    
    if (value.length === 0) {
      this.setState({ list: this.investorList })
      return
    }

    this.setState({ loading: true })
    api.getUser({ search: value }).then(data => {
      const searchResult = data.data.data.map(m => m.id)
      const newList = []
      this.investorList.map((m, index) => {
        if (searchResult.includes(m.investoruser.id)) {
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

  columns = [
    {
      title: i18n("username"),
      dataIndex: 'investoruser.username',
      key: 'username'
    },
    {
      title: i18n("org"),
      dataIndex: 'investoruser.org.orgname',
      key: 'org'
    },
    {
      title: i18n("position"),
      dataIndex: 'investoruser.title.name',
      key: 'title'
    },
    {
      title: i18n("tag"),
      dataIndex: 'investoruser.tags',
      key: 'tags',
      render: tags => tags ? tags.map(t => t.name).join(' ') : null
    },
    {
      title: i18n("userstatus"),
      dataIndex: 'investoruser.userstatus.name',
      key: 'userstatus'
    },
    {
      title: i18n("action"),
      key: 'action',
      render: (text, record) => (
        <span>
          <Link to={'/app/user/' + record.investoruser.id}>
            <Button size="small">{i18n("view")}</Button>
          </Link>
          &nbsp;
          <Link to={'/app/user/edit/' + record.investoruser.id}>
            <Button size="small">{i18n("edit")}</Button>
          </Link>
          &nbsp;
          <Popconfirm title="Confirm to delete?" onConfirm={this.handleDeleteUser.bind(null, record.investoruser.id)}>
            <Button type="danger" size="small">{i18n("delete")}</Button>
          </Popconfirm>
        </span>
      )
    }
  ]

  render() {
    return (
      <LeftRightLayout location={this.props.location} title={i18n("myinvestor")}>

        <UserListFilter onChange={this.handleFilterChange} />

        <Search
          style={{ width: 200, marginBottom: '16px', marginTop: '10px' }}
          onSearch={this.handleSearch.bind(this)} />

        <Table
          columns={this.columns}
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

      </LeftRightLayout>
    )
  }
}

export default MyInvestor