import React from 'react';
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
  Col,
  Icon,
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from './Filter';
import { Search } from './Search';
import ModalModifyOrgBDStatus from './NewModalModifyOrgBDStatus';
import BDModal from './BDModal';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { SelectOrgUser, SelectTrader } from './ExtraInput';
import { connect } from 'dva';
import styles from './OrgBDListComponent.css';

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

class OrgBDListComponent extends React.Component {
  
  constructor(props) {
    super(props);

    this.ids = (props.location.query.ids || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    this.projId = parseInt(props.location.query.projId, 10)
    this.projId = !isNaN(this.projId) ? this.projId : null;

    let filters = {...OrgBDFilter.defaultValue, proj: this.projId };
    let search = null;
    if (this.props.editable) {
      const setting = this.readSetting();
      filters = setting ? setting.filters : OrgBDFilter.defaultValue;
      search = setting ? setting.search : null;
    }

    this.state = {
        filters,
        search,
        page: 1,
        pageSize: this.props.pageSize || (this.ids.length ? this.ids.length + 1 : (getUserInfo().page || 10)),
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
        source: this.props.status||0,
        userDetail:[],
        expanded: []
    }
  }

  disabledDate = current => current && current < moment().startOf('day');

  componentDidMount() {
    this.getOrgBdList();
  }

  readSetting = () => {
    const data = localStorage.getItem('OrgBDList');
    return data ? JSON.parse(data) : null;
  };

  writeSetting = () => {
    const { filters, search } = this.state;
    const data = { filters, search };
    localStorage.setItem('OrgBDList', JSON.stringify(data));
  };

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

    let requestApi = api.getOrgBdBase;
    if (this.state.isAdd) {
      requestApi = (params) => { 
        return new Promise((resolve) => resolve({
          data: {
            data: this.ids.map(item => ({org: item, proj: this.projId}))
          }
        }))
      }
    }

    requestApi(params)
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

    if (this.props.editable) {
      this.writeSetting();
    }
    
  }

