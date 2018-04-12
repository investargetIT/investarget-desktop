import * as api from '../api'
import { i18n, checkPerm, isLogin } from '../utils/util'
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
      yield put(routerRedux.push('/app/projects/library?search=' + search))
    },
    *getGroup({}, { call, put, select }) {
      const group = yield select(state => state.app.group);
      if (group.length > 0) return;
      const { data } = yield call(api.queryUserGroup, { page_size: 99 });
      yield put({ type: 'saveGroup', payload: data.data });
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {

        dispatch({ type: 'getSourceList', payload: ['transactionPhases'] });
        dispatch({ type: 'getSourceList', payload: ['currencyType'] });
        const key = URI_TO_KEY[pathname]
        const selectedKeys = key ? [key] : []

        dispatch({
          type: 'menuSelect',
          payload: selectedKeys
        })
        // TODO 设置 selectedKeys 的同时设置 openKeys

        if (pathname === '/app/user/add' && !checkPerm('usersys.admin_adduser') && !checkPerm('usersys.user_adduser')) {
          history.replace('/app')
        }

        if (pathname === '/app' && !isLogin()) {
          history.replace('/')
        }
      })
    }
  },
}
