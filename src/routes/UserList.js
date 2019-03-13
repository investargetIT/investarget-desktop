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
import { UserListFilter } from '../components/Filter'
import { Search } from '../components/Search';
import { SelectTrader } from '../components/ExtraInput';
import { PAGE_SIZE_OPTIONS } from '../constants';

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const confirm = Modal.confirm

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
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      selectedUsers: [],
      selectedRecords:[],
      traders:[],
      trader:null,
      visible:false,
      sort:'createdtime',
      desc:1,
      ifShowCheckBox:false
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
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort, desc }
    console.log(desc+" "+sort)
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

    api.queryUserGroup({ type: 'investor' }).then(result=>{
      if(result.data.data.map(item=>item.id).includes(filters.groups)){
        this.setState({ifShowCheckBox:true})
      }else{
        this.setState({ifShowCheckBox:false})
      }
    })
  }
  

  handleSortChange = value => {
    this.setState({desc:value == 'desc' ? 1 : 0},this.getUser)
    
  }

  handleTimeChange = value =>{
    this.setState({sort:value},this.getUser)
  }

  deleteUser = id => {
    api.deleteUser(id)
    .then(result => this.getUser())
    .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
  }

  showModal = (id, username) => {
    this.modal.showModal(id, username)
  }

  handleSelectChange = (selectedUsers,selectedRecords) => {
    
    let newUsers=selectedRecords.filter(item=>{
      return !this.state.selectedRecords.includes(item)
    })
    newUsers = [...this.state.selectedRecords,...newUsers].filter(item=>{
      return selectedUsers.includes(item.id)
    })
    this.setState({ selectedUsers, selectedRecords:newUsers })
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
   
  showModifyTraderModal = () =>{ 
    this.setState({visible:true})
  }
 
  comfirmModify = () =>{
    let promises=this.state.selectedRecords.map(user=>{
      let body = {
      investoruser: user.id,
      traderuser: this.state.trader,
      relationtype: true
      }
      let weakTraders=[]
      if([2, 3].includes(user.userstatus)){    //审核通过
        return api.getUserRelation({investoruser: user.id})
        .then(result=>{         
          result.data.data.forEach(item=>{
            if(item.relationtype==false){
              weakTraders.push(item)     //获取弱交易师
            }
          })
          let existUser=weakTraders.find(item=>{return item.traderuser.id==this.state.trader})
          if(existUser){          
            return api.deleteUserRelation([existUser.id])    //删除已存在的弱交易师
          }
          weakTraders=[]
        })
        .then(data=>{
          if(user.trader_relation&&user.trader_relation.traderuser.username){
            return api.editUserRelation([{ ...body, id: user.trader_relation.id }])   //修改已存在的强交易师
          }else{
            return api.addUserRelation(body)               //添加强交易师
          }
        })       
      }
    })
    Promise.all(promises).then((data)=>{
      this.setState({selectedUsers:[], selectedRecords:[], trader:null, visible:false}, this.getUser)
    })
  }
  componentDidMount() {
    this.getUser()

    api.queryUserGroup({ type: 'trader' })
    .then(data =>api.getUser({ groups: data.data.data.map(m => m.id), userstatus: 2, page_size: 1000 }))
    .then(data => this.setState({ traders: data.data.data }))
    .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }));

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
    const { selectedUsers, filters, search, list, total, page, pageSize, loading, sort, desc} = this.state
    const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
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
          return <div style={{ display: 'flex' }}>
            { record.mobiletrue ?
            <i style={{ fontSize: 20, marginTop: 1, marginRight: 2 }} className="fa fa-mobile-phone"></i>
            : null }
            <Link to={'/app/user/' + record.id}>{record.username}</Link>
            </div>
        }
        //sorter:true,
      },
      {
        title: i18n("organization.org"),
        dataIndex: 'org.orgfullname',
        key: 'org',
        sorter:true,
      },
      {
        title: i18n("user.position"),
        dataIndex: 'title',
        key: 'title',
        sorter: true,
        render: value => this.loadLabelByValue('title', value),
      },
      {
        title: i18n("user.tags"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? <span className="span-tag">{this.loadLabelByValue('tag', tags)}</span> : null,
        sorter:true,
      },
      {
        title: i18n("account.role"),
        dataIndex: 'groups',
        key: 'role',
        render: groups => this.loadLabelByValue('group', groups),
      },
      {
        title: i18n("user.status"),
        dataIndex: 'userstatus',
        key: 'userstatus',
        sorter:true,
        render: value => this.loadLabelByValue('audit', value),
      },
      {
        title: i18n("user.trader"),
        dataIndex: 'trader_relation.traderuser.username',
        key: 'trader',
        //sorter:true,
      },
      {
        title: '是否活跃',
        dataIndex: 'is_active',
        key: 'is_active',
        sorter: true,
        render: text => text ? '活跃' : '静默',
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

        <div style={{ overflow: 'auto', marginBottom: 24 }}>

          <Search
            style={{ width: 240 }}
            placeholder={[i18n('email.username'),i18n('organization.org'), i18n('mobile'), i18n('email.email')].join(' / ')} 
            onSearch={this.handleSearch}
            onChange={search => this.setState({ search })}
            value={search}
          />
          <div style={{ float: 'right' }}>
            
            <Select size="large" style={{marginLeft:8}} defaultValue="createdtime" onChange={this.handleTimeChange.bind(this)}>
              <Option value="createdtime">{i18n('common.sort_by_created_time')}</Option>
              <Option value="lastmodifytime">{i18n('common.sort_by_modify_time')}</Option>
            </Select>
            <Select size="large" style={{marginLeft:8}} defaultValue="desc" onChange={this.handleSortChange.bind(this)}>
              <Option value="asc">{i18n('common.asc_order')}</Option>
              <Option value="desc">{i18n('common.dec_order')}</Option>
            </Select>
          </div>
        </div>

        <Modal
          title="请选择交易师"
          visible={this.state.visible}
          onOk={this.comfirmModify}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
          closable={false}
        >
 
          <SelectTrader
             style={{ width: 300 }}
             mode="single"
             data={this.state.traders}
             value={this.state.trader}
             onChange={trader => this.setState({ trader })} />

          <Button style={{ marginLeft: 10 }} disabled={this.state.trader === null} type="primary" onClick={this.comfirmModify}>{i18n('common.confirm')}</Button>

        </Modal>

        <Table
          onChange={this.handleTableChange}
          rowSelection={this.state.ifShowCheckBox ? rowSelection :null}
          columns={columns}
          dataSource={list}
          loading={loading}
          rowKey={record => record.id}
          pagination={false} />

        <div style={{ margin: '16px 0' }} className="clearfix">
        <Button disabled={selectedUsers.length==0} style={{ backgroundColor: 'orange', border: 'none' }} type="primary" size="large" onClick={this.showModifyTraderModal}>{i18n('user.modify_trader')}</Button>
        
        <Pagination
          style={{ float: 'right' }}
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handlePageChange}
          onShowSizeChange={this.handlePageSizeChange}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
        </div>

        <div style={{ display: 'flex' }}>
          <i style={{ fontSize: 20, marginTop: 1, marginRight: 2 }} className="fa fa-mobile-phone"></i>
          表示该用户的联系方式可用
        </div>

      </LeftRightLayout>
    )

  }

}

function mapStateToProps(state) {
  const { title, tag, audit, group } = state.app;
  return { title, tag, audit, group };
}

export default connect(mapStateToProps)(UserList);
