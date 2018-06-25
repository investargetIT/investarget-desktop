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
  Col,
  Switch,
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from '../components/Filter';
import { Search } from '../components/Search';
import ModalModifyOrgBDStatus from '../components/ModalModifyOrgBDStatus';
import BDModal from '../components/BDModal';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { SelectTrader } from '../components/ExtraInput';
import { SwitchButton } from '../components/SelectOrgInvestorToBD';
import OrgBDListComponent from '../components/OrgBDListComponent';
import { connect } from 'dva';
import './NewOrgBDNext.css';

var cloneObject = (obj) => JSON.parse(JSON.stringify(obj))

class H3 extends React.Component {
  render() { return <p style={{fontSize: this.props.size || '13px', fontWeight: 'bolder', marginTop: '5px', marginBottom: '10px', ...this.props.style}}>{this.props.children}</p> }
}

class NewOrgBDList extends React.Component {
  
  constructor(props) {
    super(props);

    this.orgList = {}
    this.userList = {}
    this.ids = (this.props.location.query.ids || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    this.projId = parseInt(this.props.location.query.projId, 10);
    this.projId = !isNaN(this.projId) ? this.projId : null;
    this.projDetail = {}

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
        expirationtime: null,
        ifimportantMap: {},
        isimportant: false,
        traderList: [],
    }

    this.allTrader = [];
  }

  disabledDate = current => current && current < moment().startOf('day');

  componentDidMount() {
    api.getProjDetail(this.projId)
      .then(result => {
        this.projDetail = result.data || {}
        this.getOrgBdList()
      })
      .catch(error => {
        this.getOrgBdList()
      })
    
    this.getAllTrader();
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' });
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
  }

