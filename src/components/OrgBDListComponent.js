import React from 'react';
import moment from 'moment';
import { 
  i18n, 
  timeWithoutHour, 
  time, 
  handleError, 
  hasPerm, 
  getUserInfo,
  getCurrentUser,
  requestAllData,
} from '../utils/util';
import * as api from '../api';
import { 
  Card,
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
  Transfer,
  Cascader,
  Select,
  Tooltip,
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from './Filter';
import { Search } from './Search';
import ModalModifyOrgBDStatus from './ModalModifyOrgBDStatus';
import BDModal from './BDModal';
import { getUser } from '../api';
import { isLogin, getURLParamValue } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { SelectOrgInvestor, SelectTrader } from './ExtraInput';
import { connect } from 'dva';
import styles from './OrgBDListComponent.css';
import ModalAddUser from './ModalAddUser';
import debounce from 'lodash/debounce';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  FormOutlined,
  HighlightOutlined,
  ExpandAltOutlined,
} from '@ant-design/icons';
import QRCode from 'qrcode.react';

const { Option } = Select;
const priority = ['低', '中', '高'];
const priorityColor = ['#7ed321', '#0084a9', '#ff617f'];
const priorityStyles = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: '#ff617f',
  opacity: 0.5,
};
const progressStyles = {
  margin: 2,
  backgroundColor: 'rgba(250, 221, 20, .15)',
  fontSize: 14,
  lineHeight: '20px',
  padding: '4px 10px',
  borderRadius: 20,
  color: '#262626',
};

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

    this.showUnreadOnly = getURLParamValue(props, 'showUnreadOnly') ? true : false,
    this.ids = (getURLParamValue(props, 'ids') || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    this.projId = parseInt(getURLParamValue(props, 'projId'), 10)
    this.projId = !isNaN(this.projId) ? this.projId : null;

    this.manager = parseInt(getURLParamValue(props, 'manager'), 10);
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
    if (currentSession && !currentSession.is_superuser && currentSession.permissions.includes('usersys.as_trader')) {
      filters.manager = [currentSession.id];
    }
    if (props.allManager) {
      filters.manager = [];
    }

    this.state = {
        showUnreadOnly: this.showUnreadOnly, // 是否只显示未读的机构看板任务
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
        projTradersIds: [], // 项目承揽或承做
        makeUserIds: [],
        pm: null, // 项目PM
        statistic: [],
        org: null, // 为哪个机构添加投资人
        exportLoading: false,
        listForExport: [],
        expandedForExport: [],
        orgBlackListDataSource: [],
        orgBlackList: [],
        showReasonForBlacklist: false,
        reasonForBlacklist: '',
        projectDetails: null,

        progressOptions: [], // 过滤条件中的状态加数量选项
        allLabel: '全部', // 过滤条件全部状态的名称
        isPMComment: 0, // 是否PM的备注
        showBlacklistModal: false,

        // 修改机构优先级相关状态
        isUpdatePriorityModalVisible: false,
        currentPriority: 0,
        currentPriorityRecord: null,
        loadingUpdatingOrgPriority: false,

        // 编辑机构看板
        activeOrgBDForEditing: null,
        displayModalForEditing: false,
        loadingEditingOrgBD: false,

        displayQRCode: false,
    }

    this.allTrader = [];
    this.selectedOrgForBlacklist = [];
    this.searchOrg = debounce(this.searchOrg, 800);
  }

  disabledDate = current => current && current < moment().startOf('day');

  componentDidMount() {
    this.getOrgBdList();
    this.getAllTrader();
    this.getOrgBlacklist();
    this.props.dispatch({ type: 'app/getGroup' });
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' });
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.orgbdres.length !== this.props.orgbdres.length) {
      this.getStatisticData().then(this.setStatisticAsFilter);
    }
    if (nextProps.refresh !== this.props.refresh) {
      this.getOrgBdList();
    }
    if (getURLParamValue(nextProps, 'projId') !== getURLParamValue(this.props, 'projId')) {
      if (this.props.onProjChange) {
        this.props.onProjChange();
      }
    }
  }

  getStatisticData = async () => {
    const { proj, manager, createuser, org } = this.state.filters;
    const params = { proj, manager, createuser, org: org.map(m => m.key) };
    // if (!hasPerm('BD.manageOrgBD')) {
    //   params.manager = getCurrentUser();
    //   params.createuser = getCurrentUser();
    //   params.unionFields = 'manager,createuser';
    // }
    const count = await api.getOrgBDCountNew(params);
    return count.data.response_count.map(m => ({ status: m.response, count: m.count }));
  }

  getAllTrader() {
    api.queryUserGroup({ type: 'trader' })
    .then(data => requestAllData(api.getUser, {
      groups: data.data.data.map(m => m.id),
      userstatus: 2,
    }, 1000))
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

  // getOrgBdOrg = async () => {
  //   let list = [];
  //   const { search, filters, sort, desc } = this.state;

  //   const reqProj1 = await api.getOrgBdBase({
  //     search,
  //     ...filters,
  //     sort,
  //     desc,
  //     org: filters.org.map(m => m.key),
  //     proj: filters.proj || 'none',
  //     page_size: 100,
  //   });
  //   const { count: count1, data: list1 } = reqProj1.data;
  //   if (count1 > 100) {
  //     const reqProj2 = await api.getOrgBdBase({
  //       search,
  //       ...filters,
  //       sort,
  //       desc,
  //       org: filters.org.map(m => m.key),
  //       proj: filters.proj || 'none',
  //       page_size: count1,
  //     });
  //     list = list.concat(reqProj2.data.data);
  //   } else {
  //     list = list.concat(list1);
  //   }

  //   const reqProj3 = await api.getOrgBdBase({
  //     search,
  //     ...filters,
  //     sort,
  //     desc,
  //     org: filters.org.map(m => m.key),
  //     proj: filters.proj || 'none',
  //     createuser: [getCurrentUser()],
  //     page_size: 100,
  //   });
  //   const { count: count3, data: list3 } = reqProj3.data;
  //   if (count3 > 100) {
  //     const reqProj4 = await api.getOrgBdBase({
  //       search,
  //       ...filters,
  //       sort,
  //       desc,
  //       org: filters.org.map(m => m.key),
  //       proj: filters.proj || 'none',
  //       createuser: [getCurrentUser()],
  //       page_size: count3,
  //     });
  //     list = list.concat(reqProj4.data.data);
  //   } else {
  //     list = list.concat(list3);
  //   }

  //   list = list.filter(f => f.org);
  //   const projId = list.map(m => m.org);
  //   const uniqueOrgId = projId.filter((v, i, a) => a.indexOf(v) === i);

  //   const uniqueOrg = uniqueOrgId.map(m => list.filter(f => f.org === m)[0]);
  //   window.echo('unique org', uniqueOrg);
  //   return { data: { count: uniqueOrg.length, data: uniqueOrg } };
  // }

  getOrgBdList = async () => {
    this.setState({ loading: true, expanded: [] });
    const { page, pageSize, search, filters, sort, desc } = this.state;

    // 获取当前筛选项目的承揽和承做，是否显示创建BD按钮需要根据当前用户是否是承揽或承做来决定
    const proj = filters.proj;
    let projMakeTakeTraderIds = [];
    if (proj) {
      if (this.props.onProjExistChange) {
        this.props.onProjExistChange(true);
      }
      try {
        const projResult = await api.getProjDetail(proj);
        this.setState({ projectDetails: projResult.data });
        const { projTraders, PM } = projResult.data;
        if (projTraders) {
          projMakeTakeTraderIds = projTraders.filter(f => f.user).map(m => m.user.id);
          this.setState({
            projTradersIds: projTraders.filter(f => f.user).map(m => m.user.id),
            makeUserIds: projTraders.filter(f => f.user).filter(f => f.type === 1).map(m => m.user.id),
          });
        }
        if (PM) {
          this.setState({ pm: PM.id });
        }
        if (this.props.editable) {
          this.writeSetting();
        }
      } catch (error) {
        handleError(error);
      }
    } else {
      if (this.props.onProjExistChange) {
        this.props.onProjExistChange(false);
      }
      this.setState({ projectDetails: null, projTradersIds: [], makeUserIds: [] });
    }

    const params = {
        page_index: page,
        page_size: pageSize,
        search,
        ...filters,
        // manager: undefined,
        // createuser: undefined,
        sort,
        desc,
        org: filters.org.map(m => m.key),
        proj: filters.proj || 'none',
    };
    // const { manager, createuser } = filters;
    // // 管理员承揽承做才可以筛选负责人
    // if (hasPerm('BD.manageOrgBD') || projMakeTakeTraderIds.includes(getCurrentUser())) {
    //   params.manager = manager;
    //   params.createuser = createuser;
    //   // params.unionFields = 'manager,createuser';
    // } else {
    //   params.manager = [getCurrentUser()];
    //   params.createuser = [getCurrentUser()];
    //   params.unionFields = 'manager,createuser';
    // }
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
    // this.getOrgBdOrg()
    requestApi(params)
      .then(result => {
        baseResult = result;
        baseList = baseResult.data.data;
        const ids = baseList.map(item => item.org).filter(item => item);
        if (ids.length > 0) {
          return api.getOrg({ ids, page_size: ids.length });
        } else {
          return { data: { data: [] } };
        }
      })
      .then(result => {
        let list = result.data.data
        let orgList = {}
        list.forEach(item => {orgList[item.id] = item})
        this.setState(
          {
            list: baseList.map(item => ({
              id: `${item.org}-${item.proj}`,
              org: orgList[item.org],
              proj: { id: item.proj },
              loaded: false,
              items: [],
            })),
            total: baseResult.data.count,
            loading: false,
            expanded: baseList.map(item => `${item.org}-${item.proj}`),
          },
          // () => this.state.list.map(m => this.getOrgBdListDetail(m.org.id, m.proj.id)),
          this.loadOrgBDDetails,
        );
      })
      .catch(handleError);
      if (this.props.orgbdres.length > 0) {
        this.getStatisticData().then(this.setStatisticAsFilter);
      }
  }

  setStatisticAsFilter = statistic => {
    this.setState({ statistic });
    const responseWithNum = [{ id: null, value: 'none', name: '暂无状态' }].concat(this.props.orgbdres).map((m, index) => {
      return {
        ...m,
        value: m.id || 'none',
        label: `${m.name}(${statistic.filter(f => f.status === m.id)[0] ? statistic.filter(f => f.status === m.id)[0].count : 0})`,
      }
    });
    const allCount = statistic.reduce((prev, curr) => prev + curr.count, 0);
    this.setState({ progressOptions: responseWithNum, allLabel: `全部(${allCount})` });
  }

  loadOrgBDDetails = async () => {
    const org = this.state.list.map(m => m.org.id);
    const { manager, response, createuser, proj } = this.state.filters;
    const param1 = {
      org,
      proj: proj || "none",
      response,
      manager,
      createuser,
      search: this.state.search,
      // page_size: 100,
      isRead: this.state.showUnreadOnly ? false : undefined,
    };
    // // 管理员承揽承做才可以筛选负责人
    // if (hasPerm('BD.manageOrgBD') || this.state.projTradersIds.includes(getCurrentUser())) {
    //   param1.manager = manager;
    //   param1.createuser = createuser;
    // } else {
    //   param1.manager = [getCurrentUser()];
    //   param1.createuser = [getCurrentUser()];
    //   param1.unionFields = 'manager,createuser';
    // }
    let orgBDDetails = [];
    const req1 = await api.getOrgBdList(param1);
    const { data: data1, count: count1 } = req1.data;
    if (count1 <= 10) {
      orgBDDetails = data1;
    } else {
      const req2 = await api.getOrgBdList({ ...param1, page_size: count1 });
      orgBDDetails = req2.data.data;
    }
    
    const newList = this.state.list.map((item) => {
      const items = orgBDDetails.filter(f => f.org.id === item.org.id)
        .sort((a, b) => {
          const aImportant = a.isimportant;
          const bImportant = b.isimportant;
          return bImportant - aImportant;
        });
      return { ...item, items, loaded: true };
    });

    this.setState(
      { list: newList },
      () => api.readOrgBD({ bds: orgBDDetails.map(m => m.id) }),
    );

    if (this.state.currentBD) {
      const comments = orgBDDetails.filter(item => item.id === this.state.currentBD.id)[0].BDComments || [];
      this.setState({ comments });
    }
  }

  // getOrgBdRefactorDetail = async (org, proj) => {
  //   const { manager, response } = this.state.filters;
  //   const param = {
  //     org,
  //     proj: proj || "none",
  //     manager,
  //     response,
  //     search: this.state.search,
  //     isRead: this.state.showUnreadOnly ? false : undefined,
  //     page_size: 100,
  //   };

  //   let list = [];
  //   const reqProj1 = await api.getOrgBdList({
  //     param,
  //   });
  //   const { count: count1, data: list1 } = reqProj1.data;
  //   if (count1 > 100) {
  //     const reqProj2 = await api.getOrgBdList({
  //       ...param,
  //       page_size: count1,
  //     });
  //     list = list.concat(reqProj2.data.data);
  //   } else {
  //     list = list.concat(list1);
  //   }

  //   const reqProj3 = await api.getOrgBdList({
  //     ...param,
  //     createuser: [getCurrentUser()],
  //   });
  //   const { count: count3, data: list3 } = reqProj3.data;
  //   if (count3 > 100) {
  //     const reqProj4 = await api.getOrgBdList({
  //       ...param, 
  //       createuser: [getCurrentUser()],
  //       page_size: count3,
  //     });
  //     list = list.concat(reqProj4.data.data);
  //   } else {
  //     list = list.concat(list3);
  //   }

  //   list = list.filter(f => f.id);
  //   const projId = list.map(m => m.id);
  //   const uniqueOrgId = projId.filter((v, i, a) => a.indexOf(v) === i);

  //   const uniqueOrg = uniqueOrgId.map(m => list.filter(f => f.id === m)[0]);
  //   window.echo('unique org bd', uniqueOrg);
  //   return { data: { count: uniqueOrg.length, data: uniqueOrg } };
  // }

  getOrgBdListDetail = (org, proj) => {
    const { manager, response, createuser } = this.state.filters;
    // this.getOrgBdRefactorDetail(org, proj)
    const param1 = {
      org,
      proj: proj || "none",
      manager,
      createuser,
      response,
      search: this.state.search,
      page_size: 100,
      isRead: this.state.showUnreadOnly ? false : undefined,
    };
    window.echo('承揽承做id数组', this.state.projTradersIds);
    // // 管理员承揽承做才可以筛选负责人
    // if (hasPerm('BD.manageOrgBD') || this.state.projTradersIds.includes(getCurrentUser())) {
    //   param1.manager = manager;
    //   param1.createuser = createuser;
    //   // param1.unionFields = 'manager,createuser';
    // } else {
    //   param1.manager = [getCurrentUser()];
    //   param1.createuser = [getCurrentUser()];
    //   param1.unionFields = 'manager,createuser';
    // }
    requestAllData(api.getOrgBdList, param1, 100)
    .then(result => {
      let list = result.data.data.sort((a, b) => {
        const aImportant = a.isimportant;
        const bImportant = b.isimportant;
        return bImportant - aImportant;
      });
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
    this.projId = filters.proj;
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleReset = (filters) => {
    this.projId = filters.proj;
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

  // syncTimeline = async state => {
  //   const { proj, bduser, manager } = this.state.currentBD;
  //   const params = {
  //     proj: proj.id,
  //     investor: bduser,
  //     trader: manager.id,
  //     isClose: false,
  //   };
  //   const checkTimeline = await api.getTimeline(params);

  //   if (checkTimeline.data.count === 0) {
  //     return await this.addTimeline(state.status);
  //   } else {
  //     const timeline = checkTimeline.data.data[0];
  //     return await api.editTimeline(timeline.id, {
  //       statusdata: {
  //         transationStatus: state.status
  //       }
  //     });
  //   }
  // }

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
    // // 由非空状态变为不跟进，记录之前状态，相关issue #285
    // if (state.status === 6 && ![6, null].includes(this.state.currentBD.response)) {
    //   const oldStatus = this.props.orgbdres.filter(f => f.id === this.state.currentBD.response)[0].name;
    //   comments = [state.comment.trim(), `之前状态${oldStatus}`].filter(f => f !== '').join('，');
    // } else {
    //   comments = state.comment.trim();
    // }

    // 记录进度材料变化
    if (state.status != this.state.currentBD.response || state.material !== this.state.currentBD.material) {
      let oldStatus = '';
      if (this.state.currentBD.response) {
        oldStatus = this.props.orgbdres.filter(f => f.id === this.state.currentBD.response)[0].name;
      }
      const oldMaterial = this.state.currentBD.material;
      const newStatus = this.props.orgbdres.filter(f => f.id === state.status)[0].name;
      const newMaterial = state.material;
      comments = [state.comment.trim(), `之前状态：${oldStatus || '无'}`, `之前材料：${oldMaterial || '无'}`, `现在状态：${newStatus || '无'}`, `现在材料：${newMaterial || '无'}`].filter(f => f !== '').join('，');
    } else {
      comments = state.comment.trim();
    }

    // 添加备注
    if (comments.length > 0) {
      const body = {
        orgBD: this.state.currentBD.id,
        comments,
        isPMComment: 0,
      };
      api.addOrgBDComment(body);
    }

    this.askForCreatingDataroom(state.status, this.state.currentBD.bduser);
    // 如果状态改为了已见面、已签NDA或者正在看前期资料，则同步时间轴
    // if ([1, 2, 3].includes(state.status) && this.state.currentBD.response !== state.status) {
      // this.syncTimeline(state).then(() => this.wechatConfirm(state));
    // } else {
      this.wechatConfirm(state);
    // }
  }

  askForCreatingDataroom = (status, investor) => {
    if (status === 7 && this.state.currentBD.response !== status) {
      const react = this;
      Modal.confirm({
        title: '是否同步创建DataRoom？',
        okText: '创建',
        cancelText: '不创建',
        onOk() {
          const body = {
            proj: react.projId,
            isPublic: false,
          };
          api.createDataRoom(body).then((result) => {
            if (investor) {
              const { id } = result.data;
              const param1 = { dataroom: id, user: investor };
              return api.addUserDataRoom(param1);
            }
          });
        },
      });
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

  handleConfirmAudit = ({ status, isimportant, material, username, mobile, wechat, email, group, mobileAreaCode, comment }, isModifyWechat) => {
    const body = {
      response: status,
      isimportant: isimportant,
      remark: comment,
      material: material || '',
    }
    api.modifyOrgBD(this.state.currentBD.id, body)
      .then(result => 
        {
          if (!status || [4, 5, 6].includes(status)) {
            this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
          }
        }
        );

    if (!status || [4, 5, 6].includes(status)) return;
    // 如果机构看板存在联系人
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
          comments: `${i18n('user.wechat')}: ${wechat}`,
          isPMComment: 0,
        }).then(data => {
          this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
        });
      } else {
        this.setState({ visible: false }, () => this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id))
      }
    // 如果机构看板不存在联系人
    } else {
      api.addOrgBDComment({
        orgBD: this.state.currentBD.id,
        comments: `${i18n('account.username')}: ${username} ${i18n('account.mobile')}: ${mobile} ${i18n('user.wechat')}: ${wechat} ${i18n('account.email')}: ${email}`,
        isPMComment: 0,
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
  
  // 如果机构看板有项目并且这个项目有承做，为承做和联系人建立联系
  addRelation = (investorID) => {
    if (this.state.currentBD.proj) {
      this.state.makeUserIds.forEach((userId) => {
        api.addUserRelation({
          relationtype: false,
          investoruser: investorID,
          traderuser: userId,
          proj: this.state.currentBD.proj.id,
        });
      });
    }
  }
  handleOpenModal = bd => {
    this.setState({ commentVisible: true, currentBD: bd, comments: bd.BDComments || [] });
  }

  handleAddComment = () => {
    const body = {
      orgBD: this.state.currentBD.id,
      comments: this.state.newComment,
      isPMComment: this.state.isPMComment,
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
        {...item, items: item.items.concat({id, key, new: true, isimportant: 0, orgUser: null, trader: null, org: record.org, proj: record.proj, expirationtime: moment().add(1, 'weeks')})} :
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
    requestAllData(api.getUserRelation, params, 1000)
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

  updateActiveOrgBDForEditing(record, change) {
    const newRecord = { ...record, ...change };
    this.setState({ activeOrgBDForEditing: newRecord });

    if(!change.bduser) return;

    const params = {
      investoruser: change.bduser,
      page_size: 1000,
    };
    requestAllData(api.getUserRelation, params, 1000)
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

        newRecord.manager = newTraderList[0];
        this.setState({ traderList: newTraderList, activeOrgBDForEditing: newRecord });
      });
  }

  handleEditOrgBD = () => {
    const record = this.state.activeOrgBDForEditing;
    let body = {
      'bduser': record.bduser >= 0 ? record.bduser: null,
      'manager': Number(record.manager.id),
      'org': record.org.id,
      'proj': record.proj.id,
      // 'isimportant': record.isimportant,
      // 'expirationtime':record.expirationtime ? record.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null,
      // 'bd_status': 1,
      'response': record.response,
      'material': record.material,
    }
    this.setState({ loadingEditingOrgBD: true });
    // api.getUserSession()
      // .then(() => 
      api.modifyOrgBD(record.id, body)
      .then(result => {
        if (result && result.data) {
          this.getOrgBdListDetail(record.org.id, record.proj && record.proj.id);
          this.setState({ traderList: this.allTrader, displayModalForEditing: false, loadingEditingOrgBD: false });
        }
      })
      .catch(handleError)
      .finally(() => this.setState({ loadingEditingOrgBD: false }));
  }

  saveNewBD(record) {
    let body = {
      'bduser': record.orgUser >= 0 ? record.orgUser : null,
      'manager': Number(record.trader),
      'org': record.org.id,
      'proj': record.proj.id,
      'isimportant': record.isimportant,
      // 'expirationtime':record.expirationtime ? record.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null,
      // 'bd_status': 1,
      'response': record.response,
      'material': record.material,
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
    if (this.state.projTradersIds.includes(currentUserID)) {
      return true;
    }
    return false;
  }

  isAbleToAddBlacklist = () => {
    if (hasPerm('BD.manageOrgBDBlack')) {
      return true;
    }
    if (hasPerm('BD.addOrgBDBlack')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if (this.state.projTradersIds.includes(currentUserID)) {
      return true;
    }
    return false;
  }

  isAbleToRemoveBlacklist = () => {
    if (hasPerm('BD.manageOrgBDBlack')) {
      return true;
    }
    if (hasPerm('BD.delOrgBDBlack')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if (this.state.projTradersIds.includes(currentUserID)) {
      return true;
    }
    return false;
  }

  isAbleToModifyStatus = record => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if ([...this.state.projTradersIds, record.manager.id, record.createuser.id].includes(currentUserID)) {
      return true;
    }
    return false;
  }

  isAbleToAddPMRemark = record => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if ([this.state.pm, record.manager.id, record.createuser.id].includes(currentUserID)) {
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

    link.href = tableToExcel(table, '机构看板');
    link.click();
  }

  loadAllOrgBD = async () => {
    const { search, filters } = this.state;
    const params = {
        ...filters,
        page_size: 1000,
        search,
        org: filters.org.map(m => m.key),
        proj: filters.proj || 'none',
    };
    // if (hasPerm('BD.manageOrgBD') || this.state.projTradersIds.includes(getCurrentUser())) {
    //   params.manager = manager;
    //   params.createuser = manager;
    //   params.unionFields = 'manager,createuser';
    // } else {
    //   params.manager = getCurrentUser();
    //   params.createuser = getCurrentUser();
    //   params.unionFields = 'manager,createuser';
    // }
    let allOrgs = await requestAllData(api.getOrgBdBase, params, 1000);
    allOrgs = allOrgs.data.data.map(item => ({
      id: `${item.org}-${item.proj}`,
      org: item.org,
      proj: { id: item.proj },
      loaded: false,
      items: []
    }));

    const { manager, response, createuser } = this.state.filters;
    for (let index = 0; index < allOrgs.length; index++) {
      const element = allOrgs[index];
      const params2 = { org: element.org, proj: element.proj.id || "none", response, search: this.state.search, manager, createuser };
      // if (hasPerm('BD.manageOrgBD') || this.state.projTradersIds.includes(getCurrentUser())) {
      //   params2.manager = manager;
      //   params2.createuser = manager;
      //   params2.unionFields = 'manager,createuser';
      // } else {
      //   params2.manager = getCurrentUser();
      //   params2.createuser = getCurrentUser();
      //   params2.unionFields = 'manager,createuser';
      // }
      const orgBD = await api.getOrgBdList(params2);
      element.items = orgBD.data.data;
      element.loaded = true;
      if (orgBD.data.count > 0) {
        element.org = orgBD.data.data[0].org;
      }
    }
    
    allOrgs = allOrgs.reduce((prev, cur) => prev.concat(cur.items), []);

    return allOrgs;
  }

  handleOrgBlackListChange = (targetKeys, direction, moveKeys) => {
    this.selectedOrgForBlacklist = moveKeys;
    if (direction === 'right') {
      this.setState({ showReasonForBlacklist: true });
    } else {
      this.handleRemoveOrgFromBlacklist();
    }
  }

  handleOrgBlackListSearchChange = (_, value) => {
    this.searchOrg(value);
  }

  searchOrg = async (content) => {
    const res = await api.getOrg({ search: content });
    const { data } = res.data;
    let newDataSource = this.state.orgBlackList.concat(data);

    // remove duplicate ones
    newDataSource = newDataSource.filter((value, index, self) =>
      self.map(m => m.id).indexOf(value.id) === index);

    this.setState({ orgBlackListDataSource: newDataSource });
  }

  getAllOrgBDBLacklist = async () => {
    let res = await api.getOrgBDBlacklist({ proj: this.projId, page_size: 100 });
    const { count } = res.data;
    if (count > 100) {
      res = await api.getOrgBDBlacklist({ proj: this.projId, page_size: count });
    }
    res.data.data.sort((a, b) => {
      return new Date(b.createdtime) - new Date(a.createdtime)
    });
    return res;
  }

  getOrgBlacklist = async () => {
    const getRes = await this.getAllOrgBDBLacklist();
    const { data: blacklist } = getRes.data;
    this.setState({
      orgBlackListDataSource: blacklist.map(m => ({ ...m.org, reason: m.reason })),
      orgBlackList: blacklist.map(m => ({ ...m.org, tableId: m.id, reason: m.reason })),
    });
  }

  handleConfirmAddBlacklist = async () => {
    if (!this.state.reasonForBlacklist) {
      Modal.error({
        content: '理由不能为空',
      });
      return;
    }
    await Promise.all(this.selectedOrgForBlacklist.map(m => api.addOrgBDBlacklist({
      org: m,
      proj: this.projId,
      reason: this.state.reasonForBlacklist,
    })));
    const getRes = await this.getAllOrgBDBLacklist();
    const { data: blacklist } = getRes.data;

    // update data source, add reason to the ones which have juse been added to blacklist
    const newDatasource = [...this.state.orgBlackListDataSource];
    newDatasource.forEach((element) => {
      if (this.selectedOrgForBlacklist.includes(element.id)) {
        element.reason = this.state.reasonForBlacklist;
      }
    });

    this.setState({
      showReasonForBlacklist: false,
      reasonForBlacklist: '',
      orgBlackListDataSource: newDatasource,
      orgBlackList: blacklist.map(m => ({ ...m.org, tableId: m.id, reason: m.reason })),
    });
  }

  handleRemoveOrgFromBlacklist = async () => {
    const selectTableIds = this.selectedOrgForBlacklist.map(m => this.state.orgBlackList.filter(f => f.id === m)[0].tableId);
    await Promise.all(selectTableIds.map(m => api.deleteOrgBDBlacklist(m)));
    const getRes = await this.getAllOrgBDBLacklist();
    const { data: blacklist } = getRes.data;

    // update data source, remove reason to those which have juse been removed from blacklist
    const newDatasource = [...this.state.orgBlackListDataSource];
    newDatasource.forEach((element) => {
      if (this.selectedOrgForBlacklist.includes(element.id)) {
        element.reason = null;
      }
    });

    this.setState({
      orgBlackListDataSource: newDatasource,
      orgBlackList: blacklist.map(m => ({ ...m.org, tableId: m.id, reason: m.reason })),
    });
  }

  handleCancelAddBlacklist = () => {
    this.setState({ showReasonForBlacklist: false, reasonForBlacklist: '' });
  }

  renderBlacklistItem = (item) => {
    let label = item.orgname;
    if (item.reason) {
      label = <Popover placement="top" title="加入黑名单的理由" content={item.reason}>{item.orgname}</Popover>;
    }
    return {
      label,
      value: item.orgname,
    };
  }

  handleResetBtnClick = () => {
    this.setState({ filters: OrgBDFilter.defaultValue });
    this.handleReset(OrgBDFilter.defaultValue);
  }

  handleProgressChange(record, value) {
    const response = value[0];
    let material = null;
    if (value.length > 0 && value[1] !== 0) {
      material = value[1];
    }
    this.updateSelection(record, { response, material });
  }

  handleProgressChangeForEditingOrgBD(record, value) {
    const response = value[0];
    let material = null;
    if (value.length > 0 && value[1] !== 0) {
      material = value[1];
    }
    this.updateActiveOrgBDForEditing(record, { response, material });
  }

  handleOperationChange(record, value) {
    const react = this;
    switch (value) {
      case 'delete':
        Modal.confirm({
          title: i18n('message.confirm_delete'),
          icon: <ExclamationCircleOutlined />,
          onOk() {
            react.handleDelete(record);
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        break;
      case 'update_status':
        react.setState({ isPMComment: 0 }, () => react.handleModifyStatusBtnClicked(record));
        break;
      case 'add_remark':
        react.setState({ isPMComment: 0 }, () => react.handleOpenModal(record));
        break;
      case 'add_pm_remark':
        react.setState({ isPMComment: 1 }, () => react.handleOpenModal(record));
        break;
      case 'edit':
        react.setState({ activeOrgBDForEditing: record, displayModalForEditing: true });
        break;
    }
  }

  getProgressOptions = () => {
    return this.props.orgbdres.map(m => {
      if (!m.material) {
        return { label: m.name, value: m.id };
      }
      return {
        label: m.name,
        value: m.id,
        children: [
          {
            label: '无材料',
            value: 0,
          },
          {
            label: m.material,
            value: m.material,
          },
        ],
      };
    });
  }

  getProgressBackground = id => {
    if (id === 6) {
      return 'rgba(230, 69, 71, .15)';
    }
    if ([4, 5].includes(id)) {
      return 'rgba(250, 173, 20, .15)';
    }
    return 'rgba(82, 196, 26, .15)';
  }

  handleUpdatePriorityBtnClick(priority, record) {
    this.setState({ isUpdatePriorityModalVisible: true, currentPriority: priority, currentPriorityRecord: record });
  }

  handleUpdatePriority = async () => {
    try {
      this.setState({ loadingUpdatingOrgPriority: true });
      await Promise.all(this.state.currentPriorityRecord.items.map(m => api.modifyOrgBD(m.id, { isimportant: this.state.currentPriority })));
      this.setState({ isUpdatePriorityModalVisible: false }, () => this.getOrgBdListDetail(this.state.currentPriorityRecord.org.id, this.state.currentPriorityRecord.proj && this.state.currentPriorityRecord.proj.id));
    } catch (error) {
      handleError(error);
    } finally {
      this.setState({ loadingUpdatingOrgPriority: false });
    }
  }

  generateProgressValueForEditing = bd => {
    const progressValue = [bd.response];
    if (bd.material) {
      progressValue.push(bd.material);
    }
    return progressValue;
  }

  handleDisplayQRCodeBtnClick = () => {
    this.setState({ displayQRCode: true });
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers, expanded } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const importantImg={height:'10px',width:'10px',marginTop:'-15px',marginLeft:'-5px'}
    const columns = [
      {
        title: i18n('org_bd.org'),
        key: 'org',
        fixed: 'left',
        sorter: false,
        render: (_, record) => {
          if (!record.org) return null;
          let displayPriorityColor = priorityColor[0]; // 默认优先级低
          let priorityName = priority[0];
          const allItemPriorities = record.items.map(m => m.isimportant); // 取所有投资人中的最高优先级作为机构优先级
          allItemPriorities.sort((first, second) => second - first);
          if (allItemPriorities.length > 0) {
            displayPriorityColor = priorityColor[allItemPriorities[0]];
            priorityName = priority[allItemPriorities[0]];
          }
          const popoverContent = (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>优先级{priorityName}</div>
              <Button type="link" onClick={this.handleUpdatePriorityBtnClick.bind(this, allItemPriorities.length > 0 ? allItemPriorities[0] : 0, record)} icon={<EditOutlined />}>修改</Button>
            </div>
          );
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: 8 }}>{record.org.orgname}</div>
              <Popover content={popoverContent}>
                <div style={{ ...priorityStyles, backgroundColor: displayPriorityColor }} />
              </Popover>
              <Button type="link" onClick={this.handleAddInvestorBtnClicked.bind(this, record.org)}>添加投资人</Button>
            </div>
          );
        },
      },
        // {
        //   title: '职位',
        //   key: 'position',
        // },
        // {
        //   title: '职位',
        //   width: '10%',
        // },
        // {
        //   title: '职位',
        //   width: '10%',
        // },
        // {
        //   title: '职位',
        //   width: '10%',
        // },
        // {
        //   title: '职位',
        //   width: '10%',
        // },
        // {
        //   title: '最新备注',
        //   width: '20%',
        // },
        // {
        //   title: '操作',
        //   width: '20%',
        // }
        // {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: (text, record) => record.proj.id || '暂无'},
      ]

    const columnsForExport = [
      { title: i18n('org_bd.org'), key:'org', dataIndex: 'org.orgname', className: 'orgname', width: '15%' },
      { title: i18n('org_bd.contact'), dataIndex: 'username', key:'username', width: '10%' },
      {
        title: i18n('org_bd.manager'), dataIndex: 'manager.username', key: 'manager', width: '10%', render: (text, record) => {
          if (this.isAbleToModifyStatus(record)) {
            return text;
          }
          return null;
        },
      },
      {
        title: i18n('org_bd.status'), 
        dataIndex: 'response', 
        key:'response',
        width: '10%',
        render: (text, record) => {
          if (this.isAbleToModifyStatus(record)) {
            return text && this.props.orgbdres.filter(f => f.id === text)[0].name
          }
          return null;
        },
      },
      {
        title: "机构反馈", 
        key:'bd_latest_info',
        width: '25%',
        dataIndex: 'BDComments',
        render: (text, record) => {
          if (this.isAbleToModifyStatus(record)) {
            return text && text.length && text[text.length - 1].comments || null;
          }
          return null;
        },
      },
      {
        title: "全部备注", 
        key:'bd_all_comments',
        width: '30%',
        dataIndex: 'BDComments',
        render: (comments, record) => {
          if (this.isAbleToModifyStatus(record)) {
            return comments ? comments.map(m => (
              `创建人：${m.createuser && m.createuser.username}，创建时间：${m.createdtime.slice(0, 16).replace('T', ' ')}，备注内容：${m.comments}`
            )).join('\r\n') : null;
          }
          return null;
        },
      },
    ];

    const expandedRowRender = (record) => {
      const columns = [
        {title: i18n('org_bd.contact'), width: '8%', dataIndex: 'username', key:'username', fixed: 'left',
        render:(text,record)=>{
          return record.new ? 
          <SelectOrgInvestor 
            allStatus 
            onjob 
            allowEmpty 
            style={{ width: "100%" }}
            type="investor" 
            mode="single"
            size="middle"
            optionFilterProp="children" 
            org={record.org.id} 
            value={record.orgUser} 
            onChange={v=>{this.updateSelection(record, {orgUser: v})}}
          />
          : <div style={{ display: 'flex', alignItems: 'center', paddingLeft: this.props.fromProjectCostCenter ? 15 : 0 }}>
              {!this.props.fromProjectCostCenter && (
                this.isAbleToAddPMRemark(record) ?
                  <Tooltip title="编辑">
                    <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'edit')}>
                      <ExpandAltOutlined />
                    </Button>
                  </Tooltip>
                  : <div style={{ width: 46, height: 32 }} />
              )}
              {/* {record.isimportant > 1 && <img style={importantImg} src="/images/important.png" />} */}
              { record.username ? 
              <Popover placement="topRight" content={this.content(record)}>
                <div style={{color:'#428BCA'}}>
                  {/* { record.hasRelation ? 
                  <Link to={'app/user/edit/'+record.bduser}>{record.username}</Link> 
                  : record.username } */}
                  <a target="_blank" href={'/app/user/' + record.bduser}>{record.username}</a>
                </div>                                  
              </Popover>
              : '暂无' }
            </div>
          },sorter:false},
          {
            title: '职位',
            key: 'title',
            width: '10%',
            render: (undefined, record) => record.new || !record.usertitle ? '' : record.usertitle.name,
          },
        // {
        //   title: i18n('org_bd.creator'),
        //   width: '7%',
        //   dataIndex: 'createuser.username',
        //   key: 'createuser',
        //   sorter: false,
        //   render: (text, record) => {
        //     if (record.new) {
        //       return isLogin().username;
        //     }
        //     if (this.isAbleToModifyStatus(record)) {
        //       return text;
        //     }
        //     return null;
        //   }, 
        // },
        {
          title: i18n('org_bd.manager'),
          width: '10%',
          dataIndex: ['manager', 'username'],
          key: 'manager',
          sorter: false,
          render: (text, record) => {
            if (record.new) {
              return (
                <SelectTrader
                  style={{ width: 100 }}
                  data={this.state.traderList}
                  mode="single"
                  value={record.trader}
                  onChange={v => { this.updateSelection(record, { trader: v }) }}
                />
              );
            }
            if (this.isAbleToModifyStatus(record)) {
              return text;
            }
            return null;
          },
        },
        // {
        //   title: '任务时间',
        //   width: '16%',
        //   key: 'createdtime',
        //   sorter: false,
        //   render: (text, record) => {
        //     if (record.new) {
        //       return <div>
        //         {timeWithoutHour(new Date()) + " - "}
        //         <DatePicker
        //           placeholder="过期时间"
        //           disabledDate={this.disabledDate}
        //           // defaultValue={moment()}
        //           showToday={false}
        //           shape="circle"
        //           value={record.expirationtime}
        //           renderExtraFooter={() => {
        //             return <div>
        //               <Button type="dashed" size="small" onClick={() => { this.updateSelection(record, { expirationtime: moment() }) }}>Now</Button>
        //             &nbsp;&nbsp;
        //             <Button type="dashed" size="small" onClick={() => { this.updateSelection(record, { expirationtime: moment().add(1, 'weeks') }) }}>Week</Button>
        //             &nbsp;&nbsp;
        //             <Button type="dashed" size="small" onClick={() => { this.updateSelection(record, { expirationtime: moment().add(1, 'months') }) }}>Month</Button>
        //             </div>
        //           }}
        //           onChange={v => { this.updateSelection(record, { expirationtime: v }) }}
        //         />
        //       </div>
        //     } 
        //     if (this.isAbleToModifyStatus(record)) {
        //       if (record.response !== null) {
        //         return '正常';
        //       }
        //       if (record.expirationtime === null) {
        //         return '无过期时间';
        //       }
        //       const ms = moment(record.expirationtime).diff(moment());
        //       const d = moment.duration(ms);
        //       const remainDays = Math.ceil(d.asDays());
        //       return remainDays >= 0 ? `剩余${remainDays}天` : <span style={{ color: 'red' }}>{`过期${Math.abs(remainDays)}天`}</span>;
        //     }
        //     return null;
        //   },
        // },
        {
          title: '机构进度/材料',
          width: '16%',
          dataIndex: 'response',
          key: 'response',
          sorter: false,
          render: (text, record) => {
            if (record.new) {
              return (
                <Cascader options={this.getProgressOptions()} onChange={this.handleProgressChange.bind(this, record)} placeholder="机构进度/材料" />
              );
            }
            if (this.isAbleToModifyStatus(record)) {
              let progress = null;
              if (text) {
                progress = <div style={{ ...progressStyles, backgroundColor: this.getProgressBackground(text) }}>{this.props.orgbdres.filter(f => f.id === text)[0].name}</div>;
              }
              let material = null;
              if (record.material) {
                material = <div style={{ ...progressStyles, backgroundColor: 'rgba(51, 155, 210, .15)' }}>{record.material}</div>;
              }
              return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{progress}{material}</div>;
            }
            return null;
          },
        },
      ];
      if (!this.props.fromProjectCostCenter) {
        columns.push(
          {
            title: '创建时间',
            width: '11%',
            key: 'creation_time',
            dataIndex: 'createdtime',
            render: (text, record) => {
              if (record.new) {
                return null;
              }
              if (this.isAbleToModifyStatus(record)) {
                return text.slice(0, 10);
              }
              return null;
            },
          },
          {
            title: "机构反馈",
            width: '15%',
            key: 'bd_latest_info',
            render: (text, record) => {
              if (record.new) {
                return '暂无';
              }
              if (this.isAbleToModifyStatus(record)) {
                let latestComment = '';
                if (record.BDComments && record.BDComments.length) {
                  const commonComments = record.BDComments.filter(f => !f.isPMComment);
                  if (commonComments.length > 0) {
                    latestComment = commonComments[commonComments.length - 1].comments;
                  }
                }
                if (!latestComment) return '暂无';

                const comments = record.BDComments;
                const popoverContent = comments.filter(f => !f.isPMComment)
                  .sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
                  .map(comment => {
                  let content = comment.comments;
                  const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
                  if (oldStatusMatch) {
                    const oldStatus = oldStatusMatch[0];
                    content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
                  }
                  return (
                    <div key={comment.id} style={{ marginBottom: 8 }}>
                      <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
                      <div style={{ display: 'flex' }}>
                        {comment.createuser &&
                          <div style={{ marginRight: 10 }}>
                            <a target="_blank" href={`/app/user/${comment.createuser.id}`}>
                              <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuser.photourl} />
                            </a>
                          </div>
                        }
                        <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
                      </div>
                    </div>
                  );
                });
                return (
                  <Popover placement="leftTop" title="机构反馈" content={popoverContent}>
                    <div style={{ color: "#428bca" }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div>
                  </Popover>
                );
              }
              return null;
            },
          },
          // {
          //   title: '应对策略',
          //   width: '10%',
          //   key: 'pm_remark',
          //   render: (_, record) => {
          //     if (record.new) {
          //       return '暂无';
          //     }
          //     if (this.isAbleToModifyStatus(record)) {
          //       let latestPMComment = '';
          //       if (record.BDComments && record.BDComments.length) {
          //         const pmComments = record.BDComments.filter(f => f.isPMComment);
          //         if (pmComments.length > 0) {
          //           latestPMComment = pmComments[pmComments.length - 1].comments;
          //         }
          //       }
          //       if (!latestPMComment) return '暂无';
                
          //       const comments = record.BDComments;
          //       const popoverContent = comments.filter(f => f.isPMComment)
          //         .sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
          //         .map(comment => {
          //         let content = comment.comments;
          //         const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
          //         if (oldStatusMatch) {
          //           const oldStatus = oldStatusMatch[0];
          //           content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
          //         }
          //         return (
          //           <div key={comment.id} style={{ marginBottom: 8 }}>
          //             <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
          //             <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
          //           </div>
          //         );
          //       });
          //       return (
          //         <Popover placement="leftTop" title="应对策略" content={popoverContent}>
          //           <div style={{ color: "#428bca" }}>{latestPMComment.length >= 12 ? (latestPMComment.substr(0, 10) + "...") : latestPMComment}</div>
          //         </Popover>
          //       );
          //     }
          //     return null;
          //   },
          // },
          // {
          //   title: '优先级',
          //   width: '8%',
          //   key: 'priority',
          //   dataIndex: 'isimportant',
          //   render: (text, record) => {
          //     if (record.new) {
          //       return (
          //         <Select
          //           defaultValue={1}
          //           style={{ width: '100%' }}
          //           onChange={v => { this.updateSelection(record, { isimportant: v }) }}
          //         >
          //           <Option value={0}>低</Option>
          //           <Option value={1}>中</Option>
          //           <Option value={2}>高</Option>
          //         </Select>
          //       );
          //     }
          //     if (this.isAbleToModifyStatus(record)) {
          //       return typeof text === 'number' ? priority[text] : '未知';
          //     }
          //     return null;
          //   },
          // },
        )
      }
        
        if (this.props.editable) columns.push({
            title: i18n('org_bd.operation'), width: '12%', render: (text, record) => 
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
              return (
                <div className="orgbd-operation-icon-btn" style={{ display: 'flex' }}>
                  {/* {this.isAbleToAddPMRemark(record) &&
                    <Tooltip title="编辑">
                      <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'edit')}>
                        <EditOutlined />
                      </Button>
                    </Tooltip>
                  } */}
                  {this.isAbleToModifyStatus(record) &&
                    <Tooltip title="修改状态">
                      <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'update_status')}>
                        <FormOutlined />
                      </Button>
                    </Tooltip>
                  }
                  {this.isAbleToModifyStatus(record) &&
                    <Tooltip title="添加机构反馈">
                      <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'add_remark')}>
                        <HighlightOutlined />
                      </Button>
                    </Tooltip>
                  }
                  {/* {this.isAbleToAddPMRemark(record) &&
                    <Tooltip title="添加应对策略">
                      <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'add_pm_remark')}>
                        <HighlightOutlined />
                      </Button>
                    </Tooltip>
                  } */}
                  {(hasPerm('BD.manageOrgBD') || getUserInfo().id === record.createuser.id || getUserInfo().id === record.manager.id) &&
                    <Tooltip title="删除">
                      <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'delete')}>
                        <DeleteOutlined />
                      </Button>
                    </Tooltip>
                  }
                </div>
              );
              return (
                <Select placeholder="操作" style={{ width: '100%' }} onChange={this.handleOperationChange.bind(this, record)}>
                  {this.isAbleToModifyStatus(record) && <Option value="update_status">修改状态</Option>}
                  {this.isAbleToModifyStatus(record) && <Option value="add_remark">添加机构反馈</Option>}
                  {this.isAbleToAddPMRemark(record) && <Option value="add_pm_remark">添加应对策略</Option>}
                  {(hasPerm('BD.manageOrgBD') || getUserInfo().id === record.createuser.id || getUserInfo().id === record.manager.id) && <Option value="delete">删除</Option>}
                </Select>
              );
              return <span>

                { /* 修改状态和备注按钮 */ }
                { this.isAbleToModifyStatus(record) ? 
                <span>
                  <button style={{ ...buttonStyle, marginRight: 4 }} size="small" onClick={this.handleModifyStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</button>
                  <Button type="link" style={{ ...buttonStyle, marginRight: 4 }} onClick={this.handleOpenModal.bind(this, record)}>{i18n('remark.comment')}</Button>
                </span>
                : null }

                { /* 查看时间轴按钮 */ }
                {/* { record.timeline ? 
                <Link to={`/app/timeline/list?proj=${record.proj.id}&investor=${record.bduser}&trader=${record.manager.id}`} style={{ ...buttonStyle, marginRight: 4 }}>查看时间轴</Link>
                : null } */}

                { /* 删除按钮 */ }
                { hasPerm('BD.manageOrgBD') || getUserInfo().id === record.createuser.id || getUserInfo().id === record.manager.id ?
                <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record)}>
                  <Button style={{ ...buttonStyle, color: undefined }}>
                    <DeleteOutlined />
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
            scroll={{ x: 1000 }} 
            showHeader={false}
            columns={columns}
            dataSource={record.items}
            size={"small"}
            rowKey={record=>record.id}
            pagination={false}
            loading={!record.loaded}
            // rowClassName={this.handleRowClassName}
          />
          {this.props.editable && this.isAbleToCreateBD() &&
            <Button style={{ marginLeft: 24, marginTop: 10 }} type="link" onClick={this.handleAddNew.bind(this, record)} size="large">
              <PlusCircleOutlined style={{ fontSize: 22 }} />
            </Button>
          }
        </div>

      );
    }

    return (
      <div>
        {source!=0 ? <BDModal source={sourłe} element='org'/> : null}   

        {this.props.editable &&
          <Card className="remove-on-mobile" title="机构看板" style={{ marginBottom: 20 }} extra={<Button type="link" onClick={this.handleResetBtnClick}>重置所有</Button>}>
            {this.state.projectDetails && this.state.projectDetails.lastProject &&
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                上一轮项目：
                <Link to={`/app/org/bd?projId=${this.state.projectDetails.lastProject.id}`}>{this.state.projectDetails.lastProject.projtitleC}</Link>
              </div>
            }
            {!this.state.showUnreadOnly &&
              <div>
                <OrgBDFilter
                  defaultValue={filters}
                  value={this.state.filters}
                  onSearch={this.handleFilt}
                  onReset={this.handleReset}
                  onChange={this.handleFilt}
                  progressOptions={this.state.progressOptions}
                  allLabel={this.state.allLabel}
                />
                {/* {this.state.filters.proj !== null &&
                  <div style={{ overflow: 'auto', marginBottom: 16 }}>
                    {this.props.orgbdres.length > 0 && this.state.statistic.length > 0 ?
                      <div style={{ float: 'left', lineHeight: '32px' }}>
                        {[{ id: null, name: '暂无状态' }].concat(this.props.orgbdres).map(
                          (m, index) => <span key={m.id}>
                            <span style={{ color: m.id === null ? 'red' : undefined }}>{`${m.name}(${this.state.statistic.filter(f => f.status === m.id)[0] ? this.state.statistic.filter(f => f.status === m.id)[0].count : 0})`}</span>
                            <span>{`${index === [{ id: null, name: '暂无状态' }].concat(this.props.orgbdres).length - 1 ? '' : '、'}`}</span>
                          </span>
                        )}
                      </div>
                      : null}
                  </div>
                } */}
              </div>
            }
          </Card>
        }

        <Card>
          {this.props.editable && this.state.filters.proj !== null && !this.state.showUnreadOnly &&
            <div className="orgbd-operation remove-on-mobile" style={{ marginBottom: 20, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Search
                  style={{ width: 300, marginRight: 20 }}
                  placeholder="请输入投资人名称或电话"
                  onSearch={search => this.setState({ search, page: 1 }, this.getOrgBdList)}
                  onChange={search => this.setState({ search })}
                  value={search}
                  size="middle"
                />
                <div style={{ marginRight: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', fontSize: 14, color: '#595959' }}>
                  <div style={{ marginRight: 4 }}>机构优先级：</div>
                  <div style={{ marginRight: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff617f', opacity: 0.5 }} />
                  <div style={{ marginRight: 16 }}>高</div>
                  <div style={{ marginRight: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0084a9', opacity: 0.5 }} />
                  <div style={{ marginRight: 16 }}>中</div>
                  <div style={{ marginRight: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7ed321', opacity: 0.5 }} />
                  <div style={{ marginRight: 16 }}>低</div>
                </div>
                <Button onClick={this.handleDisplayQRCodeBtnClick}>手机二维码</Button>
              </div>
              {this.isAbleToCreateBD() &&
                <div className="another-btn">
                  {this.state.projectDetails && <Button style={{ marginRight: 20 }} onClick={() => this.setState({ showBlacklistModal: true })}>添加黑名单</Button>}
                  <Link to={"/app/orgbd/add?projId=" + this.state.filters.proj}>
                    <Button type="primary" icon={<PlusOutlined />}>新增机构</Button>
                  </Link>
                </div>
              }
            </div>
          }

          {this.state.filters.proj !== null ?
            <Table
              style={{ display: 'none' }}
              className="new-org-db-style"
              columns={columnsForExport}
              dataSource={this.state.listForExport}
              rowKey={record => record.id}
              pagination={false}
              size="middle"
            />
            : null}

          <div className="remove-on-mobile orgbd-table-header" style={{ padding: '0 16px', backgroundColor: '#F5F5F5', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold', height: 41, alignItems: 'center' }}>
            {/* <div style={{ width: 40 }} /> */}
            <div style={{ marginLeft: 40, flex: 10, padding: '14px 0', paddingRight: 8 }}>联系人</div>
            <div style={{ flex: 8, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>职位</div>
            <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>负责人</div>
            <div style={{ flex: 16, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>机构进度/材料</div>
            {!this.props.fromProjectCostCenter && <div style={{ flex: 11, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>创建时间</div>}
            {!this.props.fromProjectCostCenter && <div style={{ flex: 15, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>机构反馈</div>}
            {/* {!this.props.fromProjectCostCenter && <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>应对策略</div>} */}
            {/* {!this.props.fromProjectCostCenter && <div style={{ flex: 8, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>优先级</div>} */}
            {!this.props.fromProjectCostCenter && <div style={{ flex: 12, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>操作</div>}
          </div>

          {this.state.filters.proj !== null ?
            <Table
              scroll={{ x: true }}
              onChange={this.handleTableChange}
              columns={columns}
              expandedRowRender={expandedRowRender}
              // expandRowByClick
              dataSource={list}
              rowKey={record => record.id}
              loading={loading}
              onExpand={this.onExpand.bind(this)}
              expandedRowKeys={expanded}
              pagination={false}
              size={this.props.size || "middle"}
              showHeader={false}
            />
            : null}

          {this.props.pagination && this.state.filters.proj !== null ?
            <div style={{ margin: '16px 0' }} className="clearfix">

              {this.props.editable && this.isAbleToCreateBD() ?
                <Link className="another-btn remove-on-mobile" to={"/app/orgbd/add?projId=" + this.state.filters.proj}>
                  <Button type="primary" icon={<PlusOutlined />}>新增机构</Button>
                </Link>
                : null}

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
            : null}

          {!this.props.fromProjectCostCenter && this.state.filters.proj !== null && !this.state.showUnreadOnly ?
            <Button
              className="remove-on-mobile"
              // disabled={this.state.selectedIds.length == 0}
              style={{ backgroundColor: 'orange', border: 'none' }}
              type="primary"
              // size="large"
              loading={this.state.exportLoading}
              onClick={this.handleExportBtnClicked}>
              {i18n('project_library.export_excel')}
            </Button>
            : null}
        </Card>

        { this.state.visible ? 
        <ModalModifyOrgBDStatus 
          visible={this.state.visible} 
          onCancel={() => this.setState({ visible: false })} 
          onOk={this.handleConfirmBtnClicked}
          bd={this.state.currentBD}
          orgbdres={this.props.orgbdres}
        />
        : null }

        <Modal
          title={this.state.isPMComment ? '应对策略' : '机构反馈'}
          visible={this.state.commentVisible}
          footer={null}
          onCancel={() => this.setState({ commentVisible: false, newComment: '', currentBD: null, comments: [] })}
          maskClosable={false}
        >
          <BDComments
            bd={this.state.currentBD}
            comments={this.state.comments}
            newComment={this.state.newComment}
            onChange={e => this.setState({ newComment: e.target.value })}
            onAdd={this.handleAddComment}
            onDelete={this.handleDeleteComment}
            isPMComment={this.state.isPMComment}
          />
        </Modal>

        {this.state.org ?
        <ModalAddUser
          onCancel={() => this.setState({ org: null })}
          org={this.state.org}
        />
        :null}


        <Modal
          title="机构看板黑名单"
          visible={this.state.showBlacklistModal}
          footer={null}
          onCancel={() => this.setState({ showBlacklistModal: false })}
          maskClosable={false}
        >
          <Transfer
            showSearch={this.isAbleToAddBlacklist()}
            filterOption={() => true}
            rowKey={record => record.id}
            titles={['机构列表', '该项目黑名单']}
            notFoundContent="没有找到"
            searchPlaceholder="机构名称"
            dataSource={this.state.orgBlackListDataSource.map(m => ({ ...m,
              disabled: (m.reason && !this.isAbleToRemoveBlacklist()) || (!m.reason && !this.isAbleToAddBlacklist()) ? true : false }))}
            targetKeys={this.state.orgBlackList.map(m => m.id)}
            onChange={this.handleOrgBlackListChange}
            render={this.renderBlacklistItem}
            onSearch={this.handleOrgBlackListSearchChange}
          />
        </Modal>

        <Modal
          title="请填写将该机构加入黑名单的理由"
          visible={this.state.showReasonForBlacklist}
          onOk={this.handleConfirmAddBlacklist}
          onCancel={this.handleCancelAddBlacklist}
        >
          <Input
            type="textarea"
            rows={4}
            value={this.state.reasonForBlacklist}
            onChange={e => this.setState({ reasonForBlacklist: e.target.value })}
          />
        </Modal>

        <Modal
          className="another-btn"
          title="修改机构优先级"
          visible={this.state.isUpdatePriorityModalVisible}
          onOk={this.handleUpdatePriority}
          onCancel={() => this.setState({ isUpdatePriorityModalVisible: false })}
          confirmLoading={this.state.loadingUpdatingOrgPriority}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>机构优先级：</div>
            <Select
              defaultValue={this.state.currentPriority}
              style={{ width: 180 }}
              placeholder="请选择优先级"
              onChange={value => this.setState({ currentPriority: value })}
            >
              <Option value={0}>低</Option>
              <Option value={1}>中</Option>
              <Option value={2}>高</Option>
            </Select>
          </div>
        </Modal>

        {this.state.displayModalForEditing &&
          <Modal
            wrapClassName="modal-orgbd-edit"
            title="编辑机构看板"
            visible
            onCancel={() => this.setState({ displayModalForEditing: false })}
            onOk={this.handleEditOrgBD}
            confirmLoading={this.state.loadingEditingOrgBD}
          >
            <div style={{ marginBottom: 30 }}>
              <div>机构名称</div>
              <Input style={{ width: '100%' }} disabled value={this.state.activeOrgBDForEditing.org.orgname} />
            </div>

            <div style={{ marginBottom: 30 }}>
              <div>联系人</div>
              <SelectOrgInvestor
                allStatus
                onjob
                allowEmpty
                style={{ width: '100%' }}
                type="investor"
                mode="single"
                size="middle"
                optionFilterProp="children"
                org={this.state.activeOrgBDForEditing.org.id}
                value={this.state.activeOrgBDForEditing.bduser}
                onChange={v => { this.updateActiveOrgBDForEditing(this.state.activeOrgBDForEditing, { bduser: v }) }}
              />
            </div>

            <div style={{ marginBottom: 30 }}>
              <div>负责人</div>
              <SelectTrader
                data={this.state.traderList}
                mode="single"
                value={this.state.activeOrgBDForEditing.manager.id.toString()}
                onChange={v => { this.updateActiveOrgBDForEditing(this.state.activeOrgBDForEditing, { manager: { id: v } }) }}
              />
            </div>

            <div style={{ marginBottom: 30 }}>
              <div>机构进度/材料</div>
              <Cascader
                style={{ width: '100%' }}
                options={this.getProgressOptions()}
                onChange={this.handleProgressChangeForEditingOrgBD.bind(this, this.state.activeOrgBDForEditing)}
                value={this.generateProgressValueForEditing(this.state.activeOrgBDForEditing)}
              />
            </div>
          </Modal>
        }

        <Modal
          title="手机二维码"
          visible={this.state.displayQRCode}
          onCancel={() => this.setState({ displayQRCode: false })}
          onOk={() => this.setState({ displayQRCode: false })}
        >
          <div style={{ width: 128, margin: '20px auto', marginBottom: 10 }}>
            <QRCode value={window.location.href} />
          </div>
          <p style={{ marginBottom: 10, textAlign: 'center' }}>请使用手机扫描二维码</p>
        </Modal>

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

export function BDComments(props) {
  const { comments, newComment, onChange, onDelete, onAdd, bd, isPMComment } = props
  window.echo('comments', comments);
  return (
    <div>
      <div style={{marginBottom:'16px',display:'flex',flexDirection:'row',alignItems:'center'}}>
        <Input.TextArea rows={3} value={newComment} onChange={onChange} style={{flex:1,marginRight:16}} />
        <Button onClick={onAdd} type="primary" disabled={newComment == ''}>{i18n('common.add')}</Button>
      </div>
      <div>
        {comments.length ? comments.filter(f => f.isPMComment == Boolean(isPMComment))
          .sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
          .map(comment => {
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
                {hasPerm('BD.manageOrgBD') || getUserInfo().id === bd.manager.id ?
                  <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                    <Button type="link"><DeleteOutlined /></Button>
                  </Popconfirm>
                  : null}
              </p>
              <div style={{ display: 'flex' }}>
                {comment.createuser &&
                  <div style={{ marginRight: 10 }}>
                    <a target="_blank" href={`/app/user/${comment.createuser.id}`}>
                      <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuser.photourl} />
                    </a>
                  </div>
                }
                <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
              </div>
            </div>
          );
        }) : <p>{i18n('remark.no_comments')}</p>}
      </div>
    </div>
  )
}

