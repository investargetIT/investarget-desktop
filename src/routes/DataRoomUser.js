import React from 'react'
import { Button, Popconfirm } from 'antd'
import { SelectExistUser } from '../components/ExtraInput'


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
                <Popconfirm title="确定删除吗？" onConfirm={onDeleteUser.bind(this, item.id)}>
                  <Button size="small">删除</Button>
                </Popconfirm>
              </div>
            ))}
            </div>
            <div style={{display:'flex',flexWrap:'nowrap'}}>
              <div style={{flexGrow: 1,marginRight: 8}}>
                <SelectExistUser style={{height:28,lineHeight:'28px'}} value={newUser} onChange={onSelectUser} />
              </div>
              <Button onClick={onAddUser} disabled={!newUser}>添加用户</Button>
            </div>
          </div>
        ) : <div>暂无关联用户</div>}
      </div>
    )
}

export default DataRoomUser
