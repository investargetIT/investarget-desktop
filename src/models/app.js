import * as api from '../api'
import { URI_6, URI_3 } from '../constants'
import { i18n } from '../utils/util'

const resourceMap = {
  '/register': ['tag'],
  [URI_3]: ['currencyType', 'transactionPhases', 'industry', 'tag', 'orgtype'],
  [URI_6]: ['transactionPhases', 'tag', 'currencyType', 'orgarea']
}

export default {
  namespace: 'app',
  state: {
    collapsed: false,
    selectedKeys: [],
    openKeys: [],
    registerStep: 1,
    tag: [],
    country: [],
    title: [],
    currencyType: [],
    audit: [{id: 1, name: i18n('user.under_approval')}, {id: 2, name: i18n('user.recevied_approval')}, {id: 3, name: i18n('user.reject_approval')}],
    industry: [],
    transactionPhases:  [],
    orgarea: [],
    orgtype: [],
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
    setRegisterStep(state, { payload: registerStep }) {
      return { ...state, registerStep }
    },
    toggleMenu(state, { payload: collapsed }) {
      return { ...state, collapsed }
    }
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
      const { data } = yield call(api.getSource, sourceType, {lang: window.LANG})
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
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        // TODO 路径不在 menu 中时，selectedKeys 为 []
        const selectedKeys = [pathname]
        dispatch({
          type: 'menuSelect',
          payload: selectedKeys
        })
        // TODO 设置 selectedKeys 的同时设置 openKeys

        let resourceList = resourceMap[pathname]
        if (resourceList && resourceList.length > 0) {
          dispatch({ type: 'getSourceList', payload: resourceList })
        }

      })
    }
  },
};
