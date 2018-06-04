import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { 
  i18n, 
  hasPerm,
  getUserInfo,
} from '../utils/util';
import * as api from '../api'

import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { OrgUserListFilter } from '../components/Filter'

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const confirm = Modal.confirm

import { Search } from '../components/Search'
import { PAGE_SIZE_OPTIONS } from '../constants';


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
      page: 1,
      pageSize: getUserInfo().page || 10,
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
    this.setState({ filters, page: 1, search: null }, this.getUser)
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
    this.props.dispatch({ type: 'app/getSource', payload: 'title' });
    this.props.dispatch({ type: 'app/getGroup' });
  }

  loadLabelByValue(type, value) {
    if (Array.isArray(value) && this.props.tag.length > 0) {
      return value.map(m => this.props[type].filter(f => f.id === m)[0].name).join(' / ');
    } else if (typeof value === 'number') {
      return this.props[type].filter(f => f.id === value)[0].name;
    }
  }

  render() {
    const { selectedUsers, filters, search, list, total, page, pageSize, loading } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}


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
        dataIndex: 'title',
        key: 'title',
        render: value => this.loadLabelByValue('title', value),
      },
      {
        title: i18n("user.tags"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? this.loadLabelByValue('tag', tags) : null
      },
      {
        title: i18n("account.role"),
        dataIndex: 'groups',
        key: 'role',
        render: groups => groups ? this.loadLabelByValue('group', groups) : null,
      },
      {
        title: i18n("user.status"),
        dataIndex: 'userstatus',
        key: 'userstatus',
        render: value => this.loadLabelByValue('audit', value),
      },
      {
        title: i18n("user.trader"),
        dataIndex: 'trader_relation.traderuser.username',
        key: 'trader'
      },
      {
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
              <span style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <Link to={'/app/user/' + record.id}>
                  <Button style={buttonStyle} disabled={!record.action.get} size="small">{i18n("common.view")}</Button>
                </Link>
                
                <Link to={`/app/user/edit/${record.id}?redirect=${encodeURIComponent(this.props.location.pathname + this.props.location.search)}`}>
                  <Button style={buttonStyle} disabled={!record.action.change} size="small">{i18n("common.edit")}</Button>
                </Link>
               
              </div>
                <Popconfirm title="Confirm to delete?" onConfirm={this.deleteUser.bind(null, record.id)}>
                  <a type="danger" disabled={!record.action.delete} size="small">
                    <img style={imgStyle} src="/images/delete.png" />
                  </a>
                </Popconfirm>
              </span>
        )
      }
    ]

    const action = {
      link: `/app/user/add?redirect=${encodeURIComponent(this.props.location.pathname + this.props.location.search)}`,
      name: i18n('user.create_investor'),
    }

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("user.org_investors")}
        action={hasPerm("usersys.admin_adduser") ? action : null}>

        <OrgUserListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />

        <div style={{ overflow: 'auto', marginBottom: 24 }}>

          <Search
            style={{ width: 200 }}
            placeholder={i18n('user.name')}
            onSearch={this.handleSearch}
            onChange={search => this.setState({ search })}
            value={search}
          />

          <div style={{ float: 'right' }}>
            {i18n('common.sort_by_created_time')}&nbsp;
                <Select size="large" defaultValue="desc" onChange={this.handleSortChange}>
              <Option value="asc">{i18n('common.asc_order')}</Option>
              <Option value="desc">{i18n('common.dec_order')}</Option>
            </Select>
          </div>
        </div>

        <Table
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
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />

      </LeftRightLayout>
    )

  }

}

function mapStateToProps(state) {
  const { title, tag, audit, group } = state.app;
  return { title, tag, audit, group };
}

export default connect(mapStateToProps)(OrgUserList);
