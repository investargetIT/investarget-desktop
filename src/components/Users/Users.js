import React from 'react';
import { injectIntl, intlShape, FormattedMessage, defineMessages, formatMessage } from 'react-intl'
import { connect } from 'dva';
import { Table, Pagination, Popconfirm, Button } from 'antd';
import { routerRedux } from 'dva/router';
import styles from './Users.css';
import { PAGE_SIZE } from '../../constants';
import UserModal from './UserModal';
import { Checkbox, Radio } from 'antd'
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group

import { configMessages } from '../../utils/util'
const messages = defineMessages(
  configMessages(
    [
      'user.tag',
      'user.dollar',
      'user.rmb',
      'user.dollar_rmb',
      'user.audit_status',
      'user.under_approval',
      'user.recevied_approval',
      'user.reject_approval'
    ]
  )
)


function Users({ intl, dispatch, list: dataSource, loading, total, page: current, transactionPhases, tags, currencies, audit }) {

  const transactionPhaseOptions = [] // TODO
  const tagOptions = [] // TODO
  const currencyOptions = [
    { label: intl.formatMessage(messages.dollar), value: 0 },
    { label: intl.formatMessage(messages.rmb), value: 1 },
    { label: intl.formatMessage(messages.dollar_rmb), value: 2 },
  ]
  const auditOptions = [
    { label: intl.formatMessage(messages.under_approval), value: 0 },
    { label: intl.formatMessage(messages.recevied_approval), value: 1 },
    { label: intl.formatMessage(messages.reject_approval), value: 2 },
  ]

  function transactonPhaseHandler(transactionPhases) {
    dispatch({
      type: 'users/transactionPhase',
      payload: transactionPhases
    })
  }

  function tagHandler(tags) {
    dispatch({
      type: 'users/tag',
      payload: tags
    })
  }

  function auditHandler(e) {
    const audit = e.target.value
    dispatch({
      type: 'users/audit',
      payload: audit
    })
  }

  function currencyHandler(currencies) {
    dispatch({
      type: 'users/currency',
      payload: currencies
    })
  }

  function deleteHandler(id) {
    dispatch({
      type: 'users/remove',
      payload: id,
    });
  }

  function pageChangeHandler(page) {
    dispatch(routerRedux.push({
      pathname: '/users',
      query: { page },
    }));
  }

  function editHandler(id, values) {
    dispatch({
      type: 'users/patch',
      payload: { id, values },
    });
  }

  function createHandler(values) {
    dispatch({
      type: 'users/create',
      payload: values,
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
        <span className={styles.operation}>
          <UserModal record={record} onOk={editHandler.bind(null, record.id)}>
            <a>Edit</a>
          </UserModal>
          <Popconfirm title="Confirm to delete?" onConfirm={deleteHandler.bind(null, record.id)}>
            <a href="">Delete</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.normal}>
      <div>

        <CheckboxGroup options={transactionPhaseOptions} value={transactionPhases} onChange={transactonPhaseHandler} />
        <CheckboxGroup options={tagOptions} value={tags} onChange={tagHandler} />
        <CheckboxGroup options={currencyOptions} value={currencies} onChange={currencyHandler} />
        <RadioGroup options={auditOptions} value={audit} onChange={auditHandler} />



        <div className={styles.create}>
          <UserModal record={{}} onOk={createHandler}>
            <Button type="primary">Create User</Button>
          </UserModal>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey={record => record.id}
          pagination={false}
        />
        <Pagination
          className="ant-table-pagination"
          total={total}
          current={current}
          pageSize={PAGE_SIZE}
          onChange={pageChangeHandler}
        />
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { transactionPhases, tags, currencies, audit, list, total, page } = state.users;
  return {
    transactionPhases,
    tags,
    currencies,
    audit,
    loading: state.loading.effects['users/fetch'],
    list,
    total,
    page,
  };
}

Users.propTypes = {
  intl: intlShape.isRequired
}

export default connect(mapStateToProps)(injectIntl(Users));
