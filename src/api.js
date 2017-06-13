import request from './utils/request'
import qs from 'qs'
import { PAGE_SIZE } from './constants'
import { qsArrayToString } from './utils/util'
import _ from 'lodash'

function r(url, method, body) {

  const options = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "clienttype": "3",
      "source": 1
    }
  }

  const userStr = localStorage.getItem('user_info')
  const user = userStr ? JSON.parse(userStr) : null

  if (user) {
    options.headers["token"] = user.token
  }

  if (method) {
    options["method"] = method
  }

  if (body) {
    options["body"] = JSON.stringify(body)
  }

  const lang = url.split('?').length > 1 ? `&lang=${window.LANG}` : `?lang=${window.LANG}`

  return request(url + lang, options)
}

/**
 * dataroom
 */


/**
 * org
 */

export function getOrg(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/org/?' + qs.stringify(param))
}

export function addOrg(param) {
  return r('/org/?', 'POST', param)
}

/**
 * proj
 */

export function getProj(token, param) {
  return r('/proj/?' + qs.stringify(param))
}

export function favoriteProj(token, param) {
  return r('/proj/favorite/', 'POST', param)
}

/**
 * service
 */

export function getExchangeRate(param) {
  return r('/service/currencyrate?' + qs.stringify(param))
}

/**
 * source
 */

export function getSource(sourceType) {
  return r(`/source/${sourceType}`)
}

/**
 * timeline
 */


/**
 * user
 */

export function getUser(token, param) {
  return r('/user/?' + qs.stringify(param))
}

export function login(values) {
  const param = {
    account: values.username,
    password: values.password,
    datasource: 1
  }
  return r('/user/login/', 'POST', param)
}

export function get({ page }) {
  return r(`/user/?page_index=${page}&page_size=${PAGE_SIZE}`)
}

export function addFriend(token, param) {
  return r('/user/friend/', 'POST', param)
}

export function deleteUser(id) {
  return r('/user/', 'DELETE', { users: [id] })
}

export function register(user) {
  const datasource = 1
  const mobilecode = '375104'
  const mobilecodetoken = '4871ace7028c4dc76c260adff9386e4f'
  const mobile = '18004092637'
  const groups = '1'
  const nameC = user.name
  const orgname = user.organization
  const param = {...user, datasource, mobilecode, mobile, mobilecodetoken, groups, nameC, orgname}
  return r('/user/register/', 'POST', param)
}

export function queryLogList(pageIndex, pageSize) {
  return r(`/log/api?page_index=${pageIndex}&page_size=${PAGE_SIZE}`)
}

export function queryPermList() {
  return r('/user/perm/')
}

export function queryUserGroup() {
  return r('/user/group/')
}

export function updateUserGroup(groupId, body) {
  return r(`/user/group/${groupId}/`, 'PUT', body)
}

export function deleteUserGroup(groupId) {
  return r(`/user/group/${groupId}/`, 'DELETE')
}

export function createGroup(name) {
  const body = {
    name: name,
    permissions: []
  }
  return r('/user/group/', 'POST', body)
}

export function createUser(user) {
  return r('/user/', 'POST', user)
}

