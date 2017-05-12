import request from './utils/request'
import qs from 'qs'
import { PAGE_SIZE } from './constants'

/**
 * dataroom
 */


/**
 * org
 */

export function getOrg(keywords) {
  return request('/org/?search=' + keywords, {
    headers: {
      "Accept": "application/json"
    }
  })
}

/**
 * proj
 */

export function getProj(token, param) {
  return request('/proj/?' + qs.stringify(param), {
    headers: {
      'token': token,
      'Accept': 'application/json'
    }
  })
}

export function favoriteProj(token, param) {
  console.log('POST /proj/favorite')
  return request('/proj/favorite/', {
    method: 'POST',
    body: JSON.stringify(param),
    headers: {
      'token': token,
      'Content-Type': 'application/json',
    }
  })
}

/**
 * service
 */


/**
 * source
 */

export function getTags() {
  return request('/source/tag', {
    headers: {
      "Accept": "application/json"
    }
  })
}

export function getCountries() {
  return request('/source/country', {
    headers: {
      "Accept": "application/json"
    }
  })
}

export function getTitles() {
  return request('/source/title', {
    headers: {
      "Accept": "application/json"
    }
  })
}


/**
 * timeline
 */


/**
 * user
 */

export function getUser(token, param) {
  return request('/user/?' + qs.stringify(param), {
    headers: {
      'token': token,
      'Accept': 'application/json'
    }
  })
}

export function login(values) {
  const param = {
    account: values.username,
    password: values.password,
    datasource: 1
  }
  return request('/user/login/', {
    method: 'POST',
    body: JSON.stringify(param),
    headers: {
      "Content-Type": "application/json",
      "clienttype": "3"
    },
  })
}

export function get({ page }) {
  const userStr = localStorage.getItem('user_info')
  const user = userStr ? JSON.parse(userStr) : null

  return request(`/user/?page_index=${page}&page_size=${PAGE_SIZE}`, {
    headers: {
      "token": user.token,
      "Accept": 'application/json'
    }
  })
}

export function addFriend(token, param) {
  return request('/user/friend/', {
    method: 'POST',
    body: JSON.stringify(param),
    headers: {
      "token": token,
      "Content-Type": "application/json",
    }
  })
}

export function deleteUser(id) {
  const userStr = localStorage.getItem('user_info')
  const user = userStr ? JSON.parse(userStr) : null

  return request('/user/', {
    method: 'DELETE',
    body: JSON.stringify({ users: [id] }),
    headers: {
      "token": user.token,
      "Content-Type": "application/json",
    }
  })
}

export function register(user) {
  const datasource = 1
  const mobilecode = '375104'
  const mobilecodetoken = '4871ace7028c4dc76c260adff9386e4f'
  const mobile = '18004092637'
  const groups = '1'
  const nameC = user.name
  const param = {...user, datasource, mobilecode, mobile, mobilecodetoken, groups, nameC}
  return request('/user/register/', {
    method: 'POST',
    body: JSON.stringify(param),
    headers: {
      "Content-Type": "application/json",
      "clienttype": "3"
    },
  })
}
