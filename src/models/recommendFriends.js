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
      const { id, token } = yield select(state => state.currentUser)
      const result = yield call(api.getUser, token, { id })
      const friends = result.data.data.filter(item => item.id != id)
      yield put({ type: 'setFriends', payload: friends })
    },

    *addFriends({}, {call, put, select}) {
      const { id, token } = yield select(state => state.currentUser)
      const { selectedFriends } = yield select(state => state.recommendFriends)
      const { registerStep } = yield select(state => state.app)

      try {
        yield call(api.addFriend, token, { user: id, friend: selectedFriends })
      } catch (e) {
        // TODO 错误处理
        console.error(e)
      } finally {
        yield put({ type: 'app/registerStepForward', payload: registerStep })
      }
    },

    *skipFriends({}, {call, put, select}) {
      const { registerStep } = yield select(state => state.app)
      yield put({ type: 'app/registerStepForward', payload: registerStep })
    }
  },
  subscriptions: {}
};
