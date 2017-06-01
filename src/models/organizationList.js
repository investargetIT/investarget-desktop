import * as api from '../api'

export default {
  namespace: 'organizationList',
  state: {
    filter: {
      isOversea: null,
      currency: [],
      transactionPhases: [],
      industries: [],
      tags: [],
      organizationTypes: [],
    },
    search: {
      name: null,
      stockCode: null,
    },
    page: 1,
    pageSize: 10,
    total: 0,
    list: [],
  },
  reducers: {
    changeFilter(state, { payload: { key, value } }) {
      let filter = Object.assign({}, state.filter)
      filter[key] = value
      return { ...state, filter }
    },
    resetFilter(state) {
      let filter = Object.assign({}, state.filter)
      for (let _key in filter) {
        filter[_key] = Array.isArray(filter[_key]) ? [] : null
      }
      return { ...state, filter}
    },
    changeSearch(state, { payload: { key, value } }) {
      let search = Object.assign({}, state.search)
      for (let _key in search) {
        search[_key] = null
      }
      search[key] = value
      return { ...state, search }
    },
    setPage(state, { payload: page }) {
      return { ...state, page }
    },
    setPageSize(state, { payload: pageSize }) {
      return { ...state, pageSize }
    },
    save(state, { payload: { total, list } }) {
      return { ...state, total, list }
    },
  },
  effects: {
    *get({}, { call, put, select }) {
      const { filter, search, page_index, page_size } = yield select(state => state.organizationList)
      let param = { ...filter, ...search, page_index: page_index, page_size: page_size }
      for (let _key in param) {
        let _value = filter[_key]
        if (Array.isArray(_value)) {
          param[_key] = _value.join(',')
        }
      }
      if (param.name != null) {
        if (window.LANG == 'en') {
          param.nameE = param.name
        } else {
          param.nameC = param.name
        }
        delete param.name
      }
      let result = yield call(api.getOrg, param)
      yield put({ type: 'save', payload: { total: result.data.count, list: result.data.data } })
    },
    *filt({}, { select, put }) {
      yield put({ type: 'get' })
    },
    *search({}, { select, put }) {
      yield put({ type: 'get' })
    },
    *reset({}, { put }) {
      yield put({ type: 'resetFilter' })
      yield put({ type: 'get' })
    },
    *changePage({ payload: page }, { put }) {
      yield put({ type: 'setPage', payload: page })
      yield put({ type: 'get' })
    },
    *changePageSize({ payload: pageSize }, { put }) {
      yield put({ type: 'setPageSize', payload: pageSize })
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
