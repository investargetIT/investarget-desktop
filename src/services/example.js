import request from '../utils/request';

export function getTags() {
  return request('/source/tags', {
    headers: {
      "Accept": "application/json"
    }
  })
}
