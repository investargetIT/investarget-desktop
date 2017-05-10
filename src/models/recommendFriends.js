import * as api from '../api'
import { routerRedux } from 'dva/router'

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
      const friends = result.data
      yield put({ type: 'setFriends', payload: friends })
    },

    *addFriends({}, {put}) {
      // TODO 加好友
      yield put(routerRedux.push('/recommend_projects'))
    },

    *skipFriends({}, {put}) {
      yield put(routerRedux.push('/recommend_projects'))
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/recommend_friends') {
          dispatch({ type: 'refreshFriends' });
        }
      })
    }
  },
};
