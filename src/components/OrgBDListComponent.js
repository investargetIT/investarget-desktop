import React, { useState } from 'react';
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
  Form,
  Upload,
  message,
  Tabs,
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter, OrgBDFilterForMobile } from './Filter';
import { Search } from './Search';
import ModalModifyOrgBDStatus from './ModalModifyOrgBDStatus';
import BDModal from './BDModal';
import { getUser } from '../api';
import { isLogin, getURLParamValue, useInterval } from '../utils/util'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { SelectExistOrganizationWithID, SelectNewBDStatus, SelectOrgInvestor, SelectTrader } from './ExtraInput';
import { connect } from 'dva';
import styles from './OrgBDListComponent.css';
import ModalAddUserNew from './ModalAddUserNew';
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
  CaretUpFilled,
  CaretDownFilled,
  CloseOutlined,
  FullscreenOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
} from '@ant-design/icons';
import QRCode from 'qrcode.react';
import { baseUrl } from '../utils/request';
import Fullscreen from 'react-full-screen';

const { Option } = Select;
const { TabPane } = Tabs;
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
    // if (currentSession && !currentSession.is_superuser && currentSession.permissions.includes('usersys.as_trader')) {
    //   filters.manager = [currentSession.id];
    // }
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
        displayModalForEditing: false,
        loadingEditingOrgBD: false,

        displayQRCode: false,

        // 创建机构看板
        displayModalForCreating: false,

        // 创建时间排序，置空的话必须设置为 undefined，设置为 null 的话，参数会传空，服务端会报错
        sortByTime: null,
        sort: 'response',
        desc: 1,

        loadingImportOrgBD: false,
        downloadUrl: null, // 模板下载链接
        loadingDownloadTemplate: false,

        reloadOrgInvestor: 0,
        newUser: '', // 新增投资人名称

        visiblePopover: 0,

        activeTabKey: '0',

        isFullScreen: false,

        editComment: null,

        newOrgBDModalExpand: false,
    }

    this.allTrader = [];
    this.selectedOrgForBlacklist = [];
    this.searchOrg = debounce(this.searchOrg, 800);
    this.orgBDFormRef = React.createRef();

    this.showPopoverFromContent = null;
    this.showPopoverFromName = null;

    // this.popoverRef = React.createRef();
    this.dataroomID = null;
  }

  disabledDate = current => current && current < moment().startOf('day');

  goFullScreen = () => {
    this.setState({ isFullScreen: true });
  }

  componentDidMount() {
    this.getOrgBdList();
    this.getAllTrader();
    this.getOrgBlacklist();
    this.props.dispatch({ type: 'app/getGroup' });
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' });
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getRelatedDataroom(this.state.filters.proj);
  }

  getRelatedDataroom = async (proj) => {
    if (!proj) return;
    const reqDataroom = await api.queryDataRoom({ proj });
    if (reqDataroom.data.count > 0) {
      this.dataroomID = reqDataroom.data.data[0].id;
    } else {
      console.warn('Related Dataroom Not Found!');
    }
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

  handlePopoverMouseLeave = (record) => {
    // window.echo('record')
    // this.setState({ visiblePopover: 0 });
    this.showPopoverFromContent = null;
    setTimeout(() => {
      if (this.showPopoverFromName === record.id) return;
      this.setState({ visiblePopover: null })
    }, 100);
  }

  handlePopoverMouseEnter = record => {
    // window.echo('mouse enter');
    this.showPopoverFromContent = record.id;
  }

  // handlePopoverMouseLeave1 = () => {
  //   window.echo('mouse leave');
  // }

  handleOrgNameMouseEnter = record => {
    this.showPopoverFromName = record.id;
    // window.echo('org name mouse enter', record);
    this.setState({ visiblePopover: record.id });
  }

  handleOrgNameMouseLeave = record => {
    this.showPopoverFromName = null;
    // window.echo('org name mouse leave', record);
    setTimeout(() => {
      if (this.showPopoverFromContent === record.id) return;
      this.setState({ visiblePopover: null })
    }, 100);
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
      }, 100))
      .then(data => {
        this.allTrader = data.data.data;
        this.setState({ traderList: this.allTrader });
      })
      .catch(handleError);
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
          projTraders.push({ user: PM });
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
          const req1 = api.getOrg({ ids, page_size: ids.length });
          const req2 = requestAllData(api.getOrgRemark, { org: ids }, 100);
          return Promise.all([req1, req2]);
        } else {
          // 没有机构看板数据，模拟空数据返回
          return [
            { data: { data: [] } },
            { data: { data: [] } },
          ];
        }
      })
      .then(result => {
        let list = result[0].data.data.map(m => {
          const comments = result[1].data.data.filter(f => f.org === m.id);
          return { ...m, comments };
        })
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
      isRead: this.state.showUnreadOnly ? false : undefined,
    };
    let orgBDDetails = [];
    const req1 = await api.getOrgBdList(param1);
    const { data: data1, count: count1 } = req1.data;
    if (count1 <= 10) {
      orgBDDetails = data1;
    } else {
      const req2 = await api.getOrgBdList({ ...param1, page_size: count1 });
      orgBDDetails = req2.data.data;
    }
    
    let newList = this.state.list.map((item) => {
      const items = orgBDDetails.filter(f => f.org.id === item.org.id)
        .sort((a, b) => {
          const aImportant = a.isimportant;
          const bImportant = b.isimportant;
          return bImportant - aImportant;
        });
      return { ...item, items, loaded: true };
    });
    newList = newList.map(m => {
      const newItems = m.items.map(n => ({ ...n, items: m.items, org: m.org }));
      return { ...m, items: newItems };
    });
    // window.echo('new list', newList);
    this.setState(
      { list: newList },
      () => api.readOrgBD({ bds: orgBDDetails.map(m => m.id) }),
    );

    if (this.state.currentBD) {
      const comments = orgBDDetails.filter(item => item.id === this.state.currentBD.id)[0].BDComments || [];
      this.setState({ comments });
    }
  }

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
        newList = newList.map(m => {
          const newItems = m.items.map(n => ({ ...n, items: m.items, org: m.org }));
          return { ...m, items: newItems };
        });
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

  generateProgressChangeComment = async (bd) => {
    const { id: oldID, response: oldResponse, material: oldMaterial } = this.state.currentBD;
    const { id: newID, response: newResponse, material: newMaterial } = bd;
    if (oldID !== newID) return;
    if (oldResponse === newResponse && oldMaterial === newMaterial) return;
    const orgBD = oldID;
    let oldStatus = '';
    if (oldResponse) {
      oldStatus = this.props.orgbdres.filter(f => f.id === oldResponse)[0].name;
    }
    let newStatus = '';
    if (newResponse) {
      newStatus = this.props.orgbdres.filter(f => f.id === newResponse)[0].name;
    }
    const comments = [`之前状态：${oldStatus || '无'}`, `之前材料：${oldMaterial || '无'}`, `现在状态：${newStatus || '无'}`, `现在材料：${newMaterial || '无'}`].join('，');
    const body = {
      orgBD,
      comments,
      isPMComment: 0,
    };
    await api.addOrgBDComment(body);
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
          if ((result.data || hasPerm('usersys.admin_manageuser')) && isModifyWechat) {
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
            {photourl ? <img src={photourl} style={{width:'50px',height:'50px', borderRadius:'50px', margin: '0 auto'}}/>:'暂无头像'}
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

  // 在创建机构看板时成功地添加了一名新的联系人
  handleFinishAddUser = user => {
    this.setState({ org: null, reloadOrgInvestor: this.state.reloadOrgInvestor + 1 });
    this.orgBDFormRef.current.setFieldsValue({ orgUser: user.id });
    this.sortTraderList(user.id, bestTrader => {
      if (bestTrader) {
        this.orgBDFormRef.current.setFieldsValue({ trader: bestTrader.id + '' });
      }
    });
  }

  sortTraderList = (investor, callback) => {
    const params = {
      investoruser: investor,
      page_size: 100,
    };
    requestAllData(api.getUserRelation, params, 100)
      .then(result => {
        const newTraderList = [];
        result.data.data.forEach(element => {
          let familiar = -1;
          if (this.props.famlv.length > 0) {
            const filterFam = this.props.famlv.filter(f => f.id === element.familiar);
            if (filterFam.length > 0) {
              familiar = filterFam[0].score;
            }
          }
          let trader;
          const filterTrader = this.allTrader.filter(f => f.id === element.traderuser.id);
          if (filterTrader.length > 0) {
            trader = {...filterTrader[0]};
            trader.familiar = familiar;
            if (familiar > -1) {
              trader.username += '(' + familiar + '分)';
            }
          }
          if (trader) {
            newTraderList.push(trader);
          }
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

        this.setState({ traderList: newTraderList });
        callback(newTraderList[0]);
      })
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
      page_size: 100,
    };
    requestAllData(api.getUserRelation, params, 100)
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

  handleBDUserChange = (bduser, onTraderListChange) => {
    if(!bduser) return;

    const params = {
      investoruser: bduser,
      page_size: 100,
    };
    requestAllData(api.getUserRelation, params, 100)
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
        onTraderListChange(newTraderList);
        this.setState({ traderList: newTraderList });
      });
  }

  // 进入一期资料库，自动添加该用户到 dataroom
  addUserToDataroom = async (response, user) => {
    if (response !== 7 || !user || !this.dataroomID) {
      return;
    };
    const param = { dataroom: this.dataroomID, user };
    try {
      await api.addUserDataRoom(param);
    } catch (error) {
      console.warn(error);
    }
  }

  // 不跟进，自动将该用户从 dataroom 里删除
  removeUserFromDataroom = async (response, user) => {
    if (response !== 6 || !user || !this.dataroomID) {
      return;
    }
    const request = await api.queryUserDataRoom({
      user,
      dataroom: this.dataroomID,
    });
    const { count, data } = request.data;
    if (count > 0) {
      const dataroomUserID = data[0].id;
      await api.deleteUserDataRoom(dataroomUserID);
    }
  }

  handleCancelEditOrgBD = record => {
    // Reload org bd for auto-saved comments
    this.getOrgBdListDetail(record.org.id, record.proj && record.proj.id);
    this.setState({
      displayModalForEditing: false,
      currentBD: null,
      comments: [],
      editComment: null,
    });
  };

  handleEditOrgBD = (record, editComment, newComment) => {
    let body = {
      'bduser': record.bduser >= 0 ? record.bduser: null,
      'manager': Number(record.manager.id),
      'org': record.org.id,
      'proj': record.proj.id,
      'response': record.response,
      'material': record.material || '',
    }
    this.setState({ loadingEditingOrgBD: true }); 
    api.modifyOrgBD(record.id, body)
      .then(() => this.generateProgressChangeComment(record))
      .then(() => {
        if (newComment) {
          const bodyForComment = {
            orgBD: record.id,
            comments: newComment,
          };
          if (editComment) {
            return api.editOrgBDComment(editComment, bodyForComment);
          } else {
            return api.addOrgBDComment(bodyForComment);
          }
        }
      })
      .then(() => this.removeUserFromDataroom(body.response, body.bduser))
      .then(() => this.addUserToDataroom(body.response, body.bduser))
      .then(() => {
        this.getOrgBdListDetail(record.org.id, record.proj && record.proj.id);
        this.setState({ traderList: this.allTrader, displayModalForEditing: false, loadingEditingOrgBD: false, editComment: null });
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
    const currentUserID = getUserInfo() && getUserInfo().id;
    if (this.state.projTradersIds.includes(currentUserID)) {
      return true;
    }
    return false;
  }

  isAbleToAddBlacklist = () => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if (this.state.projTradersIds.includes(currentUserID)) {
      return true;
    }
    return false;
  }

  isAbleToRemoveBlacklist = () => {
    if (hasPerm('BD.manageOrgBD')) {
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
    if (!currentUserID) {
      return false;
    }
    if (this.state.projTradersIds.includes(currentUserID)) {
      return true;
    }
    if (record.manager && record.manager.id === currentUserID) {
      return true;
    }
    if (record.createuser && record.createuser.id === currentUserID) {
      return true;
    }
    return false;
  }

  isAbleToAddPMRemark = record => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if (!currentUserID) {
      return false;
    }
    if (this.state.projTradersIds.includes(currentUserID)) {
      return true;
    }
    if (record.manager && record.manager.id === currentUserID) {
      return true;
    }
    if (record.createuser && record.createuser.id === currentUserID) {
      return true;
    }
    if (this.state.pm === currentUserID) {
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
        const dataForExport = data.map(m => {
          let { BDComments: newComments } = m;
          if (newComments) {
            newComments = newComments.filter(f => {
              return !/^之前状态(.*)，现在状态(.*)/.test(f.comments);
            });
          }
          return { ...m, BDComments: newComments };
        });
        this.setState({ 
          exportLoading: false,
          listForExport: dataForExport,
          expandedForExport: dataForExport.map(m => m.id),
        }, this.downloadExportFile);
      })
      .catch(handleError);
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
        page_size: 100,
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
    let allOrgs = await requestAllData(api.getOrgBdBase, params, 100);
    // let allOrgRemarks = await requestAllData(api.getOrgRemark, { org: filters.org.map(m => m.key) }, 100);
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

  // Test
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
        react.setState({ displayModalForEditing: true, currentBD: record, comments: record.BDComments || []  });
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

  handleDisplayQRCodeBtnClick = () => {
    this.setState({ displayQRCode: true });
  }

  generateDataSourceForMobile = originalList => {
    const newDataSource = originalList.reduce((prev, curr) => prev.concat(curr.items), []);
    return newDataSource;
  }

  handleAddNewOrgBDBtnClick = () => {
    this.setState({ displayModalForCreating: true });
  }

  handleOrgBDFormValuesChange = (changedValues, allValues) => {
    if (changedValues.org) {
      this.setState({ traderList: this.allTrader });
      this.orgBDFormRef.current.setFieldsValue({ orgUser: undefined, trader: undefined });
    }
    if (changedValues.orgUser) {
      this.sortTraderList(changedValues.orgUser, bestTrader => {
        if (bestTrader) {
          this.orgBDFormRef.current.setFieldsValue({ trader: bestTrader.id + '' });
        }
      });
    }
  }

  handleSubmitOrgBDForm = () => {
    this.orgBDFormRef.current
      .validateFields()
      .then(values => {
        this.addNewBD(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  }

  addNewBD = record => {
    const body = {
      'org': record.org,
      'isimportant': record.isimportant,
      'bduser': record.orgUser >= 0 ? record.orgUser : null,
      'manager': Number(record.trader),
      'proj': this.projId,
      'response': record.progress ? record.progress.response : undefined,
      'material': record.progress ? record.progress.material : undefined,
    };
    const { feedback } = record;
    api.getUserSession()
      .then(() => api.addOrgBD(body))
      .then(reqNewOrgBD => {
        if (feedback) {
          const { data: newOrgBD } = reqNewOrgBD;
          const bodyForComment = {
            orgBD: newOrgBD.id,
            comments: feedback,
          };
          return api.addOrgBDComment(bodyForComment);
        }
      })
      .then(() => this.removeUserFromDataroom(body.response, body.bduser))
      .then(() => this.addUserToDataroom(body.response, body.bduser))
      .then(() => {
        this.setState({ displayModalForCreating: false, newOrgBDModalExpand: false });
        this.getOrgBdList();
      })
      .catch(handleError);
  }

  handleSortByTime = direction => {
    const desc = direction === 'desc' ? 1 : 0;
    if (this.state.sort === 'createdtime' && this.state.desc === desc) {
      this.setState({ sort: undefined, desc: undefined }, this.getOrgBdList);
    } else {
      this.setState({ sort: 'createdtime', desc }, this.getOrgBdList);
    }
  }

  handleDownloadOrgBDTemplateBtnClick = () => {
    this.setState({ loadingDownloadTemplate: true });
    api.downloadUrl('file', 'sample.xls')
      .then(result => {
        this.setState({ downloadUrl: result.data });
        setTimeout(() => this.setState({ downloadUrl: null }), 1000);
      })
      .catch(handleError)
      .finally(() => this.setState({ loadingDownloadTemplate: false }));
  }

  handleTabChange = key => {
    this.setState({ activeTabKey: key });
  }

  handleAutoSaveComment = async (bd, comment, content) => {
    if (!content) return;
    const bodyForComment = {
      orgBD: bd.id,
      comments: content,
    };
    if (comment) {
      api.editOrgBDComment(comment, bodyForComment);
    } else {
      const reqAdd = await api.addOrgBDComment(bodyForComment);
      this.setState({ editComment: reqAdd.data.id });
    }
  }

  generateOrgInfo = record => {
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
    const react = this;
    function popoverContent1() {
      const popoverContent = record.org.comments.sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
        .map(comment => {
          let content = comment.remark;
          return (
            <div key={comment.id} style={{ marginBottom: 8 }}>
              <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
              <div style={{ display: 'flex' }}>
                {comment.createuserobj &&
                  <div style={{ marginRight: 10 }}>
                    <a target="_blank" href={`/app/user/${comment.createuserobj.id}`}>
                      <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuserobj.photourl} />
                    </a>
                  </div>
                }
                <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
              </div>
            </div>
          );
        });
      return (
        <div onMouseLeave={() => react.handlePopoverMouseLeave(record)} onMouseEnter={() => react.handlePopoverMouseEnter(record)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>机构备注</div>
            <CloseOutlined style={{ cursor: 'pointer' }} onClick={() => react.setState({ visiblePopover: 0 })} />
          </div>
          {popoverContent && popoverContent.length > 0 ? popoverContent : '暂无备注'}
        </div>
      );
      }

    return (
      <div className="orgbd-org-info" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Popover title={null} content={popoverContent1()} visible={this.state.visiblePopover === record.id}>
          <div
            style={{ marginRight: 8 }}
            onMouseEnter={() => this.handleOrgNameMouseEnter(record)}
            onMouseLeave={() => this.handleOrgNameMouseLeave(record)}
          >{record.org.orgname}</div>
        </Popover>
        <Popover content={popoverContent}>
          <div style={{ ...priorityStyles, backgroundColor: displayPriorityColor }} />
        </Popover>
        {/* <Button type="link" onClick={this.handleAddInvestorBtnClicked.bind(this, record.org)}>添加投资人</Button> */}
        {this.props.editable && this.isAbleToCreateBD() &&
          <Button type="link" onClick={this.handleAddNew.bind(this, record)}>
            <PlusCircleOutlined style={{ fontSize: 22 }} />
          </Button>
        }
      </div>
    );
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
          const react = this;
          function popoverContent1() {
            const popoverContent = record.org.comments.sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
              .map(comment => {
                let content = comment.remark;
                return (
                  <div key={comment.id} style={{ marginBottom: 8 }}>
                    <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
                    <div style={{ display: 'flex' }}>
                      {comment.createuserobj &&
                        <div style={{ marginRight: 10 }}>
                          <a target="_blank" href={`/app/user/${comment.createuserobj.id}`}>
                            <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuserobj.photourl} />
                          </a>
                        </div>
                      }
                      <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
                    </div>
                  </div>
                );
              });
            return (
              <div onMouseLeave={() => react.handlePopoverMouseLeave(record)} onMouseEnter={() => react.handlePopoverMouseEnter(record)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold' }}>机构备注</div>
                  <CloseOutlined style={{ cursor: 'pointer' }} onClick={() => react.setState({ visiblePopover: 0 })} />
                </div>
                {popoverContent && popoverContent.length > 0 ? popoverContent : '暂无备注'}
              </div>
            );
           }

          // function popoverTitleContent() {
          //   return (
          //     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          //       <div>机构备注</div>
          //       <CloseOutlined style={{ cursor: 'pointer' }} onClick={() => react.setState({ visiblePopover: 0 })} />
          //     </div>
          //   )
          // }

          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Popover title={null} content={popoverContent1()} visible={this.state.visiblePopover === record.id}>
                <div
                  style={{ marginRight: 8 }}
                  onMouseEnter={() => this.handleOrgNameMouseEnter(record)}
                  onMouseLeave={() => this.handleOrgNameMouseLeave(record)}
                >{record.org.orgname}</div>
              </Popover>
              <Popover content={popoverContent}>
                <div style={{ ...priorityStyles, backgroundColor: displayPriorityColor }} />
              </Popover>
              {/* <Button type="link" onClick={this.handleAddInvestorBtnClicked.bind(this, record.org)}>添加投资人</Button> */}
              {this.props.editable && this.isAbleToCreateBD() &&
                <Button type="link" onClick={this.handleAddNew.bind(this, record)}>
                  <PlusCircleOutlined style={{ fontSize: 22 }} />
                </Button>
              }
            </div>
          );
        },
      },
    ];

    const columnsForMobile = [
      {
        title: `${i18n('org_bd.org')}/${i18n('org_bd.contact')}`,
        key: 'org',
        fixed: 'left',
        width: 110,
        sorter: false,
        render: (_, record) => {
          if (!record.org) return null;
          let displayPriorityColor = priorityColor[0]; // 默认优先级低
          let priorityName = priority[0];
          if (typeof record.isimportant === 'number') {
            displayPriorityColor = priorityColor[record.isimportant];
            priorityName = priority[record.isimportant];
          }
          const popoverContent = (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>优先级{priorityName}</div>
              <Button type="link" onClick={this.handleUpdatePriorityBtnClick.bind(this, typeof record.isimportant === 'number' ? record.isimportant : 0, record)} icon={<EditOutlined />}>修改</Button>
            </div>
          );
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {this.isAbleToModifyStatus(record) &&
                  <Tooltip title="编辑">
                    <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'edit')} style={{ padding: '4px 8px' }}>
                      <ExpandAltOutlined />
                    </Button>
                  </Tooltip>}

                {(hasPerm('BD.manageOrgBD') || this.state.projTradersIds.includes(getCurrentUser())) &&
                  <Tooltip title="删除">
                    <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'delete')} style={{ padding: '4px 8px' }}>
                      <DeleteOutlined />
                    </Button>
                  </Tooltip>
                }
              </div>

              <div style={{ ...priorityStyles, backgroundColor: displayPriorityColor, marginRight: 8 }} />
              <div style={{ flex: 1, wordBreak: 'break-word' }}>
                <div style={{ fontSize: 12, color: '#262626', fontWeight: 'bold' }}>{record.org.orgname}</div>
                <div style={{ color: '#595959' }}>{record.username || '暂无'}</div>
              </div>
            </div>
          );
        },
      },
      {
        title: '职位',
        key: 'title',
        render: (undefined, record) => record.new || !record.usertitle ? '' : record.usertitle.name,
      },
      {
        title: i18n('org_bd.manager'),
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
          return text;
        },
      },
      {
        title: '机构进度/材料',
        dataIndex: 'response',
        key: 'response',
        sorter: false,
        render: (text, record) => {
          if (record.new) {
            return (
              <Cascader options={this.getProgressOptions()} onChange={this.handleProgressChange.bind(this, record)} placeholder="机构进度/材料" />
            );
          }
          let progress = null;
          if (text) {
            progress = <div style={{ ...progressStyles, backgroundColor: this.getProgressBackground(text) }}>{this.props.orgbdres.filter(f => f.id === text)[0].name}</div>;
          }
          let material = null;
          if (record.material) {
            material = <div style={{ ...progressStyles, backgroundColor: 'rgba(51, 155, 210, .15)' }}>{record.material}</div>;
          }
          return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{progress}{material}</div>;
        },
      },
      {
        title: '创建时间',
        width: '11%',
        key: 'creation_time',
        dataIndex: 'createdtime',
        render: (text, record) => {
          if (record.new) {
            return null;
          }
          return text.slice(0, 10);
        },
      },
      {
        title: "机构反馈",
        key: 'bd_latest_info',
        render: (text, record) => {
          if (record.new) {
            return '暂无';
          }
          // if (this.isAbleToModifyStatus(record)) {
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
          // }
          // return null;
        },
      },
    ];
    // if (this.props.editable) {
    //   columnsForMobile.push({
    //     title: i18n('org_bd.operation'), width: '12%', render: (text, record) => {
    //       if (record.new) {
    //         return (
    //           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
    //             <div style={{ marginRight: 4 }}>
    //               <a style={buttonStyle} size="small" onClick={this.saveNewBD.bind(this, record)}>保存</a>
    //               &nbsp;&nbsp;
    //               <Popconfirm title="确定取消？" onConfirm={this.discardNewBD.bind(this, record)}>
    //                 <a style={buttonStyle} size="small">取消</a>
    //               </Popconfirm>
    //             </div>
    //           </div>
    //         )
    //       } else {
    //         const latestComment = record.BDComments && record.BDComments[0]
    //         const comments = latestComment ? latestComment.comments : ''
    //         return (
    //           <div className="orgbd-operation-icon-btn" style={{ display: 'flex' }}>
    //             {/* {this.isAbleToAddPMRemark(record) &&
    //           <Tooltip title="编辑">
    //             <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'edit')}>
    //               <EditOutlined />
    //             </Button>
    //           </Tooltip>
    //         } */}
    //             {/* {this.isAbleToModifyStatus(record) &&
    //               <Tooltip title="修改状态">
    //                 <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'update_status')}>
    //                   <FormOutlined />
    //                 </Button>
    //               </Tooltip>
    //             } */}
    //             {/* {this.isAbleToAddPMRemark(record) &&
    //               <Tooltip title="添加机构反馈">
    //                 <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'add_remark')}>
    //                   <HighlightOutlined />
    //                 </Button>
    //               </Tooltip>
    //             } */}
    //             {/* {this.isAbleToAddPMRemark(record) &&
    //           <Tooltip title="添加应对策略">
    //             <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'add_pm_remark')}>
    //               <HighlightOutlined />
    //             </Button>
    //           </Tooltip>
    //         } */}
    //             {/* {(hasPerm('BD.manageOrgBD') || this.state.projTradersIds.includes(getCurrentUser())) &&
    //               <Tooltip title="删除">
    //                 <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'delete')}>
    //                   <DeleteOutlined />
    //                 </Button>
    //               </Tooltip>
    //             } */}
    //           </div>
    //         );
    //       }
    //     }
    //   })
    // }


    const columnsForExport = [
      { title: i18n('org_bd.org'), key:'org', dataIndex: ['org', 'orgname'], className: 'orgname', width: '15%' },
      { title: i18n('org_bd.contact'), dataIndex: 'username', key:'username', width: '10%' },
      {
        title: i18n('org_bd.manager'), dataIndex: ['manager', 'username'], key: 'manager', width: '10%', render: (text, record) => {
          // if (this.isAbleToModifyStatus(record)) {
            return text;
          // }
          // return null;
        },
      },
      {
        title: i18n('org_bd.status'), 
        key:'progress',
        width: '10%',
        render: (_, record) => {
          const { response, material } = record;
          let text = '';
          if (response && this.props.orgbdres.length > 0) {
            text = text + this.props.orgbdres.filter(f => f.id === response)[0].name;
          }
          if (material) {
            text += `/${material}`
          }
          return text;
        },
      },
      {
        title: "机构反馈", 
        key:'bd_latest_info',
        width: '25%',
        dataIndex: 'BDComments',
        render: (text, record) => {
          // if (this.isAbleToModifyStatus(record)) {
            return text && text.length && text[text.length - 1].comments || null;
          // }
          // return null;
        },
      },
      {
        title: "全部备注", 
        key:'bd_all_comments',
        width: '30%',
        dataIndex: 'BDComments',
        render: (comments, record) => {
          // if (this.isAbleToModifyStatus(record)) {
            return comments ? comments.map(m => (
              `创建人：${m.createuser && m.createuser.username}，创建时间：${m.createdtime.slice(0, 16).replace('T', ' ')}，备注内容：${m.comments}`
            )).join('\r\n') : null;
          // }
          // return null;
        },
      },
    ];

    const expandedRowRender = (record) => {
      const columns = [
        
        {title: i18n('org_bd.contact'), width: '30%', dataIndex: 'username', key:'username',
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
            : (
              <div style={{ display: 'flex' }}>
                {this.generateOrgInfo(record)}
                <div style={{ width: 100, display: 'flex', alignItems: 'center', paddingLeft: this.props.fromProjectCostCenter ? 15 : 0 }}>
                  {record.username ?
                    <Popover placement="topRight" content={this.content(record)}>
                      <div style={{ color: '#428BCA', wordBreak: 'break-all', paddingLeft: !this.props.fromProjectCostCenter ? 16 : 0 }}>
                        <a target="_blank" href={'/app/user/' + record.bduser}>{record.username}</a>
                      </div>
                    </Popover>
                    : <div style={{ paddingLeft: !this.props.fromProjectCostCenter ? 16 : 0 }}>暂无</div>}
                </div>
              </div>
            )
          },sorter:false},
          {
            title: '职位',
            key: 'title',
            width: '10%',
            render: (undefined, record) => record.new || !record.usertitle ? '' : record.usertitle.name,
          },
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
            // if (this.isAbleToModifyStatus(record)) {
              return <div style={{ wordBreak: 'break-all' }}>{text}</div>;
            // }
            // return null;
          },
        },
        {
          title: '机构进度/材料',
          width: '15%',
          dataIndex: 'response',
          key: 'response',
          sorter: false,
          render: (text, record) => {
            if (record.new) {
              return (
                <Cascader options={this.getProgressOptions()} onChange={this.handleProgressChange.bind(this, record)} placeholder="机构进度/材料" />
              );
            }
            // if (this.isAbleToModifyStatus(record)) {
              let progress = null;
              if (text) {
                progress = <div style={{ ...progressStyles, backgroundColor: this.getProgressBackground(text) }}>{this.props.orgbdres.length > 0 && this.props.orgbdres.filter(f => f.id === text)[0].name}</div>;
              }
              let material = null;
              if (record.material) {
                material = <div style={{ ...progressStyles, backgroundColor: 'rgba(51, 155, 210, .15)' }}>{record.material}</div>;
              }
              return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{progress}{material}</div>;
            // }
            // return null;
          },
        },
      ];
      if (!this.props.fromProjectCostCenter) {
        columns.push(
          {
            title: '创建时间',
            width: '10%',
            key: 'creation_time',
            dataIndex: 'createdtime',
            render: (text, record) => {
              if (record.new) {
                return null;
              }
              // if (this.isAbleToModifyStatus(record)) {
                return text.slice(0, 10);
              // }
              // return null;
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
              // if (this.isAbleToModifyStatus(record)) {
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
              // }
              // return null;
            },
          },
        )
      }
        
        if (this.props.editable) columns.push({
            title: '操作', width: '10%', render: (text, record) => {
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
              );
            } else {
              return !this.props.fromProjectCostCenter && (<div style={{ display: 'flex', marginRight: 4 }}>
                {this.isAbleToModifyStatus(record) &&
                  <Tooltip title="编辑">
                    <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'edit')} style={{ padding: '4px 8px' }}>
                      <ExpandAltOutlined />
                    </Button>
                  </Tooltip>}
                {(hasPerm('BD.manageOrgBD') || this.state.projTradersIds.includes(getCurrentUser())) &&
                  <Tooltip title="删除">
                    <Button type="link" onClick={this.handleOperationChange.bind(this, record, 'delete')} style={{ padding: '4px 8px' }}>
                      <DeleteOutlined />
                    </Button>
                  </Tooltip>
                }
              </div>
              );
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
            className="orgbd-child-table"
            // rowClassName={this.handleRowClassName}
          />
          {/* {this.props.editable && this.isAbleToCreateBD() &&
            <Button style={{ marginLeft: 24, marginTop: 10 }} type="link" onClick={this.handleAddNew.bind(this, record)} size="large">
              <PlusCircleOutlined style={{ fontSize: 22 }} />
            </Button>
          } */}
        </div>

      );
    }

    const importOrgBDProps = {
      name: "file",
      action: baseUrl + "/bd/orgbd/import/",
      accept: '.xls,application/vnd.ms-excel',
      data: { proj: this.projId },
      showUploadList: false,
      headers: { token: getUserInfo() && getUserInfo().token },
      beforeUpload: () => {
        this.setState({ loadingImportOrgBD: true });
      },
      onChange: (info) => {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          this.setState({ loadingImportOrgBD: false });
          if (info.file.response && info.file.response.code === 1000) {
            message.success('文件导入成功');
            this.getOrgBdList();
          } else {
            message.success('文件导入失败');
          }
        } else if (info.file.status === 'error') {
          this.setState({ loadingImportOrgBD: false });
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };

    const tab0 = (
      <Card className="remove-on-mobile" title="机构看板" style={{ marginBottom: 19 }} extra={<Button type="link" onClick={this.handleResetBtnClick}>重置所有</Button>}>
        {this.state.projectDetails && this.state.projectDetails.lastProject &&
          <div style={{ marginBottom: 19, textAlign: 'center' }}>
            上一轮项目：
            <Link to={`/app/org/bd?projId=${this.state.projectDetails.lastProject.id}`}>{this.state.projectDetails.lastProject.projtitleC}</Link>
          </div>
        }
        {!this.state.showUnreadOnly &&
          <OrgBDFilter
            defaultValue={filters}
            value={this.state.filters}
            onSearch={this.handleFilt}
            onReset={this.handleReset}
            onChange={this.handleFilt}
            progressOptions={this.state.progressOptions}
            allLabel={this.state.allLabel}
            onProjChange={value => this.getRelatedDataroom(value)}
          />
        }
      </Card>
    );

    return (
      <div>
        {source!=0 ? <BDModal source={source} element='org'/> : null}   

        {this.props.editable &&
          <div className="card-container">
            <Tabs type="card" size="large" activeKey={this.state.activeTabKey} onChange={this.handleTabChange} >
              <TabPane tab="机构看板" key="0">{tab0}</TabPane>
              {this.state.projectDetails && this.state.projectDetails.feishuurl && getUserInfo().thirdUnionID && (
                <TabPane tab={<span>飞书项目推进<Button style={{ marginLeft: 10 }} disabled={!this.state.projectDetails || !this.state.projectDetails.feishuurl} type="text" size="small" onClick={this.goFullScreen} icon={<FullscreenOutlined />}></Button></span>} key="1">
                  <Fullscreen enabled={this.state.isFullScreen} onChange={isFullScreen => this.setState({ isFullScreen })}>
                    <iframe src={this.state.projectDetails.feishuurl} style={{ border: 'none', width: '100%', height: this.state.isFullScreen ? '100%' : 800 }} />
                  </Fullscreen>
                </TabPane>
              )}
            </Tabs>
          </div>
        }

        <Card className="only-on-mobile" style={{ marginBottom: 20 }} bodyStyle={{ paddingBottom: 4 }}>
          <OrgBDFilterForMobile
            defaultValue={filters}
            value={this.state.filters}
            onSearch={this.handleFilt}
            onReset={this.handleReset}
            onChange={this.handleFilt}
            progressOptions={this.state.progressOptions}
            allLabel={this.state.allLabel}
          />
        </Card>

        <Card style={{ display: this.state.activeTabKey === '0'? 'block': 'none' }}>
          {this.props.editable && this.state.filters.proj !== null && !this.state.showUnreadOnly &&
            <div className="orgbd-operation remove-on-mobile" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, lineHeight: '42px' }}>
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
                <Button style={{ marginRight: 20 }} onClick={this.handleDisplayQRCodeBtnClick}>手机二维码</Button>
                <Upload {...importOrgBDProps}>
                  <Button loading={this.state.loadingImportOrgBD} style={{ marginRight: 20 }}>导入机构看板</Button>
                </Upload>
                <Button loading={this.state.loadingDownloadTemplate} onClick={this.handleDownloadOrgBDTemplateBtnClick}>模板下载</Button>
              </div>
              {this.isAbleToCreateBD() &&
                <div className="another-btn">
                  {this.state.projectDetails && <Button style={{ marginRight: 20 }} onClick={() => this.setState({ showBlacklistModal: true })}>添加黑名单</Button>}
                  <Button type="primary" icon={<PlusOutlined />} onClick={this.handleAddNewOrgBDBtnClick}>创建机构看板</Button>
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

          <div className="remove-on-mobile" style={{ backgroundColor: '#F5F5F5', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold' }}>
            <div className="orgbd-table-header" style={{ alignItems: 'center' }}>
            <div style={{ flex: 6, display: 'flex' }}><div style={{ padding: 8, flex: 1 }}>机构</div><div style={{ padding: 8, width: 100 }}>联系人</div></div>
            <div style={{ flex: 2 }}><div style={{ padding: 8 }}>职位</div></div>
            <div style={{ flex: 2 }}><div style={{ padding: 8 }}>负责人</div></div>
            <div style={{ flex: 3 }}><div style={{ padding: 8 }}>机构进度/材料</div></div>
            {!this.props.fromProjectCostCenter &&
              <div style={{ flex: 2 }}>
                <div style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: 4 }}>创建时间</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <CaretUpFilled style={{ fontSize: 12, color: this.state.sort === 'createdtime' && this.state.desc === 0 ? '#339bd2' : 'black' }} onClick={() => this.handleSortByTime('asc')}/>
                  <CaretDownFilled style={{ fontSize: 12, color: this.state.sort === 'createdtime' && this.state.desc === 1 ? '#339bd2' : 'black' }} onClick={() => this.handleSortByTime('desc')} />
                </div>
                </div>
              </div>
            }
            {!this.props.fromProjectCostCenter && <div style={{ flex: 3 }}><div style={{ padding: 8 }}>机构反馈</div></div>}
            {/* {!this.props.fromProjectCostCenter && <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>应对策略</div>} */}
            {/* {!this.props.fromProjectCostCenter && <div style={{ flex: 8, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>优先级</div>} */}
            {!this.props.fromProjectCostCenter && <div style={{ flex: 2 }}><div style={{ padding: 8 }}>操作</div></div>}
            </div>
          </div>

          {this.state.filters.proj !== null &&
            <div className="table-orgbd-desktop">
              <Table
                onChange={this.handleTableChange}
                columns={[]}
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
                rowClassName={() => 'orgbd-parent-table'}
              />
            </div>
          }

          {this.state.filters.proj !== null &&
            <div className="table-orgbd-mobile">
              <div style={{ fontWeight: 'bold', lineHeight: '28px', textAlign: 'center' }}>{this.state.projectDetails ? this.state.projectDetails.projtitleC : ''}</div>
              <Table
                scroll={{ x: 800 }}
                onChange={this.handleTableChange}
                columns={columnsForMobile}
                dataSource={this.generateDataSourceForMobile(list)}
                rowKey={record => record.id}
                loading={loading}
                pagination={false}
                size={this.props.size || "middle"}
              />
            </div>
          }

          {this.props.pagination && this.state.filters.proj !== null ?
            <div style={{ margin: '16px 0' }} className="clearfix">

              {this.props.editable && this.isAbleToCreateBD() ?
                <Link to={"/app/orgbd/add?projId=" + this.state.filters.proj}>
                    <Button className="remove-on-mobile" type="primary" icon={<PlusOutlined />}>批量新增机构</Button>
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

        {/* <Modal
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
        </Modal> */}

        {this.state.org ?
        <ModalAddUserNew
          onFinishAddUser={this.handleFinishAddUser}
          onCancel={() => this.setState({ org: null })}
          org={this.state.org}
          user={this.state.newUser}
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
          <EditOrgBDModalForm
            traderList={this.state.traderList}
            progressOptions={this.getProgressOptions()}
            loadingEditingOrgBD={this.state.loadingEditingOrgBD}
            onBDUserChange={this.handleBDUserChange}
            bd={this.state.currentBD}
            onCancelEditOrgBD={this.handleCancelEditOrgBD}
            onConfirmEditOrgBD={this.handleEditOrgBD}
            currentBD={this.state.currentBD}
            comments={this.state.comments}
            isPMComment={this.state.isPMComment}
            onDeleteComment={this.handleDeleteComment}
            editComment={this.state.editComment}
            onAutoSave={this.handleAutoSaveComment}
          />
        }

        {this.state.displayModalForCreating &&
          <Modal
            wrapClassName="modal-orgbd-edit"
            title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>创建机构看板</div>
              <div>
                <Button type="link" icon={this.state.newOrgBDModalExpand ? <ShrinkOutlined className={styles['icon-modal-operation']} /> : <ArrowsAltOutlined className={styles['icon-modal-operation']} />} onClick={() => this.setState({ newOrgBDModalExpand: !this.state.newOrgBDModalExpand })} />
                <Button type="link" icon={<CloseOutlined className={styles['icon-modal-operation']} />} onClick={() => this.setState({ displayModalForCreating: false, newOrgBDModalExpand: false, traderList: this.allTrader })} />
              </div>
            </div>}
            visible
            onCancel={() => this.setState({ displayModalForCreating: false, newOrgBDModalExpand: false, traderList: this.allTrader })}
            onOk={this.handleSubmitOrgBDForm}
            closable={false}
            style={{ maxWidth: this.state.newOrgBDModalExpand ? '90vw' : undefined }}
            width={this.state.newOrgBDModalExpand ? '90vw' : undefined}
          >
            <Form
              style={{ width: '90%' }}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              ref={this.orgBDFormRef}
              onValuesChange={this.handleOrgBDFormValuesChange}
            >
              <Form.Item
                name="org"
                label="机构"
                placeholder="请选择机构"
                rules={[
                  { required: true, message: '机构不能为空' },
                  { type: 'number' },
                ]}
              >
                <SelectExistOrganizationWithID size="middle" />
              </Form.Item>

              <Form.Item
                name="isimportant"
                label="优先级"
                rules={[{ type: 'number' }]}
              >
                <Select>
                  <Option value={0}>低</Option>
                  <Option value={1}>中</Option>
                  <Option value={2}>高</Option>
                </Select>
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const org = getFieldValue('org');
                  return (
                    // <div style={{ display: 'flex' }}>
                    <Form.Item
                      name="orgUser"
                      label="联系人"
                      placeholder="请选择联系人"
                      rules={[
                        { required: true }
                      ]}
                    >
                      
                        <SelectOrgInvestor
                          placeholder="选择或添加联系人（请先选择机构）"
                          handleAddBtnClick={search => this.setState({ org, newUser: search })}
                          allowCreate={Boolean(org)}
                          allStatus
                          onjob
                          allowEmpty
                          style={{ flex: 1 }}
                          type="investor"
                          mode="single"
                          size="middle"
                          optionFilterProp="children"
                          org={getFieldValue('org')}
                          reload={this.state.reloadOrgInvestor}
                        />
                        
                    </Form.Item>
                    // {org && <Button style={{ marginLeft: 8 }} onClick={() => this.setState({ org })}>添加联系人</Button>}
                    // </div>
                  )
                }}
              </Form.Item>

              <Form.Item
                name="trader"
                label="负责人"
                placeholder="请选择负责人"
                rules={[{ required: true }]}
              >
                <SelectTrader
                  data={this.state.traderList}
                  mode="single"
                />
              </Form.Item>

              <Form.Item
                name="progress"
                label="机构进度/材料"
              >
                <SelectNewBDStatus />
              </Form.Item>

              <Form.Item
                name="feedback"
                label="机构反馈"
              >
                <Input.TextArea
                  autoSize={{ minRows: 12 }}
                />
              </Form.Item>

            </Form>
          </Modal>
        }

        <Modal
          title="手机二维码"
          visible={this.state.displayQRCode}
          onCancel={() => this.setState({ displayQRCode: false })}
          onOk={() => this.setState({ displayQRCode: false })}
        >
          <div style={{ width: 128, margin: '20px auto', marginBottom: 10 }}>
            <QRCode value={window.location.protocol + '//' + window.location.host + '/m/org/bd?projId=' + this.projId} />
          </div>
          <p style={{ marginBottom: 10, textAlign: 'center' }}>请使用手机扫描二维码</p>
        </Modal>

        <iframe style={{display: 'none' }} src={this.state.downloadUrl}></iframe>

        {/* <div id="popover" className="test" ref={this.popoverRef} onMouseLeave={() => react.handlePopoverMouseLeave(record)} onMouseEnter={() => react.handlePopoverMouseEnter(record)} /> */}
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

export function NewBDComments(props) {
  const { comments, onDelete, bd, isPMComment } = props
  return (
    <div>
      <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
        历史备注 
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
        }) : <p>暂无</p>}
      </div>
    </div>
  )
}

