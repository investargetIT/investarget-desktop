
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
    area(state, { payload: areas }) {
      return { ...state, areas }
    },
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
    }
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
