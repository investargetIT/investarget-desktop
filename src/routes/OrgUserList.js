import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { 
  i18n, 
  hasPerm,
  getUserInfo,
  handleError,
  requestAllData,
  getURLParamValue,
} from '../utils/util';
import * as api from '../api'

import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { OrgUserListFilter } from '../components/Filter'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const confirm = Modal.confirm

import { Search } from '../components/Search'
import { PAGE_SIZE_OPTIONS } from '../constants';

export class Trader extends React.Component {
  state = {
    list: this.props.traders || [], 
  }
  render () {
    return <span>
      { this.state.list.length > 0 ? 
        this.state.list.map(m => <span key={m.value}>
          <span>{m.label}</span>
          <span style={{ color: 'red' }}>
            ({this.props.famlv.filter(f => f.id === m.familiar)[0].score})
          </span>
        </span>)
      : '暂无' }
    </span>
  }
}
function mapStateToProps1(state) {
  const { famlv, orgbdres, tag, title } = state.app;
  return { famlv, orgbdres, tag, title };
}
Trader = connect(mapStateToProps1)(Trader);

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

  getUser = async () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort: this.sort }

    // 机构所有用户
    const org = parseInt(getURLParamValue(this.props, 'org'));
    if (!org) return;

    try {
      params['org'] = org
      params['groups'] = this.investorGroupIds
      this.setState({ loading: true })
      const reqUser = await api.getUser(params);
      const { count: total, data: orgUser } = reqUser.data;

      //获取投资人的交易师
      const orgUserRelation = await requestAllData(api.getUserRelation, {
        investoruser: orgUser.map(m => m.id),
        page_size: 100,
      }, 100);
      orgUser.forEach(element => {
        const relations = orgUserRelation.data.data.filter(f => f.investoruser.id === element.id);
        element.traders = relations.map(m => ({
          label: m.traderuser.username,
          value: m.traderuser.id,
          onjob: m.traderuser.onjob,
          familiar: m.familiar,
        }))
      });
      this.setState({ total, list: orgUser, loading: false });
      this.setState({ loading: false })
    } catch (error) {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    }
    this.writeSetting();
  }

  handleSortChange = value => {
    this.sort = value === 'asc' ? true : false
    this.getUser()
  }

  deleteUser = id => api.deleteUser(id).then(this.getUser).catch(handleError);

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
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' });
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
    const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
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
      // {
      //   title: i18n('mobile'),
      //   dataIndex: 'mobile',
      //   key: 'mobile',
      // },
      // {
      //   title: i18n('account.email'),
      //   dataIndex: 'email',
      //   key: 'email',
      // },
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
        render: tags => tags ? <span className="span-tag">{this.loadLabelByValue('tag', tags)}</span> : null
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
        key: 'trader',
        // width: 200,
        // render: (text, record) => record.id ? <Trader traders={record.traders} /> : '暂无',
      },
      {
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
              <span style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <Link to={'/app/user/' + record.id}>
                  <Button style={buttonStyle} disabled={!record.action.get} size="small"><EyeOutlined /></Button>
                </Link>
                
                <Link to={`/app/user/edit/${record.id}?redirect=${encodeURIComponent(this.props.location.pathname + this.props.location.search)}`}>
                  <Button style={buttonStyle} disabled={!record.action.change} size="small"><EditOutlined /></Button>
                </Link>
               
              </div>
                <Popconfirm title="确定删除吗？" disabled={!record.action.delete} onConfirm={this.deleteUser.bind(null, record.id)}>
                  <Button type="link" disabled={!record.action.delete} size="small">
                    <DeleteOutlined />
                  </Button>
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
        action={hasPerm("usersys.admin_manageuser") ? action : null}>

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
