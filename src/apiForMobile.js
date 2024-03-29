import request from './utils/request'
import qs from 'qs'
import { PAGE_SIZE } from './constants'
import { getUserInfo as getCurrentUserInfo, uploadFileByChunks } from './utils/util'
import _ from 'lodash'
import { 
  ApiError, 
  baseUrl 
} from './utils/request';

export const SOURCE = 1

function r(url, method, body) {

  const source = parseInt(localStorage.getItem('source'), 10)

  if (!source) {
    throw new ApiError(1299, 'data source missing');
  }

  const options = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "clienttype": "4",
      "source": source
    },
    credentials: 'include'
  }

  const user = getCurrentUserInfo()
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
      "clienttype": "4",
      "source": source
    }
  }


  const user = getCurrentUserInfo()

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
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/org/remark/?' + qs.stringify(param))
}

export const getOrgAttachment = params => r('/org/atta/?' + qs.stringify(params));
export const deleteOrgAttachment = id => r('/org/atta/' + id + '/', 'DELETE');
export const addOrgAttachment = body => r('/org/atta/', 'POST', body);

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

export function getProjDidi(params) {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r(`/proj/didi/?${qs.stringify(params)}`);
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

export const getProjAttachment = param => {
  return r('/proj/attachment/?' + qs.stringify(param))
};

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
  return uploadFileByChunks(file, {
    data: { bucket },
  });
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

export const getTimelineBasic = param => r('/timeline/basic/?' + qs.stringify(param));

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

export function addUser(param, registersource = 3) {
  return r('/user/', 'POST', { ...param, registersource });
}

export function editUser(idArr, param) {
  const data = {
    'userlist': idArr,
    'userdata': param,
  }
  return r('/user/', 'PUT', data)
}

export const getUserInfo = (id, isShowAllLangInfo) => isShowAllLangInfo ? r2(`/user/${id}/`) : r(`/user/${id}/`);

export function login(values) {
  const param = {
    account: values.username,
    password: values.password,
    // datasource: 1
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
export const getUserFriend = params => r('/user/friend/?' + qs.stringify(params));
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

export const getUserAttachment = params => r('/user/atta/?' + qs.stringify(params));
export const editUserAttachment = (id, body) => r(`/user/atta/${id}/`, 'PUT', body);
export const deleteUserAttachment = id => r('/user/atta/' + id + '/', 'DELETE');
export const addUserAttachment = body => r('/user/atta/', 'POST', body);

export const getUserInvestEvent = params => r('/user/event/?' + qs.stringify(params));
export const editUserInvestEvent = (id, body) => r(`/user/event/${id}/`, 'PUT', body);
export const addUserInvestEvent = body => r('/user/event/', 'POST', body);
export const deleteUserInvestEvent = id => r('/user/event/' + id + '/', 'DELETE');

/**
 * DataRoom
 */
// export const getCompanyDataRoom = params => r('/dataroom/com/?' + qs.stringify(params));

export const queryDataRoom = (param) => {
  return r('/dataroom/?' + qs.stringify(param))
}
export const createDataRoom = (param) => {
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
export const editUserDataRoom = (id, body) => r(`/dataroom/user/${id}/`, 'PUT', body);
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
 * 查询DataRoom打包状态
 * @param {Number} dataroomID - dataroom 的 id 
 * @param {Number} investorID - 投资人的 id
 */
export const checkDataRoomStatus = (dataroomID, investorID, water) => r(`/dataroom/checkzip/${dataroomID}/?user=${investorID}&water=${water}`);

export const createAndCheckDataroomZip = (dataroomId, params) => r(`/dataroom/checkzip/${dataroomId}/?${qs.stringify(params)}`);

/**
 * 返回 DataRoom 打包下载的链接地址
 * @param {Number} dataroomID - dataroom 的 id
 * @param {Number} investorID - 投资人的 id
 */
export const downloadDataRoom = (dataroomID, investorID, part = 0, nowater = 0) => {
  const user = getCurrentUserInfo()
  let url = `/dataroom/downzip/${dataroomID}/?user=${investorID}&token=${user.token}&part=${part}&nowater=${nowater}`;
  return baseUrl + url;
};

/**
 * 生成 Dataroom 压缩包
 * @param {Number} dataroomID - dataroom 的 id
 * @param {Object} params
 * @param {Number} params.user - 投资人的 id
 * @param {String} params.water - 水印的内容 
 */
export const makeDataRoomZip = (dataroomID, params) => r(`/dataroom/makezip/${dataroomID}/?${qs.stringify(params)}`);

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

// 同样是获取项目全库，不同的是使用这个接口如果搜索结果为空的话服务端不会储存搜索内容
export const getLibProjSimple = (param) => {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/mongolog/proj/simple?' + qs.stringify(param))
}

export const getLibProjInfo = (param) => {
  return r('/mongolog/projinfo?' + qs.stringify(param))
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

export const getProjLibraryForExport = body => r('/mongolog/projexc', 'POST', body);

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
export const editProjBDCom = (id, body) => r('/bd/projbd/comment/' + id + '/', 'PUT', body);

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
export const getPhoneAddress = mobile => r(`/service/phoneAddress?mobile=${mobile}`);

export const getOrgBdBase = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r('/bd/orgbdbase/?' + qs.stringify(params))
};

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
export const deleteOrgBD = id => r(`/bd/orgbd/${id}/`, 'DELETE');
export const modifyOrgBD = (id, body) => r(`/bd/orgbd/${id}/`, 'PUT', body);

export const addOrgBDComment = body => r('/bd/orgbd/comment/', 'POST', body);
export const deleteOrgBDComment = id => r(`/bd/orgbd/comment/${id}/`, 'DELETE');
export const editOrgBDComment = (id, body) => r(`/bd/orgbd/comment/${id}/`, 'PUT', body);
export const getOrgBDProj = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r('/bd/orgbd/proj/?' + qs.stringify(params))
};
export const readOrgBD = body => r('/bd/orgbd/read/', 'POST', body);

export const getOrgBDBlacklist = params => r(`/bd/orgbd/black/?${qs.stringify(params)}`);
export const addOrgBDBlacklist = body => r('/bd/orgbd/black/', 'POST', body);
export const deleteOrgBDBlacklist = id => r(`/bd/orgbd/black/${id}/`, 'DELETE');

/**
meeting
**/
export const getMeetingBdList = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r('/bd/meetbd/?' + qs.stringify(params))
};
export const addMeetingBD = body => r('/bd/meetbd/', 'POST', body);
export const deleteMeetingBD = id => r(`/bd/meetbd/${id}/`, 'DELETE');
export const deleteMeetingBDFile = id => r(`/bd/meetbd/delatt/${id}/`, 'POST');
export const modifyMeetingBD = (id, body) => r(`/bd/meetbd/${id}/`, 'PUT', body);
export const shareMeetingBD = body => r('/bd/meetbd/share/', 'POST', body);

/**
 * 机构详情
 */
export const getOrgBuyout       = param => r('/org/buyout/?' + qs.stringify(param));       // 退出分析
export const getOrgContact      = param => r('/org/contact/?' + qs.stringify(param));      // 联系方式
export const getOrgCooperation  = param => r('/org/cooprelation/?' + qs.stringify(param)); // 合作关系
export const getOrgInvestEvent  = param => r('/org/investevent/?' + qs.stringify(param));  // 投资事件
export const getOrgManageFund   = param => r('/org/managefund/?' + qs.stringify(param));   // 管理基金

export const getOrgBDCount =  param => r('/bd/orgbd/count/?' + qs.stringify(param));
export const getOrgBDCountNew = param => {
  _.forIn(param, function(value, key) {
    if (Array.isArray(value)) {
      param[key] = value.join(',')
    }
  })
  return r('/bd/orgbd/response/?' + qs.stringify(param));
}

export const getProjBDCount = param => r('/bd/projbd/count/?' + qs.stringify(param));

export const addOrgContact = body => r('/org/contact/', 'POST', body);
export const addOrgManageFund = body => r('/org/managefund/', 'POST', body);
export const addOrgInvestEvent = body => r('/org/investevent/', 'POST', body);
export const addOrgCooperation = body => r('/org/cooprelation/', 'POST', body);
export const addOrgBuyout = body => r('/org/buyout/', 'POST', body);

export const deleteOrgContact = id => r(`/org/contact/${id}/`, 'DELETE');
export const deleteOrgManageFund = id => r(`/org/managefund/${id}/`, 'DELETE');
export const deleteOrgInvestEvent = id => r(`/org/investevent/${id}/`, 'DELETE');
export const deleteOrgCooperation = id => r(`/org/cooprelation/${id}/`, 'DELETE');
export const deleteOrgBuyout = id => r(`/org/buyout/${id}/`, 'DELETE');

export const sendProjPdfToWechatGroup = id => r(`/proj/sendpdf/${id}/`, 'POST');

export const addOrgExport = body => r(`/org/excel/`, 'POST', body);
export const getOrgExportList = param => r(`/org/excel/?${qs.stringify(param)}`);
export const getOrgExportDownloadUrl = id => `${baseUrl}/org/excel/${id}/?token=${getCurrentUserInfo().token}`;
export const sendEmailToDataroomUser = id => r(`/dataroom/user/${id}/`, 'POST');

export const getRandomPhoneNumber = () => r('/user/mobile');

export const getUserSession = () => r('/user/session/');

export const getWebexMeeting = param => r(`/msg/webex/meeting/?${qs.stringify(param)}`);
export const addWebexMeeting = body => r('/msg/webex/meeting/', 'POST', body);
export const deleteWebexMeeting = id => r(`/msg/webex/meeting/${id}/`, 'DELETE');
export const editWebexMeeting = (id, body) => r(`/msg/webex/meeting/${id}/`, 'PUT', body);
export const addWebexUser = body => r('/msg/webex/user/', 'POST', body);
export const getWebexUser = param => r('/msg/webex/user/?' + qs.stringify(param));

export const addDataroomTemp = body => r('/dataroom/temp/', 'POST', body);
export const getDataroomTemp = param => r(`/dataroom/temp/?${qs.stringify(param)}`);
export const editDataroomTemp = (id, body) => r(`/dataroom/temp/${id}/`, 'PUT', body);
export const applyDataroomTemp = (id, body) => r(`/dataroom/temp/${id}/`, 'POST', body);
export const deleteDataroomTemp = id => r(`/dataroom/temp/${id}/`, 'DELETE');

export const sendScheduleReminderEmail = body => r('/msg/icsmail', 'POST', body);

export const searchDataroom = (dataroomId, searchContent) => r(`/dataroom/filepath/?dataroom=${dataroomId}&search=${searchContent}`);
export const getNewDataroomFile = (dataroomId, userId) => r(`/dataroom/userfile/update/?dataroom=${dataroomId}&user=${userId}`);
export const sendNewFileEmail = dataroomUserId => r(`/dataroom/userfile/update/${dataroomUserId}/`, 'POST');
export const getUserDataroomFile = (dataroomId, userId) => r(`/dataroom/userfile/?dataroom=${dataroomId}&user=${userId}`);
export const addUserDataroomFile = body => r('/dataroom/userfile/', 'POST', body);
export const deleteUserDataroomFile = id => r(`/dataroom/userfile/${id}/`, 'DELETE');

export const deleteProjectBdRelatedManager = id => r(`/bd/projbd/relatemanager/${id}`, 'DELETE');
export const addProjectBdRelatedManager = body => r('/bd/projbd/relatemanager/', 'POST', body);

export const getWorkReport = params => r(`/bd/workreport/?${qs.stringify(params)}`);
export const addWorkReport = body => r('/bd/workreport/', 'POST', body);
export const editWorkReport = (id, body) => r(`/bd/workreport/${id}/`, 'PUT', body);
export const getWorkReportDetail = id => r(`/bd/workreport/${id}/`);
export const deleteWorkReport = id => r(`/bd/workreport/${id}/`, 'DELETE');
export const addWorkReportProjInfo = body => r('/bd/workreport/proj/', 'POST', body);
export const editWorkReportProjInfo = (id, body) => r(`/bd/workreport/proj/${id}/`, 'PUT', body);
export const getWorkReportProjInfo = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r(`/bd/workreport/proj/?${qs.stringify(params)}`);
}
export const deleteWorkReportProjInfo = id => r(`/bd/workreport/proj/${id}/`, 'DELETE');
export const addWorkReportMarketMsg = body => r('/bd/workreport/market/', 'POST', body);
export const editWorkReportMarketMsg = (id, body) => r(`/bd/workreport/market/${id}/`, 'PUT', body);
export const getWorkReportMarketMsg = params => r(`/bd/workreport/market/?${qs.stringify(params)}`);
export const deleteWorkReportMarketMsg = id => r(`/bd/workreport/market/${id}/`, 'DELETE');

export const getProjectTraders = params => r(`/proj/traders?${qs.stringify(params)}`);
export const editProjectTrader = (id, body) => r(`/proj/traders/${id}/`, 'PUT', body);

export const getOKRList = params => r(`/bd/okr/?${qs.stringify(params)}`);
export const getOKRDetail = id => r(`/bd/okr/${id}/`);
export const addOKR = body => r('/bd/okr/', 'POST', body);
export const editOKR = (id, body) => r(`/bd/okr/${id}/`, 'PUT', body);
export const deleteOKR = id => r(`/bd/okr/${id}/`, 'DELETE');
export const addOKRResult = body => r(`/bd/okr/krs/`, 'POST', body);
export const getOKRResult = params => r(`/bd/okr/krs/?${qs.stringify(params)}`);
export const editOKRResult = (id, body) => r(`/bd/okr/krs/${id}/`, 'PUT', body);
export const deleteOKRResult = id => r(`/bd/okr/krs/${id}/`, 'DELETE');

export const searchOrg = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r(`/org/search/?${qs.stringify(params)}`)
};
export const getOnlineTest = () => r('/msg/internTest/');
export const startOnlineTest = body => r('/msg/internTest/', 'POST', body);
export const endOnlineTest = (id, body) => r(`/msg/internTest/${id}/`, 'PUT', body);

