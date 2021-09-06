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

    getProjectDetails();
    getDataRoomTemp();
    getAllUserFile();
    getDataRoomFile();
    getDataRoomFileAnnotations();

    if (!isLogin().is_superuser && hasPerm('usersys.as_investor')) {
      getNewDataRoomFile();
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

        {(hasPerm('dataroom.admin_adddataroom') || hasPerm('dataroom.admin_deletedataroom') || isProjTrader) &&
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            {(hasPerm('dataroom.admin_adddataroom') || isProjTrader) &&
              <Popconfirm title="确定发送邮件通知该用户？" onConfirm={() => handleSendEmail(item)}>
                <Button style={{ marginRight: 10 }}>{i18n('dataroom.send_email_notification')}</Button>
              </Popconfirm>
            }
            {(hasPerm('dataroom.admin_adddataroom') || isProjTrader) &&
              <Popconfirm title="确定发送新增文件邮件给该用户吗？" onConfirm={() => handleSendNewFileEmail(item)}>
                <Button disabled={!userWithNewDataroomFile.includes(userId)} style={{ marginRight: 10 }}>{i18n('dataroom.send_new_file_notification')}</Button>
              </Popconfirm>
            }
            {(hasPerm('dataroom.admin_deletedataroom') || isProjTrader) &&
              <Popconfirm title={i18n('delete_confirm')} onConfirm={() => handleDeleteUser(item)}>
                <Button type="primary">移除</Button>
              </Popconfirm>
            }
          </div>
        }

      </div>
    );
  }

  const columns = [
    {
      title: i18n('org_bd.org'),
      key: 'org',
      sorter: false,
      render: (_, record) => {
        if (!record.org) return null;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: 8 }}>{record.org.orgname}</div>
            {list.filter(f => f.user && f.user.org && f.user.org.id === record.id)
              .map(item => (
                <Popover
                  key={item.user.id}
                  content={generatePopoverContent(item)}
                >
                  <Tag style={{ cursor: 'default' }}>{item.user.username}</Tag>
                </Popover>
              ))}
          </div>
        );
      },
    },
  ];

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
                  <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
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
      {
        title: '应对策略',
        width: '10%',
        key: 'pm_remark',
        render: (_, record) => {
          let latestPMComment = '';
          if (record.BDComments && record.BDComments.length) {
            const pmComments = record.BDComments.filter(f => f.isPMComment);
            if (pmComments.length > 0) {
              latestPMComment = pmComments[pmComments.length - 1].comments;
            }
          }
          if (!latestPMComment) return '暂无';

          const comments = record.BDComments;
          const popoverContent = comments.filter(f => f.isPMComment)
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
                  <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
                </div>
              );
            });
          return (
            <Popover placement="leftTop" title="应对策略" content={popoverContent}>
              <div style={{ color: "#428bca" }}>{latestPMComment.length >= 12 ? (latestPMComment.substr(0, 10) + "...") : latestPMComment}</div>
            </Popover>
          );
        },
      },
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

  function formatSearchData (data) {
    return data.map(item => {
      const parentId = this.state.parentId; 
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const timezone = item.timezone || '+08:00'
      return { ...item, parentId, name, rename, unique, isFolder, date, timezone }
    })
  }

  function findAllParents(fileId) {
    let allParents = [];
    function findParents (id) {
      const currentFile = allDataroomFiles.filter(f => f.id === id);
      const parent = allDataroomFiles.filter(f => f.id === currentFile[0].parent);
      allParents = allParents.concat(parent);
      if (parent.length > 0) {
        findParents(parent[0].id);
      }
      return allParents;
    }
    return findParents(fileId);
  }

  async function handleDataroomSearch(content) {
    if (!content) {
      setData(this.allDataroomFiles);
      return;
    }
    setLoading(true);
    const req = await api.searchDataroom(dataroomID, content);
    const { data } = req.data;

    let newData = formatSearchData(data);
    if (parentId !== -999) {
      const allParents = findAllParents(parentId);
      const parentFolder = allDataroomFiles.filter(f => f.id === parentId);
      newData = newData.concat(allParents).concat(parentFolder);
    }
    setLoading(false);
    setData(newData);
  }

  function recursiveFindChildren(item) {
    const children = data.filter(f => f.parent === item.id);
    if (children.length === 0) {
      return;
    }
    item['children'] = children.map(m => ({ ...m, title: m.filename, key: m.id, isLeaf: m.isFile }));
    children.forEach(element => {
      return recursiveFindChildren(element);
    });
  }

  function generateTreeData() {
    let rootDirectory = data.filter(f => !f.parent);
    rootDirectory = rootDirectory.map(m => ({ ...m, title: m.filename, key: m.id, isLeaf: m.isFile }));
    rootDirectory.forEach(element => recursiveFindChildren(element));

    const rootDir = { title: '全部文件', key: -999, id: -999 };
    rootDir['children'] = rootDirectory;
    return [rootDir];
  }

  const onSelect = (keys, info) => {
    console.log('Trigger Select', keys, info);
  };

  const onExpand = () => {
    console.log('Trigger Expand');
  };

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

      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
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

        <div style={{ padding: '0 16px', backgroundColor: '#F5F5F5', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold', display: 'flex', height: 41, alignItems: 'center' }}>
          <div style={{ marginLeft: 40, flex: 10, padding: '14px 0', paddingRight: 8 }}>投资人</div>
          <div style={{ flex: 8, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>职位</div>
          <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>负责人</div>
          <div style={{ flex: 16, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>机构进度/材料</div>
          <div style={{ flex: 15, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>机构反馈</div>
          <div style={{ flex: 10, padding: '14px 0', paddingLeft: 8, paddingRight: 8 }}>应对策略</div>
        </div>

        <Table
          columns={columns}
          expandedRowRender={expandedRowRender}
          dataSource={dataroomUsersOrgBdByOrg}
          rowKey={record => record.id}
          loading={loadingOrgBD}
          // onExpand={this.onExpand.bind(this)}
          expandedRowKeys={expandedRows}
          pagination={false}
          size="middle"
          showHeader={false}
        />

      </Card>

      <Row gutter={20}>
        <Col span={8}>
          <Card>
            <Search
              style={{ marginBottom: 30 }}
              size="default"
              placeholder="请输入文件名称或内容"
              onSearch={handleDataroomSearch}
              onChange={searchContent => setSearchContent(searchContent)}
              value={searchContent}
            />
            <DirectoryTree
              multiple
              defaultExpandAll
              onSelect={onSelect}
              onExpand={onExpand}
              treeData={generateTreeData()}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card></Card>
        </Col>
      </Row>

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
export default connect(mapStateToProps)(DataroomDetails);