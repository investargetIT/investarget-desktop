import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { i18n, hasPerm } from '../utils/util'
import * as api from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { UserListFilter } from '../components/Filter'
import { Search2 } from '../components/Search';
import { SelectUser } from '../components/ExtraInput';

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
      pageSize,
      total: 0,
      list: [],
      loading: false,
      selectedUsers: [],
      selectedRecords:[],
      traders:[],
      trader:null,
      visible:false,
      sort:undefined,
      desc:undefined,
      ifShowCheckBox:false
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

    api.queryUserGroup({ type: 'investor' }).then(result=>{
      if(result.data.data.map(item=>item.id).includes(filters.groups)){
        this.setState({ifShowCheckBox:true})
      }else{
        this.setState({ifShowCheckBox:false})
      }
    })
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
      if(user.userstatus.id == 2){    //审核通过
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

    
  }

  render() {
    const { selectedUsers, filters, search, list, total, page, pageSize, loading, sort, desc} = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
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

        <Modal
          title="请选择交易师"
          visible={this.state.visible}
          onOk={this.comfirmModify}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
          closable={false}
        >
 
          <SelectUser
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
          className="ant-table-pagination"
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handlePageChange}
          onShowSizeChange={this.handlePageSizeChange}
          showSizeChanger
          showQuickJumper />
        </div>

      </LeftRightLayout>
    )

  }

}

export default connect()(UserList)
