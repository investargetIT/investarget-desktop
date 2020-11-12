import React from 'react'
import { 
  Button, 
  Popconfirm, 
  Row, 
  Col, 
  Icon,
  Popover,
  Input,
  Table,
} from 'antd';
import { SelectExistInvestor } from '../components/ExtraInput'
import { 
  i18n,
  hasPerm,
  isLogin,
} from '../utils/util';
import { Link } from 'dva/router';
import moment from 'moment';

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
  paddingBottom: 4,
  borderBottom: '1px dashed #f2f2f2',
}

function generatePopoverContent(item, onDeleteUser, onSendEmail, onSaveTemplate, onApplyTemplate, dataRoomTemp, onSendNewFileEmail, userWithNewDataroomFile, currentUserIsProjTrader) {
  const { user: { id: userId }} = item;
  const userIdsWithDataroomTemp = dataRoomTemp.map(m => m.user);
  return (
    <div>

      {hasPerm('usersys.as_trader') ?
        <div style={{ textAlign: 'center' }}>
          <Link to={`/app/user/${item.user.id}`} target="_blank">{item.user.username}</Link>&nbsp;
          {item.user.org ? <Link to={`/app/organization/${item.user.org.id}`} target="_blank">{item.user.org.orgname}</Link> : '暂无机构'}&nbsp;
        </div>
        :
        <div style={{ textAlign: 'center' }}>
          {item.user.username}&nbsp;
          {item.user.org ? item.user.org.orgname : '暂无机构'}&nbsp;
        </div>
      }

      <div style={{ textAlign: 'center' }}>最近登录：{item.lastgettime ? item.lastgettime.slice(0, 16).replace('T', ' ') : '暂无'}</div>

      {(hasPerm('dataroom.admin_adddataroom') || hasPerm('dataroom.admin_deletedataroom') || currentUserIsProjTrader) &&
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          {/* {onSaveTemplate && <Button disabled={userIdsWithDataroomTemp.includes(userId)} onClick={onSaveTemplate.bind(this, item)} style={{ marginRight: 10 }}>保存模版</Button>} */}
          {(hasPerm('dataroom.admin_adddataroom') || currentUserIsProjTrader) &&
            <Popconfirm title="确定发送邮件通知该用户？" onConfirm={onSendEmail.bind(this, item)}>
              <Button style={{ marginRight: 10 }}>{i18n('dataroom.send_email_notification')}</Button>
            </Popconfirm>
          }
          {(hasPerm('dataroom.admin_adddataroom') || currentUserIsProjTrader) &&
            <Popconfirm title="确定发送新增文件邮件给该用户吗？" onConfirm={onSendNewFileEmail.bind(this, item)}>
              <Button disabled={!userWithNewDataroomFile.includes(userId)} style={{ marginRight: 10 }}>{i18n('dataroom.send_new_file_notification')}</Button>
            </Popconfirm>
          }
          {(hasPerm('dataroom.admin_deletedataroom') || currentUserIsProjTrader) &&
            <Popconfirm title={i18n('delete_confirm')} onConfirm={onDeleteUser.bind(this, item)}>
              <Button type="danger">移除</Button>
            </Popconfirm>
          }
        </div>
      }

    </div>
  );
}

