import * as api from '../api'
import { i18n, isLogin, requestAllData, subtracting } from '../utils/util'
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
    service: [],
    unreadMessageNum: 0,
    libIndustry: [],
    search: '',
    tooNarrow: false,
    sortedTrader: [],
    group: [],
    orgbdres: [],
    orglv: [],
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
    dismissError(state) {
      const error = null
      return { ...state, error }
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
    *getSource({ payload: sourceType }, { put, select }) {
      const data = yield select(state => state.app[sourceType])
      data.length > 0 || (yield put({ type: 'requestSource', payload: sourceType }))
    },
    *getSourceList({ payload: sourceTypeList }, { put }) {
      for (var i=0,len=sourceTypeList.length; i<len; i++) {
        let sourceType = sourceTypeList[i]
        yield put({ type: 'getSource', payload: sourceType })
      }
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
      const projPercentage = [];
      for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (element.projstatus) {
          if (element.projstatus.name.includes('已完成') || element.projstatus.name.includes('Completed')) {
            projPercentage.push({ id: element.id, percentage: 100 });
            continue;
          }
        }
        const paramsForPercentage = { proj: element.id };
        const projPercentageCount = yield call(api.getOrgBDCountNew, paramsForPercentage);
        let { response_count: resCount } = projPercentageCount.data;
        resCount = resCount.map(m => {
          const relatedRes = orgBDResList.filter(f => f.id === m.response);
          let resIndex = 0;
          if (relatedRes.length > 0) {
            resIndex = relatedRes[0].sort;
          }
          return { ...m, resIndex };
        });
        const maxRes = Math.max(...resCount.map(m => m.resIndex));
        let percentage = 0;
        if (maxRes > 3) {
          // 计算方法是从正在看前期资料开始到交易完成一共11步，取百分比
          percentage = Math.round((maxRes - 3) / 11 * 100);
        }
        projPercentage.push({ id: element.id, percentage });
      }
      yield put({ type: 'saveProjectProgress', payload: projPercentage });
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

        if (pathname.includes('/app') && !isLogin()) {
          history.replace('/')
        }
      })
    }
  },
}
