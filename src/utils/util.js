import zhMessages from '../../locales/zh_flat.js'
import { SOURCE } from '../constants'

function configMessages(keys) {
  var result = {}
  keys.forEach(key => {
    const shortKey = shorten(key)
    const value = {
        'id': key,
        'defaultMessage': zhMessages[key]
      }
    result[shortKey] = value
  })
  return result
}

function shorten(key) {
  const segs = key.split('.')
  return segs[segs.length - 1]
}

function t(obj, id) {
  const props = obj.props || obj
  return props.intl.formatMessage({ id: id })
}

function getConstant(key, lang) {
  var data = SOURCE[key]
  return data.map(item => {
    let id = item.id
    let name
    if (item.lang == 'en') {
      name = item.nameE
    } else {
      name = item.nameC
    }
    return { id, name }
  })
}


export { configMessages, t, getConstant }
