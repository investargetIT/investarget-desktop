import { Popconfirm, Button, Modal } from 'antd'
import * as api from '../api'
window.api = api

import { baseUrl } from './request'
import i18next from 'i18next'

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

window.echo = function () {
  const args = [...arguments];
  args.unshift('%cLOG', 'color: white; font-weight: bold; background-color: black; padding: 3px')
  console.log.apply(console, args);
  // TODO: add caller position including file name and line number
}

// 使用 i18next 库来做国际化
const lang = window.appLocale.lang || 'cn'
i18next.init({
  lng: lang,
  debug: true,
  resources: {
    [lang]: {
      translation: window.appLocale.messages
    }
  }
})

function i18n(key, options=null) {
  if (options) {
    return i18next.t(key, options)
  } else {
    return i18next.t(key)
  }
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

export function parseDate(dateFromServer) {
  if (!window.Intl || typeof window.Intl !== "object") {
    return dateFromServer.slice(0, 16).replace('T', ' ')
  }
  const date = new Date(dateFromServer)
  const options = {
    month: 'numeric',
    day: 'numeric',
  }
  const locale = window.LANG === 'en' ? 'en-US' : 'zh-CN'
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export function parseTime(dateFromServer) {
  if (!window.Intl || typeof window.Intl !== "object") {
    return dateFromServer.slice(0, 16).replace('T', ' ')
  }
  const date = new Date(dateFromServer)
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }
  const locale = window.LANG === 'en' ? 'en-US' : 'zh-CN'
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export function timeSlapFromNow(dateString) {
  return (new Date(dateString).getTime() - Date.now()) / 1000;
}

function timeForIM(timestamp) {
  const timeInMs = Date.now()
  const date = new Date(timestamp)
  const nowDate = new Date(timeInMs)

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const nowYear = nowDate.getFullYear();
  const nowMonth = nowDate.getMonth();
  const nowDay = nowDate.getDate();

  let options
  if (year === nowYear && month === nowMonth && day === nowDay) {
    if (!window.Intl || typeof window.Intl !== "object") {
      return `${hour}:${minutes}`
    }
    options = {
      hour: 'numeric',
      minute: 'numeric',
    }
  } else {
    if (!window.Intl || typeof window.Intl !== "object") {
      return `${year.slice(2)}-${month}-${day}`
    }
    options = {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
    }
  }
  const locale = window.LANG === 'en' ? 'en-US' : 'zh-CN'
  return new Intl.DateTimeFormat(locale, options).format(date)
}


export function getCurrencyFromId(id) {
  const map = {
    1: 'CNY', // 人民币
    2: 'USD', // 美元
    3: 'EUR', // 欧元
    5: 'GBP', // 英镑
    6: 'JPY', // 日元
    7: 'KRW', // 韩元
    12: 'CNY', // 人民币及美元
  }
  return map[id]
}

function getCurrencySign(currency) {
  const map = {
    'CNY': '\uffe5',
    'USD': '$',
    'EUR': '\u20ac',
    'GBP': '\uffe1',
    'JPY': '\uffe5',
    'KRW': '\u20a9',
  }
  return map[currency]
}

export function getCurrencyFormatter(id) {
  const currency = getCurrencyFromId(id)
  const sign = getCurrencySign(currency)
  return function(value) {
    if (isNaN(value)) {
      return sign + ' '
    } else{
      return sign + ' ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}

export function getCurrencyParser(id) {
  const currency = getCurrencyFromId(id)
  const sign = getCurrencySign(currency)
  const re = (sign == '$') ? new RegExp('\\$\\s?|(,*)', 'g') : new RegExp('\\' + sign + '\\s?|(,*)', 'g')
  return function(value) {
    return value.replace(re, '')
  }
}


var exchangeCache = {}

function exchange(source) {
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
    })
  }
}

function getUserInfo() {
  const userInfoStr = localStorage.getItem('user_info')
  try {
    return JSON.parse(userInfoStr)
  } catch(e) {
    return null
  }
}

function checkPerm(perm) {
  const userInfo = getUserInfo()
  if (!userInfo) {
    return false
  }
  return userInfo.permissions.includes(perm)
}

function isLogin() {
  return getUserInfo()
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function formatMoney(value, currency) {
  if (currency == 'CNY') {
    return '¥' + value.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  } else {
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

function hasPerm(name) {
  const userInfo = getUserInfo()
  if (!userInfo) return false
  const perms = userInfo.permissions
  return perms.includes(name)
}

function getGroup() {
  const userInfo = getUserInfo()
  if (!userInfo) return null
  const group = userInfo.groups[0]
  return group && group.id
}

function getCurrentUser() {
  const userInfo = getUserInfo()
  if (!userInfo) return null
  return userInfo.id
}

function getToken() {
  const userInfo = getUserInfo()
  if (!userInfo) return null
  return userInfo.token
}

function getPdfUrl(id) {
  const token = getToken()
  return baseUrl + '/proj/pdf/' + id + '/?acw_tk=' + token
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

export function getImageUrl(key) {
  return 'https://o79atf82v.qnssl.com/' + key
}

export { i18n, exchange, checkPerm, isLogin, getRandomInt, formatMoney, getUserInfo, hasPerm, getGroup, getCurrentUser, formatBytes, intersection, subtracting, time, timeForIM, getPdfUrl }

export function isParent(node, parentNode) {
  while (node != undefined && node != null && node.tagName.toUpperCase() != 'BODY') {
    if (node == parentNode) {
      return true
    }
    node = node.parentNode
  }
  return false
}

export function appendToArray(array, items) {
  array = array.slice()
  if (Array.isArray(items)) {
    let len = items.length;
    for (let i=0; i<len; i++) {
      let item = items[i]
      if (!array.includes(item)) {
        array.push(item)
      }
    }
  } else {
    if (!array.includes(items)) {
      array.push(items)
    }
  }
  return array
}

export function removeFromArray(array, items) {
  array = array.slice()
  if (Array.isArray(items)) {
    let len = items.length;
    for (let i=0; i<len; i++) {
      let item = items[i]
      let index = array.indexOf(item)
      if (index > -1) {
        array.splice(index, 1)
      }
    }
  } else {
    let index = array.indexOf(items)
    if (index > -1) {
      array.splice(index, 1)
    }
  }
  return array
}
