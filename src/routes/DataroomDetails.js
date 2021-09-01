import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';;
import { Breadcrumb, Button, Card } from 'antd';
import { getURLParamValue, handleError, hasPerm, isLogin, i18n } from '../utils/util';
import { SelectExistInvestor } from '../components/ExtraInput';
import * as api from '../api';
import { PlusOutlined } from '@ant-design/icons';

function DataroomDetails(props) {

  const dataroomID = getURLParamValue(props, 'id');
  const isClose = getURLParamValue(props, 'isClose');
  const projectID = getURLParamValue(props, 'projectID');
  const projectTitle = getURLParamValue(props, 'projectTitle');
  const parentID = getURLParamValue(props, 'parentID');

  const isAbleToAddUser = hasPerm('usersys.as_trader');

  const [projTitle, setProjTitle] = useState(projectTitle);
  const [projID, setProjectID] = useState(projectID);
  const [isProjTrader, setIsProjTrader] = useState(false);
  const [makeUserIds, setMakeUserIds] = useState([]);
  const [hasPermissionForDataroomTemp, setHasPermissionForDataroomTemp] = useState(false);
  const [newUser, setNewUser] = useState(null);

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });

    function getProjectDetails() {
      api.getProjLangDetail(projID).then(res => {
        const { projTraders } = res.data;
        const isProjTrader = projTraders ? projTraders.filter(f => f.user).map(m => m.user.id).includes(isLogin().id) : false;
        const isSuperUser = isLogin().is_superuser;
        setProjTitle(res.data.projtitle);
        if (isProjTrader || isSuperUser) {
          setIsProjTrader(isProjTrader);
          setHasPermissionForDataroomTemp(true);
          setMakeUserIds(projTraders ? projTraders.filter(f => f.user).filter(f => f.type === 1).map(m => m.user.id) : []);
        }
      }).catch(handleError);
    }
    getProjectDetails();

    // this.getDataRoomFile()
    // this.getDataRoomFileAnnotations(); 
    // this.getAllUserFile()
    // this.getDataRoomTemp();
    // if (!isLogin().is_superuser && hasPerm('usersys.as_investor')) {
    //   this.getNewDataRoomFile();
    // }

    

  }, []);

  function onApplyTemplate() {
    // this.setState({ showDataRoomTempModal: true });
    window.echo('handle applydd');
    // TODO
  }

  function handleAddUser() {

    // TODO

    // const { id, newUser } = this.state
    // const param = { dataroom: id, user: newUser, trader: isLogin().id };
    // api.addUserDataRoom(param).then(result => {
    //   this.setState({ newUser: null })
    //   this.getAllUserFile()
    //   const { id: dataroomUserfile, dataroom, user } = result.data;
    //   const body = { dataroomUserfile, dataroom, user };
    //   if (this.state.hasPermissionForDataroomTemp) {
    //     this.handleSaveTemplate(body);
    //   }
    // }).catch(error => {
    //   handleError(error)
    // })
  }

  return (
    <LeftRightLayoutPure location={props.location}>
      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Data Room</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/app/dataroom/project/list">Data Room 列表</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>项目文件</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginLeft: 20, marginBottom: 20, fontSize: 20, lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold' }}>{projTitle}</div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {hasPermissionForDataroomTemp && <Button style={{ width: 109, height: 32 }} onClick={onApplyTemplate}>应用模版</Button>}
          {isAbleToAddUser &&
            <div>
              <div style={{ display: 'flex' }}>
                <div style={{ marginRight: 10 }}>
                  <SelectExistInvestor
                    style={{ width: 200 }}
                    value={newUser}
                    placeholder="请选择联系人"
                    onChange={value => setNewUser(value)}
                    dataroom={dataroomID}
                  />
                </div>
                <div><Button type="primary" onClick={handleAddUser} disabled={!newUser || !hasPermissionForDataroomTemp}><PlusOutlined />{i18n('dataroom.add_user')}</Button></div>
              </div>
            </div>
          }
        </div>
      </Card>

    </LeftRightLayoutPure>
  );
}

export default connect()(DataroomDetails);
