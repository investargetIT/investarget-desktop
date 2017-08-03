import zhMessages from '../../locales/zh_flat.js'
import enMessages from '../../locales/en_flat.js'
import { Popconfirm, Button, Modal } from 'antd'
import * as api from '../api'
window.api = api

function t(obj, id) {
  const props = obj.props || obj
  return props.intl.formatMessage({ id: id })
}

function i18n(key) {
  var lang = window.LANG
  var messages = (lang == 'en') ? enMessages : zhMessages
  return messages[key]
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

export { t, i18n, exchange, checkPerm, isLogin, getRandomInt, formatMoney, hasPerm, getGroup, getCurrentUser, formatBytes }
