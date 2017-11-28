import request from './utils/request'
import qs from 'qs'
import { PAGE_SIZE, BASE_URL } from './constants'
import { qsArrayToString, getUserInfo } from './utils/util'
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

  const user = getUserInfo()
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


  const user = getUserInfo()

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

  const user = getUserInfo()

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

/**
 * 在使用环信发送图片或语音等消息时需要先把这些文件上传给环信
 * WebSDK好像有直接发送图片的接口，先放这儿吧
 *
 * @param {string} token 登录环信后获取的 token
 * @param {object} file 上传的文件
 */
export const easemobUpload = (token, file) => {
  const url = 'https://a1.easemob.com/investarget001/investarget/chatfiles'
  const headers = {
    'Authorization': token,
    'restrict-access': true,
  }
  const body = new FormData()
  body.append('file', file)
  const options = { headers, method: 'POST', body }
  return request(url, options)
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
export const getUserFriend = () => r('/user/friend/')
export const editUserFriend = (id, isaccept) => r(`/user/friend/${id}/`, 'PUT', { isaccept })
export const addUserFriend = friend => r('/user/friend/', 'POST', { friend })

// user remark

export function getUserRemark(param) {
  return r('/user/remark/?' + qs.stringify(param))
}

export function getUserRemarkDetail(id) {
  return r('/user/remark/' + id + '/')
}

export function addUserRemark(data) {
  return r('/user/remark/', 'POST', data)
}

export function editUserRemark(id, data) {
  return r('/user/remark/' + id + '/', 'PUT', data)
}

export function deleteUserRemark(id) {
  return r('/user/remark/' + id + '/', 'DELETE')
}

/**
 * DataRoom
 */

export const queryDataRoom = (param) => {
  return r('/dataroom/?' + qs.stringify(param))
}
export const addDataRoom = (param) => {
  return r('/dataroom/', 'POST', param)
}

export const editDataRoom = (id, data) => {
  return r('/dataroom/' + id + '/', 'PUT', data)
}
export const deleteDataRoom = (id) => {
  return r('/dataroom/' + id + '/', 'DELETE')
}

export const queryUserDataRoom = (param) => {
  return r('/dataroom/user/?' + qs.stringify(param))
}
export const addUserDataRoom = (param) => {
  return r('/dataroom/user/', 'POST', param)
}
export const deleteUserDataRoom = (id) => {
  return r('/dataroom/user/' + id + '/', 'DELETE')
}

export const queryDataRoomFile = (param) => {
  return r('/dataroom/file/?' + qs.stringify(param))
}
export const addDataRoomFile = (param) => {
  return r('/dataroom/file/', 'POST', param)
}
export const editDataRoomFile = (param) => {
  return r('/dataroom/file/', 'PUT', param)
}
export const deleteDataRoomFile = (param) => {
  return r('/dataroom/file/', 'DELETE', param)
}

export const queryUserDataRoomFile = (id) => {
  return r('/dataroom/user/' + id + '/')
}
export const editUserDataRoomFile = (id, param) => {
  return r('/dataroom/user/' + id + '/', 'PUT', param)
}

export const queryDataRoomDir = (id) => {
  return r('/dataroom/' + id + '/')
}

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
export const editUserRelation = body => r('/user/relationship/', 'PUT', body)

/**
 * msg
 */
export const getMsg = param => r('/msg/?' + qs.stringify(param))
export const readMsg = id => r('/msg/' + id + '/', 'POST')

/**
 * remark
 */

export function getRemark(type, param) {
  return r(`/${type}/remark/?` + qs.stringify(param))
}

export function getRemarkDetail(type, id) {
  return r(`/${type}/remark/${id}/`)
}

export function addRemark(type, data) {
  return r(`/${type}/remark/`, 'POST', data)
}

export function editRemark(type, id, data) {
  return r(`/${type}/remark/${id}/`, 'PUT', data)
}

export function deleteRemark(type, id) {
  return r(`/${type}/remark/${id}/`, 'DELETE')
}

/**
 * log
 */
export function getLogOfUserUpdate(param) {
    return r('/log/userupdate?' + qs.stringify(param))
}

/**
 * mongolog
 */
export const getChatMsg = param => r('/mongolog/chatmsg?' + qs.stringify(param))

export const getLibIndustry = () => r('/mongolog/cat')
export const getLibEvent = (param) => {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/mongolog/event?' + qs.stringify(param))
}
export const getLibProj = (param) => {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/mongolog/proj?' + qs.stringify(param))
}

// com_id, com_name
export const getLibProjRemark = (param) => {
  return r('/mongolog/projremark?' + qs.stringify(param))
}

// { com_id, com_name, remark }
export const addLibProjRemark = (data) => {
  return r('/mongolog/projremark', 'POST', data)
}

// { remark }
export const editLibProjRemark = (id, data) => {
  return r('/mongolog/projremark?id=' + id, 'PUT', data)
}

export const deleteLibProjRemark = (id) => {
  return r('/mongolog/projremark?id=' + id, 'DELETE')
}

export const getLibProjNews = (param) => {
  return r('/mongolog/projnews?' + qs.stringify(param))
}

export const getProjBDList = (param) => {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/bd/projbd/?' + qs.stringify(param))
}

export const getProjBD = (id) => {
  return r('/bd/projbd/' + id + '/')
}

// {  }
export const addProjBD = (data) => {
  return r('/bd/projbd/', 'POST', data)
}

export const editProjBD = (id, data) => {
  return r('/bd/projbd/' + id + '/', 'PUT', data)
}

export const deleteProjBD = (id) => {
  return r('/bd/projbd/' + id + '/', 'DELETE')
}

export const addProjBDCom = (data) => {
  return r('/bd/projbd/comment/', 'POST', data)
}

export const deleteProjBDCom = (id) => {
  return r('/bd/projbd/comment/' + id + '/', 'DELETE')
}

/**
 * News
 */
export const getWxMsg = (param) => {
  return r('/mongolog/wxmsg?' + qs.stringify(param))
}

export const editWxMsg = (id) => {
  return r('/mongolog/wxmsg?id=' + id, 'PUT')
}

/**
 * Schedule
 */
export const getSchedule = (param) => {
  return r('/msg/schedule/?' + qs.stringify(param))
}
export const addSchedule = (param) => {
  return r('/msg/schedule/', 'POST', param)
}
export const editSchedule = (id, param) => {
  return r('/msg/schedule/' + id + '/', 'PUT', param)
}
export const deleteSchedule = (id) => {
  return r('/msg/schedule/' + id + '/', 'DELETE')
}
export const getScheduleDetail = (id) => {
  return r('/msg/schedule/' + id + '/')
}

/**
 * password
 */
export const resetPassword = (param) => {
  return r('/user/password/', 'POST', param)
}

export const getStatisticalData = type => r('/mongolog/count?type=' + type);
export const getInvestorStatistic = () => r('/user/count');

export const getMobileUploadKey = () => r('/service/recordUpload');
export const getQRCodeStatus = key => r('/service/selectUpload?record=' + key);
export const cancelMobileUpload = record => r('/service/cancelUpload', 'POST', { record });

export const getOrgBdList = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r('/bd/orgbd/?' + qs.stringify(params))
};
export const getOrgBdDetail = id => r(`/bd/orgbd/${id}/`);
export const addOrgBD = body => r('/bd/orgbd/', 'POST', body);