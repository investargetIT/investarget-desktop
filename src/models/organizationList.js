
export default {
  namespace: 'organizationList',
  state: {
    isOversea: null,
    currency: [],
    transactionPhases: [],
    industries: [],
    tags: [],
  },
  reducers: {
    filterOnChange(state, { payload: { type, value } }) {
      return Object.assign({}, state, {
        [type]: value
      })
    }
  },
  effects: {},
  subscriptions: {},
};
