import dva from 'dva'
import * as api from '../api'
import { routerRedux } from 'dva/router'
import { handleError } from '../utils/util';

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
    *login({ payload: { username, password, remember, redirect } }, { call, put }) {
      clearFilters()
      const { data } = yield call(api.login, { username, password })
      const { token, user_info, menulist, permissions, is_superuser } = data
      const userInfo = { ...user_info, token, menulist, permissions, is_superuser }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      yield put({
        type: 'save',
        userInfo
      })
      const url = redirect ? decodeURIComponent(redirect) : '/app'
      yield put(routerRedux.replace(url))
      // 存储用户名和密码？
      if (remember) {
        localStorage.setItem('login_info', JSON.stringify({ username, password }))
      } else {
        localStorage.removeItem('login_info')
      }
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
      yield call(api.register, {...user, registersource: 3}) // 标识注册来源

      const { data } = yield call(api.login, { username: user.email, password: user.password })
      const { token, user_info, menulist, permissions, is_superuser } = data;
      const userInfo = { ...user_info, token, menulist, permissions, is_superuser };
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      yield put({
        type: 'save',
        userInfo
      })

      if (user.type !== 14) yield put(routerRedux.replace('/recommend-friends'));
      else yield put(routerRedux.replace('/app/dataroom/project/list'));
    },
  }
}

