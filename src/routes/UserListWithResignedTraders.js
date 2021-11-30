import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { 
  i18n, 
  hasPerm,
  getUserInfo,
  requestAllData,
} from '../utils/util';
import * as api from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { UserListFilter } from '../components/Filter'
import { Search } from '../components/Search';
import { SelectIndustryGroup, SelectTrader } from '../components/ExtraInput';
import { PAGE_SIZE_OPTIONS } from '../constants';
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const confirm = Modal.confirm

class UserListWithResignedTraders extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: getUserInfo().page || 10,
      indGroup: undefined,
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
    const { indGroup, page, pageSize } = this.state;
    const params = { page_index: page, page_size: pageSize, indGroup };
    this.setState({ loading: true });
    api.getInvestorWithResignedTrader(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
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
   
  // showModifyTraderModal = () =>{ 
  //   this.setState({visible:true})
  // }
 
  // comfirmModify = () =>{
  //   let promises=this.state.selectedRecords.map(user=>{
  //     let body = {
  //     investoruser: user.id,
  //     traderuser: this.state.trader,
  //     relationtype: true
  //     }
  //     let weakTraders=[]
  //     if([2, 3].includes(user.userstatus)){    //审核通过
  //       return api.getUserRelation({investoruser: user.id})
  //       .then(result=>{         
  //         result.data.data.forEach(item=>{
  //           if(item.relationtype==false){
  //             weakTraders.push(item)     //获取弱交易师
  //           }
  //         })
  //         let existUser=weakTraders.find(item=>{return item.traderuser.id==this.state.trader})
  //         if(existUser){          
  //           return api.deleteUserRelation([existUser.id])    //删除已存在的弱交易师
  //         }
  //         weakTraders=[]
  //       })
  //       .then(data=>{
  //         if(user.trader_relation&&user.trader_relation.traderuser.username){
  //           return api.editUserRelation([{ ...body, id: user.trader_relation.id }])   //修改已存在的强交易师
  //         }else{
  //           return api.addUserRelation(body)               //添加强交易师
  //         }
  //       })       
  //     }
  //   })
  //   Promise.all(promises).then((data)=>{
  //     this.setState({selectedUsers:[], selectedRecords:[], trader:null, visible:false}, this.getUser)
  //   })
  // }
  componentDidMount() {
    this.getUser()

    api.queryUserGroup({ type: 'trader' })
    .then(data => requestAllData(api.getUser, { groups: data.data.data.map(m => m.id), userstatus: 2 }, 100))
    .then(data => this.setState({ traders: data.data.data }))
    .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }));

    this.props.dispatch({ type: 'app/getSource', payload: 'title' }); 
    this.props.dispatch({ type: 'app/getGroup' }); 
  }

  loadLabelByValue(type, value) {
    if (this.props[type].length === 0) return;
    if (Array.isArray(value) && this.props.tag.length > 0) {
      return value.map(m => this.props[type].filter(f => f.id === m)[0].name).join(' / ');
    } else if (typeof value === 'number') {
      return this.props[type].filter(f => f.id === value)[0].name;
    }
  }

  handleIndGroupChange = value => {
    this.setState({ indGroup: value || undefined }, this.getUser);
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
      },
      {
        title: i18n("organization.org"),
        dataIndex: ['org', 'orgfullname'],
        key: 'org',
      },
      {
        title: i18n("user.position"),
        dataIndex: ['title', 'name'],
        key: 'title',
      },
      {
        title: i18n("user.tags"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? <span className="span-tag">{tags.map(m => m.name).join('/')}</span> : null,
      },
      {
        title: i18n("user.status"),
        dataIndex: ['userstatus', 'name'],
        key: 'userstatus',
      },
      {
        title: '是否活跃',
        dataIndex: 'is_active',
        key: 'is_active',
        render: text => text ? '活跃' : '静默',
      },
      {
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
              <span className="span-operation">

                <Link to={'/app/user/edit/' + record.id}>
                  <Button style={buttonStyle} size="small"><EditOutlined /></Button>
                </Link>

                <Popconfirm title={i18n('delete_confirm')} onConfirm={this.deleteUser.bind(null, record.id)}>
                  <Button style={buttonStyle} size="small">
                    <DeleteOutlined />
                  </Button>
                </Popconfirm>
              </span>
        ),
      }
    ]

    return (
      <LeftRightLayout
        location={this.props.location} title="离职交易师">

        <SelectIndustryGroup
          style={{ marginBottom: 20, width: 200 }}
          size="middle"
          placeholder="请选择行业组"
          allowClear
          onChange={this.handleIndGroupChange}
        />
        

        {/* <Modal
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

        </Modal> */}

        <Table
          onChange={this.handleTableChange}
          rowSelection={this.state.ifShowCheckBox ? rowSelection :null}
          columns={columns}
          dataSource={list}
          loading={loading}
          rowKey={record => record.id}
          pagination={false} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
        {/* <Button disabled={selectedUsers.length==0} style={{ backgroundColor: 'orange', border: 'none' }} type="primary" size="large" onClick={this.showModifyTraderModal}>{i18n('user.modify_trader')}</Button> */}
        
        <div style={{ display: 'flex' }}>
          <i style={{ fontSize: 20, marginTop: 1, marginRight: 2 }} className="fa fa-mobile-phone"></i>
          表示该用户的联系方式可用
        </div>

        <Pagination
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

      </LeftRightLayout>
    )

  }

}

function mapStateToProps(state) {
  const { title, tag, audit, group } = state.app;
  return { title, tag, audit, group };
}

export default connect(mapStateToProps)(UserListWithResignedTraders);
