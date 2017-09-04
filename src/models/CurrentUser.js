import dva from 'dva'
import * as api from '../api'
import { routerRedux } from 'dva/router'

function clearFilters() {
  const keys = [
    'DataRooomList',
    'EmailList',
    'EmailDetail',
    'OrganizationList',
    'OrgUserList',
    'ProjectList',
    'TimelineList',
    'UserList',
  ]
  keys.forEach(key => {
    localStorage.removeItem(key)
  })
}

export default {
  namespace: 'currentUser',
  state: null,
  reducers: {
    save(state,  { userInfo } ) {
      return { ...state, ...userInfo }
    },
    delete() {
      return null
    },
  },
  effects: {
    *login({ payload: { username, password, redirect } }, { call, put }) {
      clearFilters()
      const { data } = yield call(api.login, { username, password })
      const { token, user_info, menulist, permissions } = data
      const userInfo = { ...user_info, token, menulist, permissions }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      yield put({
        type: 'save',
        userInfo
      })
      yield put(routerRedux.replace(redirect || '/app'))
    },
    *logout({ payload }, { call, put }) {
      localStorage.removeItem('user_info')
      clearFilters()
      yield put({ type: 'delete' })
      if (payload && payload.redirect) {
        yield put(routerRedux.replace('/login?redirect=' + payload.redirect))
      } else {
        yield put(routerRedux.replace('/login'))
      }
    },
    *register({ payload: user }, { call, put }) {
      yield call(api.register, user)

      const { data } = yield call(api.login, { username: user.email, password: user.password })
      const { token, user_info, menulist, permissions } = data
      const userInfo = { ...user_info, token, menulist, permissions }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      yield put({
        type: 'save',
        userInfo
      })

      yield put({ type: 'app/registerStepForward' })
    },
  }
}

