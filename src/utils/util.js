import zhMessages from '../../locales/zh_flat.js'
import enMessages from '../../locales/en_flat.js'
import { Popconfirm, Button } from 'antd'
import * as api from '../api'

function t(obj, id) {
  const props = obj.props || obj
  return props.intl.formatMessage({ id: id })
}

function i18n(key) {
  var lang = window.LANG
  var messages = (lang == 'en') ? enMessages : zhMessages
  return messages[key]
}

function dataToColumn(data, operationHandler) {
  if (data.length === 0) return null

  const allColumns = [
    {
      title: i18n("username"),
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: "操作者",
      dataIndex: 'requestuser_name',
      key: 'requestuser_name'
    },
    {
      title: i18n('organization.name'),
      dataIndex: 'orgname',
      key: 'orgname',
    },
    {
      title: "时间",
      dataIndex: 'actiontime',
      key: 'actiontime'
    },
    {
      title: i18n("org"),
      dataIndex: 'org.name',
      key: 'org'
    },
    {
      title: "操作对象",
      dataIndex: 'model_name',
      key: 'model_name'
    },
    {
      title: i18n('organization.industry'),
      dataIndex: 'industry.industry',
      key: 'industry',
    },
    {
      title: "操作",
      dataIndex: 'method',
      key: 'method'
    },
    {
      title: i18n("position"),
      dataIndex: 'title.name',
      key: 'title'
    },
    {
      title: '操作前',
      dataIndex: 'request_before',
      key: 'request_before'
    },
    {
      title: i18n('organization.currency'),
      dataIndex: 'currency.currency',
      key: 'currency',
    },
    {
      title: "操作后",
      dataIndex: 'request_after',
      key: 'request_after'
    },
    {
      title: i18n("tag"),
      dataIndex: 'tags',
      key: 'tags',
      render: tags => tags.map(t => t.name).join(' ')
    },
    {
      title: i18n('organization.decision_cycle'),
      dataIndex: 'decisionCycle',
      key: 'decisionCycle',
    },
    {
      title: i18n("trader_relation"),
      dataIndex: 'trader_relation.traderuser.name',
      key: 'trader_relation',
    },
    {
      title: i18n('organization.transaction_phase'),
      dataIndex: 'orgtransactionphase',
      key: 'orgtransactionphase',
      render: phases => phases.map(p => p.name).join(' ')
    },
    {
      title: i18n('organization.stock_code'),
      dataIndex: 'orgcode',
      key: 'orgcode',
    },
    {
      title: i18n("userstatus"),
      dataIndex: 'userstatus.name',
      key: 'userstatus',
    },
    {
      title: i18n("action"),
      key: 'action',
      render: (text, record) => (
            <span>
              <Button disabled={!record.action.get} size="small" onClick={operationHandler.bind(null, 'get', record.id)}>{i18n("view")}</Button>&nbsp;
              <Button disabled={!record.action.change} size="small" onClick={operationHandler.bind(null, 'edit', record.id)}>{i18n("edit")}</Button>&nbsp;
              <Popconfirm title="Confirm to delete?" onConfirm={operationHandler.bind(null, 'delete', record.id)}>
                <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
              </Popconfirm>
            </span>
      )
    },
  ]

  return allColumns.filter(f => Object.keys(data[0]).includes(f.key))
}


var exchangeCache = {}
var offlineRate = {
  'USD': 1,
  'CNY': 0.147,
}
function exchange(source) {
  console.log(source)
  if (exchangeCache[source] != null) {
    let rate = exchangeCache[source]
    return new Promise(function(resolve, reject) {
      resolve(rate)
    })
  } else {
    let param = {
      'tcur': 'USD',
      'scur': source,
    }
    return api.getExchangeRate(param).then((result) => {
      var rate = result.data.rate
      exchangeCache[source] = rate
      return rate
    }, (error) => {
      return offlineRate[source]
    })
  }

}

function checkPerm(perm) {
  const userInfoStr = localStorage.getItem('user_info')
  if (!userInfoStr) {
    return false
  }
  const permissions = JSON.parse(userInfoStr).permissions
  if (permissions.includes(perm)) {
    return true
  } else {
    return false
  }
}

function isLogin() {
  const userInfoStr = localStorage.getItem('user_info')
  if (!userInfoStr) {
    return false
  } else {
    return JSON.parse(userInfoStr)
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export { t, i18n, dataToColumn, exchange, checkPerm, isLogin, getRandomInt }
