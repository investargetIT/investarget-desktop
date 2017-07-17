import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router'
import _ from 'lodash'
import { i18n } from '../utils/util'
import * as api from '../api'

import LeftRightLayout from '../components/LeftRightLayout'
import { Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { UserListFilter } from '../components/Filter'
import UserRelationModal from '../components/UserRelationModal'


const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const Search = Input.Search



function UserList({ currentUser, selectedRowKeys, filter, search, location, list, total, page, pageSize, dispatch, loading }) {

  let modal = null

  const handleFilterChange = (key, value) => {
    dispatch({ type: 'userList/setFilter', payload: { [key]: value } })
  }

  const handleFilt = () => {
    dispatch({ type: 'userList/filt' })
  }

  const handleReset = () => {
    dispatch({ type: 'userList/reset' })
  }

  const handleSearchChange = (e) => {
    const search = e.target.value
    dispatch({ type: 'userList/setField', payload: { search } })
  }

  const handleSearch = (search) => {
    dispatch({ type: 'userList/search' })
  }

  const handlePageChange = (page, pageSize) => {
    dispatch({ type: 'userList/changePage', payload: page })
  }

  const handleShowSizeChange = (current, pageSize) => {
    dispatch({ type: 'userList/changePageSize', payload: pageSize })
  }

  const handleDeleteUser = (id) => {
    api.deleteUser(id).then(result => {
      dispatch({ type: 'userList/get' })
    }, error => {
      Modal.error(error.message)
    })
  }

  const showModal = (id, username) => {
    if (modal) {
      modal.showModal(id, username)
    }
  }


  const rowSelection = {
    selectedRowKeys,
    onChange: selectedRowKeys => dispatch({
      type: "userList/onSelectedRowKeysChanged",
      payload: selectedRowKeys
    })
  }

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
      render: tags => tags.map(t => t.name).join(' ')
    },
    {
      title: i18n("trader_relation"),
      dataIndex: 'trader_relation.traderuser.username',
      key: 'trader_relation',
    },
    {
      title: i18n("action"),
      key: 'action',
      render: (text, record) => (
            <span>
              {
                _.some(record.groups, function(group) {
                  return group.id == 1 // 投资人
                }) ? (
                  <Button size="small" onClick={showModal.bind(null, record.id, record.username)}>交易师</Button>
                ) : null
              }
              &nbsp;
              <Link to={'/app/user/' + record.id}>
                <Button disabled={!record.action.get} size="small">{i18n("view")}</Button>
              </Link>
              &nbsp;
              <Link to={'/app/user/edit/' + record.id}>
                <Button disabled={!record.action.change} size="small">{i18n("edit")}</Button>
              </Link>
              &nbsp;
              <Popconfirm title="Confirm to delete?" onConfirm={handleDeleteUser.bind(null, record.id)}>
                <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
              </Popconfirm>
            </span>
      )
    },
  ]

  const action = currentUser.permissions.includes("usersys.admin_adduser") ? { name: i18n("create_user"), link: "/app/user/add" } : null

  return (
    <LeftRightLayout
      location={location}
      title={i18n("user_list")}
      action={action}>

      <UserListFilter
        value={filter}
        onChange={handleFilterChange}
        onSearch={handleFilt}
        onReset={handleReset} />

      <div style={{marginBottom: '24px'}}>
        <Search value={search} onChange={handleSearchChange} placeholder="搜索用户" style={{width: 200}} onSearch={handleSearch} />
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={list}
        loading={loading}
        rowKey={record => record.id}
        pagination={false} />

      <Pagination
        className="ant-table-pagination"
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={handlePageChange}
        onShowSizeChange={handleShowSizeChange}
        showSizeChanger
        showQuickJumper />

      <UserRelationModal ref={(inst) => { modal = inst; }} />

    </LeftRightLayout>
  )
}

function mapStateToProps(state) {
  const { filter, search, selectedRowKeys, list, total, page, pageSize } = state.userList
  const { currentUser } = state
  return {
    filter,
    search,
    selectedRowKeys,
    list,
    total,
    page,
    pageSize,
    currentUser,
    loading: state.loading.effects['userList/get'],
  }
}

export default connect(mapStateToProps)(UserList)