  getOrgBdList = () => {
    this.setState({ loading: true, expanded: [] });
    const { page, pageSize } = this.state;
    const params = {
        page_size: 50,
        ids: this.ids
    }

    api.getOrg(params)
    .then(result => {
      let list = result.data.data
      list.forEach(item => {this.orgList[item.id] = item})
      this.setState({
        list: list.map(item => ({
          id: `${item.id}-${this.projId}`,
          org: item, 
          proj: {id: this.projId, name: this.projDetail.projtitleC},
          loaded: false,
          items: []
        })),
        total: result.data.count,
        loading: false,
        expanded: list.map(item => `${item.id}-${this.projId}`),
      }, () => this.state.list.map(m => this.getOrgBdListDetail(m.org.id)));
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
        api.queryUserGroup({ type: 'investor' }).then(data => {
          const groups = data.data.data.map(item => item.id)
          return api.getUser({starmobile: true, org: [org], groups, page_size: 1000})
        })
       .then(result => {
            result.data.data.forEach(user=>existUsersDetail[user.id]=this.userList[user.id]=user)
            list = list.map(bd=>({...existUsersDetail[bd.bduser], bd: bd, key: `${bd.id}-${bd.bduser}`})).filter(Boolean).filter(user => user.id)
                   .concat(result.data.data.filter(user=>!existUsers.includes(user.id)).map(user=>({...user, bd: null, key: `null-${user.id}`})))
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
    const photourl=user.userinfo&&user.userinfo.photourl
    const tags=user.userinfo&&user.userinfo.tags ? user.userinfo.tags.map(item=>item.name).join(',') :''
    const comments = user.BDComments || [];
    const orgbdres = user.response && this.props.orgbdres.filter(f => f.id === user.response)[0].name;
    const wechat = user.userinfo && user.userinfo.wechat;
    return <div style={{minWidth: 250}}>
          <Row style={{textAlign:'center',margin:'10px 0'}}>
            {photourl ? <img src={photourl} style={{width:'50px',height:'50px', borderRadius:'50px'}}/>:'暂无头像'}
          </Row>
          <SimpleLine title={"项目名称"} value={user.proj && user.proj.projtitle || "暂无"} />
          <SimpleLine title={"BD状态"} value={orgbdres || '暂无'} />
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

          { wechat ? 
          <SimpleLine title={i18n('user.wechat')} value={wechat} />
          : null }

          <Row style={{ lineHeight: '24px' }}>
            <Col span={12}>{i18n('remark.remark')}:</Col>
            <Col span={12} style={{wordWrap: 'break-word'}}>
            {comments.length>0 ? comments.map(item => <p key={item.id} >{item.comments}</p>) :'暂无'}
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

  // createOrgBD = () => {
  //   this.setState({ selectVisible: false });
  //   Promise.all(this.state.selectedKeys.map(userKey => {
  //     let user = this.userList[userKey]
  //     let body = {
  //       bduser: userKey,
  //       manager: this.state.manager,
  //       org: user.org.id,
  //       proj: this.projId,
  //       isimportant:this.state.ifimportantMap[userKey] || false,
  //       bd_status: 1,
  //       expirationtime: this.state.expirationtime ? this.state.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null
  //     };
  //     return api.addOrgBD(body);
  //   }))
  //     .then(result => {
  //       Modal.confirm({
  //           title: i18n('timeline.message.create_success_title'),
  //           content: i18n('create_orgbd_success'),
  //           okText:"继续创建BD",
  //           cancelText:"返回BD列表",
  //           onOk: () => { this.props.history.push({ pathname: '/app/orgbd/add' }) },
  //           onCancel: () => { this.props.history.push({ pathname: '/app/org/bd' }) }
  //         })
  //     })
  //     .catch(error => {
  //       Modal.error({
  //         content: error.message
  //       });
  //     });
  // }
 
  // handleSelectUser = () => {
  //   this.setState({ selectVisible: true });
  // }

  handleCreateBD = user => {
    this.activeUser = user;
    this.setState({ selectVisible: true });
    // 在为投资人分配IR时默认选中熟悉程度最高的交易师
    this.setDefaultTrader();
  }

  setDefaultTrader = () => {
    const params = {
      investoruser: this.activeUser.id,
      page_size: 1000,
    };
    api.getUserRelation(params)
      .then(result => {
        const newTraderList = [];
        result.data.data.forEach(element => {
          const familiar = this.props.famlv.filter(f => f.id === element.familiar)[0].score;
          const trader = { ...this.allTrader.filter(f => f.id === element.traderuser.id)[0]};
          trader.username += '(' + familiar + '分)';
          trader.familiar = familiar;
          newTraderList.push(trader);
        });
        this.allTrader.forEach(element => {
          if (!newTraderList.map(m => m.id).includes(element.id)) {
            newTraderList.push({ ...element, familiar: -1 });
          }
        });

        // 按照熟悉程度排序
        newTraderList.sort(function(a, b) {
          return b.familiar - a.familiar;
        });

        this.setState({ traderList: newTraderList, manager: newTraderList[0].id.toString() });
      })
  }

  getAllTrader() {
    api.queryUserGroup({ type: 'trader' })
    .then(data => api.getUser({ groups: data.data.data.map(m => m.id), userstatus: 2, page_size: 1000 }))
    .then(data => {
      this.allTrader = data.data.data; 
      this.setState({ traderList: this.allTrader });
    })
  }

  createOrgBD = () => {
    const user = this.activeUser;
    this.setState({ selectVisible: false });
    let body = {
      bduser: user.id,
      manager: this.state.manager,
      org: user.org.id,
      proj: this.projId,
      isimportant: this.state.isimportant,
      bd_status: 1,
      expirationtime: this.state.expirationtime ? this.state.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null
    };
    api.addOrgBD(body)
      .then(result => {
        this.setState({ manager: null, expirationtime: null, isimportant: false });
        this.getOrgBdListDetail(user.org.id);
      })
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers, expanded } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const importantImg={height:'10px',width:'10px',marginTop:'-15px',marginLeft:'-5px'}
    const columns = [
        {title: i18n('org_bd.org'), render: (text, record) => {
          let org = record.org
          if (!org) return "无效机构"
          let selectedUsers = this.state.selectedKeys.filter(userid=>this.userList[userid].org.id === org.id)
          return <div>
                  {record.org.orgname}
                  {(selectedUsers.length ? <Tag color="green" style={{marginLeft: 15}}>{`已选 ${selectedUsers.length} 人`}</Tag> : null)}
                </div>
        }, key:'org', sorter:false},
        // {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: (text, record) => record.proj.name || '暂无'},
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
        columns.push({title:i18n('org_bd.important') + '/操作', render:(text,record)=>{
          if (!record.bd) return <Button onClick={this.handleCreateBD.bind(this, record)}>创建BD</Button>
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
            rowKey={record=>record.key}
            pagination={false}
            loading={!record.loaded}
            size={"small"}
            // rowSelection={rowSelection}
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
        breadcrumb={' > ' + i18n('menu.organization_bd') + ' > ' + i18n('project.create_org_bd') + ` > ${this.projDetail.projtitleC || "暂无项目"}`}
        title={i18n('menu.bd_management')}
        action={{ name: '返回机构BD', link: '/app/org/bd' }}
      >
      {source!=0 ? <BDModal source={sourłe} element='org'/> : null}   

        {this.projId ?
          <div>
            <H3 size="1.2em">○ 该项目的历史BD</H3>
            <OrgBDListComponent location={this.props.location} pageSize={5} pagination />
          </div>
        : null }

        <H3 size="1.2em" style={{marginTop: "2em"}}>○ 选择机构列表</H3>
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

        {/* <div style={{ marginTop: 10, marginBottom: 10 }}>
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
        </div> */}

        {/* <div style={{textAlign: 'right', padding: '0 16px', marginTop: 10 }}>
          <Button disabled={this.state.selectedKeys.length === 0} type="primary" onClick={this.handleSelectUser.bind(this)}>{i18n('common.create')}</Button>
        </div> */}

        <Modal
          title="创建BD"
          visible={this.state.selectVisible}
          footer={null}
          onCancel={() => this.setState({ selectVisible: false })}
          closable={true}
          maskClosable={false}
        >
          <div style={{marginLeft: '15px'}}>
            <H3>1.选择交易师</H3>
            <SelectTrader
              style={{ width: 300 }}
              mode="single"
              data={this.state.traderList}
              value={this.state.manager}
              onChange={manager => this.setState({ manager })} />
            
            <H3>2.选择过期时间</H3>
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
              <span style={{ marginLeft: 40 }}>重点BD</span>
              <Switch
                defaultChecked={this.state.isimportant}
                onChange={checked => this.setState({ isimportant: checked })}
              />

            <Button style={{ float: "right", marginRight: 30 }} disabled={this.state.manager === null} type="primary" onClick={this.createOrgBD.bind(this)}>{i18n('common.confirm')}</Button>
          </div>
        </Modal>

      </LeftRightLayout>
    );
  }
}

function mapStateToProps(state) {
  const { famlv, orgbdres } = state.app;
  return { famlv, orgbdres };
}
export default connect(mapStateToProps)(NewOrgBDList);

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

