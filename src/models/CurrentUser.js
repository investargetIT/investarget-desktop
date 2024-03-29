import dva from 'dva'
import * as api from '../api'
import * as apiForMobile from '../apiForMobile';
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
    saveRegisterInfo(state, { registerInfo }) {
      return { ...state, registerInfo };
    },
  },
  effects: {
    *login({ payload: { username, password, remember, redirect, union_id } }, { call, put }) {
      clearFilters()
      const { data } = yield call(api.login, { username, password, union_id })
      const { token, user_info, menulist, permissions, is_superuser } = data
      const userInfo = { ...user_info, token, menulist, permissions, is_superuser }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      yield put({
        type: 'save',
        userInfo
      })
      let url = '/app';
      if (password == 'Aa123456') {
        url = '/app/modify_password?reset=true';
      } else if (redirect) {
        url = decodeURIComponent(redirect);
      } else if (!is_superuser && permissions.includes('usersys.as_investor')) {
        url = '/app/dataroom/project/list';
      } else if (!is_superuser && permissions.includes('usersys.as_trader') && permissions.includes('dataroom.onlydataroom')) {
        url = '/app/dataroom/project/list';
      }
      // 存储用户名和密码？
      if (remember) {
        localStorage.setItem('login_info', JSON.stringify({ username, password }))
      } else {
        localStorage.removeItem('login_info')
      }
      if (url.includes('pdf_viewer.html')) {
        window.location.replace(url);
      } else {
        yield put(routerRedux.replace(url));
      }
    },
    *loginWithFeishu({ payload: { data } }, { put }) {
      const { token, user_info, menulist, permissions, is_superuser } = data;
      const userInfo = { ...user_info, token, menulist, permissions, is_superuser };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      yield put({
        type: 'save',
        userInfo,
      });
      let url = '/app';
      if (!is_superuser && permissions.includes('usersys.as_investor')) {
        url = '/app/dataroom/project/list';
      }
      yield put(routerRedux.replace(url));
    },
    *loginForMobile({ payload: { username, password, remember, redirect } }, { call, put }) {
      clearFilters()
      const { data } = yield call(apiForMobile.login, { username, password })
      const { token, user_info, menulist, permissions, is_superuser } = data
      const userInfo = { ...user_info, token, menulist, permissions, is_superuser }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      yield put({
        type: 'save',
        userInfo
      })
      let url = '/m';
      if (redirect) {
        url = decodeURIComponent(redirect);
      }
      // 存储用户名和密码？
      if (remember) {
        localStorage.setItem('login_info', JSON.stringify({ username, password }))
      } else {
        localStorage.removeItem('login_info')
      }
      if (url.includes('pdf_viewer.html')) {
        window.location.replace(url);
      } else {
        yield put(routerRedux.replace(url));
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
    *logoutForMobile({ payload }, { call, put }) {
      localStorage.removeItem('user_info')
      clearFilters()
      yield put({ type: 'delete' })
      if (payload && payload.redirect) {
        yield put(routerRedux.replace('/mlogin?redirect=' + payload.redirect))
      } else {
        yield put(routerRedux.replace('/mlogin'))
      }
    },
    *register({ payload: additionalInfo }, { call, put, select }) {
      const { registerInfo } = yield select(state => state.currentUser);
      const user = { ...registerInfo, ...additionalInfo };
      yield call(api.register, {...user, registersource: 3}) // 标识注册来源

      const { data } = yield call(api.login, { username: user.email, password: user.password })
      const { token, user_info, menulist, permissions, is_superuser } = data;
      const userInfo = { ...user_info, token, menulist, permissions, is_superuser };
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      yield put({
        type: 'save',
        userInfo
      })

      let url = '/app';
      if (!is_superuser && permissions.includes('usersys.as_investor')) {
        url = '/app/dataroom/project/list';
      }
      yield put(routerRedux.replace(url))

      // if (user.type !== 14) yield put(routerRedux.replace('/recommend-friends'));
      // else yield put(routerRedux.replace('/app/dataroom/project/list'));
    },
    *register1({ payload: registerInfo }, { put }) {
      yield put({ type: 'saveRegisterInfo', registerInfo });
    },
  }
}

