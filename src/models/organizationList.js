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
    page_index: 1,
    page_size: 10,
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
        if (Array.isArray(filter[_key])) {
          filter[_key] = []
        } else {
          filter[_key] = null
        }
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
    setParam(state, { payload: param }) {
      return { ...state, param }
    },
  },
  effects: {
    *get({ payload: param }, { call, put, select }) {
      const { page_index, page_size } = yield select(state => state.organizationList)
      // param = Object.assign({}, param, {
      //   page_index: page_index,
      //   page_size: page_size
      // })
      console.log(param)
      const result = yield call(api.getOrg, param)
      yield put({ type: 'save', payload: { total: result.data.count, list: result.data.data } })
    },
    *filt({}, { select, put }) {
      const { filter } = yield select(state => state.organizationList)
      let param = {}
      for (let _key in filter) {
        let _value = filter[_key]
        if (Array.isArray(_value)) {
          if (_value.length > 0) {
            param[_key] = _value.join(',')
          }
        } else {
          if (_value != null) {
            param[_key] = _value
          }
        }
      }

      yield put({ type: 'get', payload: param })
    },
    *search({}, { select, put }) {
      const { filter, search } = yield select(state => state.organizationList)
      let param = {}
      for (let _key in filter) {
        let _value = filter[_key]
        if (Array.isArray(_value)) {
          if (_value.length > 0) {
            param[_key] = _value.join(',')
          }
        } else {
          if (_value != null) {
            param[_key] = _value
          }
        }
      }
      for (let _key in search) {
        if (search[_key] != null) {
          param[_key] = search[_key]
        }
      }
      // name 特殊处理
      if (param.name != null) {
        if (window.LANG == 'en') {
          param.nameE = param.name
        } else {
          param.nameC = param.name
        }
        delete param.name
      }

      yield put({ type: 'get', payload: param })
    },
    *reset({}, { put }) {
      yield put({ type: 'resetFilter' })
      yield put({ type: 'get', payload: {} })
    },
    *changePage({ payload: page }, { put }) {
      yield put({ type: 'setPage', payload: page })
      yield put({ type: 'get', payload: {} })
    },
    *changePageSize({ payload: pageSize }, { put }) {
      yield put({ type: 'setPageSize', payload: pageSize })
      yield put({ type: 'get', payload: {} })
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
