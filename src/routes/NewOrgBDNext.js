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

function displayUserWhenPopover(user) {
  const photourl = user && user.photourl;
  const tags = user && user.tags ? user.tags.map(item => item.name).join(',') : '';
  return <div style={{ width: 180 }}>
    <Row style={{ textAlign: 'center', margin: '10px 0' }}>
      {photourl ? <img src={photourl} style={{ width: '50px', height: '50px', borderRadius: '50px' }} /> : '暂无头像'}
    </Row>
    {/* <SimpleLine title={i18n('user.mobile')} value={user.mobile || '暂无'} /> */}
    {/* <SimpleLine title={i18n('user.email')} value={user.email || '暂无'} /> */}
    {/* <Row style={{ lineHeight: '24px', borderBottom: '1px dashed #ccc' }}> */}
      {/* <Col span={12}>{i18n('user.trader')}:</Col> */}
      {/* <Col span={12} style={{ wordBreak: 'break-all' }}> */}
        {/* <TraderForPopover investor={user.id} /> */}
      {/* </Col> */}
    {/* </Row> */}
    <Row style={{ lineHeight: '24px' }}>
      <Col span={12}>{i18n('user.tags') + '：'}</Col>
      <Col span={12} style={{wordWrap: 'break-word'}}>{tags || '暂无'}</Col>
    </Row>
  </div>;
}

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

    this.ids = (this.props.location.query.ids || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    this.projId = parseInt(this.props.location.query.projId, 10);
    this.projId = !isNaN(this.projId) ? this.projId : null;

    this.state = {
        filters: OrgBDFilter.defaultValue,
        search: null,
        page: 1,
        pageSize: this.props.location.query.ids ? this.ids.length + 1 : (getUserInfo().page || 10),
        total: 0,
        list: [],
        loading: false,
        visible: false,
        currentBD: null,
        comments: [],
        newComment: '',
        status: null,
        commentVisible: false,
        sort:undefined,
        desc:undefined,
        source:this.props.location.query.status||0,
        userDetail:[],
        expanded: []
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
        let orgList = {}
        list.forEach(item => {orgList[item.id] = item})
        this.setState({
          list: baseList.map(item => ({
            id: `${item.org}-${item.proj}`,
            org: orgList[item.org], 
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
            list = list.concat(result.data.data.filter(user=>!existUsers.includes(user.id)).map(user=>({
              ...user,
              bduser: user.id,
              new: true,
              proj: this.projId,
              org: {id: org},
              usermobile: user.mobile
            })))
            let newList = this.state.list.map(item => 
              item.id === `${org}-${this.projId}` ?
                {...item, items: list, loaded: true} :
                item
            )
            console.log(list);
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
    return <div style={{minWidth: 180}}>
          <Row style={{textAlign:'center',margin:'10px 0'}}>
            {photourl ? <img src={photourl} style={{width:'50px',height:'50px', borderRadius:'50px'}}/>:'暂无头像'}
          </Row>
          <SimpleLine title={i18n('user.mobile')} value={user.usermobile ||'暂无'} />
          <SimpleLine title={i18n('user.wechat')} value={user.wechat||'暂无'} />
          <SimpleLine title={i18n('user.email')} value={user.email||'暂无'} />
          <Row style={{ lineHeight: '24px', borderBottom: '1px dashed #ccc' }}>
            <Col span={12}>{i18n('user.trader')}:</Col>
            <Col span={12} style={{wordBreak: 'break-all'}}>
            <Trader investor={user.bduser} />
            </Col>
          </Row>
          <SimpleLine title={i18n('user.tags')} value={tags||'暂无'} />
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
    console.log(value)
    if (Array.isArray(value) && this.props.tag.length > 0) {
      return value.map(m => this.props[type].filter(f => f.id === m)[0].name).join(' / ');
    } else if (typeof value === 'number') {
      return this.props[type].filter(f => f.id === value)[0].name;
    }
  }

  handleSwitchChange = (record, ifimportant) => {
    let id=record.id+"_"+record.org.id
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
            {record.username ? <Popover placement="topLeft" content={displayUserWhenPopover(record)}>
              <span style={{ color: '#428BCA' }}>{ record.username }</span>
            </Popover> : '暂无投资人'}
          </div>
        },
        // { title: i18n('organization.org'), key: 'orgname', dataIndex: 'org.orgname' },
        // { title: i18n('user.position'), key: 'title', dataIndex: 'title', render: text => this.loadLabelByValue('title', text) || '暂无' },
        { title: i18n('mobile'), key: 'mobile', dataIndex: 'usermobile', render: text => text || '暂无' },
        { title: i18n('account.email'), key: 'email', dataIndex: 'email', render: text => text || '暂无' },
        { title: i18n('user.trader'), key: 'transaction', render: (text, record) => record.bduser ? <Trader investor={record.bduser} onLoadTrader={this.handleLoadTrader} /> : '暂无' } 
        
      ]
      if(this.props.source!="meetingbd"){
        columns.push({title:i18n('org_bd.important'), render:(text,record)=>{
          if (record.new) return <SwitchButton onChange={this.handleSwitchChange.bind(this,record)} />
          else return <div>{record.isimportant ? "是" : "否"}</div>
        }})
      }

      const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: record => ({
          disabled: record.new !== true,
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
          <Button 
            style={{float: 'right', margin: '15px 15px 0 0'}} 
            onClick={this.handleMore.bind(this, record)}
          >{"展示更多"}</Button>
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

