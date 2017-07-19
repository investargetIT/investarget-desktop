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

function r2(url, method, body) {

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

  return request(url, options)
}

/**
 * dataroom
 */

export function getDataroom() {
  return { count: 0, data: [] }
}

export function deleteDataroom() {

}


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

export function editOrg(id, param) {
  return r('/org/' + id + '/', 'PUT', param)
}

export function deleteOrg(id) {
  return r('/org/' + id + '/', 'DELETE')
}

export function getOrgDetailLang(id, param) {
  return r('/org/' + id + '/?' + qs.stringify(param))
}

export function getOrgDetail(id, param) {
  return r2('/org/' + id + '/?' + qs.stringify(param))
}

export function getOrgRemark(param) {
  return r('/org/remark/?' + qs.stringify(param))
}

export function getOrgRemarkDetail(id) {
  return r('/org/remark/' + id + '/')
}

export function addOrgRemark(data) {
  return r('/org/remark/', 'POST', data)
}

export function editOrgRemark(id, data) {
  return r('/org/remark/' + id + '/', 'PUT', data)
}

export function deleteOrgRemark(id) {
  return r('/org/remark/' + id + '/', 'DELETE')
}

/**
 * proj
 */

export function getProj(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/proj/?' + qs.stringify(param))
}

export function favoriteProj(param) {
  return r('/proj/favorite/', 'POST', param)
}

export function createProj(param) {
  return r('/proj/', 'POST', param)
}

export function editProj(id, param) {
  return r('/proj/' + id + '/', 'PUT', param)
}

export function deleteProj(id) {
  return r('/proj/' + id + '/', 'DELETE')
}

export function getProjLangDetail(id) {
  return r('/proj/' + id + '/')
}

export function getProjDetail(id) {
  return r2('/proj/' + id + '/')
}

/**
 * Favorite Proj
 */

export function getFavoriteProj(param) {
  return r('/proj/favorite/?' + qs.stringify(param))
}

export function projFavorite(param) {
  return r('/proj/favorite/', 'POST', param)
}

export function projCancelFavorite(param) {
  return r('/proj/favorite/', 'DELETE', param)
}

/**
 * Proj finance
 */

export function getProjFinance(proj) {
  return r('/proj/finance/?proj=' + proj)
}

export function addProjFinance(data) {
  return r('/proj/finance/', 'POST', data)
}

export function editProjFinance(data) {
  const _data = { 'finances': [data] }
  return r('/proj/finance/', 'PUT', _data)
}

export function deleteProjFinance(id) {
  const data = { 'finances': [id] }
  return r('/proj/finance/', 'DELETE', data)
}

/**
 * proj attachment
 */

export function getProjAttachment(proj) {
  return r('/proj/attachment/?proj=' + proj)
}

export function addProjAttachment(data) {
  return r('/proj/attachment/', 'POST', data)
}

export function editProjAttachment(data) {
  return r('/proj/attachment/', 'PUT', data) // todo
}

export function deleteProjAttachment(id) {
  const data = { attachment: [id] }
  return r('/proj/attachment/', 'DELETE', data)
}

/**
 * service
 */

export function getExchangeRate(param) {
  return r('/service/currencyrate?' + qs.stringify(param))
}

export function qiniuDelete(bucket, key) {
  const param = { bucket, key }
  return r('/service/qiniudelete', 'POST', param)
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

export function getTimeline() {

}

export function deleteTimeline() {

}

/**
 * email
 */

export function getEmail() {

}

export function getEmailDetail() {

}

/**
 * user
 */

export function getUser(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/user/?' + qs.stringify(param))
}

export function addUser(param) {
  return r('/user/', 'POST', param)
}

export function editUser(id, param) {
  const data = {
    'userlist': [id],
    'userdata': param,
  }
  return r('/user/', 'PUT', data)
}

export function getUserBase(id) {
  return r('/user/' + id + '/')
}

export function getUserDetailLang(id) {
  return r('/user/detail/' + id + '/')
}

export function getUserDetail(id) {
  return r2('/user/detail/' + id + '/')
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
  const mobilecode = '375104'
  const mobilecodetoken = '4871ace7028c4dc76c260adff9386e4f'
  const mobile = '18004092637'
  const usernameC = user.username
  const orgname = user.organization
  const param = {...user, mobilecode, mobile, mobilecodetoken, usernameC, orgname}
  return r('/user/register/', 'POST', param)
}

export function queryLogList(pageIndex, pageSize) {
  return r(`/log/api?page_index=${pageIndex}&page_size=${pageSize}`)
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

/**
 * dataroom
 */
export function queryDataRoom() {
  return r('/dataroom/')
}

export function createDataRoom(body) {
  return r('/dataroom/', 'POST', body)
}

export function getDataRoomFile(dataRoomID) {
  return r(`/dataroom/file/?dataroom=${dataRoomID}`)
}

/**
 * User Relation
 */
export function getUserRelation(param) {
  return r('/user/relationship/?' + qs.stringify(param))
}

export function addUserRelation(param) {
  return r('/user/relationship/', 'POST', param)
}

export function deleteUserRelation(id) {
  const param = {'relationlist': [id]}
  return r('/user/relationship/', 'DELETE', param)
}