function EditOrgBDModalForm({
  traderList,
  progressOptions,
  loadingEditingOrgBD,
  bd,
  onBDUserChange,
  onCancelEditOrgBD,
  onConfirmEditOrgBD,
  currentBD,
  comments,
  isPMComment,
  onDeleteComment,
  editComment, // 正在编辑的机构反馈，由自动保存而来
  onAutoSave,
}) {
  const [form] = Form.useForm();
  const [modalExpanded, setModalExpanded] = useState(false);

  useInterval(() => {
    autoSave();
  }, 5 * 1000);

  function autoSave() {
    const content = form.getFieldValue('newComment');
    onAutoSave(bd, editComment, content);
  }

  const initialValues = {
    orgname: bd.org.orgname,
    bduser: bd.bduser,
    managerId: bd.manager.id.toString(),
    progress: bd.material ? [bd.response, bd.material] : [bd.response],
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const { orgname, bduser, managerId, progress, newComment } = values;
      const response = progress[0];
      let material = null;
      if (progress.length > 0 && progress[1] !== 0) {
        material = progress[1];
      }
      // 特殊处理，如果新的material为undefined，则将新的material还原为旧的
      if (material === undefined) {
        material = bd.material;
      }
      const newBd = {
        ...bd,
        org: {
          ...bd.org,
          orgname,
        },
        bduser,
        manager: {
          ...bd.manager,
          id: managerId,
        },
        response,
        material,
      };
      onConfirmEditOrgBD(newBd, editComment, newComment);
    });
  };

  const handleBDUserChange = (bduser) => {
    onBDUserChange(bduser, (newTraderList) => {
      const manager = newTraderList[0];
      form.setFieldsValue({ managerId: manager.id.toString() });
    });
  };

  return (
    <Modal
      wrapClassName="modal-orgbd-edit"
      title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>编辑机构看板</div>
        <div>
          <Button type="link" icon={modalExpanded ? <ShrinkOutlined className={styles['icon-modal-operation']} /> : <ArrowsAltOutlined className={styles['icon-modal-operation']} />} onClick={() => setModalExpanded(!modalExpanded)} />
          <Button type="link" icon={<CloseOutlined className={styles['icon-modal-operation']} />} onClick={() => onCancelEditOrgBD(bd)} />
        </div>
      </div>}
      visible
      closable={false}
      onOk={handleOk}
      onCancel={() => onCancelEditOrgBD(bd)}
      confirmLoading={loadingEditingOrgBD}
      style={{ maxWidth: modalExpanded ? '90vw' : undefined }}
      width={modalExpanded ? '90vw' : undefined}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          name="orgname"
          label="机构名称"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="bduser"
          label="联系人"
        >
          <SelectOrgInvestor
            allStatus
            onjob
            allowEmpty
            style={{ width: '100%' }}
            type="investor"
            mode="single"
            size="middle"
            optionFilterProp="children"
            org={bd.org.id}
            onChange={handleBDUserChange}
          />
        </Form.Item>
        <Form.Item
          name="managerId"
          label="负责人"
        >
          <SelectTrader
            data={traderList}
            mode="single"
          />
        </Form.Item>
        <Form.Item
          name="progress"
          label="机构进度/材料"
        >
          <Cascader
            style={{ width: '100%' }}
            options={progressOptions}
          />
        </Form.Item>
        <Form.Item
          name="newComment"
          label="机构反馈"
        >
          <Input.TextArea
            autoSize={{ minRows: 12 }}
          />
        </Form.Item>
      </Form>
      <NewBDComments
        bd={currentBD}
        comments={comments}
        isPMComment={isPMComment}
        onDelete={onDeleteComment}
      />
    </Modal>
  );
}