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

function showError(message) {
  Modal.error({
    title: '错误',
    content: message,
  })
}


export { t, i18n, exchange, checkPerm, isLogin, getRandomInt, formatMoney, showError }
