import React from 'react'
import { 
  Button, 
  Popconfirm, 
  Row, 
  Col 
} from 'antd';
import { SelectExistUser } from '../components/ExtraInput'
import { i18n } from '../utils/util'
// import { Col } from 'antd/lib/grid';

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
    return list.length > 0 ? 
          <Row>
            <Col span={8}>
              <Row>
              <Col span={16}><SelectExistUser value={newUser} onChange={onSelectUser} /></Col>
              <Col span={1} />
              <Col span={7}><Button size="large" onClick={onAddUser} disabled={!newUser}>{i18n('dataroom.add_user')}</Button></Col>
              </Row>
            </Col>
            <Col span={1} />
            <Col span={15}>
            {list.map(item => (
              // <div key={item.id} style={rowStyle}>
                /* <span>{item.user.username}</span> */
                
                <Popconfirm key={item.id} title={i18n('delete_confirm')} onConfirm={onDeleteUser.bind(this, item.id)}>
                <img style={{ marginRight: 15, marginBottom: 10, width: 40, height: 40 }}src={item.user.photourl} />
                  {/* <Button size="small" type="danger">{i18n('common.delete')}</Button> */}
                </Popconfirm>
              // </div>
            ))}
            </Col>
          </Row>
        : <div>{i18n('dataroom.no_user')}</div>
    
}

export default DataRoomUser
