import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
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
  Table, 
  Button, 
  Popconfirm, 
  Pagination, 
  Modal, 
  Input, 
  Popover,
  Row,
  Col
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from '../components/Filter';
import { Search2 } from '../components/Search';
import ModalModifyOrgBDStatus from '../components/ModalModifyOrgBDStatus';
import BDModal from '../components/BDModal';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';
  
class OrgBDList extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
        filters: OrgBDFilter.defaultValue,
        search: null,
        page: 1,
        pageSize: getUserInfo().page || 10,
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
    }
  }

  componentDidMount() {
    this.getOrgBdList();
  }

  getOrgBdList = () => {
    this.setState({ loading: true });
    const { page, pageSize, search, filters, sort, desc } = this.state;
    const params = {
        page_index: page,
        page_size: pageSize,
        search,
        ...filters,
        sort,
        desc
        
    }
    api.getOrgBdList(params)
    .then(result => { 
      let list = result.data.data
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
        this.setState({
          list,
          total: result.data.count,
          loading: false,
        });
        if (this.state.currentBD) {
          const comments = result.data.data.filter(item => item.id == this.state.currentBD.id)[0].BDComments || [];
          this.setState({ comments });
        }
    })
    })
  }

  handleDelete(id) {
    api.deleteOrgBD(id)
      .then(data => this.getOrgBdList())
      .catch(error => handleError(error));
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleModifyStatusBtnClicked(bd) {
    this.setState({ 
        visible: true, 
        currentBD: bd,
        status: bd.bd_status.id,
    });
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
            this.setState({ visible: false }, this.getOrgBdList)
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
        this.setState({ visible: false }, this.getOrgBdList)
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
            this.setState({ visible: false }, this.getOrgBdList)
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
  handleOpenModal = bd => {
    this.setState({ commentVisible: true, currentBD: bd, comments: bd.BDComments || [] });
  }

  handleAddComment = () => {
    const body = {
      orgBD: this.state.currentBD.id,
      comments: this.state.newComment,
    };
    api.addOrgBDComment(body)
      .then(data => this.setState({ newComment: '' }, this.getOrgBdList))
      .catch(error => handleError(error));
  }

  handleDeleteComment = id => {
    api.deleteOrgBDComment(id)
    .then(() => this.getOrgBdList())
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

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const importantImg={height:'10px',width:'10px',marginTop:'-15px',marginLeft:'-5px'}
    const columns = [
        {title: i18n('org_bd.contact'), dataIndex: 'username', key:'username', 
        render:(text,record)=>{
          return <div >                  
                  {record.isimportant ? <img style={importantImg} src = "../../images/important.png"/> :null} 
                  {record.username? <Popover  placement="topRight" content={this.content(record)}>
                                    <span style={{color:'#428BCA'}}>
                                    {record.hasRelation ? <Link to={'app/user/edit/'+record.bduser}>{record.username}</Link> 
                                    : record.username}
                                    </span>                                  
                                    </Popover> : '暂无'}                               
                                 
                 </div>
        },sorter:true },
        {title: i18n('org_bd.created_time'), render: (text, record) => {
            return timeWithoutHour(record.createdtime + record.timezone)
        }, key:'createdtime', sorter:true},
        {title: i18n('org_bd.creator'), dataIndex:'createuser.username', key:'createuser', sorter:true},
        {title: i18n('org_bd.manager'), dataIndex: 'manager.username', key:'manager', sorter:true},
        {title: i18n('org_bd.org'), render: (text, record) => record.org ? record.org.orgname : null, key:'org', sorter:true},
        {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: text => text || '暂无'},
        {title: i18n('org_bd.status'), dataIndex: 'bd_status.name', key:'bd_status', sorter:true},
        {
            title: i18n('org_bd.operation'), render: (text, record) => 
            {
            const latestComment = record.BDComments && record.BDComments[0]
            const comments = latestComment ? latestComment.comments : ''
            return (
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>

              { hasPerm('BD.manageOrgBD') || getUserInfo().id === record.manager.id ? 
              <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between'}}>
                <div style={{marginRight:4}}>
                <button style={buttonStyle} size="small" onClick={this.handleModifyStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</button>
                </div>
                <div>
                <a style={buttonStyle} href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record)}>{i18n('remark.comment')}</a>
                </div>
              </div>
              : null }

               { hasPerm('BD.manageOrgBD') ?
                <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record.id)}>
                    <a type="danger"><img style={imgStyle} src="/images/delete.png" /></a>
                </Popconfirm>
                : null }

              </div>)
            }
        },
       
      ]

    return (
      <LeftRightLayout 
        location={this.props.location} 
        name={i18n('menu.organization_bd')} 
        title={i18n('menu.bd_management')}
        action={hasPerm('BD.manageOrgBD') ? { name: i18n('add_orgbd'), link: '/app/orgbd/add' } : undefined}
      >
      {source!=0 ? <BDModal source={source} element='org'/> : null}   

        <OrgBDFilter
          defaultValue={filters}
          onSearch={this.handleFilt}
          onReset={this.handleReset}
          onChange={this.handleFilt}
        />
        
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }} className="clearfix">
          <Search2
            defaultValue={search}
            placeholder={i18n('project_bd.project_name')}
            style={{ width: 200, float: 'right' }}
            onSearch={search => this.setState({ search, page: 1 }, this.getOrgBdList)} 
          />
        </div>
        
        <Table
          onChange={this.handleTableChange}
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />
                
        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={page => this.setState({ page }, this.getOrgBdList)}
            showSizeChanger
            onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getOrgBdList)}
            showQuickJumper
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
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

      </LeftRightLayout>
    );
  }
}

export default OrgBDList;

export class Trader extends React.Component {
  state = {
    list: [], 
  }
  componentDidMount() {
    const param = { investoruser: this.props.investor}
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

