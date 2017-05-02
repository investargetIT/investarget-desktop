import ReactDOM from 'react-dom'
import { addLocaleData, IntlProvider } from 'react-intl'
import { LocaleProvider } from 'antd'
import dva from 'dva';
import './index.css';
import createLoading from 'dva-loading';
import { message } from 'antd'

const userStr = localStorage.getItem('user_info')
const user = userStr ? JSON.parse(userStr) : null

// 1. Initialize
const app = dva({
  initialState: {
    products: [
      { name: 'dva', id: 1 },
      { name: 'antd', id: 2 },
    ],
    currentUser: user,
  },
  onError(e, dispatch) {
    console.debug(e.toString())
    message.error(e.message)
  },
})

// 2. Plugins
// app.use({});
app.use(createLoading({
  effects: true
}));

// 3. Model
// app.model(require('./models/example'));
app.model(require('./models/products'));
app.model(require("./models/users"));
app.model(require('./models/CurrentUser'))

// 4. Router
app.router(require('./router'));

// 5. Start
const App = app.start();

// 6. Intl
const appLocale = window.appLocale
addLocaleData(appLocale.data)

ReactDOM.render(
  (<LocaleProvider locale={appLocale.antd}>
    <IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
      <App />
    </IntlProvider>
  </LocaleProvider>),
  document.getElementById('root')
)
