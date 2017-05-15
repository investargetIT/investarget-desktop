import request from './utils/request'
import qs from 'qs'
import { PAGE_SIZE } from './constants'

function r(url, method, body) {

  const options = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "clienttype": "3"
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


/**
 * org
 */

export function getOrg(keywords) {
  return r('/org/?search=' + keywords)
}

/**
 * proj
 */

export function getProj(token, param) {
  return r('/proj/?' + qs.stringify(param))
}

export function favoriteProj(token, param) {
  console.log('POST /proj/favorite')
  return r('/proj/favorite/', 'POST', param)
}

/**
 * service
 */


/**
 * source
 */

export function getTags() {
  return r('/source/tag')
}

export function getCountries() {
  return r('/source/country')
}

export function getTitles() {
  return r('/source/title')
}

export function getIndustries() {
  return r('/source/industry')
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
  const param = {...user, datasource, mobilecode, mobile, mobilecodetoken, groups, nameC}
  return r('/user/register/', 'POST', param)
}
