import * as api from '../api'

export default {
  namespace: 'organizationList',
  state: {
    isOversea: null,
    currency: [],
    transactionPhases: [],
    industries: [],
    tags: [],
    data: [],
  },
  reducers: {
    filterOnChange(state, { payload: { type, value } }) {
      return Object.assign({}, state, {
        [type]: value
      })
    },
    save(state, { payload: data }) {
      return { ...state, data }
    },
  },
  effects: {
    *get({ payload: { page = 1 } }, { call, put }) {
      const result = yield call(api.getOrg, { page })
      yield put({ type: 'save', payload: result.data })
    }
  },
  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({ pathname, query }) => {
        if (pathname == '/app/organization/list') {
          dispatch({ type: 'get', payload: { page : 1} })
        }
      })
    }
  },
};
