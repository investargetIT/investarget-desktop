import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';;
import { Breadcrumb, Button, Card, Modal, Select, Input } from 'antd';
import { getURLParamValue, handleError, hasPerm, isLogin, i18n } from '../utils/util';
import { SelectExistInvestor } from '../components/ExtraInput';
import * as api from '../api';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';

const { Option } = Select;

function DataroomDetails(props) {

  const dataroomID = getURLParamValue(props, 'id');
  const isClose = getURLParamValue(props, 'isClose');
  const projectID = getURLParamValue(props, 'projectID');
  const projectTitle = getURLParamValue(props, 'projectTitle');
  const parentID = getURLParamValue(props, 'parentID');
  const isAbleToAddUser = hasPerm('usersys.as_trader');
  let allDataroomFiles = [];

  const [projTitle, setProjTitle] = useState(projectTitle);
  const [projID, setProjectID] = useState(projectID);
  const [isProjTrader, setIsProjTrader] = useState(false);
  const [makeUserIds, setMakeUserIds] = useState([]);
  const [hasPermissionForDataroomTemp, setHasPermissionForDataroomTemp] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [showDataRoomTempModal, setShowDataRoomTempModal] = useState(false);
  const [dataRoomTemp, setDataRoomTemp] = useState([]);
  const [selectedDataroomTemp, setSelectedDataroomTemp] = useState('');
  const [list, setList] = useState([]);
  const [dataRoomTempModalUserId, setDataRoomTempModalUserId] = useState('');
  const [pdfPasswordForTemp, setPdfPasswordForTemp] = useState('');
  const [pdfPassword, setPdfPassword] = useState('');
  const [currentBD, setCurrentBD] = useState(null);
  const [comments, setComments] = useState([]);
  const [dataroomUsersOrgBdByOrg, setDataroomUsersOrgBdByOrg] = useState([]);
  const [userWithNewDataroomFile, setUserWithNewDataroomFile] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [userDataroomIds, setUserDataroomIds] = useState([]);
  const [userDataroomMap, setUserDataroomMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [fileUserList, setFileUserList] = useState([]);
  const [targetUserFileList, setTargetUserFileList] = useState([]);
  const [data, setData] = useState([]);

  async function getOrgBdOfUsers(users) {
    const pageSize = 100;
    let result = await api.getOrgBdList({
      bduser: users.map(m => m.id),
      proj: projectID,
      page_size: pageSize,
    });
    const { count } = result.data;
    if (count > pageSize) {
      result = await api.getOrgBdList({
        bduser: users.map(m => m.id),
        proj: projectID,
        page_size: count,
      });
    }

    if (currentBD) {
      const comments = result.data.data.filter(item => item.id == currentBD.id)[0].BDComments || [];
      setComments(comments);
    }

    let dataroomUserOrgBdBeforeSort = users.map(m => {
      const { org } = m;
      if (org) {
        return { id: org.id, org, orgbd: [] };
      } else {
        return { id: -1, org: { id: -1, orgname: '暂无机构' }, orgbd: [] };
      }
    });
    dataroomUserOrgBdBeforeSort = _.uniqBy(dataroomUserOrgBdBeforeSort, 'id');
  
    // 暂无机构排最后
    const result1 = [], result2 = [];
    for (let index = 0; index < dataroomUserOrgBdBeforeSort.length; index++) {
      const element = dataroomUserOrgBdBeforeSort[index];
      if (element.id !== -1) {
        result1.push(element);
      } else {
        result2.push(element);
      }
    }
    const dataroomUserOrgBd = result1.concat(result2);

    const allOrgBds = result.data.data;
    for (let index = 0; index < allOrgBds.length; index++) {
      const element = allOrgBds[index];
      const { org } = element;
      const orgID = org ? org.id : -1;
      const orgIndex = dataroomUserOrgBd.map(m => m.org.id).indexOf(orgID);
      if (orgIndex > -1) {
        dataroomUserOrgBd[orgIndex].orgbd.push(element);
      } else {
        dataroomUserOrgBd.push({ id: org.id, org, orgbd: [element] });
      }
    }
    setDataroomUsersOrgBdByOrg(dataroomUserOrgBd); 
  }

  async function checkUserNewFile(userIds) {
    const res = await Promise.all(userIds.map(m => api.getNewDataroomFile(dataroomID, m)));
    let result = [];
    for (let index = 0; index < res.length; index++) {
      const element = res[index];
      if (element.data.length > 0) {
        result.push(userIds[index]);
      }
    }
    setUserWithNewDataroomFile(result);
  }

  function getAllUserFile() {
    api.queryUserDataRoom({ dataroom: dataroomID }).then(result => {
      const list = result.data.data
      
      if (list.length > 0) {
        getOrgBdOfUsers(list.map(m => m.user));
      }

      const users = list.map(item => item.user)
      const userIds = users.map(item => item.id)
      checkUserNewFile(userIds);
      const userDataroomIds = list.map(item => item.id)
      var userDataroomMap = {}
      userIds.forEach((userId, index) => {
        userDataroomMap[userId] = userDataroomIds[index]
      })
      const userOptions = users.map(item => ({ label: item.username, value: item.id }));

      setList(list);
      setDataRoomTempModalUserId(list.length > 0 ? '' + list[0].user.id : '');
      setUserOptions(userOptions);
      setUserDataroomIds(userDataroomIds);
      setUserDataroomMap(userDataroomMap);

      if (selectedUser && !userIds.includes(selectedUser)) {
        setSelectedUser(null);
      }
      
      return Promise.all(list.map((item) => {
        return api.getUserDataroomFile(dataroomID, item.user.id).then((result1) => {
          const { data } = result1.data;
          return data.filter(f => f.file !== null).map((m) => {
            return { id: m.id, dataroomUserfileId: item.id, file: m.file.id, user: item.user.id };
          });
        });
      }))

      .then(results => {
        const list = results.reduce((a,b) => a.concat(b), [])
        setFileUserList(list);
        if (selectedUser) {
          let _list = list.filter(item => item.user == selectedUser)
          setTargetUserFileList(_list);
        }
      })

    }).catch(error => {
      handleError(error)
    })
  }

  function formatData(data) {
    return data.map(item => {
      const parentId = item.parent || -999
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const timezone = item.timezone || '+08:00'
      return { ...item, parentId, name, rename, unique, isFolder, date, timezone }
    })
  }

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

    async function getDataRoomTemp() {
      const reqDataroomTemp = await api.getDataroomTemp({ dataroom: dataroomID });
      let allUserInfo = [];
      const allTempUserIds = reqDataroomTemp.data.data.map(m => m.user);
      if (allTempUserIds.length > 0) {
        const allUsersReq = await api.batchGetUserSimpleInfo({ id: allTempUserIds, page_size: allTempUserIds.length });
        allUserInfo = allUsersReq.data.data;
      }
      const dataRoomTemplate = reqDataroomTemp.data.data.map((m, i) => ({ ...m, userInfo: allUserInfo.filter(f => f.id === m.user)[0] }));
 
      setDataRoomTemp(dataRoomTemplate);
      setSelectedDataroomTemp(dataRoomTemplate.length > 0 ? '' + dataRoomTemplate[0].id : '');
      setPdfPassword(dataRoomTemplate.length > 0 ? dataRoomTemplate[0].password : '');
      setPdfPasswordForTemp(dataRoomTemplate.length > 0 ? dataRoomTemplate[0].password : '');
    }

    function investorGetDataRoomFile() {
      return api.queryDataRoomDir(dataroomID).then(result => {
        setData(formatData(result.data))
        const param = { dataroom: dataroomID };
        return api.queryUserDataRoom(param).then(result => {
          const data = result.data.data[0]
          return api.queryUserDataRoomFile(data.id).then(result => {
            const files = result.data.files
            const data = [...this.state.data, ...files]
            allDataroomFiles = data;
            setData(formatData(data));
          })
        })
      })
    }

    function getDataRoomFile() {
      let param = { dataroom: dataroomID };
      api.queryDataRoomFile(param).then(result => {
        var { count, data } = result.data
        data = formatData(data)
        allDataroomFiles = data;
        setData(data);
      }).catch(_ => {
        investorGetDataRoomFile();
      })
    }

    getProjectDetails();
    getDataRoomTemp();
    getAllUserFile();
    getDataRoomFile();

    // this.getDataRoomFileAnnotations(); 
    // if (!isLogin().is_superuser && hasPerm('usersys.as_investor')) {
    //   this.getNewDataRoomFile();
    // }

    

  }, []);

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

  function handleConfirmSelectDataroomTemp() {

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
          {hasPermissionForDataroomTemp && <Button style={{ width: 109, height: 32 }} onClick={() => setShowDataRoomTempModal(true)}>应用模版</Button>}
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

      {showDataRoomTempModal &&
        <Modal
          title="选择Dataroom模版"
          visible={true}
          onOk={handleConfirmSelectDataroomTemp}
          onCancel={() => setShowDataRoomTempModal(false)}
        >
          <div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <Select
                  defaultValue={dataRoomTemp.length > 0 ? '' + dataRoomTemp[0].id : undefined}
                  style={{ width: 120 }}
                  onChange={value => setSelectedDataroomTemp(value)}
                  value={selectedDataroomTemp + ''}
                >
                  {dataRoomTemp.map(m => <Option key={m.id} value={m.id + ''}>{m.userInfo.username}</Option>)}
                </Select>
              </div>
              <div style={{ margin: '0 10px' }}>应用到</div>
              <div>
                <Select
                  defaultValue={list.length > 0 ? '' + list[0].user.id : undefined}
                  style={{ width: 120 }}
                  onChange={value => setDataRoomTempModalUserId(value)}
                  value={dataRoomTempModalUserId + ''}
                >
                  {list.map(m => m.user).map(m => <Option key={m.id} value={m.id + ''}>{m.username}</Option>)}
                </Select>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'grid', width: 400, gridTemplateColumns: 'auto 1fr' }}>
              <div style={{ alignSelf: 'center', marginRight: 10 }}>设置pdf默认编辑密码</div>
              <Input
                placeholder="不输入该密码，pdf文件将默认不加密"
                value={pdfPasswordForTemp}
                onChange={e => setPdfPasswordForTemp(e.target.value)}
              />
              <div style={{ gridColumn: 2, fontSize: 12, fontStyle: 'oblique' }}>该密码仅针对pdf文件有效</div>
            </div>

          </div>
        </Modal>
      }

    </LeftRightLayoutPure>
  );
}

export default connect()(DataroomDetails);
