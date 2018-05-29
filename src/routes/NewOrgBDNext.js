import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import moment from 'moment';
import { 
  i18n, 
  timeWithoutHour, 
  time, 
  handleError, 
  hasPerm, 
  getUserInfo, 
} from '../utils/util';
import * as api from '../api';
import { 
  message,
  Table, 
  Button, 
  Popconfirm, 
  Pagination, 
  Modal, 
  Input, 
  Popover,
  Checkbox,
  DatePicker,
  Row,
  Tag,
  Col
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from '../components/Filter';
import { Search } from '../components/Search';
import ModalModifyOrgBDStatus from '../components/ModalModifyOrgBDStatus';
import BDModal from '../components/BDModal';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { SelectOrgUser, SelectTrader } from '../components/ExtraInput';
import { SwitchButton } from '../components/SelectOrgInvestorToBD';

import './NewOrgBDNext.css';

var cloneObject = (obj) => JSON.parse(JSON.stringify(obj))

class DBSelectOrgUser extends React.Component {
  constructor(props) {
    super(props)
    this.state = {value: props.value}
  }
  render() {
    return (
      <SelectOrgUser style={{width: "100%"}} org={this.props.org} type="investor" mode="single" optionFilterProp="children" value={this.state.value} onChange={value => this.setState({value})}/>
  )}
}

class DBSelectTrador extends React.Component {
  constructor(props) {
    super(props)
    this.state = {value: props.value}
  }
  render() {
    return (
      <SelectTrader style={{ width: "100%" }} mode="single" value={this.state.value} onChange={value => this.setState({value})}/>
  )}
}

class NewOrgBDList extends React.Component {
  
  constructor(props) {
    super(props);

    this.orgList = {}
    this.userList = {}
    this.ids = (this.props.location.query.ids || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    this.projId = parseInt(this.props.location.query.projId, 10);
    this.projId = !isNaN(this.projId) ? this.projId : null;

    this.state = {
        filters: OrgBDFilter.defaultValue,
        search: null,
        page: 1,
        pageSize: this.props.location.query.ids ? this.ids.length + 1 : (getUserInfo().page || 10),
        total: 0,
        manager: null,
        list: [],
        loading: false,
        visible: false,
        currentBD: null,
        comments: [],
        newComment: '',
        status: null,
        commentVisible: false,
        selectVisible: false,
        sort:undefined,
        desc:undefined,
        source:this.props.location.query.status||0,
        expanded: [],
        selectedKeys: [],
        data: null,
        expirationtime: null,
        ifimportantMap: {}
    }
  }

  disabledDate = current => current && current < moment().startOf('day');

  componentDidMount() {
    this.getOrgBdList();
  }

  getOrgBdList = () => {
    this.setState({ loading: true, expanded: [] });
    const { page, pageSize, search, filters, sort, desc } = this.state;
    const params = {
        page_index: page,
        page_size: pageSize,
        search,
        ...filters,
        sort,
        desc,
        org: filters.org.map(m => m.key),
        proj: filters.proj || 'none',
    }

    api.getOrgBdBase(params)
    .then(baseResult => {
      let baseList = baseResult.data.data
      api.getOrg({ids: baseList.map(item => item.org).filter(item => item), page_size: pageSize})
      .then(result => {
        let list = result.data.data
        list.forEach(item => {this.orgList[item.id] = item})
        this.setState({
          list: baseList.map(item => ({
            id: `${item.org}-${item.proj}`,
            org: this.orgList[item.org], 
            proj: {id: item.proj},
            loaded: false,
            items: []
          })),
          total: baseResult.data.count,
          loading: false
        })
      })
    })
  }

  getOrgBdListDetail = (org) => {
    api.getOrgBdList({org, proj: this.projId || "none"}).then(result => {
      let list = result.data.data
      let existUsers = list.map(bd=>bd.bduser)
      let existUsersDetail = {};
      let promises = list.map(item=>{
        if(item.bduser){
          return api.checkUserRelation(isLogin().id, item.bduser)
        }
        else{
          return {data:false}
        }
      })
      Promise.all(promises).then(data=>{
        data.forEach((item,index)=>{
          list[index].hasRelation=item.data          
        })
        if (this.state.currentBD) {
          const comments = result.data.data.filter(item => item.id == this.state.currentBD.id)[0].BDComments || [];
          this.setState({ comments });
        }
        api.getUser({starmobile: true, org: [org]}).then(result => {
            result.data.data.forEach(user=>existUsersDetail[user.id]=this.userList[user.id]=user)
            list = list.map(bd=>({...existUsersDetail[bd.bduser], bd: bd})).filter(Boolean)
                   .concat(result.data.data.filter(user=>!existUsers.includes(user.id)).map(user=>({...user, bd: null})))
            let newList = this.state.list.map(item => 
              item.id === `${org}-${this.projId}` ?
                {...item, items: list, loaded: true} :
                item
            )
            this.setState({
              list: newList,
            });
        })
      })
    })
  }

  handleStatusChange = (status) => {
    this.setState({ status })
  }

  checkExistence = (mobile, email) => {
    return new Promise((resolve, reject) => {
      Promise.all([api.checkUserExist(mobile), api.checkUserExist(email)])
        .then(result => {
          for (let item of result) {
            if (item.data.result === true)
              resolve(true);
          }
          resolve(false);
        })
        .catch(err => reject(err));
    });
  }

  wechatConfirm = state => {
    const react = this;
    if ( state.status === 3 && this.state.currentBD.bd_status.id !==3 ) {
      if (!this.state.currentBD.bduser) {
        this.checkExistence(state.mobile, state.email).then(ifExist => {
          if (ifExist) {
            Modal.error({
              content: i18n('user.message.user_exist')
            });
          } else {
            this.handleConfirmAudit(state, true);
          }
        })
      } else {
        // 已经有联系人时
        if (this.state.currentBD.wechat && this.state.currentBD.wechat.length > 0) {
          // 该联系人已经有微信
          Modal.confirm({
            title: '警告',
            content: '联系人微信已存在，是否覆盖现有微信',
            onOk: () => this.handleConfirmAudit(state, true), 
            onCancel:  () => this.handleConfirmAudit(state),
          });
        } else {
          // 该联系人没有微信
          this.handleConfirmAudit(state, true);
        }
      }
    } else {
      this.handleConfirmAudit(state, true);
    }
  }

  handleConfirmAudit = ({ status, isimportant, username, mobile, wechat, email, group, mobileAreaCode }, isModifyWechat) => {
    const body = {
      bd_status: status,
      isimportant: isimportant ? 1 : 0,
    }
    api.modifyOrgBD(this.state.currentBD.id, body)
      .then(result => 
        {
          if (status !== 3 || this.state.currentBD.bd_status.id === 3){
            this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
          }
        }
        );

    if (status !== 3 || this.state.currentBD.bd_status.id === 3) return;

    // 如果机构BD存在联系人
    if (this.state.currentBD.bduser) {
      // 首先检查经理和投资人的关联
      api.checkUserRelation(this.state.currentBD.bduser, this.state.currentBD.manager.id)
        .then(result => {
          // 如果存在关联或者有相关权限并且确定覆盖微信，则直接修改用户信息
          if (result.data || hasPerm('usersys.admin_changeuser') && isModifyWechat) {
            api.editUser([this.state.currentBD.bduser], { wechat });
          } else {
            api.addUserRelation({
              relationtype: false,
              investoruser: this.state.currentBD.bduser,
              traderuser: this.state.currentBD.manager.id
            })
              .then(result => {
                if (isModifyWechat) {
                  api.editUser([this.state.currentBD.bduser], { wechat });
                }
              })
              .catch(error => {
                if (!isModifyWechat) return;
                if (error.code === 2025) {
                  Modal.error({
                    content: '该用户正处于保护期，无法建立联系，因此暂时无法修改微信',
                  });
                }
              });
          }
        });

      // 承做和投资人建立联系
      this.addRelation(this.state.currentBD.bduser);

      api.addOrgBDComment({
        orgBD: this.state.currentBD.id,
        comments: `${i18n('user.wechat')}: ${wechat}`
      }).then(data=>{
        this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
      });
    // 如果机构BD不存在联系人
    } else {
      api.addOrgBDComment({
        orgBD: this.state.currentBD.id,
        comments: `${i18n('account.username')}: ${username} ${i18n('account.mobile')}: ${mobile} ${i18n('user.wechat')}: ${wechat} ${i18n('account.email')}: ${email}`
      });
      const newUser = { mobile, wechat, email, mobileAreaCode, groups: [Number(group)], userstatus: 2 };
      if (window.LANG === 'en') {
        newUser.usernameE = username;
      } else {
        newUser.usernameC = username;
      }
      this.checkExistence(mobile,email).then(ifExist=>{
        if(ifExist){
          Modal.error({
          content: i18n('user.message.user_exist')
        });
        }
        else{
        api.addUser(newUser)
          .then(result =>{
            api.addUserRelation({
            relationtype: false,
            investoruser: result.data.id,
            traderuser: this.state.currentBD.manager.id
          }).then(data=>{
            this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
          })
          });
        }
      })
      }
    }
  
  // 如果机构BD有项目并且这个项目有承做，为承做和联系人建立联系
  addRelation = investorID =>{
    if (this.state.currentBD.makeUser && this.state.currentBD.proj) {
      api.addUserRelation({
        relationtype: false,
        investoruser: investorID,
        traderuser: this.state.currentBD.makeUser,
        proj: this.state.currentBD.proj.id,
      })
    }
  }

  handleAddComment = () => {
    const body = {
      orgBD: this.state.currentBD.id,
      comments: this.state.newComment,
    };
    api.addOrgBDComment(body)
      .then(data => this.setState({ newComment: '' }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id)))
      .catch(error => handleError(error));
  }

  handleDeleteComment = id => {
    api.deleteOrgBDComment(id)
    .then(() => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
    .catch(error => handleError(error));
  }
  
  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getOrgBdList
    );
  }

  content(user) {
    const photourl=user.useinfo&&user.useinfo.photourl
    const tags=user.useinfo&&user.useinfo.tags ? user.useinfo.tags.map(item=>item.name).join(',') :''
    const comments=user.BDComments ? user.BDComments.map(item=>item.comments):[]
    return <div style={{minWidth: 250}}>
          <Row style={{textAlign:'center',margin:'10px 0'}}>
            {photourl ? <img src={photourl} style={{width:'50px',height:'50px', borderRadius:'50px'}}/>:'暂无头像'}
          </Row>
          <SimpleLine title={"项目名称"} value={user.proj || "暂无"} />
          <SimpleLine title={"BD状态"} value={user.bd_status.name || "暂无"} />
          <SimpleLine title={"到期日期"} value={user.expirationtime ? timeWithoutHour(user.expirationtime + user.timezone) : "未设定"} />
          <SimpleLine title={"负责人"} value={user.manager.username || "暂无"} />
          <SimpleLine title={"创建人"} value={user.createuser.username || "暂无"} />
          <Row style={{ lineHeight: '24px', borderBottom: '1px dashed #ccc' }}>
            <Col span={12}>{i18n('user.trader')}:</Col>
            <Col span={12} style={{wordBreak: 'break-all'}}>
            <Trader investor={user.bduser} />
            </Col>
          </Row>
          <SimpleLine title={i18n('user.tags')} value={tags||'暂无'} />
          <SimpleLine title={i18n('user.wechat')} value={user.wechat||'暂无'} />
          <Row style={{ lineHeight: '24px' }}>
            <Col span={12}>{i18n('remark.remark')}:</Col>
            <Col span={12} style={{wordWrap: 'break-word'}}>
            {comments.length>0 ? comments.map(item=>{return (<p >{item}</p>)}) :'暂无'}
            </Col>
          </Row>
           </div>
  }

  onExpand(expanded, record) {
    let currentId = record.id

    let newExpanded = this.state.expanded
    let expandIndex = newExpanded.indexOf(currentId)

    if (expandIndex < 0) {
      newExpanded.push(currentId)
      this.getOrgBdListDetail(record.org.id, record.proj.id)
    } else {
      newExpanded.splice(expandIndex, 1)
    }

    this.setState({ expanded: newExpanded })
  }

  handleMore(record) {
    // let key = Math.random()
    // let list = this.state.list.map(item => 
    //   item.id === `${record.org.id}-${record.proj.id}` ?
    //     {...item, items: item.items.concat({key, new: true, isimportant: false, orgUser: null, trader: null, org: record.org, proj: record.proj, expirationtime: null})} :
    //     item
    // )
    // this.setState({ list })
  }

  handleLoadTrader = investorUserRelation => {
    this.investorTrader.push(investorUserRelation);
    const listWithInvestor = this.state.list.filter(f => f.id !== null);
    if (this.investorTrader.length === listWithInvestor.length) {
      this.props.dispatch({
        type: 'app/setSortedTrader',
        payload: this.investorTrader, 
      }); 
    }
  }

  loadLabelByValue(type, value) {
    if (Array.isArray(value) && this.props.tag.length > 0) {
      return value.map(m => this.props[type].filter(f => f.id === m)[0].name).join(' / ');
    } else if (typeof value === 'number') {
      return this.props[type].filter(f => f.id === value)[0].name;
    }
  }

  handleSwitchChange = (record, ifimportant) => {
    let id=record.id
    this.setState({ifimportantMap:{...this.state.ifimportantMap,[id]:ifimportant}})
    const userList = this.props.value
    const index = _.findIndex(userList, function(item) {
      return item.investor+"_"+item.org == id
    })
    if (index > -1) {
      userList[index].isimportant=ifimportant
      this.props.onChange(userList)
    }
  }

  handleDeleteUser(userKey) {
    this.setState({ selectedKeys: this.state.selectedKeys.filter(key => key !== userKey) })
  }

  createOrgBD = () => {
    this.setState({ selectVisible: false });
    Promise.all(this.state.selectedKeys.map(userKey => {
      let user = this.userList[userKey]
      let body = {
        bduser: userKey,
        manager: this.state.manager,
        org: user.org.id,
        proj: this.projId,
        isimportant:this.state.ifimportantMap[userKey] || false,
        bd_status: 1,
        expirationtime: this.state.expirationtime ? this.state.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null
      };
      console.log(body)
      return api.addOrgBD(body);
    }))
      .then(result => {
        Modal.confirm({
            title: i18n('timeline.message.create_success_title'),
            content: i18n('create_orgbd_success'),
            okText:"继续创建BD",
            cancelText:"返回BD列表",
            onOk: () => { this.props.history.push({ pathname: '/app/orgbd/add' }) },
            onCancel: () => { this.props.history.push({ pathname: '/app/org/bd' }) }
          })
      })
      .catch(error => {
        Modal.error({
          content: error.message
        });
      });
  }
 
  handleSelectUser = () => {
    this.setState({ selectVisible: true });
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers, expanded } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const importantImg={height:'10px',width:'10px',marginTop:'-15px',marginLeft:'-5px'}
    const columns = [
        {title: i18n('org_bd.org'), render: (text, record) => record.org ? record.org.orgname : null, key:'org', sorter:true},
        {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: (text, record) => record.proj.id || '暂无'},
      ]

    const expandedRowRender = (record) => {
      const columns = [
        {
          title: i18n('user.name'), key: 'username', dataIndex: 'username',
          render: (text, record) => <div>
            {record.username ? (record.bd ? <Popover placement="topLeft" content={this.content(record.bd)}>
              <span style={{ color: '#428BCA' }}>{ record.username }</span>
              </Popover> : record.username ) : '暂无投资人'}
          </div>
        },
        // { title: i18n('organization.org'), key: 'orgname', dataIndex: 'org.orgname' },
        // { title: i18n('user.position'), key: 'title', dataIndex: 'title', render: text => this.loadLabelByValue('title', text) || '暂无' },
        { title: i18n('mobile'), key: 'mobile', dataIndex: 'mobile', render: text => text || '暂无' },
        { title: i18n('account.email'), key: 'email', dataIndex: 'email', render: text => text || '暂无' },
        { title: i18n('user.trader'), key: 'transaction', render: (text, record) => record.id ? <Trader investor={record.id} onLoadTrader={this.handleLoadTrader} /> : '暂无' } 
        
      ]
      if(this.props.source!="meetingbd"){
        columns.push({title:i18n('org_bd.important'), render:(text,record)=>{
          if (!record.bd) return <SwitchButton onChange={this.handleSwitchChange.bind(this,record)} />
          else return <div>{record.bd.isimportant ? "是" : "否"}</div>
        }})
      }

      let allKeys = record.items.map(user=>user.id)
      const rowSelection = {
        selectedRowKeys: this.state.selectedKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          let selected = this.state.selectedKeys
          selected = selected.filter(key => !allKeys.includes(key))
          selected = selected.concat(selectedRowKeys.filter(key => !selected.includes(key)))
          this.setState({ selectedKeys: selected })
        },
        getCheckboxProps: record => ({
          disabled: Boolean(record.bd),
          name: record.name,
        }),
      };

      return (
        <div>
          <Table
            // showHeader={false}
            columns={columns}
            dataSource={record.items}
            rowKey={record=>record.id}
            pagination={false}
            loading={!record.loaded}
            size={"small"}
            rowSelection={rowSelection}
          />
          {/* <Button 
            style={{float: 'right', margin: '15px 15px 0 0'}} 
            onClick={this.handleMore.bind(this, record)}
          >{"展示更多"}</Button> */}
        </div>

      );
    }

    return (
      <LeftRightLayout 
        location={this.props.location} 
        breadcrumb={' > ' + i18n('menu.organization_bd') + ' > ' + i18n('project.create_org_bd')}
        title={i18n('menu.bd_management')}
        action={{ name: '返回机构BD', link: '/app/org/bd' }}
      >
      {source!=0 ? <BDModal source={sourłe} element='org'/> : null}   

        <Table
          className="new-org-db-style"
          onChange={this.handleTableChange}
          columns={columns}
          expandedRowRender={expandedRowRender}
          expandRowByClick
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          onExpand={this.onExpand.bind(this)}
          expandedRowKeys={expanded}
          pagination={false}
          size={"middle"}
        />

        <div style={{ marginTop: 10, marginBottom: 10 }}>
          {this.state.selectedKeys.map(user => 
            <Tag 
              key={this.userList[user].id} 
              closable 
              style={{ marginBottom: 8 }} 
              onClose={this.handleDeleteUser.bind(this, user)}
            >
              {`${this.userList[user].org.orgfullname || "无机构"} - ${this.userList[user].username}`}
            </Tag>
          )}
        </div>

        <div style={{textAlign: 'right', padding: '0 16px'}}>
          <Button disabled={this.state.selectedKeys.length === 0} type="primary" onClick={this.handleSelectUser.bind(this)}>{i18n('common.create')}</Button>
        </div>

        { this.state.visible ? 
        <ModalModifyOrgBDStatus 
          visible={this.state.visible} 
          onCancel={() => this.setState({ visible: false })} 
          status={this.state.status}
          onStatusChange={this.handleStatusChange}
          onOk={this.wechatConfirm}
          bd={this.state.currentBD}
        />
        : null }

        <Modal
          title={i18n('remark.comment')}
          visible={this.state.commentVisible}
          footer={null}
          onCancel={() => this.setState({ commentVisible: false, newComment: '', currentBD: null, comments: [] })}
          maskClosable={false}
        >
          <BDComments
            comments={this.state.comments}
            newComment={this.state.newComment}
            onChange={e => this.setState({ newComment: e.target.value })}
            onAdd={this.handleAddComment}
            onDelete={this.handleDeleteComment} 
          />
        </Modal>

        <Modal
          title="创建BD"
          visible={this.state.selectVisible}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
          closable={false}
        >
          <div style={{marginLeft: '15px'}}>
            <p style={{fontSize: '13px', fontWeight: 'bolder', marginTop: '5px', marginBottom: '10px'}}> 1.选择交易师</p>
            <SelectTrader
              style={{ width: 300 }}
              mode="single"
              data={this.state.data}
              value={this.state.manager}
              onChange={manager => this.setState({ manager })} />
            
            <p style={{fontSize: '13px', fontWeight: 'bolder', marginTop: '15px', marginBottom: '10px'}}> 2.选择过期时间</p>
            <DatePicker 
                  style={{ marginBottom: '15px' }}
                  placeholder="Expiration Date"
                  disabledDate={this.disabledDate}
                  // defaultValue={moment()}
                  showToday={false}
                  shape="circle"
                  value={this.state.expirationtime}
                  renderExtraFooter={() => {
                    return <div>
                      <Button type="dashed" size="small" onClick={()=>{this.setState({expirationtime: moment()})}}>Now</Button>
                      &nbsp;&nbsp;
                      <Button type="dashed" size="small" onClick={()=>{this.setState({expirationtime: moment().add(1, 'weeks')})}}>Week</Button>
                      &nbsp;&nbsp;
                      <Button type="dashed" size="small" onClick={()=>{this.setState({expirationtime: moment().add(1, 'months')})}}>Month</Button>
                    </div>
                  }}
                  onChange={v=>{this.setState({expirationtime: v})}}
                />

            <Button style={{ float: "right", marginRight: 30 }} disabled={this.state.manager === null} type="primary" onClick={this.createOrgBD.bind(this)}>{i18n('common.confirm')}</Button>
          </div>
        </Modal>

      </LeftRightLayout>
    );
  }
}

