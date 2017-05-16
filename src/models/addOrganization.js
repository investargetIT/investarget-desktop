import { routerRedux } from 'dva/router'

export default {
  namespace: 'addOrganization',
  state: {},
  reducers: {},
  effects: {
    *goBack({}, {put}) {
      yield put(routerRedux.goBack())
    }
  },
  subscriptions: {},
};
