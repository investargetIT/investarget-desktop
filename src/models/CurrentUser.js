import dva from 'dva'
import * as accountService from '../services/account'

export default {
  namespace: 'currentUser',
  state: {
    token: null,
  },  
  reducers: {
    save(state, { payload: { data: token } }) {
      return { ...state, token }
    },
  },
  effects: {
    *login({ payload: { username, password } }, { call, put }) {
      console.log('YXM login', payload)
      const { data, headers } = yield call(accountService.login, { username, password })
      yield put({
	type: 'save',
	payload: {
	  data,
	  total: parseInt(headers['x-total-count'], 10),
	  page: parseInt(page, 10),
	},
      }); 
    }
  }
}

