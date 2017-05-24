import zhMessages from '../../locales/zh_flat.js'
import enMessages from '../../locales/en_flat.js'


function t(obj, id) {
  const props = obj.props || obj
  return props.intl.formatMessage({ id: id })
}

function i18n(key) {
  var lang = window.LANG
  var messages = (lang == 'en') ? enMessages : zhMessages
  return messages[key]
}

export { t, i18n }
