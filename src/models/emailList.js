import * as api from '../api'

const DEFAULT_VALUE = {
  filter: {},
  search: null,
  page: 1,
  pageSize: 10,
}

export default {
  namespace: 'emailList',
  state: {
    filter: {},
    search: null,
    pageSize: 10,
    page: 1,
    _params: {},
    total: 0,
    list: [{
      id: 1,
    }],
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
    *get({}, { call, put, select }) {
      const { _params, pageSize, page } = yield select(state => state.emailList)
      let params = { ..._params, page_size: pageSize, page_index: page }
      console.log('>>>', params)
      let result = yield call(api.getEmail, params)
      yield put({ type: 'save', payload: { total: result.data.count, list: result.data.data } })
    },
    *filt({}, { call, put, select }) {
      const { filter } = yield select(state => state.emailList)
      yield put({ type: 'setField', payload: { page: 1 } })
      yield put({ type: 'updateParams', payload: { ...filter } })
      yield put({ type: 'get' })
    },
    *search({}, { call, put, select }) {
      const { search } = yield select(state => state.emailList)
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
      const { pageSize } = yield select(state => state.emailList)
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
        if (pathname == '/app/email/list') {
          // dispatch({ type: 'get' })
        }
      })
    }
  },
};