export const getZoomMeetingList = () => r('/service/zoom/meetings/?type=upcoming');

export const getWebexMeetingList = body => r('/msg/webexAPI/meeting/', 'POST', body);

export const batchGetUserSimpleInfo = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r(`/user/simple?${qs.stringify(params)}`)
};

export const getAnnotations = params => {
  _.forIn(params, function(value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r(`/dataroom/discuss/?${qs.stringify(params)}`);
};

export const getInvestors = params => {
  _.forIn(params, function (value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r(`/user/investor?${qs.stringify(params)}`)
};

export const getDataroomFileReadRecord = params => {
  _.forIn(params, function (value, key) {
    if (Array.isArray(value)) {
      params[key] = value.join(',')
    }
  })
  return r(`/dataroom/userRecord/?${qs.stringify(params)}`);
}

export const getCustomizedUrl = url => r(url);

export const addPromotionHistory = body => r('/user/workingposition/', 'POST', body);
export const getPromotionHistory = params => r(`/user/workingposition/?${qs.stringify(params)}`);
export const editPromotionHistory = (id, body) => r(`/user/workingposition/${id}/`, 'PUT', body);
export const deletePromotionHistory = id => r(`/user/workingposition/${id}/`, 'DELETE');

export const checkToken = () => r('/user/checkToken/');

export const addKPIRecord = body => r('/user/performanceappraisal/', 'POST', body);
export const getKPIRecord = params => r(`/user/performanceappraisal/?${qs.stringify(params)}`);
export const editKPIRecord = (id, body) => r(`/user/performanceappraisal/${id}/`, 'PUT', body);
export const deleteKPIRecord = id => r(`/user/performanceappraisal/${id}/`, 'DELETE');

export const addMentorTrack = body => r('/user/mentortracking/', 'POST', body);
export const getMentorTrack = params => r(`/user/mentortracking/?${qs.stringify(params)}`);
export const editMentorTrack = (id, body) => r(`/user/mentortracking/${id}/`, 'PUT', body);
export const deleteMentorTrack = id => r(`/user/mentortracking/${id}/`, 'DELETE');

export const addTrainingRecord = body => r('/user/trainingrecords/', 'POST', body);
export const getTrainingRecord = params => r(`/user/trainingrecords/?${qs.stringify(params)}`);
export const editTrainingRecord = (id, body) => r(`/user/trainingrecords/${id}/`, 'PUT', body);
export const deleteTrainingRecord = id => r(`/user/trainingrecords/${id}/`, 'DELETE');

export const addEmployeeRelation = body => r('/user/personnelrelations/', 'POST', body);
export const getEmployeeRelation = params => r(`/user/personnelrelations/?${qs.stringify(params)}`);
export const deleteEmployeeRelation = id => r(`/user/personnelrelations/${id}/`, 'DELETE');

export const getInvestorWithResignedTrader = params => r(`/user/indgroup/investor?${qs.stringify(params)}`);

// 项目数量统计
export const getProjCount = params => r(`/proj/count?${qs.stringify(params)}`);
