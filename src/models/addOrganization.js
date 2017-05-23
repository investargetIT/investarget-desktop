import { routerRedux } from 'dva/router'
import * as api from '../api'

export default {
  namespace: 'addOrganization',
  state: {
    exchangeRate: 1,
  },
  reducers: {
    setExchangeRate(state, { payload: exchangeRate }) {
      return { ...state, exchangeRate }
    }
  },
  effects: {
    *goBack({}, {put}) {
      yield put(routerRedux.goBack())
    },
    *getExchangeRate({}, {call, put}) {
      const result = yield call(api.getExchangeRate, {tcur: 'USD', scur: 'CNY'})
      yield put({ type: 'setExchangeRate', payload: Number(result.data.rate) })
    },
    *submit({ payload: values }, {call, put}) {
      yield call(api.addOrg, values)
      yield put(routerRedux.goBack())
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname == '/app/organization/add') {
          dispatch({ type: 'getExchangeRate' })
        }
      })
    }
  },
};