  getOrgBdListDetail = (org, proj) => {
    api.getOrgBdList({org, proj: proj || "none"}).then(result => {
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
        let newList = this.state.list.map(item => 
          item.id === `${org}-${proj}` ?
            {...item, items: list, loaded: true} :
            item
        )
        this.setState({
          list: newList,
        });
        if (this.state.currentBD) {
          const comments = result.data.data.filter(item => item.id == this.state.currentBD.id)[0].BDComments || [];
          this.setState({ comments });
        }
      })
    })
  }

  handleDelete(record) {
    api.deleteOrgBD(record.id)
      .then(data => this.getOrgBdListDetail(record.org.id, record.proj && record.proj.id))
      .catch(error => handleError(error));
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1, search: null }, this.getOrgBdList)
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

  addTimeline = () => {
    const { proj, bduser, manager } = this.state.currentBD;
    const params = {
      timelinedata: {
        'proj': proj.id,
        'investor': bduser,
        'trader': manager.id,
      },
      statusdata: {
        'alertCycle': 7,
        'transationStatus': 1,
        'isActive': true
      }
    }
    api.addTimeline(params);
  }

  handleConfirmBtnClicked = state => {

    // 添加备注
    if (state.comment.length > 0) {
      const body = {
        orgBD: this.state.currentBD.id,
        comments: state.comment,
      };
      api.addOrgBDComment(body);
    }

    const react = this;

    if (state.status === 2 && this.state.currentBD.response !== 2) {
      Modal.confirm({
        title: '是否同步创建时间轴？',
        content: '',
        onOk() {
          react.addTimeline();
          react.wechatConfirm(state);
        },
        onCancel() {
          react.wechatConfirm(state);
        },
      });
    } else {
      react.wechatConfirm(state);
    }
  }

  wechatConfirm = state => {
    const react = this;
    // 如果修改状态为2或者3即已签NDA或者正在看前期资料
    if (state.status !== this.state.currentBD.response && [2, 3].includes(state.status) && ![2, 3].includes(this.state.currentBD.response)) {
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
      response: status,
      isimportant: isimportant ? 1 : 0,
    }
    api.modifyOrgBD(this.state.currentBD.id, body)
      .then(result => 
        {
          if (status === this.state.currentBD.response || ![2, 3].includes(status) || ([2, 3].includes(status) && [2, 3].includes(this.state.currentBD.response))) {
            this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
          }
        }
        );

    if (status === this.state.currentBD.response || ![2, 3].includes(status) || ([2, 3].includes(status) && [2, 3].includes(this.state.currentBD.response))) return;

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
  handleOpenModal = bd => {
    this.setState({ commentVisible: true, currentBD: bd, comments: bd.BDComments || [] });
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
    return <div style={{minWidth: 180, maxWidth: 600}}>
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

  handleAddNew(record) {
    let key = Math.random()
    let list = this.state.list.map(item => 
      item.id === `${record.org.id}-${record.proj.id}` ?
        {...item, items: item.items.concat({key, new: true, isimportant: false, orgUser: null, trader: null, org: record.org, proj: record.proj, expirationtime: null})} :
        item
    )
    this.setState({ list })
  }

  updateSelection(record, change) {
    let list = this.state.list.map(line => 
      line.id !== `${record.org.id}-${record.proj.id}` ?
        line :
        {...line, items: line.items.map(item => 
          item.key !== record.key ?
          item :
          {...item, ...change}
        )}
    )
    this.setState({ list })
  }

  saveNewBD(record) {
    let body = {
      'bduser': record.orgUser >= 0 ? record.orgUser : null,
      'manager': record.trader,
      'org': record.org.id,
      'proj': record.proj.id,
      'isimportant':record.isimportant,
      'expirationtime':record.expirationtime ? record.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null,
      'bd_status': 1,
    }
    api.addOrgBD(body).then(result => {
      if (result && result.data) {
        let list = this.state.list.map(line => 
          line.id !== `${record.org.id}-${record.proj.id}` ?
            line :
            {...line, items: line.items.filter(item => item.key !== record.key).concat([result.data])}
        )
        this.setState({ list })
      }
    }).catch(error => {
      Modal.error({
        content: error.message || "未知错误",
      });
    })
  }

  discardNewBD(record) {
    let list = this.state.list.map(line => 
      line.id !== `${record.org.id}-${record.proj.id}` ?
        line :
        {...line, items: line.items.filter(item => item.key !== record.key)}
    )
    this.setState({ list })
  }

  handleRowClassName = (record, index) => {
    return styles['bd-status-' + record.response];
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers, expanded } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const importantImg={height:'10px',width:'10px',marginTop:'-15px',marginLeft:'-5px'}
    const columns = [
        {title: i18n('org_bd.org'), render: (text, record) => record.org ? record.org.orgname : null, key:'org', sorter:true},
        // {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: (text, record) => record.proj.id || '暂无'},
      ]

    const expandedRowRender = (record) => {
      const columns = [
        {title: i18n('org_bd.contact'), dataIndex: 'username', key:'username', 
        render:(text,record)=>{
          return record.new ? 
          <SelectOrgUser allStatus allowEmpty style={{width: "100%"}} type="investor" mode="single" optionFilterProp="children" org={record.org.id} value={record.orgUser} onChange={v=>{this.updateSelection(record, {orgUser: v})}}/>
          : <div>                  
              {record.isimportant ? <img style={importantImg} src = "../../images/important.png"/> :null} 
              {record.username? <Popover  placement="topRight" content={this.content(record)}>
                              <span style={{color:'#428BCA'}}>
                              {record.hasRelation ? <Link to={'app/user/edit/'+record.bduser}>{record.username}</Link> 
                              : record.username}
                              </span>                                  
                              </Popover> : '暂无'}    
            </div>
          },sorter:false},
        {title: i18n('org_bd.created_time'), render: (text, record) => {
            return record.new ? 
            <div>
              { timeWithoutHour(new Date()) + " - " }
              <DatePicker 
                placeholder="Expiration Date"
                disabledDate={this.disabledDate}
                // defaultValue={moment()}
                showToday={false}
                shape="circle"
                value={record.expirationtime}
                renderExtraFooter={() => {
                  return <div>
                    <Button type="dashed" size="small" onClick={()=>{this.updateSelection(record, {expirationtime: moment()})}}>Now</Button>
                    &nbsp;&nbsp;
                    <Button type="dashed" size="small" onClick={()=>{this.updateSelection(record, {expirationtime: moment().add(1, 'weeks')})}}>Week</Button>
                    &nbsp;&nbsp;
                    <Button type="dashed" size="small" onClick={()=>{this.updateSelection(record, {expirationtime: moment().add(1, 'months')})}}>Month</Button>
                  </div>
                }}
                onChange={v=>{this.updateSelection(record, {expirationtime: v})}}
              />
            </div>
            : ( (timeWithoutHour(record.createdtime + record.timezone) + " - ") + (record.expirationtime ? timeWithoutHour(record.expirationtime + record.timezone) : "Now" ) )
        }, key:'createdtime', sorter:false},
        {title: i18n('org_bd.creator'), render: (text, record) => {
          return record.new ? isLogin().username : record.createuser.username
        }, dataIndex:'createuser.username', key:'createuser', sorter:false},
        {title: i18n('org_bd.manager'), render: (text, record) => {
          return record.new ? 
          <SelectTrader style={{ width: "100%" }} mode="single" value={record.trader} onChange={v=>{this.updateSelection(record, {trader: v})}}/> : record.manager.username
        }, dataIndex: 'manager.username', key:'manager', sorter:false},
        {
          title: i18n('org_bd.status'), 
          render: (text, record) => {
            if (record.new) {
              return (
                <Checkbox
                  checked={record.isimportant}
                  onChange={v => { this.updateSelection(record, { isimportant: v.target.checked }) }}>
                  重点BD
                </Checkbox>
              );
            } else {
              return text && this.props.orgbdres.filter(f => f.id === text)[0].name;
            }
          }, 
          dataIndex: 'response', 
          key:'response', 
          sorter:false
        },
        {title: "最新备注", render: (text, record) => {
          let latestComment = record.BDComments && record.BDComments.length && record.BDComments[record.BDComments.length-1].comments || null;

          return record.new ? "暂无" : (latestComment ? <Popover placement="leftTop" title="最新备注" content={<p style={{maxWidth: 400}}>{latestComment}</p>}><div style={{color: "#428bca"}}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment }</div></Popover> : "暂无")
        }, key:'bd_latest_info'}]
        
        if (this.props.editable) columns.push({
            title: i18n('org_bd.operation'), render: (text, record) => 
            {
            if (record.new) {
              return (
                <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between'}}>
                  <div style={{marginRight:4}}>
                  <a style={buttonStyle} size="small" onClick={this.saveNewBD.bind(this, record)}>保存</a>
                  &nbsp;&nbsp;
                  <Popconfirm title="Sure to discard change?" onConfirm={this.discardNewBD.bind(this, record)}>
                    <a style={buttonStyle} size="small">取消</a>
                  </Popconfirm>
                  </div>
                </div>
              )
            } else {
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

                { hasPerm('BD.manageOrgBD') || getUserInfo().id === record.createuser.id ?
                  <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record)}>
                      <a type="danger"><img style={imgStyle} src="/images/delete.png" /></a>
                  </Popconfirm>
                  : null }

                </div>)
              }
            }
        })

      return (
        <div>
          <Table
            showHeader
            columns={columns}
            dataSource={record.items}
            size={"small"}
            rowKey={record=>record.id}
            pagination={false}
            loading={!record.loaded}
            rowClassName={this.handleRowClassName}
          />
          {this.props.editable ? 
            <Button 
              style={{float: 'right', margin: '5px 15px 5px 0'}} 
              onClick={this.handleAddNew.bind(this, record)}
            >{i18n('org_bd.new_user')}</Button> : null
          }
        </div>

      );
    }

    return (
      <div>
      {source!=0 ? <BDModal source={sourłe} element='org'/> : null}   

        { this.props.editable ?
          <OrgBDFilter
            defaultValue={filters}
            onSearch={this.handleFilt}
            onReset={this.handleReset}
            onChange={this.handleFilt}
          />
        : null}
        
        { this.props.editable && this.state.filters.proj !== null ?
          <div style={{ marginBottom: 16, textAlign: 'right' }} className="clearfix">
            <Search
              style={{ width: 200 }}
              placeholder="联系人/联系电话"
              onSearch={search => this.setState({ search, page: 1 }, this.getOrgBdList)}
              onChange={search => this.setState({ search })}
              value={search}
            />
          </div>
        : null}

        { this.state.filters.proj !== null ? 
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
          size={this.props.size || "middle"}
        />
        : null }

        { this.props.pagination && this.state.filters.proj !== null ?    
          <div style={{ margin: '16px 0' }} className="clearfix">
            
            { this.props.editable ? 
            <Link to={"/app/orgbd/add?projId=" + this.state.filters.proj}>
              <Icon type="plus-circle-o" style={{ fontSize: 24, color: '#08c', lineHeight: '33px', marginLeft: 54 }} />
            </Link>
            : null } 

            <Pagination
              style={{ float: 'right' }}
              size={this.props.paginationSize || 'middle'}
              total={total}
              current={page}
              pageSize={pageSize}
              onChange={page => this.setState({ page }, this.getOrgBdList)}
              showSizeChanger
              onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getOrgBdList)}
              showQuickJumper
              pageSizeOptions={['5', '10', '20', '30', '40', '50']}
            />
          </div>
        : null }

        { this.state.visible ? 
        <ModalModifyOrgBDStatus 
          visible={this.state.visible} 
          onCancel={() => this.setState({ visible: false })} 
          onOk={this.handleConfirmBtnClicked}
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

      </div>
    );
  }
}

function mapStateToProps(state) {
  const { orgbdres } = state.app;
  return { orgbdres };
}

export default connect(mapStateToProps)(OrgBDListComponent);

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
      {/* <div style={{marginBottom:'16px',display:'flex',flexDirection:'row',alignItems:'center'}}>
        <Input.TextArea rows={3} value={newComment} onChange={onChange} style={{flex:1,marginRight:16}} />
        <Button onClick={onAdd} type="primary" disabled={newComment == ''}>{i18n('common.add')}</Button>
      </div> */}
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

