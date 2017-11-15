import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { i18n, hasPerm } from '../utils/util'
import * as api from '../api'

import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { OrgUserListFilter } from '../components/Filter'

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const confirm = Modal.confirm

import { Search2 } from '../components/Search'


class OrgUserList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : OrgUserListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

    this.state = {
      filters,
      search,
      page,
      pageSize,
      total: 0,
      list: [],
      loading: false,
      selectedUsers: [],
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getUser)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getUser)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getUser)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getUser)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getUser)
  }

  getUser = () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort: this.sort }

    // 机构所有用户
    const org = parseInt(this.props.location.query.org)
    if (org) {
      params['org'] = org
      params['groups'] = this.investorGroupIds
      this.setState({ loading: true })
      api.getUser(params).then(result => {
        const { count: total, data: list } = result.data
        this.setState({ total, list, loading: false })
      }, error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
      this.writeSetting()
    }

  }

  handleSortChange = value => {
    this.sort = value === 'asc' ? true : false
    this.getUser()
  }

  deleteUser = (id) => {
    this.setState({ loading: true })
    api.deleteUser(id).then(result => {
      this.getUser()
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'findError',
        payload: error,
      })
    })
  }

  showModal = (id, username) => {
    this.modal.showModal(id, username)
  }

  handleSelectChange = (selectedUsers) => {
    this.setState({ selectedUsers })
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('OrgUserList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('OrgUserList')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    api.queryUserGroup({ type: 'investor' }).then(data => {
      this.investorGroupIds = data.data.data.map(item => item.id)
      this.getUser()
    })
  }

  render() {
    const { selectedUsers, filters, search, list, total, page, pageSize, loading } = this.state



    const rowSelection = {
      selectedUsers,
      onChange: this.handleSelectChange,
    }

    const columns = [
      {
        title: i18n("user.name"),
        dataIndex: 'username',
        key: 'username'
      },
      {
        title: i18n("organization.org"),
        dataIndex: 'org.orgname',
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
      },
      {
        title: i18n("account.role"),
        dataIndex: 'groups',
        key: 'role',
        render: groups => groups ? groups.map(m => m.name).join(' ') : null
      },
      {
        title: i18n("user.status"),
        dataIndex: 'userstatus.name',
        key: 'userstatus'
      },
      {
        title: i18n("user.trader"),
        dataIndex: 'trader_relation.traderuser.username',
        key: 'trader'
      },
      {
        title: 'IR',
        dataIndex: 'IR.username',
        key: 'IR'
      },
      {
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
              <span>
                <Link to={'/app/user/' + record.id}>
                  <Button disabled={!record.action.get} size="small">{i18n("common.view")}</Button>
                </Link>
                &nbsp;
                <Link to={'/app/user/edit/' + record.id}>
                  <Button disabled={!record.action.change} size="small">{i18n("common.edit")}</Button>
                </Link>
                &nbsp;
                <Popconfirm title="Confirm to delete?" onConfirm={this.deleteUser.bind(null, record.id)}>
                  <Button type="danger" disabled={!record.action.delete} size="small">{i18n("common.delete")}</Button>
                </Popconfirm>
              </span>
        )
      }
    ]

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("user.user_list")}
        action={hasPerm("usersys.admin_adduser") ? { name: i18n("user.create_user"), link: "/app/user/add" } : null}>

        <OrgUserListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />

        <div style={{ overflow: 'auto' }}>
          <div style={{ marginBottom: '24px', float: 'left' }}>
            <Search2 placeholder={i18n('user.name')} style={{ width: 200 }} defaultValue={search} onSearch={this.handleSearch} />
          </div>

          <div style={{ float: 'right' }}>
            {i18n('common.sort_by_created_time')}&nbsp;
                <Select size="large" defaultValue="desc" onChange={this.handleSortChange}>
              <Option value="asc">{i18n('common.asc_order')}</Option>
              <Option value="desc">{i18n('common.dec_order')}</Option>
            </Select>
          </div>
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

      </LeftRightLayout>
    )

  }

}

export default connect()(OrgUserList)