function DataRoomUser(props) {
    const { list, newUser, onSelectUser, onAddUser, onDeleteUser, onSendEmail, onSaveTemplate, onApplyTemplate, dataRoomTemp, onSendNewFileEmail, userWithNewDataroomFile, currentUserIsProjTrader, orgBDList } = props
    const isAbleToAddUser = hasPerm('usersys.as_trader');

  const columns = [
    {
      title: i18n('org_bd.contact'),
      width: '10%',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '职位',
      key: 'title',
      width: '7%',
      dataIndex: 'usertitle.name',
    },
    {
      title: i18n('org_bd.creator'),
      width: '7%',
      dataIndex: 'createuser.username',
      key: 'createuser',
    },
    {
      title: i18n('org_bd.manager'),
      width: '10%',
      dataIndex: 'manager.username',
      key: 'manager',
    },
    {
      title: '任务时间',
      width: '16%',
      render: (text, record) => {
        if (record.response !== null) {
          return '正常';
        }
        if (record.expirationtime === null) {
          return '无过期时间';
        }
        const ms = moment(record.expirationtime).diff(moment());
        const d = moment.duration(ms);
        const remainDays = Math.ceil(d.asDays());
        return remainDays >= 0 ? `剩余${remainDays}天` : <span style={{ color: 'red' }}>{`过期${Math.abs(remainDays)}天`}</span>;
      },
      key: 'createdtime',
    },
    // {
    //   title: i18n('org_bd.status'),
    //   width: '10%',
    //   render: (text, record) => {
    //     if (record.new) {
    //       return (
    //         <Checkbox
    //           checked={record.isimportant}
    //           onChange={v => { this.updateSelection(record, { isimportant: v.target.checked }) }}>
    //           重点BD
    //         </Checkbox>
    //       );
    //     } else {
    //       return text && this.props.orgbdres.filter(f => f.id === text)[0].name;
    //     }
    //   },
    //   dataIndex: 'response',
    //   key: 'response',
    //   sorter: false
    // },
    // {
    //   title: "最新备注", width: '20%', render: (text, record) => {
    //     let latestComment = record.BDComments && record.BDComments.length && record.BDComments[record.BDComments.length - 1].comments || null;

    //     return record.new ? "暂无" : (latestComment ? <Popover placement="leftTop" title="最新备注" content={<p style={{ maxWidth: 400 }}>{latestComment}</p>}><div style={{ color: "#428bca" }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div></Popover> : "暂无")
    //   }, key: 'bd_latest_info'
    // },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>

        {isAbleToAddUser ?
          <div style={{ marginRight: 10 }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 160, marginRight: 8 }}><SelectExistInvestor value={newUser} onChange={onSelectUser} /></div>
              <div><Button type="primary" size="large" onClick={onAddUser} disabled={!newUser || !onAddUser}><Icon type="plus" />{i18n('dataroom.add_user')}</Button></div>
            </div>
          </div>
          : null}

        {/* { isAbleToAddUser ? <Col span={1} /> : null } */}

        {onApplyTemplate && <div style={{ marginRight: 6 }}><Button style={{ width: 109, height: 32 }} onClick={onApplyTemplate}>应用模版</Button></div>}
        {/* {onApplyTemplate && <Col span={1} />} */}

        <div>
          {list.map(item => (
            <Popover key={item.id} placement="top" content={generatePopoverContent(item, onDeleteUser, onSendEmail, onSaveTemplate, onApplyTemplate, dataRoomTemp, onSendNewFileEmail, userWithNewDataroomFile, currentUserIsProjTrader)}>
              <div onClick={props.onChange.bind(this, item.user.id)} style={{ position: 'relative', display: 'inline-block', margin: 4, cursor: 'pointer' }}>
                <img style={{ width: 40, height: 40 }} src={item.user.photourl} />
                {props.selectedUser === item.user.id ?
                  <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, color: 'white', backgroundColor: 'rgba(0, 0, 0, .3)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {/* {item.user.username} */}
                    <img style={{ width: 20 }} src="/images/check.png" />
                  </div>
                  : null}
              </div>
            </Popover>
          ))}
        </div>

      </div>

      <Table
        showHeader={true}
        columns={columns}
        dataSource={orgBDList}
        size="small"
        rowKey={record => record.id}
        pagination={false}
      // loading={!record.loaded}
      // rowClassName={this.handleRowClassName}
      />

    </div>
  );
}

function DataRoomUserList(props) {
  const { list, password, passwordChange, disableEditPassword, displayEditPasswordField } = props;
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

      {displayEditPasswordField &&
      <div style={{ margin: '0 auto', display: 'grid', width: 300, gridTemplateColumns: '1fr 230px' }}>
        <div style={{ alignSelf: 'center' }}>编辑密码</div>
        <Input placeholder="不输入密码PDF文件将不加密" value={password} onChange={passwordChange} disabled={disableEditPassword} />
        <div style={{ gridColumn: 2, fontSize: 12, fontStyle: 'oblique' }}>该密码仅针对pdf文件有效</div>
      </div>
      }
      

      <Row style={{ marginTop: 30, marginBottom: 10, textAlign: 'center' }}>
        <Button disabled={!props.selectedUser} onClick={props.onConfirm} type="primary">下载全部文件</Button>
        <Button disabled={props.disableDownloadSelectedFilesButton} style={{ marginLeft: 10 }} onClick={props.onDownloadSelectedFiles}>下载选中的文件</Button>
        {!isLogin().is_superuser && hasPerm('usersys.as_investor') &&
          <Button disabled={props.disableDownloadNewFilesButton} style={{ marginLeft: 10 }} onClick={props.onDownloadNewFiles}>下载新文件</Button>
        }
      </Row>

    </div>
  );
}

export {DataRoomUserList, DataRoomUser}

