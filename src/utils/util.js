import zhMessages from '../../locales/zh_flat.js'
import enMessages from '../../locales/en_flat.js'
import { Popconfirm, Button } from 'antd'

function t(obj, id) {
  const props = obj.props || obj
  return props.intl.formatMessage({ id: id })
}

function i18n(key) {
  var lang = window.LANG
  var messages = (lang == 'en') ? enMessages : zhMessages
  return messages[key]
}

function dataToColumn(data, getHandler, editHandler, deleteHandler) {
  if (data.length === 0) return null

  const allColumns = [
    {
      title: i18n("username"),
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: i18n("org"),
      dataIndex: 'org.name',
      key: 'org'
    },
    {
      title: i18n("position"),
      dataIndex: 'title.name',
      key: 'title'
    },
    {
      title: i18n("tag"),
      dataIndex: 'tags',
      key: 'tags',
      render: tags => tags.map(t => t.name).join(' ')
    },
    {
      title: i18n("trader_relation"),
      dataIndex: 'trader_relation.traderuser.name',
      key: 'trader_relation',
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
          <Button disabled={!record.action.get} size="small" onClick={getHandler.bind(null, record.id)}>{i18n("view")}</Button>&nbsp;
          <Button disabled={!record.action.change} size="small" onClick={editHandler.bind(null, record.id)}>{i18n("edit")}</Button>&nbsp;
          <Popconfirm title="Confirm to delete?" onConfirm={deleteHandler.bind(null, record.id)}>
            <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return allColumns.filter(f => Object.keys(data[0]).includes(f.key))
}

export { t, i18n, dataToColumn }
