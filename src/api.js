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
  return request('/org/', {
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

  return request(`/user/?_page=${page}&_limit=${PAGE_SIZE}`, {
    headers: {
      "token": user.token,
      "Accept": 'application/json'
    }
  })
}
