import ReactDOM from 'react-dom'
import { addLocaleData, IntlProvider } from 'react-intl'
import { LocaleProvider } from 'antd'
import dva from 'dva';
import { useRouterHistory } from 'dva/router';
import { createHistory } from 'history'
import { state } from './models/app';
import './base_components/menu.less';
import './index.css';
import createLoading from 'dva-loading';
import { message } from 'antd'
import { hasPerm, getUserInfo } from './utils/util'
import favicon from 'favicon.js'

// 推荐在入口文件全局设置 locale
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

if (document.domain === 'saas.investarget.com') {
  localStorage.setItem('source', 1);
}

// 6. Intl
const appLocale = window.appLocale
addLocaleData(appLocale.data)
const lang = appLocale.lang
window.LANG = lang || 'cn'
const basename = lang ? ('/' + lang) : ''

// 侧边栏菜单状态，页面宽度小于1200时关闭，大于1200时为用户设置值
// 如果用户没设置过的话默认展开
const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
let collapsed = localStorage.getItem('collapsed');
collapsed = w < 1200 ? true : collapsed ? JSON.parse(collapsed) : false;

// 1. Initialize
const app = dva({
  history: useRouterHistory(createHistory)({ basename: basename }),
  initialState: {
    currentUser: getUserInfo(),
    app: {
      ...state,
      collapsed,
    }
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
