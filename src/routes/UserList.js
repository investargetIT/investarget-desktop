import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { i18n, hasPerm } from '../utils/util'
import * as api from '../api'

import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { UserListFilter } from '../components/Filter'

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const confirm = Modal.confirm

import { Search2 } from '../components/Search'


class UserList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : UserListFilter.defaultValue
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
      sort:undefined,
      desc:undefined,
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
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort, desc }
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

  handleSortChange = value => {
    this.sort = value === 'asc' ? true : false
    this.getUser()
  }

  deleteUser = id => {
    api.deleteUser(id)
    .then(result => this.getUser())
    .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
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
    localStorage.setItem('UserList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('UserList')
    return data ? JSON.parse(data) : null
  }
  
  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getUser()
    );
  }

  componentDidMount() {
    this.getUser()
  }

  render() {
    const { selectedUsers, filters, search, list, total, page, pageSize, loading, sort, desc} = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
    console.log(list)

    const rowSelection = {
      selectedUsers,
      onChange: this.handleSelectChange,
    }

    const columns = [
      {
        title: i18n("email.username"),
        dataIndex: 'username',
        key: 'username',
        render: (text, record) => {
          return <Link to={'/app/user/' + record.id}>{record.username}</Link>
        }
        //sorter:true,
      },
      {
        title: i18n("organization.org"),
        dataIndex: 'org.orgname',
        key: 'org',
        sorter:true,
      },
      {
        title: i18n("user.position"),
        dataIndex: 'title.name',
        key: 'title',
        sorter:true,
      },
      {
        title: i18n("user.tags"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? <span className="span-tag">{tags.map(t => t.name).join(' / ')}</span> : null,
        sorter:true,
      },
      {
        title: i18n("account.role"),
        dataIndex: 'groups',
        key: 'role',
        render: groups => groups ? groups.map(m => m.name).join(' ') : null,
        ///sorter:true,
      },
      {
        title: i18n("user.status"),
        dataIndex: 'userstatus.name',
        key: 'userstatus',
        sorter:true,
      },
      {
        title: i18n("user.trader"),
        dataIndex: 'trader_relation.traderuser.username',
        key: 'trader',
        //sorter:true,
      },
      {
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
              <span className="span-operation" style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap'}}>

                <Link to={'/app/user/edit/' + record.id}>
                  <Button style={buttonStyle} disabled={!record.action.change} size="small">{i18n("common.edit")}</Button>
                </Link>

                <Popconfirm title={i18n('delete_confirm')} onConfirm={this.deleteUser.bind(null, record.id)}>
                  <a type="danger" disabled={!record.action.delete} ><img style={imgStyle} src="/images/delete.png" /></a>
                </Popconfirm>
              </span>
        ),
      }
    ]

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("menu.user_management")}
        action={hasPerm("usersys.admin_adduser") ? { name: i18n("user.create_user"), link: "/app/user/add" } : null}>

        <UserListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />

        <div style={{ overflow: 'auto' }}>
          <div style={{ marginBottom: '24px', float: 'left' }}>
            <Search2 placeholder={[i18n('email.username'),i18n('organization.org'), i18n('mobile'), i18n('email.email')].join(' / ')} style={{ width: 240 }} defaultValue={search} onSearch={this.handleSearch} />
          </div>

          <div style={{ float: 'right' }}>
            {i18n('common.sort_by_created_time')}
            <Select size="large" style={{marginLeft:8}} defaultValue="desc" onChange={this.handleSortChange}>
              <Option value="asc">{i18n('common.asc_order')}</Option>
              <Option value="desc">{i18n('common.dec_order')}</Option>
            </Select>
          </div>
        </div>

        <Table
          onChange={this.handleTableChange}
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

export default connect()(UserList)
