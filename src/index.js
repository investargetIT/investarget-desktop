import ReactDOM from 'react-dom'
import { addLocaleData, IntlProvider } from 'react-intl'
import { LocaleProvider } from 'antd'
import dva from 'dva';
import { useRouterHistory } from 'dva/router';
import { createHistory } from 'history'

import './index.css';
import createLoading from 'dva-loading';
import { message } from 'antd'
import { hasPerm, getUserInfo } from './utils/util'


// 6. Intl
const appLocale = window.appLocale
addLocaleData(appLocale.data)
const lang = appLocale.lang
window.LANG = lang || 'cn'
const basename = lang ? ('/' + lang) : ''

// 1. Initialize
const app = dva({
  history: useRouterHistory(createHistory)({ basename: basename }),
  initialState: {
    currentUser: getUserInfo(),
  },
  onError(error, dispatch) {
    dispatch({
      type: 'app/findError',
      payload: error
    })
  },
})
window.app = app

// 2. Plugins
// app.use({});
app.use(createLoading({
  effects: true
}));

// 3. Model
app.model(require("./models/recommendProjects"))
app.model(require("./models/recommendFriends"))

app.model(require('./models/CurrentUser'))
app.model(require("./models/app"))

// 4. Router
app.router(require('./router'));

// 5. Start
const App = app.start();

ReactDOM.render(
  (<LocaleProvider locale={appLocale.antd}>
    <IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
      <App />
    </IntlProvider>
  </LocaleProvider>),
  document.getElementById('root')
)
