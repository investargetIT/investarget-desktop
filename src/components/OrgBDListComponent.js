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
} from '@ant-design/icons';

const { Option } = Select;
const priority = ['低', '中', '高'];
const options = [
  {
    value: '暂未联系',
    label: '暂未联系',
  },
  {
    value: '预沟通',
    label: '预沟通',
    children: [
      {
        value: '无材料',
        label: '无材料',
      },
      {
        value: 'Teaser',
        label: 'Teaser',
      },
      {
        value: 'BP',
        label: 'BP',
      },
      {
        value: 'DP',
        label: 'DP',
      },
      {
        value: '补充材料',
        label: '补充材料',
      },
    ],
  },
  {
    value: '正式路演',
    label: '正式路演',
    children: [
      {
        value: '无材料',
        label: '无材料',
      },
      {
        value: 'Teaser',
        label: 'Teaser',
      },
      {
        value: 'BP',
        label: 'BP',
      },
      {
        value: 'DP',
        label: 'DP',
      },
      {
        value: '补充材料',
        label: '补充材料',
      },
    ],
  },
];

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
        const { projTraders } = projResult.data;
        if (projTraders) {
          projMakeTakeTraderIds = projTraders.filter(f => f.user).map(m => m.user.id);
          this.setState({
            projTradersIds: projTraders.filter(f => f.user).map(m => m.user.id),
            makeUserIds: projTraders.filter(f => f.user).filter(f => f.type === 1).map(m => m.user.id),
          });
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
          const aImportant = a.isimportant ? 1 : 0;
          const bImportant = b.isimportant ? 1 : 0;
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
        const aImportant = a.isimportant ? 1 : 0;
        const bImportant = b.isimportant ? 1 : 0;
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

  handleConfirmAudit = ({ status, isimportant, username, mobile, wechat, email, group, mobileAreaCode, comment }, isModifyWechat) => {
    const body = {
      response: status,
      isimportant: isimportant ? 1 : 0,
      remark: comment,
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
          comments: `${i18n('user.wechat')}: ${wechat}`
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

  handleOrgBlackListSearchChange = (direction, event) => {
    const { value } = event.target;
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

  handleProgressChange = value => {
    window.echo('progress change', value);
    // setProgress(value[0]);
    // let material = '无材料';
    // if (value.length === 2) {
    //   material = value[1];
    // }
    // setMaterial(material);
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
        react.handleModifyStatusBtnClicked(record);
        break;
      case 'add_remark':
        react.handleOpenModal(record);
        break;
    }
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
        title: "最新备注", 
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
        {title: i18n('org_bd.contact'), width: '10%', dataIndex: 'username', key:'username', 
        render:(text,record)=>{
          return record.new ? 
          <SelectOrgInvestor 
            allStatus 
            onjob 
            allowEmpty 
            style={{width: "100%"}} 
            type="investor" 
            mode="single"
            size="middle"
            optionFilterProp="children" 
            org={record.org.id} 
            value={record.orgUser} 
            onChange={v=>{this.updateSelection(record, {orgUser: v})}}
          />
          : <div style={{ width: 100, marginLeft: 40 }}>                  
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
          width: '15%',
          dataIndex: 'response',
          key: 'response',
          sorter: false,
          render: (text, record) => {
            if (record.new) {
              return (
                <Cascader options={options} onChange={this.handleProgressChange} placeholder="Please select" />
              );
            }
            if (this.isAbleToModifyStatus(record)) {
              return text && this.props.orgbdres.filter(f => f.id === text)[0].name;
            }
            return null;
          },
        },
        {
          title: '创建时间',
          width: '10%',
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
          title: "最新备注",
          width: '15%',
          key: 'bd_latest_info',
          render: (text, record) => {
            if (record.new) {
              return '暂无';
            }
            if (this.isAbleToModifyStatus(record)) {
              let latestComment = record.BDComments && record.BDComments.length && record.BDComments[record.BDComments.length - 1].comments || null;
              return latestComment ? <Popover placement="leftTop" title="最新备注" content={<p style={{ maxWidth: 400 }}>{latestComment}</p>}>
                <div style={{ color: "#428bca" }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div>
              </Popover> : "暂无";
            }
            return null;
          },
        },
        {
          title: 'PM备注',
          width: '10%',
          key: 'pm_remark',
          render: (_, record) => 'PM Remark',
        },
        {
          title: '优先级',
          width: '8%',
          key: 'priority',
          dataIndex: 'isimportant',
          render: (text, record) => {
            if (record.new) {
              return (
                <Input /> 
              );
            }
            if (this.isAbleToModifyStatus(record)) {
              return typeof text === 'number' ? priority[text] : '未知';
            }
            return null;
          },
        },
      ];
        
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
                <Select placeholder="操作" style={{ width: '100%' }} onChange={this.handleOperationChange.bind(this, record)}>
                  {this.isAbleToModifyStatus(record) && <Option value="update_status">修改状态</Option>}
                  {this.isAbleToModifyStatus(record) && <Option value="add_remark">添加备注</Option>}
                  <Option value="add_pm_remark">添加PM备注</Option>
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
            showHeader={false}
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

        {this.props.editable &&
          <Card title="机构看板" style={{ marginBottom: 20 }} extra={<Button type="link" onClick={this.handleResetBtnClick}>重置所有</Button>}>
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
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Search
                style={{ width: 300 }}
                placeholder="请输入投资人名称或电话"
                onSearch={search => this.setState({ search, page: 1 }, this.getOrgBdList)}
                onChange={search => this.setState({ search })}
                value={search}
                size="middle"
              />
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

          <div style={{ padding: '0 16px', backgroundColor: '#F5F5F5', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold', display: 'flex', height: 41, alignItems: 'center' }}>
            {/* <div style={{ width: 40 }} /> */}
            <div style={{ marginLeft: 40, flex: 10, padding: '14px 0', paddingRight: 8 }}>联系人</div>
            <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>职位</div>
            <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>负责人</div>
            <div style={{ flex: 15, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>机构进度/材料</div>
            <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>创建时间</div>
            <div style={{ flex: 15, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>最新备注</div>
            <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>PM备注</div>
            <div style={{ flex: 8, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>优先级</div>
            <div style={{ flex: 12, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>操作</div>
          </div>

          {this.state.filters.proj !== null ?
            <Table
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
                <Link to={"/app/orgbd/add?projId=" + this.state.filters.proj}>
                  <PlusCircleOutlined style={{ fontSize: 24, color: '#08c', lineHeight: '33px', marginLeft: 54 }} />
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

          {this.state.filters.proj !== null && !this.state.showUnreadOnly ?
            <Button
              // disabled={this.state.selectedIds.length == 0}
              style={{ backgroundColor: 'orange', border: 'none' }}
              type="primary"
              size="large"
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
            bd={this.state.currentBD}
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


        <Modal
          title="机构看板黑名单"
          visible={this.props.showBlacklistModal}
          footer={null}
          onCancel={this.props.onCloseBlacklistModal}
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
            onSearchChange={this.handleOrgBlackListSearchChange}
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
  const { comments, newComment, onChange, onDelete, onAdd, bd } = props
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
                {hasPerm('BD.manageOrgBD') || getUserInfo().id === bd.manager.id ?
                  <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                    <Button type="link">{i18n('common.delete')}</Button>
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

