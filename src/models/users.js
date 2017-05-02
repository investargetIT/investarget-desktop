import * as usersService from '../services/users';


export default {
  namespace: 'users',
  state: {
    transactionPhases: [],
    tags: [],
    currencies: [],
    audit: null,
    list: [],
    total: null,
    page: null,
  },
  reducers: {
    transactionPhase(state, { payload: transactionPhases }) {
      return { ...state, transactionPhases }
    },
    tag(state, { payload: tags }) {
      return { ...state, tags }
    },
    currency(state, { payload: currencies }) {
      return { ...state, currencies }
    },
    audit(state, { payload: audit }) {
      return { ...state, audit }
    },
    save(state, { payload: { data: list, total, page } }) {
      return { ...state, list, total, page };
    },
  },
  effects: {
    *fetch({ payload: { page = 1 } }, { call, put }) {
      const { data, headers } = yield call(usersService.fetch, { page });
      yield put({
        type: 'save',
        payload: {
          data,
          total: parseInt(headers['x-total-count'], 10),
          page: parseInt(page, 10),
        },
      });
    },
    *remove({ payload: id }, { call, put }) {
      yield call(usersService.remove, id);
      yield put({ type: 'reload' });
    },
    *patch({ payload: { id, values } }, { call, put }) {
      yield call(usersService.patch, id, values);
      yield put({ type: 'reload' });
    },
    *create({ payload: values }, { call, put }) {
      yield call(usersService.create, values);
      yield put({ type: 'reload' });
    },
    *reload(action, { put, select }) {
      const page = yield select(state => state.users.page);
      yield put({ type: 'fetch', payload: { page } });
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/users') {
          dispatch({ type: 'fetch', payload: query });
        }
      });
    },
  },
};
