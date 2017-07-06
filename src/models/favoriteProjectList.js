import * as api from '../api'

export default {
  namespace: 'favoriteProjectList',
  state: {
    page_index: 1,
    page_size: 10,
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
      const { page_size, page_index } = yield select(state => state.favoriteProjectList)
      let params = { page_size, page_index }
      console.log('>>>', params)
      // let result = yield call(api.getFavoriteProj, params)
      let result = yield call(api.getProj, params)
      yield put({ type: 'save', payload: { total: result.data.count, list: result.data.data } })
    },
    *changePage({ payload : page_index }, { call, put, select }) {
      const { page_size } = yield select(state => state.favoriteProjectList)
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
        console.log('>>>', pathname)
        if (pathname == '/app/project/list/recommend') {
          dispatch({ type: 'getRecommend' })
        } else if (pathname == '/app/project/list/favor') {
          dispatch({ type: 'getFavor' })
        } else if (pathname == '/app/project/list/interest') {
          dispatch({ type: 'getInterest' })
        }
      })
    }
  }
}
