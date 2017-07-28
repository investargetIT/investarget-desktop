import ReactDOM from 'react-dom'
import { addLocaleData, IntlProvider } from 'react-intl'
import { LocaleProvider } from 'antd'
import dva from 'dva';
import { useRouterHistory } from 'dva/router';
import { createHistory } from 'history'

import './index.css';
import createLoading from 'dva-loading';
import { message } from 'antd'
import { hasPerm } from './utils/util'

const userStr = localStorage.getItem('user_info')
const user = userStr ? JSON.parse(userStr) : null

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
    currentUser: user,
  },
  onError(e, dispatch) {
    console.debug(e.toString())
    if (e.name === 'ApiError' && e.code === 2009) {
      dispatch({
        type: 'currentUser/logout'
      })
      message.error('权限校验失败，请重新登录')
    } else {
      message.error(e.message)
    }
  },
})

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
app.model(require('./models/dataRoomList'))

// 4. Router
app.router(require('./router'));

// getUserType
window.IS_ADMIN = hasPerm('usersys.as_admin')
window.IS_INVESTOR = hasPerm('usersys.as_investor')
window.IS_TRADER = hasPerm('usersys.as_trader')

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
