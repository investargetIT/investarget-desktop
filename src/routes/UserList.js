import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { i18n, showError, hasPerm } from '../utils/util'
import * as api from '../api'

import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { UserListFilter } from '../components/Filter'
import UserRelationModal from '../components/UserRelationModal'

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const confirm = Modal.confirm

import { Search } from '../components/Search'


class UserList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      filters: {
        transactionPhases: [],
        tags: [],
        currencies: [],
        audit: null,
        areas: [],
      },
      search: null,
      current: 0,
      pageSize: 10,
      _param: {},
      total: 0,
      list: [],
      loading: false,
      selectedUsers: [],
    }
  }

  handleFiltersChange = (filters) => {
    this.setState({ filters })
  }

  handleFilt = () => {
    let { _params, filters } = this.state
    _params = { ..._params, ...filters }
    this.setState({ _params, page: 1 }, this.getUser)
  }

  handleReset = () => {
    this.setState({ filters: {
      transactionPhases: [],
      tags: [],
      currencies: [],
      audit: null,
      areas: [],
    }, page: 1, _params: {} }, this.getUser)
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
    const { _params, page, pageSize } = this.state
    const params = { ..._params, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getUser(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  deleteUser = (id) => {
    this.setState({ loading: true })
    api.deleteUser(id).then(result => {
      this.getUser()
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  showModal = (id, username) => {
    this.modal.showModal(id, username)
  }

  handleSelectChange = (selectedUsers) => {
    this.setState({ selectedUsers })
  }

  componentDidMount() {
    this.getUser()
  }

  render() {
    const { selectedUsers, filters, search, list, total, page, pageSize, loading } = this.state



    const rowSelection = {
      selectedUsers,
      onChange: this.handleSelectChange,
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
        render: tags => tags ? tags.map(t => t.name).join(' ') : null
      },
      {
        title: i18n("role"),
        dataIndex: 'groups',
        key: 'role',
        render: groups => groups ? groups.map(m => m.name).join(' ') : null
      },
      {
        title: i18n("userstatus"),
        dataIndex: 'userstatus.name',
        key: 'userstatus'
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
                    <Button size="small" onClick={this.showModal.bind(null, record.id, record.username)}>交易师</Button>
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
                <Popconfirm title="Confirm to delete?" onConfirm={this.deleteUser.bind(null, record.id)}>
                  <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
                </Popconfirm>
              </span>
        )
      }
    ]

    return (
      <LeftRightLayout
        location={location}
        title={i18n("user_list")}
        action={hasPerm("usersys.admin_adduser") ? { name: i18n("create_user"), link: "/app/user/add" } : null}>

          <UserListFilter
            value={filters}
            onChange={this.handleFiltersChange}
            onSearch={this.handleFilt}
            onReset={this.handleReset} />

        <div style={{marginBottom: '24px'}}>
          <Search value={search} onChange={this.handleSearchChange} placeholder="搜索用户" style={{width: 200}} onSearch={this.handleSearch} />
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
          onChange={this.handlePageChange}
          onShowSizeChange={this.handlePageSizeChange}
          showSizeChanger
          showQuickJumper />

        <UserRelationModal ref={(inst) => { this.modal = inst }} />

      </LeftRightLayout>
    )

  }

}

export default UserList
