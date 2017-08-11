import request from './utils/request'
import qs from 'qs'
import { PAGE_SIZE, BASE_URL } from './constants'
import { qsArrayToString } from './utils/util'
import _ from 'lodash'
import { ApiError } from './utils/request'

export const SOURCE = 1

function r(url, method, body) {

  const source = parseInt(localStorage.getItem('source'), 10)

  if (!source) {
    throw new ApiError(1299, 'data source missing')
  }

  const options = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "clienttype": "3",
      "source": source
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

  const source = parseInt(localStorage.getItem('source'), 10)

  if (!source) {
    throw new ApiError(1299, 'data source missing')
  }

  const options = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "clienttype": "3",
      "source": source
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

export function getShareToken(id) {
  return r('/proj/share/' + id + '/')
}

export function getShareProj(token) {
  return r(`/proj/shareproj/?token=${token}`)
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

export function downloadUrl(bucket, key) {
  const params = { bucket, key }
  return r('/service/downloadUrl', 'POST', params)
}

export function qiniuUpload(bucket, file) {

  const source = parseInt(localStorage.getItem('source'), 10)
  if (!source) {
    throw new ApiError(1299, 'data source missing')
  }

  const userStr = localStorage.getItem('user_info')
  const user = userStr ? JSON.parse(userStr) : null

  let headers = {
    "Accept": "application/json",
    "clienttype": "3",
    "source": source,
    "x-requested-with": "XMLHttpRequest",
  }
  if (user) {
    headers["token"] = user.token
  }

  var formData = new FormData()
  formData.append('file', file)

  return fetch(BASE_URL + '/service/qiniubigupload?bucket=' + bucket, {
    headers,
    method: 'POST',
    body: formData,
  }).then(response => {
    return response.json()
  }).then(data => {
    return { data: data.result }
  })
}

export function sendSmsCode(body) {
  return r('/service/sms', 'POST', body)
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
export function addTimeline(params) {
  return r('/timeline/', 'POST', params)
}

export function editTimeline(id, params) {
  return r('/timeline/' + id + '/', 'PUT', params)
}

export function getTimeline(params) {
  return r('/timeline/?' + qs.stringify(params))
}

export function getTimelineDetail(id) {
  return r('/timeline/' + id + '/')
}

export function deleteTimeline(id) {
  const params = { timelines: [id] }
  return r('/timeline/', 'DELETE', params)
}

export function closeTimeline(id, reason) {
  const params = { timelinedata: { isClose: true } }
  return r('/timeline/' + id + '/', 'PUT', params)
}

export function openTimeline(id) {
  const params = { timelinedata: { isClose: false } }
  return r('/timeline/' + id + '/', 'PUT', params)
}

/**
 * timeline remark
 */

export function getTimelineRemark(param) {
  return r('/timeline/remark/?' + qs.stringify(param))
}

export function getTimelineRemarkDetail(id) {
  return r('/timeline/remark/' + id + '/')
}

export function addTimelineRemark(data) {
  return r('/timeline/remark/', 'POST', data)
}

export function editTimelineRemark(id, data) {
  return r('/timeline/remark/' + id + '/', 'PUT', data)
}

export function deleteTimelineRemark(id) {
  return r('/timeline/remark/' + id + '/', 'DELETE')
}

/**
 * email
 */

export function getEmailList(params) {
  return r('/mongolog/email?' + qs.stringify(params))
}

export function getEmail(params) {
  return r('/emailmanage/?' + qs.stringify(params))
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

export function editUser(idArr, param) {
  const data = {
    'userlist': idArr,
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
  // const mobilecode = '375104'
  const mobilecode = user.code
  // const mobilecodetoken = '4871ace7028c4dc76c260adff9386e4f'
  const mobilecodetoken = user.smstoken
  // const mobile = '18004092637'
  const usernameC = user.username
  const orgname = user.organization
  const mobileAreaCode = user.prefix
  const param = {...user, mobilecode, mobilecodetoken, usernameC, orgname, mobileAreaCode}
  return r('/user/register/', 'POST', param)
}

export function queryLogList(pageIndex, pageSize) {
  return r(`/log/api?page_index=${pageIndex}&page_size=${pageSize}`)
}

export function queryPermList() {
  return r('/user/perm/')
}

export const queryUserGroup = param => r('/user/group/?' + qs.stringify(param))

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

export const modifyPassword = (id, oldpassword, newpassword) => r(`/user/password/${id}/`, 'PUT', {oldpassword, newpassword})
export const addUnreachUser = body => r('/user/unuser/', 'POST', body)
export const getUnreachUser = param => r('/user/unuser/?' + qs.stringify(param))
export const deleteUnreachUser = id => r('/user/unuser/' + id, 'DELETE')
export const checkUserExist = mobileOrEmail => r('/user/checkexists/?account=' + mobileOrEmail)

/**
 * dataroom
 */
export function queryDataRoom(param) {
  return r('/dataroom/?' + qs.stringify(param))
}

export function createDataRoom(body) {
  return r('/dataroom/', 'POST', body)
}

export function getDataRoomFile(param) {
  return r('/dataroom/file/?' + qs.stringify(param))
}

export function queryDataRoomDetail(id) {
  return r('/dataroom/' + id)
}
export const deleteDataRoom = body => r('/dataroom/', 'DELETE', body)
export const editDataRoom = body => r('/dataroom/', 'PUT', body)
export const addToDataRoom = body => r('/dataroom/file/', 'POST', body)
export const deleteFromDataRoom = body => r('/dataroom/file/', 'DELETE', body)
export const editInDataRoom = body => r('/dataroom/file/', 'PUT', body)

/**
 * User Relation
 */
export function getUserRelation(param) {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/user/relationship/?' + qs.stringify(param))
}

export function addUserRelation(param) {
  return r('/user/relationship/', 'POST', param)
}

export function deleteUserRelation(idArr) {
  const param = {'relationlist': idArr}
  return r('/user/relationship/', 'DELETE', param)
}

export const checkUserRelation = (investor, trader) => r('/user/checkrelation/', 'POST', { investor, trader })
export const editUserRelation = (relationlist, relationdata) => r('/user/relationship/', 'PUT', { relationlist, relationdata })

/**
 * msg
 */
export const getMsg = param => r('/msg/?' + qs.stringify(param))
export const readMsg = id => r('/msg/' + id + '/', 'POST')
