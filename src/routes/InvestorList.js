import React from 'react';
import MainLayout from '../components/MainLayout';
import { connect } from 'dva';
import { Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm } from 'antd'
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option

import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { PAGE_SIZE } from '../constants'
import { routerRedux } from 'dva/router'
import UserModal from '../components/UserModal';
import { InvestorListFilter } from '../components/Filter'
import Search from '../components/Search'

const createStyle = {
  marginBottom: '1.5em'
}

const operationStyle = {
  margin: '0 .5em'
}

function InvestorList({ filter, location, list: dataSource, total, page: current, intl, dispatch, loading }) {
    

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
      pathname: '/app/investor/list',
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <a href="">{text}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
    },
    {
      title: 'Operation',
      key: 'operation',
      render: (text, record) => (
        <span>
          <UserModal record={record} onOk={editHandler.bind(null, record.id)}>
            <a style={operationStyle}>Edit</a>
          </UserModal>
          <Popconfirm title="Confirm to delete?" onConfirm={deleteHandler.bind(null, record.id)}>
            <a style={operationStyle} href="">Delete</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  function filterOnChange(type, value) {
    dispatch({
      type: 'investorList/filterOnChange',
      payload: {
        type,
        value
      }
    })
  }

  return (
    <MainLayout location={location}>

      <InvestorListFilter value={filter} onChange={filterOnChange} />

      <div style={{marginBottom: '16px'}}>
        <Button type="primary" icon="search" onClick={filterHandler}><FormattedMessage id="common.filter" /></Button>
        <Button onClick={resetHandler}><FormattedMessage id="common.reset" /></Button>
      </div>

      <Search onSearch={searchHandler} />

      <div style={createStyle}>
        <UserModal record={{}} onOk={createHandler}>
          <Button type="primary">Create User</Button>
        </UserModal>
      </div>

      <Table
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

    </MainLayout>
  )
}

function mapStateToProps(state) {
  const filter = state.investorList
  const { list, total, page } = state.users
  return {
    filter,
    loading: state.loading.effects['users/get'],
    list,
    total,
    page
  }
}

export default connect(mapStateToProps)(injectIntl(InvestorList))
