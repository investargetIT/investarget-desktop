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

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}

window.echo = function () {
  const args = [...arguments];
  args.unshift('%cLOG', 'color: white; font-weight: bold; background-color: red; padding: 3px')
  console.log.apply(console, args);
  // TODO: add caller position including file name and line number
}

// 使用 i18next 库来做国际化
let lang = window.appLocale.lang || 'cn'
i18next.init({
  lng: lang,
  debug: true,
  resources: {
    en: {
      translation: window.appLocale.messagesEn
    },
    cn: {
      translation: window.appLocale.messages
    }
  }
})

window.LANG = localStorage.getItem('APP_PREFERRED_LANG') || 'cn';
changeLang(window.LANG);

export function changeLang(lang='en') {
  return new Promise((resolve, reject) => {
    i18next.changeLanguage(lang, (err, t) => {
      if (err) reject(err);
      else {
        window.LANG = lang;
        localStorage.setItem('APP_PREFERRED_LANG', lang);
        resolve(t);
      }
    });
  });
}

function i18n(key, options=null) {
  let ans;
  if (options) {
    ans = i18next.t(key, options)
  } else {
    ans = i18next.t(key)
  }
  if (ans === key) return ans.substr(ans.lastIndexOf(".") + 1).split("_").map(w => w ? w[0].toLocaleUpperCase() + w.substr(1) : w).join(" ");
  else return ans;
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

export function timeWithoutHour(dateFromServer) {
  if (!window.Intl || typeof window.Intl !== "object") {
    return dateFromServer.slice(0, 16).replace('T', ' ')
  }
  const date = new Date(dateFromServer)
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
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
    8: 'HKD', // 港币
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
    'HKD': '$',
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
      var rate = result.data[0].exchange;
      exchangeCache[source] = Number(rate);
      return Number(rate)
    }).catch(() => {
      exchangeCache[source] = 1;
      return 1;
    });
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
  let result = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (currency == 'CNY') {
    return '¥' + result
  } else {
    return '$' + result
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
  return `${baseUrl}/proj/pdf/${id}/?acw_tk=${token}&lang=${window.LANG}`;
}

export function getPdfUrlWithoutBase(id) {
  const token = getToken();
  return `/proj/pdf/${id}/?acw_tk=${token}`;
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
  return key ? 'https://image.investarget.com/' + key : null;
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

export function checkMobile(mobile) {
  return /^\d{6,20}$/.test(mobile);
}

export function isShowCNY(record, allArea) {
  const { country: recordArea } = record;
  const parentArea = allArea.filter(f => f.id === recordArea.parent)[0];
  const isRecordAreaChina = ['中国', 'China'].includes(recordArea.country);
  const isRecordParentAreaChina = parentArea ? ['中国', 'China'].includes(parentArea.country) : false;
  return (isRecordAreaChina || isRecordParentAreaChina) && record.currency.id === 1;
}

export function checkRealMobile(mobile) {
  return /^(13[0-9]|14[579]|15[0-3,5-9]|17[0135678]|18[0-9])[\d*]{8}$/.test(mobile);
}

export function getUserGroupIdByName(allGroups, name) {
  const group = allGroups.filter(f => f.name === name);
  if (group.length > 0) {
    return group[0].id;
  } else {
    throw new Error('Group Not Found!!!');
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const requestAllData = async (request, params, page_size) => {
  const firstRes = await request({ ...params, page_size });
  const { count } = firstRes.data;
  if (count <= page_size) {
    return firstRes;
  }
  const secondRes = await request({ ...params, page_size: count });
  return secondRes;
}

export const requestAllData2 = async (request, params, max_size) => {
  const firstRes = await request({ ...params, max_size});
  const { count } = firstRes.data;
  if (count <= max_size) {
    return firstRes;
  }
  const secondRes = await request({ ...params, max_size: count });
  return secondRes;
}

function trimTextIfExceedMaximumCount(text, count) {
  if (text.length < count) {
    return text;
  }
  return text.slice(0, count) + '...';
}

function getFilenameWithoutExt(filename) {
  const splitFilename = filename.split('.');
  if (splitFilename.length > 1) {
    splitFilename.splice(splitFilename.length - 1, 1);
    return splitFilename.join('.');
  }
  return filename;
}

function getFileTypeByName(filename) {
  if (/\.(pdf)$/i.test(filename)) {
    return 'PDF';
  }
  if (/\.(gif|jpg|jpeg|bmp|png|webp)$/i.test(filename)) {
    return 'IMAGE';
  }
  if (/\.(doc|docx)$/i.test(filename)) {
    return 'WORD';
  }
  if (/\.(ppt|pptx)$/i.test(filename)) {
    return 'PPT';
  }
  if (/\.(xls|xlsx)$/i.test(filename)) {
    return 'EXCEL';
  }
  if (/\.(mp4|avi)$/i.test(filename)) {
    return 'VIDEO';
  }
  if (/\.(mp3|m4a)$/i.test(filename)) {
    return 'AUDIO';
  }
  return 'FILE';
}

export {
  trimTextIfExceedMaximumCount,
  getFilenameWithoutExt,
  getFileTypeByName,
};

export function getURLParamValue(props, name) {
  const params = new URLSearchParams(props.location.search);
  return params.get(name);
}

/**
 * http://stackoverflow.com/a/10997390/11236
 */
export function updateURLParameter(props, param, paramVal) {
  var newAdditionalURL = "";
  var tempArray = props.location.search.split("?");
  var additionalURL = tempArray[1];
  var temp = "";
  if (additionalURL) {
    tempArray = additionalURL.split("&");
    for (var i = 0; i < tempArray.length; i++) {
      if (tempArray[i].split('=')[0] != param) {
        newAdditionalURL += temp + tempArray[i];
        temp = "&";
      }
    }
  }

  var rows_txt = temp + "" + param + "=" + paramVal;
  return newAdditionalURL + rows_txt;
}
