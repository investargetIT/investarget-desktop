import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';;
import { Breadcrumb, Button, Card, Modal, Select, Input, Table, Popover, Tag, Popconfirm, Row, Col, Tree } from 'antd';
import { getURLParamValue, handleError, hasPerm, isLogin, i18n, requestAllData, time } from '../utils/util';
import { SelectExistInvestor } from '../components/ExtraInput';
import * as api from '../api';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Search } from '../components/Search';
import DataroomFileManage from '../components/DataroomFileManage';

const { Option } = Select;

function DetaroomDetailsForCompanyFile(props) {

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
  const [readFileUserList, setReadFileUserList] = useState([]);
  const [targetUserFileList, setTargetUserFileList] = useState([]);
  const [data, setData] = useState([]);
  const [fileAnnotationList, setFileAnnotationList] = useState([]);
  const [newDataroomFile, setNewDataroomFile] = useState([]);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loadingOrgBD, setLoadingOrgBD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState(parseInt(parentID, 10) || -999);
  const [searchContent, setSearchContent] = useState('');

  async function getOrgBdOfUsers(users) {
    setLoadingOrgBD(true);
    const result = await requestAllData(api.getOrgBdList, {
      bduser: users.map(m => m.id),
      proj: projectID,
    }, 100);

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
    setLoadingOrgBD(false);
    setDataroomUsersOrgBdByOrg(dataroomUserOrgBd);
    setExpandedRows(dataroomUserOrgBd.map(m => m.id));
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
          const list = results.reduce((a, b) => a.concat(b), [])
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

    function investorGetDataRoomFile() {
      const stateData = data;
      return api.queryDataRoomDir(dataroomID).then(result => {
        setData(formatData(result.data))
        const param = { dataroom: dataroomID };
        return api.queryUserDataRoom(param).then(result => {
          const data1 = result.data.data[0]
          return api.queryUserDataRoomFile(data1.id).then(result => {
            const files = result.data.files || [];
            const data = [...stateData, ...files]
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

    async function getDataRoomFileAnnotations() {
      const req = await requestAllData(api.getAnnotations, { dataroom: dataroomID }, 10);
      setFileAnnotationList(req.data.data);
    }

    async function getNewDataRoomFile() {
      const res = await api.getNewDataroomFile(dataroomID, isLogin().id);
      const { data } = res;
      if (data.length === 0) return;
      setNewDataroomFile(data);
      setShowNewFileModal(true);
    }

    async function getDataroomFileReadingRecord() {
      const req = await requestAllData(api.getDataroomFileReadRecord, { dataroom: dataroomID }, 100);
      setReadFileUserList(req.data.data);
    }

    getProjectDetails();
    getDataRoomTemp();
    getAllUserFile();
    getDataRoomFile();
    getDataRoomFileAnnotations();
    getDataroomFileReadingRecord();

    if (!isLogin().is_superuser && hasPerm('usersys.as_investor')) {
      getNewDataRoomFile();
    }
  }, []);

  function handleConfirmSelectDataroomTemp() {
    const body = { user: dataRoomTempModalUserId };
    api.applyDataroomTemp(selectedDataroomTemp, body).then(() => {
      Modal.success({
        title: i18n('success'),
        content: '应用模版成功',
      });
      setShowDataRoomTempModal(false);
      getAllUserFile();
    });
    api.editDataroomTemp(
      selectedDataroomTemp,
      { password: pdfPasswordForTemp },
    ).then(getDataRoomTemp);
  }

  async function toggleUserDataroomFiles(user, data, isAdd) {
    const dataroomUserfile = userDataroomMap[user];

    // Delete
    if (!isAdd) {
      await Promise.all(data.map(m => api.deleteUserDataroomFile(m.id)));
      const removedFiles = data.map(m => m.file);
      const newTargetUserFileList = targetUserFileList.filter(f => !removedFiles.includes(f.file));
      const newFileUserList = fileUserList.filter(f => f.user !== user || !removedFiles.includes(f.file));
      setFileUserList(newFileUserList);
      setTargetUserFileList(newTargetUserFileList);
      return;
    }

    // Add
    const res = [];
    for (let index = 0; index < data.length; index++) {
      const m = data[index];
      const body = {
        dataroom: dataroomID,
        dataroomUserfile,
        file: m.file,
      };
      try {
        const addFileToUser = await api.addUserDataroomFile(body);
        res.push(addFileToUser);
      } catch (error) {
        console.log(error);
      }
    }
    const newFiles = res.map(m => {
      const { id, file, dataroomUserfile: dataroomUserfileId } = m.data;
      return { id, file, dataroomUserfileId, user };
    });
    const newTargetUserFileList = targetUserFileList.concat(newFiles);
    const newFileUserList = fileUserList.concat(newFiles);
    setFileUserList(newFileUserList);
    setTargetUserFileList(newTargetUserFileList);

    // check new file
    const res1 = await api.getNewDataroomFile(dataroomID, user);
    if (res1.data.length > 0) {
      setUserWithNewDataroomFile(userWithNewDataroomFile.concat(user))
    }
  }

  function handleSelectFileUser(file, user) {
    const data = { file };
    toggleUserDataroomFiles(user, [data], true);
  }

  function handleDeselectFileUser(file, user) {
    const removedFiles = fileUserList.filter(item => item.file === file && item.user === user);
    toggleUserDataroomFiles(user, removedFiles, false);
  }


  function handleUploadFile(file, parentId) {
    const body = {
      dataroom: parseInt(dataroomID),
      filename: file.name,
      isFile: true,
      orderNO: 1,
      parent: parentId == -999 ? null : parentId,
      key: file.response.result.key,
      size: file.size,
      bucket: 'file',
      realfilekey: file.response.result.realfilekey,
    }

    api.addDataRoomFile(body).then(result => {
      const item = result.data
      const parentId = item.parent || -999

      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date }
      const newData = [...data];
      newData.push(newItem)
      setData(newData);
    }).catch(error => {
      props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  async function createOrFindFolder(folderName, parentFolderID) {
    // 检查当前目录下是否有同名文件夹
    const files = data.filter(f => f.parentId === parentFolderID);
    const sameNameFolderIndex = files.map(item => item.name).indexOf(folderName);
    if (sameNameFolderIndex > -1) {
      console.warning('find duplaicate folder', files[sameNameFolderIndex]);
      return files[sameNameFolderIndex].id;
    }

    const body = {
      dataroom: Number(dataroomID),
      filename: folderName,
      isFile: false,
      orderNO: 1,
      parent: parentFolderID == -999 ? null : parentFolderID,
    }
    const data1 = await api.addDataRoomFile(body);
    const item = data1.data
    const parentId = item.parent || -999
    const name = item.filename
    const rename = item.filename
    const unique = item.id
    const isFolder = !item.isFile
    const date = item.lastmodifytime || item.createdtime
    const justCreated = true; // 以此为标识用户刚新建的文件夹，否则会被自动隐藏空文件夹功能隐藏
    const newItem = { ...item, parentId, name, rename, unique, isFolder, date, justCreated }
    const newData = data.slice();
    newData.push(newItem);
    allDataroomFiles = newData;
    setData(newData);
    return unique;
  }

  async function createOrFindFolderLoop(folderArr, initialParentId) {
    let parentFolderID = initialParentId;
    for (let index = 0; index < folderArr.length; index++) {
      const folderName = folderArr[index];
      const newFolderId = await createOrFindFolder(folderName, parentFolderID);
      parentFolderID = newFolderId;
    }
    return parentFolderID;
  }

  async function handleUploadFileWithDir(file, parentId) {
    const { webkitRelativePath } = file;
    const splitPath = webkitRelativePath.split('/');
    const dirArray = splitPath.slice(0, splitPath.length - 1);
    const finalFolderID = await createOrFindFolderLoop(dirArray, parentId);
    const files = allDataroomFiles.filter(f => f.parentId === finalFolderID);
    if (files.some(item => item.name == file.name)) {
      message.warning(`文件 ${file.webkitRelativePath} 已存在`);
      return;
    }
    const body = {
      dataroom: parseInt(dataroomID),
      filename: file.name,
      isFile: true,
      orderNO: 1,
      parent: finalFolderID == -999 ? null : finalFolderID,
      key: file.response.result.key,
      size: file.size,
      bucket: 'file',
      realfilekey: file.response.result.realfilekey,
    }

    api.addDataRoomFile(body).then(data1 => {
      const item = data1.data
      const parentId = item.parent || -999

      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date }
      const newData = allDataroomFiles.slice();
      newData.push(newItem);
      setData(newData);
    }).catch(error => {
      props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  return (
    <LeftRightLayoutPure location={props.location}>
      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>公司文件</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/app/dataroom/company/list">公司文件列表</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>公司文件</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginLeft: 20, marginBottom: 20, fontSize: 20, lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold' }}>{projTitle}</div>

      {data.length > 0 &&
        <DataroomFileManage
          isCompanyDataroom
          setData={setData}
          setLoading={setLoading}
          allDataroomFiles={allDataroomFiles}
          parentId={parentId}
          dataroomID={dataroomID}
          data={data}
          userOptions={userOptions}
          fileUserList={fileUserList}
          onSelectFileUser={handleSelectFileUser}
          onDeselectFileUser={handleDeselectFileUser}
          readFileUserList={readFileUserList}
          onUploadFile={handleUploadFile}
          onUploadFileWithDir={handleUploadFileWithDir}
        />
      }

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
function mapStateToProps(state) {
  const { orgbdres } = state.app
  return { orgbdres };
}
export default connect(mapStateToProps)(DetaroomDetailsForCompanyFile);
