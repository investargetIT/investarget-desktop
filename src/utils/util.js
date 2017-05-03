import zhMessages from '../../locales/zh_flat.js'

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

export { configMessages }
