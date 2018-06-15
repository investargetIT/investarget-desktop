import React from 'react'
import { 
  Button, 
  Popconfirm, 
  Row, 
  Col, 
  Icon, 
} from 'antd';
import { SelectExistUser } from '../components/ExtraInput'
import { 
  i18n,
  hasPerm,
} from '../utils/util';

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
    const isAbleToAddUser = hasPerm('usersys.as_trader');

  return <Row>

    {isAbleToAddUser ?
      <Col span={8}>
        <Row>
          <Col span={16}><SelectExistUser value={newUser} onChange={onSelectUser} /></Col>
          <Col span={1} />
          <Col span={7}><Button type="primary" size="large" onClick={onAddUser} disabled={!newUser}><Icon type="plus" />{i18n('dataroom.add_user')}</Button></Col>
        </Row>
      </Col>
      : null}

    { isAbleToAddUser ? <Col span={1} /> : null }

    <Col span={ isAbleToAddUser ? 15 : 24 }>
      {list.map(item => (
        <div key={item.id} onClick={props.onChange.bind(this, item.user.id)} style={{ position: 'relative', display: 'inline-block', marginRight: 15, marginBottom: 10, cursor: 'pointer' }}>
          <img style={{ width: 40, height: 40 }} src={item.user.photourl} />
          {props.selectedUser === item.user.id ?
            <div>
              <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, color: 'white', backgroundColor: 'rgba(0, 0, 0, .3)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{item.user.username}</div>
              <Popconfirm key={item.id} title={i18n('delete_confirm')} onConfirm={onDeleteUser.bind(this, item.id)}>
                <div style={{ position: 'absolute', top: -12, right: -8, cursor: 'pointer' }}>x</div>
              </Popconfirm>
            </div>
            : null}
        </div>
      ))}
    </Col>

  </Row>;
}

function DataRoomUserList(props) {
  const { list } = props;
  return (
    <div>

      {list.length > 0 ?
        <Row style={{ textAlign: 'center' }}>
          {list.map(item => (
            <div key={item.id} onClick={props.onChange.bind(this, item.user)} style={{ width: 50, overflow: 'hidden', position: 'relative', display: 'inline-block', marginRight: 15, marginBottom: 10, cursor: 'pointer', border: '1px solid rgb(234, 238, 238)' }}>
              <div><img style={{ width: 50, height: 50 }} src={item.user.photourl} /></div>
              <div style={{ fontSize: 12 }}>{item.user.username}</div>
              {props.selectedUser && props.selectedUser.id === item.user.id ?
                <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, color: 'white', backgroundColor: 'rgba(0, 0, 0, .3)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <img style={{ width: 30 }} src="/images/check.png" />
                </div>
                : null}
            </div>
          ))}
        </Row>
        : null}

      <Row style={{ marginTop: 30, marginBottom: 10, textAlign: 'center' }}>
        <Button disabled={!props.selectedUser} onClick={props.onConfirm} type="primary">{i18n('common.confirm')}</Button>
      </Row>

    </div>
  );
}

export {DataRoomUserList, DataRoomUser}

