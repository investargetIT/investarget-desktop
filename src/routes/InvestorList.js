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

const createStyle = {
  marginBottom: '1.5em'
}

const operationStyle = {
  margin: '0 .5em'
}

function InvestorList({ filter, location, list: dataSource, total, page: current, intl, dispatch, transactionPhases, transactionPhaseOptions, tags, tagOptions, currencies, audit, areas, areaOptions, name, phone, email, organization, transaction, searchType, loading }) {
    

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

  function searchTypeHandler(searchType) {
    dispatch({
      type: 'investorList/searchType',
      payload: searchType
    })
    dispatch({
      type: 'investorList/clearSearch'
    })
  }

  function nameHandler(e) {
    const name = e.target.value
    dispatch({
      type: 'investorList/name',
      payload: name
    })
  }

  function emailHandler(e) {
    const email = e.target.value
    dispatch({
      type: 'investorList/email',
      payload: email
    })
  }

  function phoneHandler(e) {
    const phone = e.target.value
    dispatch({
      type: 'investorList/phone',
      payload: phone
    })
  }

  function orgnizationHandler(e) {
    const orgnization = e.target.value
    dispatch({
      type: 'investorList/orgnization',
      payload: orgnization
    })
  }

  function transactionHandler(e) {
    const transaction = e.target.value
    dispatch({
      type: 'investorList/transaction',
      payload: transaction
    })
  }

  function searchHandler(e) {
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
      <div>

        <div>


          <InvestorListFilter value={filter} onChange={filterOnChange} />

          <div style={{marginBottom: '16px'}}>
            <Button type="primary" icon="search" onClick={filterHandler}><FormattedMessage id="common.filter" /></Button>
            <Button onClick={resetHandler}><FormattedMessage id="common.reset" /></Button>
          </div>

          <div style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}} >
            <Select style={{width: '160px'}} defaultValue="name" onChange={searchTypeHandler} >
              <Option value="name"><FormattedMessage id="user.name" /></Option>
              <Option value="phone"><FormattedMessage id="user.phone" /></Option>
              <Option value="email"><FormattedMessage id="user.email" /></Option>
              <Option value="organization"><FormattedMessage id="user.organization" /></Option>
              <Option value="transaction"><FormattedMessage id="user.transaction" /></Option>
            </Select>
            { searchType == 'name' ? <Input style={{width: '160px'}} value={name} onChange={nameHandler} /> : null }
            { searchType == 'phone' ? <Input style={{width: '160px'}} value={phone} onChange={phoneHandler} /> : null }
            { searchType == 'email' ? <Input style={{width: '160px'}} value={email} onChange={emailHandler} /> : null }
            { searchType == 'organization' ? <Input style={{width: '160px'}} value={organization} onChange={orgnizationHandler} /> : null }
            { searchType == 'transaction' ? <Input style={{width: '160px'}} value={transaction} onChange={transactionHandler} /> : null }
            <Button type="primary" icon="search" onClick={searchHandler}></Button>
          </div>

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

    </div>

    </div>
  </MainLayout>
  );
}

function mapStateToProps(state) {
  const filter = state.investorList
  const { transactionPhases, tags, currencies, audit, areas, searchType, name, phone, email, organization, transaction } = state.investorList
  var { transactionPhases: transactionPhaseOptions, tags: tagOptions, areas: areaOptions } = state.app
  transactionPhaseOptions = transactionPhaseOptions.map(item => ({ label: item.name, value: item.id }))
  tagOptions = tagOptions.map(item => ({ label: item.tagName, value: item.id }))
  areaOptions = areaOptions.map(item => ({ label: item.areaName, value: item.id }))
  const { list, total, page } = state.users
  return {
    filter,
    transactionPhaseOptions,
    transactionPhases,
    tagOptions,
    tags,
    currencies,
    audit,
    areaOptions,
    areas,
    name, phone, email, organization, transaction,
    searchType,
    loading: state.loading.effects['users/get'],
    list,
    total,
    page
  }
}

export default connect(mapStateToProps)(injectIntl(InvestorList))
