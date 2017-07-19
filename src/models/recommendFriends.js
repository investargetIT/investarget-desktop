import * as api from '../api'
import { routerRedux } from 'dva/router'
import { delay } from 'dva/saga'

export default {
  namespace: 'recommendFriends',
  state: {
    friends: [],
    selectedFriends: []
  },
  reducers: {
    setFriends(state, { payload: friends }) {
      return { ...state, friends }
    },
    clearSelected(state) {
      return { ...state, selectedFriends: []}
    },
    toggleFriend(state, { payload: friend }) {
      var selectedFriends = state.selectedFriends.slice()
      var index = selectedFriends.indexOf(friend)
      if(index > -1) {
        selectedFriends.splice(index, 1)
      } else {
        selectedFriends.push(friend)
      }

      return { ...state, selectedFriends }
    },
  },
  effects: {
    *refreshFriends({}, {call, put, select}) {
      const { id } = yield select(state => state.currentUser)
      const params = {
        org: 39, // 机构: 多维海拓
        groups: [2], // 用户组：交易师
      }
      const result = yield call(api.getUser, params)
      const friends = result.data.data.filter(item => item.id != id)
      yield put({ type: 'setFriends', payload: friends })
    },

    *addFriends({}, {call, put, select}) {
      const { id, token } = yield select(state => state.currentUser)
      const { selectedFriends } = yield select(state => state.recommendFriends)

      try {
        yield call(api.addFriend, token, { user: id, friend: selectedFriends })
      } catch (e) {
        // TODO 错误处理
        console.error(e)
      } finally {
        yield put({ type: 'app/registerStepForward' })
      }
    },

    *skipFriends({}, {call, put}) {
      yield put({ type: 'app/registerStepForward' })
    }
  },
  subscriptions: {}
};