export default NewOrgBDList;

export class Trader extends React.Component {
  state = {
    list: [], 
  }
  componentDidMount() {
    const param = { investoruser: this.props.investor}
    api.queryUserGroup({ type: 'investor' }).then(data => {
    this.investorGroupIds = data.data.data.map(item => item.id);
    })
    api.getUserRelation(param).then(result => {
      echo(result);
      const data = result.data.data.sort((a, b) => Number(b.relationtype) - Number(a.relationtype))
      const list = []
      data.forEach(item => {
        const trader = item.traderuser
        if (trader) {
          list.push({ label: trader.username, value: trader.id, onjob: trader.onjob })
        }
        this.setState({ list });
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }
  render () {
    const traders=this.state.list.length>0 ? this.state.list.map(m =>m.label).join(',') :'暂无'
    return <span>
      {traders}
    </span>
  }
}

export function SimpleLine(props) {
  return (
    <Row style={{ lineHeight: '24px',borderBottom: '1px dashed #ccc' }}>
      <Col span={12}>{props.title + '：'}</Col>
      <Col span={12} style={{wordWrap: 'break-word'}}>{props.value}</Col>
    </Row>
  );
}

function BDComments(props) {
  const { comments, newComment, onChange, onDelete, onAdd } = props
  return (
    <div>
      <div style={{marginBottom:'16px',display:'flex',flexDirection:'row',alignItems:'center'}}>
        <Input.TextArea rows={3} value={newComment} onChange={onChange} style={{flex:1,marginRight:16}} />
        <Button onClick={onAdd} type="primary" disabled={newComment == ''}>{i18n('common.add')}</Button>
      </div>
      <div>
        {comments.length ? comments.map(comment => (
          <div key={comment.id} style={{marginBottom:8}}>
            <p>
              <span style={{marginRight: 8}}>{time(comment.createdtime + comment.timezone)}</span>
              { hasPerm('BD.manageOrgBD') ?
              <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                <a href="javascript:void(0)">{i18n('common.delete')}</a>
              </Popconfirm> 
              : null}
            </p>
            <p dangerouslySetInnerHTML={{__html:comment.comments.replace(/\n/g,'<br>')}}></p>
          </div>
        )) : <p>{i18n('remark.no_comments')}</p>}
      </div>
    </div>
  )
}

