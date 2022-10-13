import * as api from '../api'
import { i18n, isLogin, requestAllData, requestDownloadUrl, subtracting } from '../utils/util'
import { URI_TO_KEY } from '../constants'
import { routerRedux } from 'dva/router'

export default {
  namespace: 'app',
  state: {
    collapsed: false,
    selectedKeys: [],
    openKeys: [],
    registerStep: 1,
    tag: [],
    continent: [],
    country: [],
    title: [],
    currencyType: [],
    audit: [{id: 1, name: i18n('common.under_approval')}, {id: 2, name: i18n('common.recevied_approval')}, {id: 3, name: i18n('common.reject_approval')}],
    industry: [],
    transactionPhases:  [],
    transactionType: [],
    transactionStatus: [],
    orgarea: [],
    orgtype: [],
    character: [],
    bdStatus: [],
    industryGroup: [],
    showChat: false,
    projstatus: [],
    error: null,
    errorForMobile: null,
    service: [],
    unreadMessageNum: 0,
    libIndustry: [],
    search: '',
    tooNarrow: false,
    sortedTrader: [],
    group: [],
    orgbdres: [],
    famlv: [],
    exportStatus: [
      {id: 1, name: '已失败'}, 
      // {id: 2, name: '已过期'}, 
      {id: 3, name: '未开始'},
      {id: 4, name: '正在进行'},
      {id: 5, name: '已完成'},
    ],
    education: [],
    trainingStatus: [],
    trainingType: [],
    palevel: [],
    allTraders: [],
    projectProgress: [], // 项目进度
    allProjBDComments: [],
    projectBDListParameters: { scrollPosition: 0, currentBD: null }, // 记住滑动位置及当前BD
    orgListParameters: { scrollPosition: 0, currentOrg: null },
    projectIDToDataroom: [],
    orgRemarks: [],
    orgInvestorsAndRemarks: [],
  },
  reducers: {
    menuOpen(state, { payload: openKeys }) {
      return { ...state, openKeys }
    },
    menuSelect(state, { payload: selectedKeys }) {
      return { ...state, selectedKeys }
    },
    saveSource(state, { payload: { sourceType, data } }) {
      return { ...state, [sourceType]: data }
    },
    saveLibIndustry(state, { payload: data }) {
      return { ...state, libIndustry: data }
    },
    setRegisterStep(state, { payload: registerStep }) {
      return { ...state, registerStep }
    },
    toggleMenu(state, { payload: collapsed }) {
      localStorage.setItem('collapsed', collapsed);
      return { ...state, collapsed }
    },
    toggleChat(state, { payload: showChat }) {
      return { ...state, showChat }
    },
    findError(state, { payload: error }) {
      return { ...state, error }
    },
    findErrorForMobile(state, { payload: errorForMobile }) {
      return { ...state, errorForMobile }
    },
    dismissError(state) {
      const error = null
      return { ...state, error }
    },
    dismissErrorForMobile(state) {
      const errorForMobile = null
      return { ...state, errorForMobile }
    },
    setUnreadMessageNum(state, { payload: unreadMessageNum }) {
      return { ...state, unreadMessageNum }
    },
    saveSearch(state, { payload: search }) {
      return { ...state, search }
    },
    showOrHideTooNarrowWarning(state, { payload: tooNarrow }) {
      return { ...state, tooNarrow };
    },
    setSortedTrader(state, { payload: sortedTrader }) {
      return { ...state, sortedTrader };
    },
    saveGroup(state, { payload: group }) {
      return { ...state, group };
    },
    appendTag(state, { payload: newTag }) {
      return { ...state, tag: [...state.tag, newTag] };
    },
  },
  effects: {
    *registerStepForward({}, { call, put, select }) {
      const { registerStep: step } = yield select(state => state.app)
      if (step == 1) {
        yield put({ type: 'recommendFriends/refreshFriends' })
      } else if (step == 2) {
        yield put({ type: 'recommendProjects/refreshProjects' })
      }
      yield put({ type: 'setRegisterStep', payload: step + 1 })
    },
    *requestSource({ payload: sourceType }, { call, put }) {
      const { data } = yield call(api.getSource, sourceType)
      yield put({ type: 'saveSource', payload: { sourceType, data } })
    },
    *getSource({ payload: sourceType }, { call, put, select }) {
      let dataFromRedux = yield select(state => state.app[sourceType]);
      if (dataFromRedux.length > 0) return dataFromRedux;
      const { data } = yield call(api.getSource, sourceType)
      yield put({ type: 'saveSource', payload: { sourceType, data } });
      return data;
    },
    *getSourceList({ payload: sourceTypeList }, { put }) {
      for (var i=0,len=sourceTypeList.length; i<len; i++) {
        let sourceType = sourceTypeList[i]
        yield put({ type: 'getSource', payload: sourceType })
      }
    },
    *createTag({ payload: name }, { call, put }) {
      const { data } = yield call(api.createTag, { nameC: name });
      const { id, nameC } = data;
      yield put({ type: 'appendTag', payload: { id, name: nameC } });
      // 新增标签成功后，重新请求最新的标签列表
      yield put({ type: 'requestSource', payload: 'tag' });
    },
    *getIndustryGroup(_, { call, put, select }) {
      const tryData = yield select(state => state.app['industryGroup']);
      if (tryData.length > 0) return tryData;
      const { data } = yield call(api.getSource, 'industryGroup');
      const allManagers = data.filter(f => f.manager).map(m => m.manager);
      
      let indGroups = data;
      if (allManagers.length > 0) {
        const reqManagerList = yield call(requestAllData, api.getUser, { id: allManagers }, 10);
        indGroups = data.map(m => {
          const filterManager = reqManagerList.data.data.filter(f => f.id === m.manager);
          let manager = null;
          if (filterManager.length > 0) {
            manager = filterManager[0];
          }
          return { ...m, manager };
        });
      }

      yield put({ type: 'saveSource', payload: { sourceType: 'industryGroup', data: indGroups } });
      return indGroups;
    },  
    *requestLibIndustry({}, { call, put }) {
      const { data } = yield call(api.getLibIndustry)
      yield put({ type: 'saveLibIndustry', payload: data.data })
    },
    *getLibIndustry({}, { select, put }) {
      const data = yield select(state => state.app.libIndustry)
      data.length > 0 || (yield put({ type: 'requestLibIndustry' }))
    },
    *globalSearch({ payload: search }, { select, put }) {
      yield put({ type: 'saveSearch', payload: search })
      // yield put(routerRedux.push('/app/projects/library?search=' + search))
    },
    *saveProjectProgress({ payload: newData }, { select, put }) {
      const oldData = yield select(state => state.app.projectProgress);
      yield put({ type: 'saveSource', payload: { sourceType: 'projectProgress', data: oldData.concat(newData) } });
    },
    *saveProjectBDComments({ payload: { projBDID, projBDCom } }, { select, put }) {
      const oldData = yield select(state => state.app.allProjBDComments);
      const newData = oldData.slice();
      newData[projBDID] = projBDCom;
      yield put({ type: 'saveSource', payload: { sourceType: 'allProjBDComments', data: newData } });
    },
    *getGroup({}, { call, put, select }) {
      const group = yield select(state => state.app.group);
      if (group.length > 0) return;
      const { data } = yield call(requestAllData, api.queryUserGroup, { page_size: 99 }, 99);
      yield put({ type: 'saveGroup', payload: data.data });
      return data.data;
    },
    *getAllTraders(_, { call, put, select }) {
      const tryData = yield select(state => state.app['allTraders']);
      if (tryData.length > 0) return tryData;
      const traderGroupsReq = yield call(requestAllData, api.queryUserGroup, { type: 'trader' }, 99);
      const allTradersReq = yield call(requestAllData, api.getUser, {
        groups: traderGroupsReq.data.data.map(m => m.id),
        userstatus: 2,
      }, 99);
      yield put({ type: 'saveSource', payload: { sourceType: 'allTraders', data: allTradersReq.data.data } });
      return allTradersReq.data.data;
    },
    *checkProjectProgressFromRedux({ payload: projList }, { select, put }) {
      const projectProgress = yield select(state => state.app.projectProgress);
      const projectInRedux = projectProgress.map(m => m.id);
      const projectToCheck = projList.map(m => m.id);
      const toRequest = subtracting(projectToCheck, projectInRedux);
      const toRequestProjects = toRequest.map(m => projList.filter(f => f.id === m)[0]);
      if (toRequestProjects.length > 0) {
        yield put({ type: 'getAndSetProjectPercentage', payload: toRequestProjects })
      }
    },
    *getAndSetProjectPercentage({ payload: list }, { call, put }) {
      const reqBdRes = yield call(api.getSource, 'orgbdres');
      const { data: orgBDResList } = reqBdRes;
      const allSteps = orgBDResList.filter(f => f.sort > 3).sort((a, b) => a.sort - b.sort);
      const projPercentage = [];
      for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (element.projstatus) {
          if (element.projstatus.name.includes('已完成') || element.projstatus.name.includes('Completed')) {
            projPercentage.push({ id: element.id, percentage: 100 });
            yield put({ type: 'saveProjectProgress', payload: { id: element.id, percentage: 100, status: '完成交易' } });
            continue;
          }
        }
        const paramsForPercentage = { proj: element.id };
        const projPercentageCount = yield call(api.getOrgBDCountNew, paramsForPercentage);
        let { response_count: resCount } = projPercentageCount.data;
        resCount = resCount.map(m => {
          const relatedRes = orgBDResList.filter(f => f.id === m.response);
          let resIndex = 0;
          let status = '暂无';
          if (relatedRes.length > 0) {
            resIndex = relatedRes[0].sort;
            status = relatedRes[0].name;
          }
          return { ...m, resIndex, status };
        });
        const maxRes = Math.max(...resCount.map(m => m.resIndex));
        const maxResObj = resCount.find(f => f.resIndex === maxRes);
        let percentage = 0;
        let status = '暂无';
        if (maxRes > 3) {
          const maxResIndex = allSteps.map(m => m.sort).indexOf(maxRes);
          percentage = Math.round((maxResIndex + 1) / allSteps.length * 100);
          status = maxResObj.status;
        }
        projPercentage.push({ id: element.id, percentage, status });
        yield put({ type: 'saveProjectProgress', payload: { id: element.id, percentage, status } }); 
      }
      // yield put({ type: 'saveProjectProgress', payload: projPercentage });
    },
    *getProjBDCommentsByID({ payload: { projBDID, forceUpdate } }, { call, put, select }) {
      const allProjBDComments = yield select(state => state.app.allProjBDComments);
      if (allProjBDComments[projBDID] && !forceUpdate) return allProjBDComments[projBDID];
      const req = yield call(requestAllData, api.getProjBDCom, { projectBD: projBDID }, 100);
      const { data: BDComments } = req.data;
      const commentsWithUrl = yield call(requestDownloadUrl, BDComments);
      yield put({ type: 'saveProjectBDComments', payload: { projBDID, projBDCom: commentsWithUrl } });
      return req.data.data;
    },
    *getDataroomByProjectID({ payload: projectIDArr }, { call, put, select }) {
      const allProjectIDToDataroom = yield select(state => state.app.projectIDToDataroom);
      const needsRefreshArr = [];
      projectIDArr.forEach(element => {
        if (allProjectIDToDataroom[element] === undefined) {
          needsRefreshArr.push(element);
        }
      });
      if (needsRefreshArr.length === 0) return;
      const req = yield call(api.queryDataRoom, {
        proj: needsRefreshArr.join(','),
        page_size: needsRefreshArr.length,
      });
      const { data: dataroom } = req.data;
      const newResult = allProjectIDToDataroom.slice();
      needsRefreshArr.forEach(element => {
        const projDataroomIndex = dataroom.map(m => m.proj.id).indexOf(element);
        newResult[element] = projDataroomIndex > -1 ? dataroom[projDataroomIndex] : null;
      });
      yield put({ type: 'saveSource', payload: { sourceType: 'projectIDToDataroom', data: newResult } });
    },
    *getOrgRemarks({ payload: { orgIDArr, forceUpdate }}, { call, put, select }) {
      const allOrgRemarks = yield select(state => state.app.orgRemarks);
      let needsRefreshArr = [];
      if (forceUpdate) {
        needsRefreshArr = orgIDArr;
      } else {
        orgIDArr.forEach(element => {
          const orgInfo = allOrgRemarks.find(f => f.id === element);
          if (!orgInfo) {
            needsRefreshArr.push(element);
          }
        });
      }
      if (needsRefreshArr.length === 0) return;
      const req = yield call(requestAllData, api.getOrgRemark, { org: needsRefreshArr }, 100);
      const { data: orgRemarks } = req.data;
      let newOrgRemarks = allOrgRemarks.slice();
      needsRefreshArr.forEach(element => {
        const remarks = orgRemarks.filter(f => f.org === element);
        const orgIndex = newOrgRemarks.map(m => m.id).indexOf(element);
        if (orgIndex === -1) {
          newOrgRemarks = newOrgRemarks.concat({ id: element, remarks });
        } else {
          newOrgRemarks[orgIndex] = { id: element, remarks };
        }
      });
      yield put({ type: 'saveSource', payload: { sourceType: 'orgRemarks', data: newOrgRemarks } });
    },
    *getOrgInvestorsAndRemarks({ payload: { orgIDArr, forceUpdate }}, { call, put, select }) {
      const allOrgInvestorsAndRemarks = yield select(state => state.app.orgInvestorsAndRemarks);
      let needsRefreshArr = [];
      if (forceUpdate) {
        needsRefreshArr = orgIDArr;
      } else {
        orgIDArr.forEach(element => {
          const orgInfo = allOrgInvestorsAndRemarks.find(f => f.id === element);
          if (!orgInfo) {
            needsRefreshArr.push(element);
          }
        });
      }
      if (needsRefreshArr.length === 0) return;
      const req = yield call(requestAllData, api.getUser, { org: needsRefreshArr }, 100);
      const { data: orgInvestors } = req.data;
      let investorRemarks = [];
      if (orgInvestors.length > 0) {
        const req0 = yield call(requestAllData, api.getUserRemark, { user: orgInvestors.map(m => m.id) }, 100);
        investorRemarks = req0.data.data
        investorRemarks = investorRemarks.filter(f => {
          return !/之前状态(.*)，现在状态(.*)/.test(f.remark);
        });
      }
      let newOrgInvestorsAndRemarks = allOrgInvestorsAndRemarks.slice();
      needsRefreshArr.forEach(element => {
        const investors = orgInvestors.filter(f => f.org.id === element);
        investors.forEach(element1 => {
          const remarks = investorRemarks.filter(f => f.user === element1.id);
          element1.remarks = remarks.sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime));
        });
        const orgIndex = newOrgInvestorsAndRemarks.map(m => m.id).indexOf(element);
        if (orgIndex === -1) {
          newOrgInvestorsAndRemarks = newOrgInvestorsAndRemarks.concat({ id: element, investors });
        } else {
          newOrgInvestorsAndRemarks[orgIndex] = { id: element, investors };
        }
      });
      yield put({ type: 'saveSource', payload: { sourceType: 'orgInvestorsAndRemarks', data: newOrgInvestorsAndRemarks } });
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {

        // dispatch({ type: 'getSourceList', payload: ['transactionPhases'] });
        // dispatch({ type: 'getSourceList', payload: ['currencyType'] });
        const key = URI_TO_KEY[pathname]
        const selectedKeys = key ? [key] : []

        dispatch({
          type: 'menuSelect',
          payload: selectedKeys
        })
        // TODO 设置 selectedKeys 的同时设置 openKeys

        // if (pathname.includes('/app') && !isLogin()) {
        //   history.replace('/')
        // }
      })
    }
  },
}
