import * as api from '../api'

const DEFAULT_VALUE = {
  filter: {
    tags: [],
    country: [],
    industries: [],
    netIncome_USD_F: 0,
    netIncome_USD_T: 500000000,
    grossProfit_F: -200000000,
    grossProfit_T: 200000000,
    projstatus: [],
  },
  search: null,
  page: 1,
  pageSize: 10,
}

export default {
  namespace: 'projectList',
  state: {
    filter: {
      tags: [],
      country: [],
      industries: [],
      netIncome_USD_F: 0,
      netIncome_USD_T: 500000000,
      grossProfit_F: -200000000,
      grossProfit_T: 200000000,
      projstatus: [],
    },
    search: null,
    page: 1,
    pageSize: 10,
    _params: {},
    total: 0,
    list: [],
  },
  reducers: {
    setFilter(state, { payload: field }) {
      const filter = { ...state.filter, ...field }
      return { ...state, filter }
    },
    resetFilter(state) {
      const filter = { ...DEFAULT_VALUE.filter }
      return { ...state, filter }
    },
    setField(state, { payload: field }) {
      return { ...state, ...field }
    },
    updateParams(state, { payload: params }) {
      const _params = { ...state._params, ...params }
      return { ...state, _params }
    },
    clearParams(state) {
      return { ...state, _params: {} }
    },
    save(state, { payload: { total, list } }) {
      return { ...state, total, list }
    },
  },
  effects: {
    *delete({ payload: id }, { call, put, select }) {
      let result = yield call(api.deleteProj, id)
      yield put({ type: 'get' })
    },
    *get({}, { call, put, select }) {
      const { _params, pageSize, page } = yield select(state => state.projectList)
      // _params 处理
      const defaultFilter = DEFAULT_VALUE.filter
      if (_params['netIncome_USD_F'] == defaultFilter['netIncome_USD_F'] &&
          _params['netIncome_USD_T'] == defaultFilter['netIncome_USD_T']) {
            _params['netIncome_USD_F'] = _params['netIncome_USD_T'] = null
      }
      if (_params['grossProfit_F'] == defaultFilter['grossProfit_F'] &&
          _params['grossProfit_T'] == defaultFilter['grossProfit_T']) {
            _params['grossProfit_F'] = _params['grossProfit_T'] = null
      }

      let params = { ..._params, page_size: pageSize, page_index: page }
      console.log('>>>', params)
      let result = yield call(api.getProj, params)
      yield put({ type: 'save', payload: { total: result.data.count, list: result.data.data } })
    },
    *filt({}, { call, put, select }) {
      const { filter } = yield select(state => state.projectList)
      yield put({ type: 'setField', payload: { page: 1 } })
      yield put({ type: 'updateParams', payload: { ...filter } })
      yield put({ type: 'get' })
    },
    *search({}, { call, put, select }) {
      const { search } = yield select(state => state.projectList)
      yield put({ type: 'setField', payload: { page: 1 } })
      yield put({ type: 'updateParams', payload: { search } })
      yield put({ type: 'get' })
    },
    *reset({}, { call, put, select }) {
      yield put({ type: 'resetFilter' })
      yield put({ type: 'setField', payload: { page: 1 } })
      yield put({ type: 'clearParams' })
      yield put({ type: 'get' })
    },
    *changePage({ payload : page }, { call, put, select }) {
      const { pageSize } = yield select(state => state.projectList)
      yield put({ type: 'setField', payload: { page } })
      yield put({ type: 'get' })
    },
    *changePageSize({ payload: pageSize }, { call, put, select }) {
      yield put({ type: 'setField', payload: { pageSize } })
      yield put({ type: 'setField', payload: { page: 1 } })
      yield put({ type: 'get' })
    },
  },
  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({ pathname, query }) => {
        if (pathname == '/app/project/list') {
          dispatch({ type: 'get' })
        }
      })
    }
  }
}
