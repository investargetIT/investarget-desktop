import * as api from '../api'

export default {
  namespace: 'favoriteProjectList',
  state: {
    page: 1,
    pageSize: 10,
    total: 0,
    list: [],
  },
  reducers: {
    setField(state, { payload: field }) {
      return { ...state, ...field }
    },
    save(state, { payload: { total, list } }) {
      return { ...state, total, list }
    },
  },
  effects: {
    *getRecommend({}, { call, put, select }) {
      // TODO later
      // const params = { user: '', trader: '', favoritetype: '' }
      // yield put({ type: 'get', payload: params })
      yield put({ type: 'get' })
    },
    *getFavor({}, { call, put, select }) {
      yield put({ type: 'get' })
    },
    *getInterest({}, { call, put, select }) {
      yield put({ type: 'get' })
    },
    *get({ payload: _params }, { call, put, select }) {
      const { pageSize, page } = yield select(state => state.favoriteProjectList)
      let params = { page_size: pageSize, page_index: page }
      console.log('>>>', params)
      // let result = yield call(api.getFavoriteProj, params)
      let result = yield call(api.getProj, params)
      yield put({ type: 'save', payload: { total: result.data.count, list: result.data.data } })
    },
    *changePage({ payload : page }, { call, put, select }) {
      const { pageSize } = yield select(state => state.favoriteProjectList)
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
        if (pathname == '/app/projects/list/recommend') {
          dispatch({ type: 'getRecommend' })
        } else if (pathname == '/app/projects/list/favor') {
          dispatch({ type: 'getFavor' })
        } else if (pathname == '/app/projects/list/interest') {
          dispatch({ type: 'getInterest' })
        }
      })
    }
  }
}
