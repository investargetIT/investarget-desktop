import React from 'react'
import { Button, Popconfirm } from 'antd'
import { SelectExistUser } from '../components/ExtraInput'
import { i18n } from '../utils/util'

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
  paddingBottom: 4,
  borderBottom: '1px dashed #f2f2f2',
}

function DataRoomUser(props) {
    const { list, newUser, onSelectUser, onAddUser, onDeleteUser } = props
    return (
      <div style={{minHeight: 250}}>
        {list.length > 0 ? (
          <div>
            <div style={{marginBottom:16}}>
            {list.map(item => (
              <div key={item.id} style={rowStyle}>
                <span>{item.user.username}</span>
                <Popconfirm title={i18n('delete_confirm')} onConfirm={onDeleteUser.bind(this, item.id)}>
                  <Button size="small" type="danger">{i18n('common.delete')}</Button>
                </Popconfirm>
              </div>
            ))}
            </div>
            <div style={{display:'flex',flexWrap:'nowrap'}}>
              <div style={{flexGrow: 1,marginRight: 8}}>
                <SelectExistUser value={newUser} onChange={onSelectUser} />
              </div>
              <Button size="large" onClick={onAddUser} disabled={!newUser}>{i18n('dataroom.add_user')}</Button>
            </div>
          </div>
        ) : <div>{i18n('dataroom.no_user')}</div>}
      </div>
    )
}

export default DataRoomUser
