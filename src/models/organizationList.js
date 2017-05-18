import * as api from '../api'

export default {
  namespace: 'organizationList',
  state: {
    isOversea: null,
    currency: [],
    transactionPhases: [],
    industries: [],
    tags: [],
    organizationTypes: [],

    name: null,
    stockCode: null,

    total: 0,
    page: 1,
    pageSize: 10,
    data: [],
  },
  reducers: {
    filterOnChange(state, { payload: { type, value } }) {
      return { ...state, [type]: value }
    },
    resetFilter(state) {
      return { ...state, isOversea: null, currency: [], transactionPhases: [], industries: [], tags: [], organizationTypes: []}
    },
    searchChange(state, { payload: { key, value } }) {
      return { ...state, [key]: value }
    },
    page(state, { payload: page }) {
      return { ...state, page }
    },
    pageSize(state, { payload: pageSize }) {
      return { ...state, pageSize }
    },
    save(state, { payload: { total, data } }) {
      return { ...state, total, data }
    },
  },
  effects: {
    *get({}, { call, put, select }) {
      const { page, pageSize, isOversea, currency, transactionPhases, industries, tags, organizationTypes, name, stockCode } = yield select(state => state.organizationList)
      const param = {
        page_index: page,
        page_size: pageSize,

        currencys: currency,
        industrys: industries,
        orgtransactionphases: transactionPhases,
        tags: tags,
        orgtypes: organizationTypes,

        orgcode: stockCode,
      }

      if (window.appLocale.locale == 'en-US') {
        param.nameE = name
      } else {
        param.nameC = name
      }

      const result = yield call(api.getOrg, param)
      yield put({ type: 'save', payload: { total: result.data.count, data: result.data.data } })
    },
    *reset({}, { put }) {
      yield put({ type: 'resetFilter' })
      yield put({ type: 'get' })
    },
    *changePage({ payload: page }, { put }) {
      yield put({ type: 'page', payload: page })
      yield put({ type: 'get' })
    },
    *changePageSize({ payload: pageSize }, { put }) {
      yield put({ type: 'pageSize', payload: pageSize })
      yield put({ type: 'get' })
    }
  },
  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({ pathname, query }) => {
        if (pathname == '/app/organization/list') {
          dispatch({ type: 'get' })
        }
      })
    }
  },
};
