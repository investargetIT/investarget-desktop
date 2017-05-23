import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout'
import { connect } from 'dva';
import { Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu } from 'antd'
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option

import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { PAGE_SIZE, URI_6 } from '../constants'
import { routerRedux } from 'dva/router'
import UserModal from '../components/UserModal';
import { UserListFilter } from '../components/Filter'
import Search from '../components/Search'

const createStyle = {
  marginBottom: '1.5em'
}

const operationStyle = {
  margin: '0 .5em',
  fontSize: '14px',
  color: 'gray'
}

function UserList({ selectedRowKeys, filter, location, list: dataSource, total, page: current, intl, dispatch, loading }) {

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

  function deleteHandler(id) {
    dispatch({
      type: 'users/remove',
      payload: id,
    });
  }

  function pageChangeHandler(page) {
    dispatch(routerRedux.push({
      pathname: URI_6,
      query: { page },
    }));
  }

  function editHandler(id, values) {
    dispatch({
      type: 'users/patch',
      payload: { id, values },
    });
  }


  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: text => <a href="">{text}</a>,
    },
    {
      title: '所属机构',
      dataIndex: 'org.name',
      key: 'org'
    },
    {
      title: '职位',
      dataIndex: 'title.name',
      key: 'title'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: tags => tags.map(t => t.name).join(' ')
    },
    {
      title: '交易师',
      dataIndex: 'trader_relation.traderuser.name',
    },
    {
      title: '审核状态',
      dataIndex: 'userstatus.name',
    },
    {
      title: '资料完整度',
      render: percent => <Progress percent={30} strokeWidth={5} />
    },
    {
      title: '操作',
      key: 'operation',
      render: (text, record) => (
        <span>
          <Dropdown overlay={menu}>
            <a style={operationStyle} href="#"><Icon style={{ color: '#157915' }} type="setting" /></a>
          </Dropdown>
          <UserModal record={record} onOk={editHandler.bind(null, record.id)}>
            <a style={operationStyle}><Icon style={{ color: '#10458F' }} type="edit" /></a>
          </UserModal>
          <Popconfirm title="Confirm to delete?" onConfirm={deleteHandler.bind(null, record.id)}>
            <a style={operationStyle} href=""><Icon style={{ color: '#F37676' }} type="delete" /></a>
          </Popconfirm>
        </span>
      ),
    },
  ];

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

  const searchKeys = [
    { value: 'name', label: <FormattedMessage id="user.name" /> },
    { value: 'phone', label: <FormattedMessage id="user.phone" /> },
    { value: 'email', label: <FormattedMessage id="user.email" /> },
    { value: 'organization', label: <FormattedMessage id="user.organization" /> },
    { value: 'transaction', label: <FormattedMessage id="user.transaction" /> },
  ]

  return (
    <LeftRightLayout location={location}>

      <UserListFilter value={filter} onChange={filterOnChange} onSearch={filterHandler} onReset={resetHandler} />

      <div style={createStyle}>
        <UserModal record={{}} onOk={createHandler}>
          <Button type="primary">Create User</Button>
        </UserModal>
        <div style={{ float: 'right' }}>
          <Search keys={searchKeys} onSearch={searchHandler} />
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={record => record.id}
        pagination={false} />

      <Pagination
        className="ant-table-pagination"
        total={total}
        current={current}
        pageSize={PAGE_SIZE}
        onChange={pageChangeHandler} />

    </LeftRightLayout>
  )
}

function mapStateToProps(state) {
  const filter = state.investorList
  const { selectedRowKeys } = filter
  const { list, total, page } = state.users
  return {
    filter,
    selectedRowKeys,
    loading: state.loading.effects['users/get'],
    list,
    total,
    page
  }
}

export default connect(mapStateToProps)(injectIntl(UserList))
