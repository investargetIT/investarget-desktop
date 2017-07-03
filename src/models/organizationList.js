import * as api from '../api'

const DEFAULT_VALUE = {
  filter: {
    isOversea: null,
    currencys: [],
    orgtransactionphases: [],
    industrys: [],
    tags: [],
    orgtypes: [],
  },
  search: null,
  page_index: 1,
  page_size: 10,
}

export default {
  namespace: 'organizationList',
  state: {
    filter: {
      isOversea: null,
      currencys: [],
      orgtransactionphases: [],
      industrys: [],
      tags: [],
      orgtypes: [],
    },
    search: null,
    page_size: 10,
    page_index: 1,
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
      let result = yield call(api.deleteOrg, id)
      yield put({ type: 'get' })
    },
    *get({}, { call, put, select }) {
      const { _params, page_size, page_index } = yield select(state => state.organizationList)
      let params = { ..._params, page_size, page_index }
      console.log('>>>', params)
      let result = yield call(api.getOrg, params)
      yield put({ type: 'save', payload: { total: result.data.count, list: result.data.data } })
    },
    *filt({}, { call, put, select }) {
      const { filter } = yield select(state => state.organizationList)
      yield put({ type: 'setField', payload: { page_index: 1 } })
      yield put({ type: 'updateParams', payload: { ...filter } })
      yield put({ type: 'get' })
    },
    *search({}, { call, put, select }) {
      const { search } = yield select(state => state.organizationList)
      yield put({ type: 'setField', payload: { page_index: 1 } })
      yield put({ type: 'updateParams', payload: { search } })
      yield put({ type: 'get' })
    },
    *reset({}, { call, put, select }) {
      yield put({ type: 'resetFilter' })
      yield put({ type: 'setField', payload: { page_index: 1 } })
      yield put({ type: 'clearParams' })
      yield put({ type: 'get' })
    },
    *changePage({ payload : page_index }, { call, put, select }) {
      const { page_size } = yield select(state => state.organizationList)
      yield put({ type: 'setField', payload: { page_index } })
      yield put({ type: 'get' })
    },
    *changePageSize({ payload: page_size }, { call, put, select }) {
      yield put({ type: 'setField', payload: { page_size } })
      yield put({ type: 'setField', payload: { page_index: 1 } })
      yield put({ type: 'get' })
    },
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
