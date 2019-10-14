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
import ModalModifyOrgBDStatus from './ModalModifyOrgBDStatus';
import BDModal from './BDModal';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { SelectOrgInvestor, SelectTrader } from './ExtraInput';
import { connect } from 'dva';
import styles from './OrgBDListComponent.css';
import ModalAddUser from './ModalAddUser';

function tableToExcel(table, worksheetName) {
  var uri = 'data:application/vnd.ms-excel;base64,'
  var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
  var base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
  var format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

  var ctx = { worksheet: worksheetName, table: table.outerHTML }
  var href = uri + base64(format(template, ctx))
  return href
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

class OrgBDListComponent extends React.Component {
  
  constructor(props) {
    super(props);

    this.showUnreadOnly = props.location.query.showUnreadOnly ? true : false,
    this.ids = (props.location.query.ids || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    this.projId = parseInt(props.location.query.projId, 10)
    this.projId = !isNaN(this.projId) ? this.projId : null;

    this.manager = parseInt(props.location.query.manager, 10);
    this.manager = !isNaN(this.manager) ? [this.manager] : [];
    
    let filters = {...OrgBDFilter.defaultValue, proj: this.projId, manager: this.manager };
    if (this.showUnreadOnly) {
      filters.isRead = false;
    }
    let search = null;
    if (this.props.editable && this.projId === null) {
      const setting = this.readSetting();
      filters = setting ? setting.filters : OrgBDFilter.defaultValue;

      // 为了兼容之前版本，过段时间可以将此段代码删除
      if (!Array.isArray(filters.response)) {
        filters.response = [];
      }

      search = setting ? setting.search : null;
    }

    const currentSession = getUserInfo();
    if (!currentSession.is_superuser && currentSession.permissions.includes('usersys.as_trader')) {
      filters.manager = [currentSession.id];
    }

    this.state = {
        showUnreadOnly: this.showUnreadOnly, // 是否只显示未读的机构BD任务
        filters,
        search,
        page: 1,
        pageSize: this.props.pageSize || (this.ids.length ? this.ids.length + 1 : (currentSession ? currentSession.page : 10)),
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
        expanded: [],
        traderList: [],
        makeUser: undefined, // 项目承做
        takeUser: undefined, // 项目承揽
        statistic: [],
        org: null, // 为哪个机构添加投资人
        exportLoading: false,
        listForExport: [],
        expandedForExport: [],
    }

    this.allTrader = [];
  }

  disabledDate = current => current && current < moment().startOf('day');

  componentDidMount() {
    this.getOrgBdList();
    this.getAllTrader();
    this.props.dispatch({ type: 'app/getGroup' });
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' });
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.orgbdres.length !== this.props.orgbdres.length) {
      this.getStatisticData().then(data => this.setState({ statistic: data }));
    }
    if (nextProps.refresh !== this.props.refresh) {
      this.getOrgBdList();
    }
  }

  getStatisticData = async () => {
    const count = await api.getOrgBDCountNew({ proj: this.state.filters.proj });
    return count.data.response_count.map(m => ({ status: m.response, count: m.count }));
  }

  getAllTrader() {
    api.queryUserGroup({ type: 'trader' })
    .then(data => api.getUser({ 
      groups: data.data.data.map(m => m.id), 
      userstatus: 2, 
      page_size: 1000, 
      // org: !hasPerm('BD.manageOrgBD') ? [isLogin().org.id] : undefined, 
    }))
    .then(data => {
      this.allTrader = data.data.data; 
      this.setState({ traderList: this.allTrader });
    })
  }

  readSetting = () => {
    const data = localStorage.getItem('OrgBDList');
    return data ? JSON.parse(data) : null;
  };

  writeSetting = () => {
    const { filters, search } = this.state;
    const saveFilters = {
      proj: filters.proj,
      manager: [],
      org: [],
      response: []
    };
    const data = { filters: saveFilters, search };
    localStorage.setItem('OrgBDList', JSON.stringify(data));
  };

  getOrgBdList = () => {
    this.setState({ loading: true, expanded: [] });
    const { page, pageSize, search, filters, sort, desc } = this.state;

    // 获取当前筛选项目的承揽和承做，是否显示创建BD按钮需要根据当前用户是否是承揽或承做来决定
    const proj = filters.proj;
    if (proj) {
      api.getProjDetail(proj)
      .then(result => {
        const makeUser = result.data.makeUser && result.data.makeUser.id;
        const takeUser = result.data.takeUser && result.data.takeUser.id;
        this.setState({ makeUser, takeUser });
        if (this.props.editable) {
          this.writeSetting();
        }
      })
      .catch(handleError);
    }

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

    let baseResult, baseList;
    requestApi(params)
      .then(result => {
        baseResult = result;
        baseList = baseResult.data.data;
        return api.getOrg({ids: baseList.map(item => item.org).filter(item => item), page_size: pageSize})
      })
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
          loading: false,
          expanded: baseList.map(item => `${item.org}-${item.proj}`),
        }, () => this.state.list.map(m => this.getOrgBdListDetail(m.org.id, m.proj.id)));
      })
      .catch(handleError);
      if (this.props.orgbdres.length > 0) {
        this.getStatisticData().then(data => this.setState({ statistic: data }));
      }
  }

  getOrgBdListDetail = (org, proj) => {
    const { manager, response } = this.state.filters;
    api.getOrgBdList({org, proj: proj || "none", manager, response, search: this.state.search, page_size: 100, isRead: this.state.showUnreadOnly ? false : undefined}).then(result => {
      let list = result.data.data
      let promises = list.map(item=>{
        if(item.bduser && ![4, 5, 6, null].includes(item.response)) {
          const params = {
            proj: proj.id,
            investor: item.bduser,
            trader: item.manager.id,
            isClose: false,
          }
          // return api.getTimeline(params);
          return {
            data: { 
              count: 1, 
              data: [{ id: true }] 
            }
          };
        } else {
          return { 
            data: { count: 0 }
          }
        }
      });
      Promise.all(promises).then(data=>{
        data.forEach((item,index)=>{
          if (item.data.count > 0) {
            list[index].timeline = item.data.data[0].id;  
          }
        })
        let newList = this.state.list.map(item => 
          item.id === `${org}-${proj}` ?
            {...item, items: list, loaded: true} :
            item
        )
        this.setState({
          list: newList,
        }, () => api.readOrgBD({ bds: list.map(m => m.id )}));
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

  syncTimeline = async state => {
    const { proj, bduser, manager } = this.state.currentBD;
    const params = {
      proj: proj.id,
      investor: bduser,
      trader: manager.id,
      isClose: false,
    };
    const checkTimeline = await api.getTimeline(params);

    if (checkTimeline.data.count === 0) {
      return await this.addTimeline(state.status);
    } else {
      const timeline = checkTimeline.data.data[0];
      return await api.editTimeline(timeline.id, {
        statusdata: {
          transationStatus: state.status
        }
      });
    }
  }

  addTimeline = status => {
    const { proj, bduser, manager } = this.state.currentBD;
    const params = {
      timelinedata: {
        'proj': proj.id,
        'investor': bduser,
        'trader': manager.id,
        'createuser': manager.id,
      },
      statusdata: {
        'alertCycle': 7,
        'transationStatus': status,
        'isActive': true
      }
    }
    return api.addTimeline(params);
  }

  handleConfirmBtnClicked = state => {
    let comments = '';
    // 由非空状态变为不跟进，记录之前状态，相关issue #285
    if (state.status === 6 && ![6, null].includes(this.state.currentBD.response)) {
      const oldStatus = this.props.orgbdres.filter(f => f.id === this.state.currentBD.response)[0].name;
      comments = [state.comment.trim(), `之前状态${oldStatus}`].filter(f => f !== '').join('，');
    } else {
      comments = state.comment.trim();
    }
    // 添加备注
    if (comments.length > 0) {
      const body = {
        orgBD: this.state.currentBD.id,
        comments,
      };
      api.addOrgBDComment(body);
    }

    // 如果状态改为了已见面、已签NDA或者正在看前期资料，则同步时间轴
    // if ([1, 2, 3].includes(state.status) && this.state.currentBD.response !== state.status) {
      // this.syncTimeline(state).then(() => this.wechatConfirm(state));
    // } else {
      this.wechatConfirm(state);
    // }
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
        if (this.state.currentBD.userinfo.wechat && this.state.currentBD.userinfo.wechat.length > 0 && state.wechat.length > 0) {
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

  handleConfirmAudit = ({ status, isimportant, username, mobile, wechat, email, group, mobileAreaCode, comment }, isModifyWechat) => {
    const body = {
      response: status,
      isimportant: isimportant ? 1 : 0,
      remark: comment,
    }
    api.modifyOrgBD(this.state.currentBD.id, body)
      .then(result => 
        {
          if (status === this.state.currentBD.response || ![1, 2, 3].includes(status) || ([1, 2, 3].includes(status) && [1, 2, 3].includes(this.state.currentBD.response))) {
            this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
          }
        }
        );

    if (status === this.state.currentBD.response || ![1, 2, 3].includes(status) || ([1, 2, 3].includes(status) && [1, 2, 3].includes(this.state.currentBD.response))) return;
    // 如果机构BD存在联系人
    if (this.state.currentBD.bduser) {
      // 首先检查经理和投资人的关联
      api.checkUserRelation(this.state.currentBD.bduser, this.state.currentBD.manager.id)
        .then(result => {
          // 如果存在关联或者有相关权限并且确定覆盖微信，则直接修改用户信息
          if ((result.data || hasPerm('usersys.admin_changeuser')) && isModifyWechat) {
            api.addUserRelation({
              relationtype: true,
              investoruser: this.state.currentBD.bduser,
              traderuser: this.state.currentBD.manager.id
            })
            api.editUser([this.state.currentBD.bduser], { wechat: wechat === '' ? undefined : wechat });
          } else {
            api.addUserRelation({
              relationtype: true,
              investoruser: this.state.currentBD.bduser,
              traderuser: this.state.currentBD.manager.id
            })
              .then(result => {
                if (isModifyWechat) {
                  api.editUser([this.state.currentBD.bduser], { wechat: wechat === '' ? undefined : wechat });
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
          // 重新加载这条记录，保证修改了的微信能在鼠标hover时正确显示
          this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id);
        });

      // 承做和投资人建立联系
      this.addRelation(this.state.currentBD.bduser);

      if (wechat.length > 0) {
        api.addOrgBDComment({
          orgBD: this.state.currentBD.id,
          comments: `${i18n('user.wechat')}: ${wechat}`
        }).then(data => {
          this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
        });
      } else {
        this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
      }
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
            relationtype: true,
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
    const photourl=user.userinfo&&user.userinfo.photourl
    const tags=user.userinfo&&user.userinfo.tags ? user.userinfo.tags.map(item=>item.name).join(',') :''
    const comments = user.BDComments || [];
    const mobile = user.userinfo && user.userinfo.mobile;
    const email = user.userinfo && user.userinfo.email;
    const wechat = user.userinfo && user.userinfo.wechat;
    const title = user.usertitle && user.usertitle.name;
    return <div style={{minWidth: 180, maxWidth: 600}}>
          <Row style={{textAlign:'center',margin:'10px 0'}}>
            {photourl ? <img src={photourl} style={{width:'50px',height:'50px', borderRadius:'50px'}}/>:'暂无头像'}
          </Row>

          { mobile ? 
          <SimpleLine title={i18n('user.mobile')} value={mobile} />
          : null }

          { wechat ? 
          <SimpleLine title={i18n('user.wechat')} value={wechat} />
          : null }

          { email ? 
          <SimpleLine title={i18n('user.email')} value={email} />
          : null }

          {/* <SimpleLine title={i18n('user.position')} value={title||'暂无'} /> */}

          <SimpleLine title={i18n('user.tags')} value={tags||'暂无'} />

          <Row style={{ lineHeight: '24px', borderBottom: '0px dashed #ccc' }}>
            <Col span={12}>{i18n('user.trader')}:</Col>
            <Col span={12} style={{wordBreak: 'break-all'}}>
            <Trader investor={user.bduser} />
            </Col>
          </Row>
          
          {/* <Row style={{ lineHeight: '24px' }}>
            <Col span={12}>{i18n('remark.remark')}:</Col>
            <Col span={12} style={{wordWrap: 'break-word'}}>
            {comments.length > 0 ? comments.map(item=><p key={item.id}>{item.comments}</p>) :'暂无'}
            </Col>
          </Row> */}
          
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
    const id = Math.random();
    let list = this.state.list.map(item => 
      item.id === `${record.org.id}-${record.proj.id}` ?
        {...item, items: item.items.concat({id, key, new: true, isimportant: false, orgUser: null, trader: null, org: record.org, proj: record.proj, expirationtime: moment().add(1, 'weeks')})} :
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
    if(!change.orgUser) return;
    const params = {
      investoruser: change.orgUser,
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

        // 找出熟悉程度最高的一个交易师
        let newList = this.state.list.map(line => 
          line.id !== `${record.org.id}-${record.proj.id}` ?
            line :
            {...line, items: line.items.map(item => 
              item.key !== record.key ?
              item :
              {...item, trader: newTraderList[0].id.toString()}
            )}
        );

        this.setState({ traderList: newTraderList, list: newList });
      })
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
    api.getUserSession()
      .then(() => api.addOrgBD(body))
      .then(result => {
        if (result && result.data) {
          let list = this.state.list.map(line =>
            line.id !== `${record.org.id}-${record.proj.id}` ?
              line :
              { ...line, items: line.items.filter(item => item.key !== record.key).concat([result.data]) }
          )
          this.setState({ list, traderList: this.allTrader });
        }
      })
      .catch(handleError);
  }

  discardNewBD(record) {
    let list = this.state.list.map(line => 
      line.id !== `${record.org.id}-${record.proj.id}` ?
        line :
        {...line, items: line.items.filter(item => item.key !== record.key)}
    )
    this.setState({ list, traderList: this.allTrader })
  }

  handleRowClassName = (record, index) => {
    return styles['bd-status-' + record.response];
  }

  isAbleToCreateBD = () => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    if (hasPerm('BD.user_addOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if ([this.state.makeUser, this.state.takeUser].includes(currentUserID)) {
      return true;
    }
    return false;
  }

  isAbleToModifyStatus = record => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if ([this.state.makeUser, this.state.takeUser, record.manager.id, record.createuser.id].includes(currentUserID)) {
      return true;
    }
    return false;
  }

  handleAddInvestorBtnClicked = org => {
    this.setState({ org });
  }

  handleExportBtnClicked = () => {
    this.setState({ exportLoading: true });
    this.loadAllOrgBD()
      .then(data => {
        this.setState({ 
          exportLoading: false,
          listForExport: data,
          expandedForExport: data.map(m => m.id),
        }, this.downloadExportFile);
      })
  }

  downloadExportFile = () => {
    var link = document.createElement('a');
    link.download = 'Investors.xls';

    var table = document.querySelectorAll('table')[0];
    table.border = '1';

    var cells = table.querySelectorAll('td, th');
    cells.forEach(element => {
      element.style.textAlign = 'center';
      element.style.verticalAlign = 'middle';
    });

    link.href = tableToExcel(table, '机构BD');
    link.click();
  }

  loadAllOrgBD = async () => {
    const { search, filters } = this.state;
    const params = {
        page_size: 1000,
        search,
        ...filters,
        org: filters.org.map(m => m.key),
        proj: filters.proj || 'none',
    };
    let allOrgs = await api.getOrgBdBase(params);
    allOrgs = allOrgs.data.data.map(item => ({
      id: `${item.org}-${item.proj}`,
      org: item.org,
      proj: { id: item.proj },
      loaded: false,
      items: []
    }));

    const { manager, response } = this.state.filters;
    for (let index = 0; index < allOrgs.length; index++) {
      const element = allOrgs[index];
      const orgBD = await api.getOrgBdList({org: element.org, proj: element.proj.id || "none", manager, response, search: this.state.search});
      element.items = orgBD.data.data;
      element.loaded = true;
      if (orgBD.data.count > 0) {
        element.org = orgBD.data.data[0].org;
      }
    }
    
    allOrgs = allOrgs.reduce((prev, cur) => prev.concat(cur.items), []);

    return allOrgs;
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers, expanded } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const importantImg={height:'10px',width:'10px',marginTop:'-15px',marginLeft:'-5px'}
    const columns = [
        {
          title: i18n('org_bd.org'),
          key:'org', 
          sorter: false, 
          render: (text, record) => record.org ? 
            <div>
              {record.org.orgname}
              <a style={{ marginLeft: 10 }} onClick={this.handleAddInvestorBtnClicked.bind(this, record.org)}>添加投资人</a>
            </div>
            : null, 
        },
        // {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: (text, record) => record.proj.id || '暂无'},
      ]

    const columnsForExport = [
      { title: i18n('org_bd.org'), key:'org', dataIndex: 'org.orgname', className: 'orgname', width: '15%' },
      { title: i18n('org_bd.contact'), dataIndex: 'username', key:'username', width: '10%' },
      { title: i18n('org_bd.manager'), dataIndex: 'manager.username', key:'manager', width: '10%' },
      {
        title: i18n('org_bd.status'), 
        render: text => text && this.props.orgbdres.filter(f => f.id === text)[0].name, 
        dataIndex: 'response', 
        key:'response',
        width: '10%', 
      },
      {
        title: "最新备注", 
        render: text => text && text.length && text[text.length - 1].comments || null,
        key:'bd_latest_info',
        width: '25%',
        dataIndex: 'BDComments',
      },
      {
        title: "全部备注", 
        render: comments => comments ? comments.map(m => (
          `创建人：${m.createuser && m.createuser.username}，创建时间：${m.createdtime.slice(0, 16).replace('T', ' ')}，备注内容：${m.comments}`
        )).join('\r\n') : null,
        key:'bd_all_comments',
        width: '30%',
        dataIndex: 'BDComments',
      },
    ];

    const expandedRowRender = (record) => {
      const columns = [
        {title: i18n('org_bd.contact'), dataIndex: 'username', key:'username', 
        render:(text,record)=>{
          return record.new ? 
          <SelectOrgInvestor 
            allStatus 
            onjob 
            allowEmpty 
            style={{width: "100%"}} 
            type="investor" 
            mode="single" 
            optionFilterProp="children" 
            org={record.org.id} 
            value={record.orgUser} 
            onChange={v=>{this.updateSelection(record, {orgUser: v})}}
          />
          : <div style={{ width: 100 }}>                  
              {record.isimportant ? <img style={importantImg} src = "../../images/important.png"/> :null} 
              { record.username ? 
              <Popover placement="topRight" content={this.content(record)}>
                <span style={{color:'#428BCA'}}>
                  {/* { record.hasRelation ? 
                  <Link to={'app/user/edit/'+record.bduser}>{record.username}</Link> 
                  : record.username } */}
                  <a target="_blank" href={'/app/user/' + record.bduser}>{record.username}</a>
                </span>                                  
              </Popover> 
              : '暂无' }
            </div>
          },sorter:false},
          {
            title: '职位',
            key: 'title',
            render: (undefined, record) => record.new || !record.usertitle ? '' : record.usertitle.name,
          },
          {title: i18n('org_bd.creator'), render: (text, record) => {
            return record.new ? isLogin().username : record.createuser.username
          }, dataIndex:'createuser.username', key:'createuser', sorter:false},
          {title: i18n('org_bd.manager'), render: (text, record) => {
            return record.new ? 
            <SelectTrader style={{ width: "100%" }} data={this.state.traderList} mode="single" value={record.trader} onChange={v=>{this.updateSelection(record, {trader: v})}}/> : <div style={{ width: 160 }}>{record.manager.username}</div>
          }, dataIndex: 'manager.username', key:'manager', sorter:false},
        {title: '任务时间', render: (text, record) => {
          if (record.new) {
            return <div>
              { timeWithoutHour(new Date()) + " - " }
              <DatePicker 
                placeholder="过期时间"
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
          } else {
            if (record.response !== null) {
              return '正常';
            }
            if (record.expirationtime === null) {
              return '无过期时间';
            }
            const ms = moment(record.expirationtime).diff(moment());
            const d = moment.duration(ms);
            const remainDays = Math.ceil(d.asDays());
            return remainDays >= 0 ? `剩余${remainDays}天` : <span style={{ color: 'red' }}>{`过期${Math.abs(remainDays)}天`}</span>;
          }
        }, key:'createdtime', sorter:false},
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
                  <Popconfirm title="确定取消？" onConfirm={this.discardNewBD.bind(this, record)}>
                    <a style={buttonStyle} size="small">取消</a>
                  </Popconfirm>
                  </div>
                </div>
              )
            } else {
              const latestComment = record.BDComments && record.BDComments[0]
              const comments = latestComment ? latestComment.comments : ''
              return <span>

                { /* 修改状态和备注按钮 */ }
                { this.isAbleToModifyStatus(record) ? 
                <span>
                  <button style={{ ...buttonStyle, marginRight: 4 }} size="small" onClick={this.handleModifyStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</button>
                  <a style={{ ...buttonStyle, marginRight: 4 }} href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record)}>{i18n('remark.comment')}</a>
                </span>
                : null }

                { /* 查看时间轴按钮 */ }
                {/* { record.timeline ? 
                <Link to={`/app/timeline/list?proj=${record.proj.id}&investor=${record.bduser}&trader=${record.manager.id}`} style={{ ...buttonStyle, marginRight: 4 }}>查看时间轴</Link>
                : null } */}

                { /* 删除按钮 */ }
                { hasPerm('BD.manageOrgBD') || getUserInfo().id === record.createuser.id ?
                <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record)}>
                  <Button style={{ ...buttonStyle, color: undefined }}>
                    <Icon type="delete" />
                  </Button>
                </Popconfirm>
                : null }

              </span>
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
          {this.props.editable && this.isAbleToCreateBD() ? 
            <Button 
              style={{float: 'right', margin: '5px 15px 5px 0'}} 
              onClick={this.handleAddNew.bind(this, record)}
            >新增BD</Button> : null
          }
        </div>

      );
    }
    
    return (
      <div>
      {source!=0 ? <BDModal source={sourłe} element='org'/> : null}   

        { this.props.editable && !this.state.showUnreadOnly ?
          <OrgBDFilter
            defaultValue={filters}
            onSearch={this.handleFilt}
            onReset={this.handleReset}
            onChange={this.handleFilt}
          />
        : null}

        { this.props.editable && this.state.filters.proj !== null && !this.state.showUnreadOnly ?
        <div style={{ overflow: 'auto', marginBottom: 16 }}>

          { this.props.orgbdres.length > 0 && this.state.statistic.length > 0 ? 
          <div style={{ float: 'left', lineHeight: '32px' }}>
            {[{ id: null, name: '暂无状态' }].concat(this.props.orgbdres).map(
              (m, index) => <span key={m.id}>
                <span style={{ color: m.id === null ? 'red' : undefined }}>{`${m.name}(${this.state.statistic.filter(f => f.status === m.id)[0] ? this.state.statistic.filter(f => f.status === m.id)[0].count : 0})`}</span>
                <span>{`${index === [{ id: null, name: '暂无状态' }].concat(this.props.orgbdres).length - 1 ? '' : '、'}`}</span>
              </span>
            )}
          </div>
          : null }

          <div style={{ float: 'right' }} className="clearfix">
            <Search
              style={{ width: 200 }}
              placeholder="联系人/联系电话"
              onSearch={search => this.setState({ search, page: 1 }, this.getOrgBdList)}
              onChange={search => this.setState({ search })}
              value={search}
            />
          </div>

        </div>
        : null }

        { this.state.filters.proj !== null ? 
        <Table
          style={{ display: 'none' }}
          className="new-org-db-style"
          columns={columnsForExport}
          dataSource={this.state.listForExport}
          rowKey={record=>record.id}
          pagination={false}
          size="middle"
        />
        : null }

        { this.state.filters.proj !== null ? 
        <Table
          className="new-org-db-style"
          onChange={this.handleTableChange}
          columns={columns}
          expandedRowRender={expandedRowRender}
          // expandRowByClick
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
            
            { this.props.editable && this.isAbleToCreateBD() ? 
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
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        : null }

        { this.state.filters.proj !== null && !this.state.showUnreadOnly ? 
        <Button
          // disabled={this.state.selectedIds.length == 0}
          style={{ backgroundColor: 'orange', border: 'none' }}
          type="primary"
          size="large"
          loading={this.state.exportLoading}
          onClick={this.handleExportBtnClicked}>
          {i18n('project_library.export_excel')}
        </Button>
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

        {this.state.org ?
        <ModalAddUser
          onCancel={() => this.setState({ org: null })}
          org={this.state.org}
        />
        :null}

      </div>
    );
  }
}

function mapStateToProps(state) {
  const { orgbdres, famlv } = state.app;
  return { orgbdres, famlv };
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
      <div style={{marginBottom:'16px',display:'flex',flexDirection:'row',alignItems:'center'}}>
        <Input.TextArea rows={3} value={newComment} onChange={onChange} style={{flex:1,marginRight:16}} />
        <Button onClick={onAdd} type="primary" disabled={newComment == ''}>{i18n('common.add')}</Button>
      </div>
      <div>
        {comments.length ? comments.map(comment => {
          let content = comment.comments;
          const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
          if (oldStatusMatch) {
            const oldStatus = oldStatusMatch[0];
            content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
          }
          return (
            <div key={comment.id} style={{ marginBottom: 8 }}>
              <p>
                <span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span>
                {hasPerm('BD.manageOrgBD') ?
                  <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                    <a href="javascript:void(0)">{i18n('common.delete')}</a>
                  </Popconfirm>
                  : null}
              </p>
              <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
            </div>
          );
        }) : <p>{i18n('remark.no_comments')}</p>}
      </div>
    </div>
  )
}

