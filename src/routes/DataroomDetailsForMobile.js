import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Breadcrumb, Button, Card, Modal, Select, Input, Table, Popover, Tag, Popconfirm, Row, Col, Tree, Empty, Spin } from 'antd';
import { getURLParamValue, handleErrorForMobile as handleError, hasPerm, isLogin, i18n, requestAllData, time, updateURLParameter } from '../utils/util';
import { SelectExistInvestor } from '../components/ExtraInput';
import * as api from '../apiForMobile';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Search } from '../components/Search';
import DataroomFileManageForMobile from '../components/DataroomFileManageForMobile';
import LeftRightLayoutPureForMobile from '../components/LeftRightLayoutPureForMobile';

const { Option } = Select;
const { DirectoryTree } = Tree;
const priority = ['低', '中', '高'];
const priorityColor = ['#7ed321', '#0084a9', '#ff617f'];
const priorityStyles = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: '#ff617f',
  opacity: 0.5,
};
const progressStyles = {
  margin: 2,
  backgroundColor: 'rgba(250, 221, 20, .15)',
  fontSize: 14,
  lineHeight: '20px',
  padding: '4px 10px',
  borderRadius: 20,
  color: '#262626',
};

function DataroomDetails(props) {

  const dataroomID = getURLParamValue(props, 'id');
  const isClose = getURLParamValue(props, 'isClose');
  const projectID = getURLParamValue(props, 'projectID');
  const projectTitle = getURLParamValue(props, 'projectTitle');
  const parentID = getURLParamValue(props, 'parentID');
  const isAbleToAddUser = hasPerm('usersys.as_trader');

  const [allDataroomFiles, setAllDataroomFiles] = useState([]);
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

  const [fileID, setFileID] = useState(-999); // 当前目录或文件 ID

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
    // setExpandedRows(dataroomUserOrgBd.map(m => m.id));
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
      let list = result.data.data
      list = list.map(m => {
        const user = m.user;
        if (!user.org) {
          return { ...m, user: { ...user, org: { id: -1, orgname: '暂无机构' } } };
        }
        return m;
      });
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
      const parent = item.parent || -999;
      const parentId = item.parent || -999
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const timezone = item.timezone || '+08:00'
      return { ...item, parentId, name, rename, unique, isFolder, date, timezone, parent }
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
        let allProjTraders = [];
        const { PM } = res.data;
        if (PM) {
          allProjTraders.push({ user: PM });
        }
        const { projTraders } = res.data;
        if (projTraders) {
          allProjTraders = allProjTraders.concat(projTraders);
        }
        const isProjTrader = allProjTraders.filter(f => f.user).map(m => m.user.id).includes(isLogin().id);
        const isSuperUser = isLogin() && isLogin().is_superuser;
        setProjTitle(res.data.projtitle);
        if (isProjTrader || isSuperUser) {
          setIsProjTrader(isProjTrader);
          setHasPermissionForDataroomTemp(true);
          setMakeUserIds(projTraders ? projTraders.filter(f => f.user).filter(f => f.type === 1).map(m => m.user.id) : []);
        }
      }).catch(handleError);
    }

    // function investorGetDataRoomFile() {
    //   const stateData = data;
    //   return api.queryDataRoomDir(dataroomID).then(result => {
    //     setData(formatData(result.data))
    //     const param = { dataroom: dataroomID };
    //     return api.queryUserDataRoom(param).then(result => {
    //       const data1 = result.data.data[0]
    //       return api.queryUserDataRoomFile(data1.id).then(result => {
    //         const files = result.data.files || [];
    //         const data = [...stateData, ...files]
    //         setAllDataroomFiles(formatData(data));
    //         setData(formatData(data));
    //       })
    //     })
    //   })
    // }

    async function getDataroomFiles() {
      setLoading(true);
      const reqDir = await api.queryDataRoomDir(dataroomID);
      setData(formatData(reqDir.data));
      const reqFile = await api.queryDataRoomFile({ dataroom: dataroomID, isFile: true });
      setLoading(false);
      const allFiles = [...reqDir.data, ...reqFile.data.data];
      const formattedFiles = formatData(allFiles);
      setAllDataroomFiles(formattedFiles);
      setData(formattedFiles);
    }

    // function getDataRoomFile() {
    //   let param = { dataroom: dataroomID };
    //   api.queryDataRoomFile(param).then(result => {
    //     var { count, data } = result.data
    //     data = formatData(data)
    //     setAllDataroomFiles(data);
    //     setData(data);
    //   }).catch(_ => {
    //     investorGetDataRoomFile();
    //   })
    // }

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

    getAllUserFile();
    getDataroomFiles();
    getProjectDetails();
    getDataRoomTemp();
    getDataRoomFileAnnotations();
    getDataroomFileReadingRecord();

    if (isLogin() && !isLogin().is_superuser && hasPerm('usersys.as_investor')) {
      getNewDataRoomFile();
    }

    window.onpopstate = (e) => {
      // const fileID = getURLParamValue(props, 'fileID');
      const fileID = e.state && e.state.fileID;
      setFileID(parseInt(fileID, 10) || -999);
    }
  }, []);

  function handleSaveTemplate(body) {
    api.addDataroomTemp(body).then(getDataRoomTemp).catch(handleError);
  }

  function handleAddUser() {
    const param = { dataroom: dataroomID, user: newUser, trader: isLogin().id };
    api.addUserDataRoom(param).then(result => {
      setNewUser(null);
      getAllUserFile()
      const { id: dataroomUserfile, dataroom, user } = result.data;
      const body = { dataroomUserfile, dataroom, user };
      if (hasPermissionForDataroomTemp) {
        handleSaveTemplate(body);
      }
    }).catch(handleError);
  }

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

  function getProgressBackground(id) {
    if (id === 6) {
      return 'rgba(230, 69, 71, .15)';
    }
    if ([4, 5].includes(id)) {
      return 'rgba(250, 173, 20, .15)';
    }
    return 'rgba(82, 196, 26, .15)';
  }

  let startX, oldX=0;
  function handleTouchStart(e) {
    const { touches } = e;
    if (touches && touches.length === 1) {
      const touch = touches[0];
      startX = touch.clientX;
    }

    const all = document.getElementsByClassName('long-content');
    for (let i = 0; i < all.length; i++) {
      const oldLeft = all[i].style.left;
      if (oldLeft) {
        oldX = parseInt(oldLeft);
      }
    }
    // e.preventDefault();
  }

  function handleTouchMove(e) {
    const progressX = startX - e.touches[0].clientX;
    const translation = progressX > 0 ? parseInt(-Math.abs(progressX)) : parseInt(Math.abs(progressX));
    // window.echo('move e', progressX);
    const all = document.getElementsByClassName('long-content');
    // window.echo('all', all);
    
    for (let i = 0; i < all.length; i++) {
      if ((oldX + translation) < -465) {
        all[i].style.left = '-465px';
      } else if ((oldX + translation) < 0) {
        all[i].style.left = `${oldX + translation}px`;
      } else {
        all[i].style.left = 0;
      }
    }
  }

  function handleSendEmail(item) {
    api.sendEmailToDataroomUser(item.id)
      .then(_ => {
        Modal.success({ title: '邮件发送成功' });
      })
      .catch(handleError);
  }

  function handleSendNewFileEmail(item) {
    api.sendNewFileEmail(item.id)
      .then(result => {
        echo(result);
        Modal.success({ title: '邮件发送成功' });
      })
      .catch(handleError);
  }

  function handleDeleteUser(item) {
    const { id: dataroomUserId, user: { id: userId } } = item;
    const userDataroomTemp = dataRoomTemp.filter(f => f.user === userId);
    api.deleteUserDataRoom(dataroomUserId).then(_ => {
      getAllUserFile();
      if (userDataroomTemp.length > 0) {
        api.deleteDataroomTemp(userDataroomTemp[0].id);
      }
    }).catch(error => {
      handleError(error)
    });
  }

  function generatePopoverContent(item) {
    const { user: { id: userId } } = item;
    return (
      <div>
        {hasPerm('usersys.as_trader') ?
          <div style={{ color: '#989898' }}>
            <div><Link to={`/app/user/${item.user.id}`} target="_blank">{item.user.username}</Link></div>
            <div>机构名称：{item.user.org ? <Link to={`/app/organization/${item.user.org.id}`} target="_blank">{item.user.org.orgname}</Link> : '暂无机构'}</div>
          </div>
          :
          <div style={{ color: '#989898' }}>
            <div>{item.user.username}</div>
            <div>机构名称：{item.user.org ? item.user.org.orgname : '暂无机构'}</div>
          </div>
        }

        <div style={{ color: '#989898' }}>最近登录：{item.lastgettime ? item.lastgettime.slice(0, 16).replace('T', ' ') : '暂无'}</div>

        {(hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Popconfirm title="确定发送邮件通知该用户？" onConfirm={() => handleSendEmail(item)}>
              <Button style={{ marginRight: 10 }}>{i18n('dataroom.send_email_notification')}</Button>
            </Popconfirm>
            <Popconfirm title="确定发送新增文件邮件给该用户吗？" onConfirm={() => handleSendNewFileEmail(item)}>
              <Button disabled={!userWithNewDataroomFile.includes(userId)} style={{ marginRight: 10 }}>{i18n('dataroom.send_new_file_notification')}</Button>
            </Popconfirm>
            <Popconfirm title={i18n('delete_confirm')} onConfirm={() => handleDeleteUser(item)}>
              <Button type="primary">移除</Button>
            </Popconfirm>
          </div>
        }

      </div>
    );
  }

  // const columns = [
  //   {
  //     title: i18n('org_bd.org'),
  //     key: 'org',
  //     sorter: false,
  //     render: (_, record) => {
  //       if (!record.org) return null;
  //       return (
  //         <div style={{ display: 'flex', alignItems: 'center' }}>
  //           <div style={{ marginRight: 8 }}>{record.org.orgname}</div>
  //           {list.filter(f => f.user && f.user.org && f.user.org.id === record.id)
  //             .map(item => (
  //               <Popover
  //                 key={item.user.id}
  //                 content={generatePopoverContent(item)}
  //               >
  //                 <Tag style={{ cursor: 'default' }}>{item.user.username}</Tag>
  //               </Popover>
  //             ))}
  //         </div>
  //       );
  //     },
  //   },
  // ];

  function renderProgressAndMaterial(text, record) {
    let progress = null;
    if (text) {
      progress = <div style={{ ...progressStyles, backgroundColor: getProgressBackground(text) }}>{props.orgbdres.filter(f => f.id === text)[0].name}</div>;
    }
    let material = null;
    if (record.material) {
      material = <div style={{ ...progressStyles, backgroundColor: 'rgba(51, 155, 210, .15)' }}>{record.material}</div>;
    }
    return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{progress}{material}</div>;
  }

  function renderLatestComment(record) {
    let latestComment = '';
          if (record.BDComments && record.BDComments.length) {
            const commonComments = record.BDComments.filter(f => !f.isPMComment);
            if (commonComments.length > 0) {
              latestComment = commonComments[commonComments.length - 1].comments;
            }
          }
          if (!latestComment) return '暂无';

          const comments = record.BDComments;
          const popoverContent = comments.filter(f => !f.isPMComment)
            .sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
            .map(comment => {
              let content = comment.comments;
              const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
              if (oldStatusMatch) {
                const oldStatus = oldStatusMatch[0];
                content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
              }
              return (
                <div key={comment.id} style={{ marginBottom: 8 }}>
                  <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
                  <div style={{ display: 'flex' }}>
                    {comment.createuser &&
                      <div style={{ marginRight: 10 }}>
                        <a target="_blank" href={`/app/user/${comment.createuser.id}`}>
                          <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuser.photourl} />
                        </a>
                      </div>
                    }
                    <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
                  </div>
                </div>
              );
            });
          return (
            <Popover placement="leftTop" title="机构反馈" content={popoverContent}>
              <div style={{ color: "#428bca" }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div>
            </Popover>
          );
  }

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: i18n('org_bd.contact'), width: '8%', dataIndex: 'username', key: 'username',
        render: (_, record) => {
          return (
            <div style={{ paddingLeft: 30 }}>
              {/* {record.isimportant > 1 && <img style={importantImg} src="/images/important.png" />} */}
              {record.username ?
                // <Popover placement="topRight" content={this.content(record)}>
                  <span style={{ color: '#428BCA' }}>
                    <a target="_blank" href={'/app/user/' + record.bduser}>{record.username}</a>
                  </span>
                // </Popover>
                : '暂无'}
            </div>
          );
        },
      },
      {
        title: '职位',
        key: 'title',
        width: '10%',
        render: (_, record) => record.new || !record.usertitle ? '' : record.usertitle.name,
      },
      {
        title: i18n('org_bd.manager'),
        width: '10%',
        dataIndex: ['manager', 'username'],
        key: 'manager',
      },
      {
        title: '机构进度/材料',
        width: '16%',
        dataIndex: 'response',
        key: 'response',
        sorter: false,
        render: (text, record) => {
          let progress = null;
          if (text) {
            progress = <div style={{ ...progressStyles, backgroundColor: getProgressBackground(text) }}>{props.orgbdres.filter(f => f.id === text)[0].name}</div>;
          }
          let material = null;
          if (record.material) {
            material = <div style={{ ...progressStyles, backgroundColor: 'rgba(51, 155, 210, .15)' }}>{record.material}</div>;
          }
          return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{progress}{material}</div>;
        },
      },
      {
        title: "机构反馈",
        width: '15%',
        key: 'bd_latest_info',
        render: (_, record) => {
          let latestComment = '';
          if (record.BDComments && record.BDComments.length) {
            const commonComments = record.BDComments.filter(f => !f.isPMComment);
            if (commonComments.length > 0) {
              latestComment = commonComments[commonComments.length - 1].comments;
            }
          }
          if (!latestComment) return '暂无';

          const comments = record.BDComments;
          const popoverContent = comments.filter(f => !f.isPMComment)
            .sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
            .map(comment => {
              let content = comment.comments;
              const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
              if (oldStatusMatch) {
                const oldStatus = oldStatusMatch[0];
                content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
              }
              return (
                <div key={comment.id} style={{ marginBottom: 8 }}>
                  <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
                  <div style={{ display: 'flex' }}>
                    {comment.createuser &&
                      <div style={{ marginRight: 10 }}>
                        <a target="_blank" href={`/app/user/${comment.createuser.id}`}>
                          <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuser.photourl} />
                        </a>
                      </div>
                    }
                    <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
                  </div>
                </div>
              );
            });
          return (
            <Popover placement="leftTop" title="机构反馈" content={popoverContent}>
              <div style={{ color: "#428bca" }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div>
            </Popover>
          );
        },
      },
      // {
      //   title: '应对策略',
      //   width: '10%',
      //   key: 'pm_remark',
      //   render: (_, record) => {
      //     let latestPMComment = '';
      //     if (record.BDComments && record.BDComments.length) {
      //       const pmComments = record.BDComments.filter(f => f.isPMComment);
      //       if (pmComments.length > 0) {
      //         latestPMComment = pmComments[pmComments.length - 1].comments;
      //       }
      //     }
      //     if (!latestPMComment) return '暂无';

      //     const comments = record.BDComments;
      //     const popoverContent = comments.filter(f => f.isPMComment)
      //       .sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
      //       .map(comment => {
      //         let content = comment.comments;
      //         const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
      //         if (oldStatusMatch) {
      //           const oldStatus = oldStatusMatch[0];
      //           content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
      //         }
      //         return (
      //           <div key={comment.id} style={{ marginBottom: 8 }}>
      //             <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
      //             <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
      //           </div>
      //         );
      //       });
      //     return (
      //       <Popover placement="leftTop" title="应对策略" content={popoverContent}>
      //         <div style={{ color: "#428bca" }}>{latestPMComment.length >= 12 ? (latestPMComment.substr(0, 10) + "...") : latestPMComment}</div>
      //       </Popover>
      //     );
      //   },
      // },
    ];
    return (
      <Table
        showHeader={false}
        columns={columns}
        dataSource={record.orgbd}
        size="small"
        rowKey={record => record.id}
        pagination={false}
        // loading={!record.loaded}
      />
    );
  };


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

  function handleOrgBDExpand(record) {
    const currentId = record.id;
    const newExpanded = [...expandedRows];
    const expandIndex = newExpanded.indexOf(currentId);
    if (expandIndex < 0) {
      newExpanded.push(currentId);
    } else {
      newExpanded.splice(expandIndex, 1);
    }
    setExpandedRows(newExpanded);
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
      const parent = item.parent || -999;
      const parentId = item.parent || -999

      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date, parent }
      const newData = [...data];
      newData.push(newItem)
      setData(newData);
    }).catch(error => {
      props.dispatch({
        type: 'app/findErrorForMobile',
        payload: error
      })
    })
  }

  async function createOrFindFolder(folderName, parentFolderID, data) {
    // 检查当前目录下是否有同名文件夹
    const files = data.filter(f => f.parentId === parentFolderID);
    const sameNameFolderIndex = files.map(item => item.name).indexOf(folderName);
    if (sameNameFolderIndex > -1) {
      console.warn('find duplaicate folder', files[sameNameFolderIndex]);
      return { unique: files[sameNameFolderIndex].id, newData: data };
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
    const parent = item.parent || -999;
    const parentId = item.parent || -999
    const name = item.filename
    const rename = item.filename
    const unique = item.id
    const isFolder = !item.isFile
    const date = item.lastmodifytime || item.createdtime
    const justCreated = true; // 以此为标识用户刚新建的文件夹，否则会被自动隐藏空文件夹功能隐藏
    const newItem = { ...item, parentId, name, rename, unique, isFolder, date, justCreated, parent }
    const newData = data.slice();
    newData.push(newItem);
    return { unique, newData };
  }

  async function createOrFindFolderLoop(folderArr, initialParentId, data) {
    let parentFolderID = initialParentId;
    let initialData = data;
    for (let index = 0; index < folderArr.length; index++) {
      const folderName = folderArr[index];
      const { unique: newFolderId, newData } = await createOrFindFolder(folderName, parentFolderID, initialData);
      initialData = newData
      parentFolderID = newFolderId;
    }
    return { parentFolderID, newData: initialData };
  }

  async function handleUploadFileWithDir(file, parentId, data) {
    const { webkitRelativePath } = file;
    const splitPath = webkitRelativePath.split('/');
    const dirArray = splitPath.slice(0, splitPath.length - 1);
    const { parentFolderID: finalFolderID, newData } = await createOrFindFolderLoop(dirArray, parentId, data);
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
    const newNewData = newData.slice();
    await api.addDataRoomFile(body).then(data1 => {
      const item = data1.data
      const parent = item.parent || -999;
      const parentId = item.parent || -999

      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date, parent }
      newNewData.push(newItem);
    }).catch(error => {
      props.dispatch({
        type: 'app/findErrorForMobile',
        payload: error
      })
    })

    return newNewData;
  }

  function handleItemClick(item) {
    window.echo('item', item);
    // if (!item.isFile) {
      const newURLParams = updateURLParameter(props, 'fileID', item.id);
      history.pushState({ fileID: item.id }, '', `?${newURLParams.toString()}`)
      setFileID(item.id);
    // }
  }

  return (
    <LeftRightLayoutPureForMobile location={props.location}>
    
      {fileID === -999 && <div>
        <div style={{ marginLeft: 8, marginBottom: 12, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold' }}>{projTitle}</div>

        {/* <div onTouchMove={handleTouchMove} onTouchStart={handleTouchStart}>
        <div>一级目录不用动</div>
        <div className="short-content">
          <div className="long-content">二级目录跟着拖动，可以是很长的内容，照样跟着拖动，二级目录跟着拖动，可以是很长的内容，照样跟着拖动</div>
        </div>
        <div>一级目录不用动</div>
        <div className="short-content">
          <div className="long-content">二级目录跟着拖动，可以是很长的内容，照样跟着拖动，二级目录跟着拖动，可以是很长的内容，照样跟着拖动</div>
        </div>
      </div> */}

        {(hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
          <Card style={{ marginBottom: 20 }} bodyStyle={{ padding: 8, overflow: 'hidden' }} onTouchMove={handleTouchMove} onTouchStart={handleTouchStart}>
            <div className="short-content">
              <div className='long-content'>
                <div style={{ padding: '0 28px', backgroundColor: '#F5F5F5', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold', display: 'flex', height: 40, alignItems: 'center' }}>
                  <div style={{ width: 150 }}>投资人</div>
                  <div style={{ width: 100 }}>职位</div>
                  <div style={{ width: 100 }}>负责人</div>
                  <div style={{ width: 200 }}>机构进度/材料</div>
                  <div style={{ width: 200 }}>机构反馈</div>
                </div>
              </div>
            </div>
            {loadingOrgBD && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <Spin />
            </div>}
            {dataroomUsersOrgBdByOrg.map(m => <div key={m.id}>

              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid rgb(230, 230, 230)' }} onClick={() => handleOrgBDExpand(m)}>
                {expandedRows.includes(m.id) ? <CaretDownOutlined style={{ fontSize: 12, marginRight: 12 }} /> : <CaretRightOutlined style={{ fontSize: 12, marginRight: 12 }} />}
                <div style={{ marginRight: 8 }}>{m.org.orgname}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {list.filter(f => f.user && f.user.org && f.user.org.id === m.id)
                    .map(item => (
                      <Tag key={item.user.id} style={{ marginBottom: 4 }}>{item.user.username}</Tag>
                    ))}
                </div>
              </div>

              {expandedRows.includes(m.id) && m.orgbd.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}

              {expandedRows.includes(m.id) && m.orgbd.map(m1 => <div key={m1.id} className="short-content">
                <div className="long-content">
                  <div style={{ padding: '0 28px', backgroundColor: 'rgb(250, 250, 250)', color: 'rgba(89, 89, 89)', display: 'flex', height: 40, alignItems: 'center', borderBottom: '1px solid rgb(230, 230, 230)' }}>
                    <div style={{ width: 150 }}>{m1.username || '暂无'}</div>
                    <div style={{ width: 100 }}>{m1.usertitle ? m1.usertitle.name : '暂无'}</div>
                    <div style={{ width: 100 }}>{m1.manager ? m1.manager.username : ''}</div>
                    <div style={{ width: 200 }}>{renderProgressAndMaterial(m1.response, m1)}</div>
                    <div style={{ width: 200 }}>{renderLatestComment(m1)}</div>
                  </div>
                </div>
              </div>)}

            </div>)}
          </Card>
        }

      </div>}

      {/* {(hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
        <Card style={{ marginBottom: 20 }}> */}

          {/* <div style={{ padding: '0 16px', backgroundColor: '#F5F5F5', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold', display: 'flex', height: 41, alignItems: 'center' }}>
            <div style={{ marginLeft: 40, flex: 10, padding: '14px 0', paddingRight: 8 }}>投资人</div>
            <div style={{ flex: 8, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>职位</div>
            <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>负责人</div>
            <div style={{ flex: 16, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>机构进度/材料</div>
            <div style={{ flex: 15, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>机构反馈</div>
            <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>应对策略</div>
          </div> */}

          {/* <Table
            columns={columns}
            expandedRowRender={expandedRowRender}
            dataSource={dataroomUsersOrgBdByOrg}
            rowKey={record => record.id}
            loading={loadingOrgBD}
            // onExpand={handleOrgBDExpand}
            // expandedRowKeys={expandedRows}
            pagination={false}
            size="middle"
            showHeader={false}
          /> */}

        {/* </Card>
      } */}

      {/* {data.length > 0 && */}
        <DataroomFileManageForMobile
          setData={setData}
          loading={loading}
          setLoading={setLoading}
          allDataroomFiles={allDataroomFiles}
          setAllDataroomFiles={setAllDataroomFiles}
          parentId={parentId}
          dataroomID={dataroomID}
          data={data}
          userOptions={userOptions}
          fileUserList={fileUserList}
          targetUserFileList={targetUserFileList}
          onSelectFileUser={handleSelectFileUser}
          onDeselectFileUser={handleDeselectFileUser}
          readFileUserList={readFileUserList}
          onUploadFile={handleUploadFile}
          onUploadFileWithDir={handleUploadFileWithDir}
          setFileUserList={setFileUserList}
          setTargetUserFileList={setTargetUserFileList}
          isProjTrader={isProjTrader}
          newDataroomFile={newDataroomFile}
          allUserWithFile={list.filter(f => fileUserList.map(m => m.user).includes(f.user.id)).map(m => m.user)}
          fileID={fileID}
          onItemClick={handleItemClick}
        />
      {/* } */}

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

    </LeftRightLayoutPureForMobile>
  );
}
function mapStateToProps(state) {
  const { orgbdres } = state.app
  return { orgbdres };
}
export default connect(mapStateToProps)(DataroomDetails);
