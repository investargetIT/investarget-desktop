import dva from 'dva'
import * as accountService from '../services/account'
import { routerRedux } from 'dva/router'

export default {
  namespace: 'currentUser',
  state: {
    token: null,
  },  
  reducers: {
    save(state,  { token } ) {
      return { ...state, token }
    },
  },
  effects: {
    *login({ payload: { username, password } }, { call, put }) {
      const { data } = yield call(accountService.login, { username, password })
      const { token, user_info: userInfo } = data
      yield put({
	type: 'save',
	token
      })
      yield put(routerRedux.push('/'))
    }
  }
}

