import request from './utils/request'
import qs from 'qs'


/**
 * dataroom
 */


/**
 * org
 */


/**
 * proj
 */


/**
 * service
 */


/**
 * source
 */


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
