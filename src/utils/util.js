import zhMessages from '../../locales/zh_flat.js'
import enMessages from '../../locales/en_flat.js'
import { Popconfirm, Button, Modal } from 'antd'
import * as api from '../api'
window.api = api

// Since IE doesn't support this we need the polyfill
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1. 
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

function t(obj, id) {
  const props = obj.props || obj
  return props.intl.formatMessage({ id: id })
}

function i18n(key) {
  var lang = window.LANG
  var messages = (lang == 'en') ? enMessages : zhMessages
  return messages[key]
}

function time(dateFromServer) {
  if (!window.Intl || typeof window.Intl !== "object") {
    return dateFromServer.slice(0, 16).replace('T', ' ')
  }
  const date = new Date(dateFromServer)
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }
  const locale = window.LANG === 'en' ? 'en-US' : 'zh-CN'
  return new Intl.DateTimeFormat(locale, options).format(date)
}

var exchangeCache = {}
var offlineRate = {
  'USD': 1,
  'CNY': 0.147,
}
function exchange(source) {
  console.log(source)
  if (exchangeCache[source] != null) {
    let rate = exchangeCache[source]
    return new Promise(function(resolve, reject) {
      resolve(rate)
    })
  } else {
    let param = {
      'tcur': 'USD',
      'scur': source,
    }
    return api.getExchangeRate(param).then((result) => {
      var rate = result.data.rate
      exchangeCache[source] = rate
      return rate
    }, (error) => {
      return offlineRate[source]
    })
  }

}

function checkPerm(perm) {
  const userInfoStr = localStorage.getItem('user_info')
  if (!userInfoStr) {
    return false
  }
  const permissions = JSON.parse(userInfoStr).permissions
  if (permissions.includes(perm)) {
    return true
  } else {
    return false
  }
}

function isLogin() {
  const userInfoStr = localStorage.getItem('user_info')
  if (!userInfoStr) {
    return false
  } else {
    return JSON.parse(userInfoStr)
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function formatMoney(value, currency) {
  if (currency == 'CNY') {
    return '￥ ' + value.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  } else {
    return '$ ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

function hasPerm(name) {
  const userInfo = JSON.parse(localStorage.getItem('user_info'))
  if (!userInfo) return false
  const perms = userInfo.permissions
  return perms.includes(name)
}

function getGroup() {
  const userInfo = JSON.parse(localStorage.getItem('user_info'))
  if (!userInfo) return null
  const group = userInfo.groups[0]
  return group && group.id
}
window.getGroup = getGroup

function getCurrentUser() {
  const userInfo = JSON.parse(localStorage.getItem('user_info'))
  if (!userInfo) return null
  return userInfo.id
}

function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||0,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

const intersection = (xs,ys) => xs.filter(x => ys.some(y => x === y))
const subtracting = (xs, ys) => xs.filter(x => !ys.includes(x))


export function handleError(error) {
  window.app._store.dispatch({
    type: 'app/findError',
    payload: error,
  })
}

export { t, i18n, exchange, checkPerm, isLogin, getRandomInt, formatMoney, hasPerm, getGroup, getCurrentUser, formatBytes, intersection, subtracting, time }
