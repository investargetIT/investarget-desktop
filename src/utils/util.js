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
      title: '姓名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '所属机构',
      dataIndex: 'org.name',
      key: 'org'
    },
    {
      title: '职位',
      dataIndex: 'title.name',
      key: 'title'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: tags => tags.map(t => t.name).join(' ')
    },
    {
      title: '交易师',
      dataIndex: 'trader_relation.traderuser.name',
      key: 'trader_relation',
    },
    {
      title: '审核状态',
      dataIndex: 'userstatus.name',
      key: 'userstatus',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button disabled={!record.action.get} size="small" onClick={getHandler.bind(null, record.id)}>查看</Button>&nbsp;
          <Button disabled={!record.action.change} size="small" onClick={editHandler.bind(null, record.id)}>修改</Button>&nbsp;
          <Popconfirm title="Confirm to delete?" onConfirm={deleteHandler.bind(null, record.id)}>
            <Button type="danger" disabled={!record.action.delete} size="small">删除</Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return allColumns.filter(f => Object.keys(data[0]).includes(f.key))
}

export { t, i18n, dataToColumn }
