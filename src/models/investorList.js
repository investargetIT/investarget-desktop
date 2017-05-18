
export default {
  namespace: 'investorList',
  state: {
    transactionPhases: [],
    tags: [],
    currencies: [],
    audit: null,
    areas: [],
    name: null,
    phone: null,
    email: null,
    orgnization: null,
    transaction: null,
    searchType: 'name',
    selectedRowKeys: []
  },
  reducers: {
    resetFilter(state) {
      return { ...state, transactionPhases: [], tags: [], currencies: [], audit: null, areas: [] }
    },
    name(state, { payload: name }) {
      return { ...state, name }
    },
    phone(state, { payload: phone }) {
      return { ...state, phone }
    },
    email(state, { payload: email }) {
      return { ...state, email }
    },
    orgnization(state, { payload: orgnization }) {
      return { ...state, orgnization }
    },
    transaction(state, { payload: transaction }) {
      return { ...state, transaction }
    },
    searchType(state, { payload: searchType }) {
      return { ...state, searchType }
    },
    clearValue(state) {
      return { ...state, name: null, phone: null, email: null, orgnization: null, transaction: null }
    },
    filterOnChange(state, { payload: { type, value } }) {
      return Object.assign({}, state, {
        [type]: value
      })
    },
    onSelectedRowKeysChanged(state, { payload: selectedRowKeys }) {
      return { ...state, selectedRowKeys }
    },
  },
  effects: {
    filter() {
      // TODO
      console.log('filter')
    },
    search() {
      // TODO
      console.log('search')
    },
  },
  subscriptions: {},
};
