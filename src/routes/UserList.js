import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout'
import { connect } from 'dva';
import { Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu } from 'antd'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { PAGE_SIZE, URI_6 } from '../constants'
import { routerRedux } from 'dva/router'
import UserModal from '../components/UserModal';
import { UserListFilter } from '../components/Filter'
import { UserListSearch } from '../components/Search'
import { dataToColumn, i18n } from '../utils/util'

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option

const createStyle = {
  marginBottom: '1.5em'
}

const operationStyle = {
  margin: '0 .5em',
  fontSize: '14px',
  color: 'gray'
}

function UserList({ currentUser, selectedRowKeys, filter, location, list: dataSource, total, page: current, intl, dispatch, loading }) {

  function filterHandler() {
    dispatch({
      type: 'investorList/filter'
    })
  }

  function resetHandler() {
    dispatch({
      type: 'investorList/resetFilter'
    })
  }

  function searchHandler(e, a) {
    console.log(e, a)
    dispatch({
      type: 'investorList/search'
    })
  }

  function createHandler(values) {
    dispatch({
      type: 'users/create',
      payload: values,
    });
  }

  function operationHandler(action, id) {
    console.log(action, id)
    switch (action) {
      case 'delete':
        dispatch({
          type: 'users/remove',
          payload: id,
        })
        break
      case 'edit':
        dispatch({
          type: 'users/patch',
          payload: { id, values },
        })
        break
    }
  }

  function pageChangeHandler(page) {
    dispatch(routerRedux.push({
      pathname: URI_6,
      query: { page },
    }));
  }

  const menu = (
    <Menu>
      <Menu.Item>待审核</Menu.Item>
      <Menu.Item>审核通过</Menu.Item>
      <Menu.Item>审核退回</Menu.Item>
    </Menu>
  )
  function filterOnChange(type, value) {
    dispatch({
      type: 'investorList/filterOnChange',
      payload: {
        type,
        value
      }
    })
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: selectedRowKeys => dispatch({
      type: "investorList/onSelectedRowKeysChanged",
      payload: selectedRowKeys
    })
  }

  const action = currentUser.permissions.includes("usersys.admin_adduser") ? { name: i18n("create_user"), link: "/app/user/add" } : null

  return (
    <LeftRightLayout
      location={location}
      title={i18n("user_list")}
      action={action}>

      <UserListFilter
        value={filter}
        onChange={filterOnChange}
        onSearch={filterHandler}
        onReset={resetHandler} />

      <div style={createStyle}>
        <UserModal record={{}} onOk={createHandler}>
          <Button type="primary">Create User</Button>
        </UserModal>
        <div style={{ float: 'right' }}>
          <UserListSearch onSearch={searchHandler} />
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={dataToColumn(dataSource, operationHandler)}
        dataSource={dataSource}
        loading={loading}
        rowKey={record => record.id}
        pagination={false} />

      <Pagination
        className="ant-table-pagination"
        total={total}
        current={current}
        pageSize={10}
        onChange={pageChangeHandler} showSizeChanger showQuickJumper />

    </LeftRightLayout>
  )
}

function mapStateToProps(state) {
  const filter = state.investorList
  const { selectedRowKeys } = filter
  const { list, total, page } = state.users
  const { currentUser } = state
  return {
    filter,
    selectedRowKeys,
    loading: state.loading.effects['users/get'],
    list,
    total,
    page,
    currentUser
  }
}

export default connect(mapStateToProps)(injectIntl(UserList))
