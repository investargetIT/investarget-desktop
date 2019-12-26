import React from 'react'
import { connect } from 'dva'
import LeftRightLayout from '../components/LeftRightLayout'
import FileMgmt from '../components/FileMgmt'
import * as api from '../api'
import { Modal, Select, Input } from 'antd'
import { hasPerm, isLogin, i18n, handleError } from '../utils/util'
import { 
  DataRoomUser, 
  DataRoomUserList, 
} from '../components/DataRoomUser';
import { Search } from '../components/Search';

const { Option } = Select;

const disableSelect = {
  padding: 30,
  backgroundColor: '#fff',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none', /* Safari */
  khtmlUserSelect: 'none', /* Konqueror HTML */
  MozUserSelect: 'none', /* Old versions of Firefox */
  msUserSelect: 'none', /* Internet Explorer/Edge */
  userSelect: 'none', /* Non-prefixed version, currently
                                supported by Chrome, Opera and Firefox */
};

class DataRoom extends React.Component {

  constructor(props) {
    super(props)

    const { id, isClose, projectID, projectTitle } = props.location.query
    this.state = {
      id: id,
      projectID: projectID,
      isClose: isClose == 'true' ? true : false,
      title: decodeURIComponent(projectTitle),
      data: [],
      visible: false,

      userOptions: [],
      userDataroomIds: [],
      fileUserList: [],

      list: [],
      newUser: null,

      selectedUser: null,
      targetUserFileList: [],
      downloadUrl: null,
      downloadUser: isLogin(),
      loading: false,

      showDataRoomTempModal: false,
      dataRoomTemp: [],
      selectedDataroomTemp: '',
      hasPermissionForDataroomTemp: false,
      dataRoomTempModalUserId: '',

      selectedFiles: [],
      isMakeUser: false,
      isTakeUser: false,

      pdfPassword: '',
      disableEditPassword: false,

      pdfPasswordForTemp: '',
      searchContent: '',

      parentId: parseInt(props.location.query.parentID, 10) || -999,

      newDataroomFile: [],
      showNewFileModal: false,
    }

    this.dataRoomTempModalUserId = null;
    this.allDataroomFiles = [];
  }

  componentDidMount() {
    api.getProjLangDetail(this.state.projectID).then(res => {
      const isMakeUser = res.data.makeUser && res.data.makeUser.id === isLogin().id;
      const isTakeUser = res.data.takeUser && res.data.takeUser.id === isLogin().id;
      const isSuperUser = isLogin().is_superuser;
      if (isMakeUser || isTakeUser || isSuperUser) {
        this.setState({
          title: res.data.projtitle,
          isMakeUser,
          isTakeUser,
          hasPermissionForDataroomTemp: true,
        });
      } else {
        this.setState({ title: res.data.projtitle });
      }
    })
    this.getDataRoomFile()
    this.getAllUserFile()
    this.getDataRoomTemp();
    this.getNewDataRoomFile();
  }

  getNewDataRoomFile = async () => {
    const res = await api.getNewDataroomFile(this.state.id, isLogin().id);
    window.echo('get new dataroom file', res);
    const { data } = res;
    if (data.length === 0) return;
    this.setState({ newDataroomFile: data, showNewFileModal: true });
  }

  getDataRoomTemp = async () => {
    const dataroom = this.state.id;
    const reqDataroomTemp = await api.getDataroomTemp({ dataroom });
    const allReq = reqDataroomTemp.data.data.map(m => api.getUserInfo(m.user));
    const reqUserInfo = await Promise.all(allReq);
    const dataRoomTemp = reqDataroomTemp.data.data.map((m, i) => ({ ...m, userInfo: reqUserInfo[i].data }));
    this.setState({
      dataRoomTemp,
      selectedDataroomTemp: dataRoomTemp.length > 0 ? '' + dataRoomTemp[0].id : '',
      pdfPassword: dataRoomTemp.length > 0 ? dataRoomTemp[0].password : '',
      pdfPasswordForTemp: dataRoomTemp.length > 0 ? dataRoomTemp[0].password : '',
    });
  }

  formatData = (data) => {
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

  formatSearchData = (data) => {
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

  getDataRoomFile = () => {
    const id = this.state.id
    let param = { dataroom: id }
    api.queryDataRoomFile(param).then(result => {
      var { count, data } = result.data
      data = this.formatData(data)
      this.allDataroomFiles = data;
      this.setState({ data })
    }).catch(error => {
      this.investorGetDataRoomFile();
    })
  }

  investorGetDataRoomFile = () => api.queryDataRoomDir(this.state.id).then(result => {
    this.setState({ data: this.formatData(result.data) })
    const param = { dataroom: this.state.id }
    return api.queryUserDataRoom(param).then(result => {
      const data = result.data.data[0]
      return api.queryUserDataRoomFile(data.id).then(result => {
        const files = result.data.files
        const data = [...this.state.data, ...files]
        this.setState({ data: this.formatData(data) })
      })
    })
  })

  getAllUserFile = () => {
    api.queryUserDataRoom({ dataroom: this.state.id }).then(result => {
      const list = result.data.data
      const users = list.map(item => item.user)
      const userIds = users.map(item => item.id)
      const userDataroomIds = list.map(item => item.id)
      var userDataroomMap = {}
      userIds.forEach((userId, index) => {
        userDataroomMap[userId] = userDataroomIds[index]
      })
      const userOptions = users.map(item => ({ label: item.username, value: item.id }))
      this.setState({
        list,
        dataRoomTempModalUserId: list.length > 0 ? '' + list[0].user.id : '',
        userOptions,
        userDataroomIds,
        userDataroomMap,
      });
      if (this.state.selectedUser && !userIds.includes(this.state.selectedUser)) {
        this.setState({ selectedUser: null })
      }

      return Promise.all(list.map(item => {
        return api.queryUserDataRoomFile(item.id).then(result => {
          const { files, user } = result.data
          return files.map(item => {
            return { file: item.id, user }
          })
        })
      })).
      then(results => {
        const list = results.reduce((a,b) => a.concat(b), [])
        this.setState({ fileUserList: list })
        if (this.state.selectedUser) {
          let _list = list.filter(item => item.user == this.state.selectedUser)
          this.setState({ targetUserFileList: _list })
        }
      })

    }).catch(error => {
      handleError(error)
    })
  }

  handleCreateNewFolder(parentId) {
    const newData = this.state.data.slice()
    const existKeyList = newData.map(m => m.unique)
    const maxKey = Math.max(...existKeyList)
    newData.splice(0, 0, {
      name: i18n('dataroom.new_folder'),
      isFolder: true,
      parentId: parentId,
      rename: i18n('dataroom.new_folder'),
      unique: maxKey + 1,
      id: maxKey + 1,
      isCreatingFolder: true,
    })
    this.setState({ data: newData, name: i18n('dataroom.new_folder') })
  }

  showModal = () => {
    this.setState({ visible: true })
  }
  hideModal = () => {
    this.setState({ visible: false, newUser: null })
  }

  handleNewFolderNameChange(unique, evt) {
    const newData = this.state.data.slice()
    const index = newData.map(m => m.unique).indexOf(unique)
    if (index > -1) {
      newData[index].rename = evt.target.value
      this.setState({ data: newData })
    }
  }

  handleConfirm(unique) {
    const newData = this.state.data.slice()
    const index = newData.map(m => m.unique).indexOf(unique)
    if (index < 0) return
    const value = this.state.data[index]
    if (value.isCreatingFolder) {
      // Create new folder
      const parentIndex = newData.map(m => m.id).indexOf(value.parentId)
      
      const currentFiles=newData.filter(f=>{return f.parentId==value.parentId}).slice(1)

      if(currentFiles.some(item=>{return Object.is(item.name,value.rename)}))
      {
        Modal.error({
            title: '不支持的文件夹名字',
            content: '已存在相同的文件夹名字',
          })
        return 
      }
      const body = {
        dataroom: Number(this.state.id),
        filename: value.rename,
        isFile: false,
        orderNO: 1,
        parent: value.parentId == -999 ? null : value.parentId
      }

      newData.splice(index, 1)

      api.addDataRoomFile(body).then(data => {
        const item = data.data
        const parentId = item.parent || -999
        const name = item.filename
        const rename = item.filename
        const unique = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime || item.createdtime
        const justCreated = true; // 以此为标识用户刚新建的文件夹，否则会被自动隐藏空文件夹功能隐藏
        const newItem = { ...item, parentId, name, rename, unique, isFolder, date, justCreated }
        newData.push(newItem)
        this.setState({ data: newData })
      }).catch(error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    } else {
      // Rename
      const body = {
        id: value.id,
        filename: value.rename
      }
      api.editDataRoomFile(body).then(data => {
        newData[index].name = newData[index].rename
        this.setState({ data: newData })
      }).catch(error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }
  }

  handleCancel(unique) {
    const newData = this.state.data.slice()
    const index = newData.map(m => m.unique).indexOf(unique)
    if (index < 0) return
    const value = newData[index]
    const name = value.name
    if (value.isCreatingFolder) {
      newData.splice(index, 1)
      this.setState({ data: newData })
    } else {
      newData[index].rename = newData[index].name
      this.setState({ data: newData })
    }
  }

  handleDeleteFiles(idArr) {
    const body = {
      filelist: idArr
    }
    api.deleteDataRoomFile(body).then(data => {
      const newData = this.state.data.slice()
      idArr.map(d => {
        const index = newData.map(m => m.id).indexOf(d)
        newData.splice(index, 1)
      })
      const newFileUserList = this.state.fileUserList.filter(f => !idArr.includes(f.file));
      this.setState({ data: newData, fileUserList: newFileUserList });
    }).catch(error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleOnMoveFiles(files, targetID) {
    const targetFile = this.state.data.filter(f => f.id === targetID)[0]
    if (files.filter(f => f.dataroom !== targetFile.dataroom).length > 0 ) {
      Modal.error({
        title: i18n('dataroom.message.error_move_files_title'),
        content: i18n('dataroom.message.error_move_files_content')
      })
      return
    }
    files.map(m => {
      const body = {
        id: m.id,
        parent: targetID == -999 ? null : targetID
      }
      api.editDataRoomFile(body).then(data => {
        const index = this.state.data.map(m => m.id).indexOf(m.id)
        this.state.data[index].parentId = targetID
        this.setState({ data: this.state.data })
      }).catch(error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    })
  }

  handleUploadFile(file, parentId) {
    const body = {
      dataroom: parseInt(this.state.id),
      filename: file.name,
      isFile: true,
      orderNO: 1,
      parent: parentId == -999 ? null : parentId,
      key: file.response.result.key,
      size: file.size,
      bucket: 'file',
      realfilekey: file.response.result.realfilekey,
    }

    api.addDataRoomFile(body).then(data => {
      const item = data.data
      const parentId = item.parent || -999

      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date }
      const newData = this.state.data;
      newData.push(newItem)
      this.setState({ data: newData })
    }).catch(error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleSelectFileUser = (file, user) => {
    const list = [...this.state.fileUserList, {file, user}]
    this.setState({ fileUserList: list })
    const files = list.filter(item => item.user == user).map(item => item.file)
    this.editUserFileList(user, files)
  }

  handleDeselectFileUser = (file, user) => {
    const list = this.state.fileUserList.filter(item => {
      return !(item.file == file && item.user == user)
    })
    this.setState({ fileUserList: list })
    const files = list.filter(item => item.user == user).map(item => item.file)
    this.editUserFileList(user, files)
  }

  editUserFileList = (user, files) => {
    const id = this.state.userDataroomMap[user]
    api.editUserDataRoomFile(id, {files}).then(result => {
      this.getAllUserFile()
    }).catch(error => {
      handleError(error)
    })
  }

  handleChangeUser = (value) => {
    this.setState({ newUser: value })
  }

  handleAddUser = () => {
    const { id, newUser } = this.state
    const param = { dataroom: id, user: newUser, trader: isLogin().id };
    api.addUserDataRoom(param).then(result => {
      this.setState({ newUser: null })
      this.getAllUserFile()
      const { id: dataroomUserfile, dataroom, user } = result.data;
      const body = { dataroomUserfile, dataroom, user };
      if (this.state.hasPermissionForDataroomTemp) {
        this.handleSaveTemplate(body);
      }
    }).catch(error => {
      handleError(error)
    })
  }

  handleDeleteUser = (item) => {
    const { id: dataroomUserId, user: { id: userId } } = item;
    const userDataroomTemp = this.state.dataRoomTemp.filter(f => f.user === userId);
    api.deleteUserDataRoom(dataroomUserId).then(result => {
      this.getAllUserFile()
      if (userDataroomTemp.length > 0) {
        api.deleteDataroomTemp(userDataroomTemp[0].id);
      }
    }).catch(error => {
      handleError(error)
    })
  }

  handleSendEmail = item => {
    api.sendEmailToDataroomUser(item.id)
      .then(result => {
        echo(result);
        Modal.success({ title: '邮件发送成功' });
      })
      .catch(handleError);
    
  }

  handleSelectUser = (value) => {
    if (value === this.state.selectedUser) {
      this.setState({ selectedUser: null, targetUserFileList: [] });
    } else {
      const list = this.state.fileUserList.filter(item => item.user == value)
      this.setState({ selectedUser: value, targetUserFileList: list });
    }
  }

  handleToggleVisible = (id) => {
    const { selectedUser, targetUserFileList } = this.state
    var list = targetUserFileList.map(item => item.file)

    var index = list.indexOf(id)
    if (index > -1) {
      list = [...list.slice(0, index), ...list.slice(index + 1)]
    } else {
      list = [...list, id]
    }

    this.editUserFileList(selectedUser, list)
  }

  handleMultiVisible = (ids) => {
    const { selectedUser, targetUserFileList } = this.state
    var list = targetUserFileList.map(item => item.file)
    var list2 = [...list]
    ids.forEach(id => {
      if (!list2.includes(id)) {
        list2.push(id)
      }
    })
    this.editUserFileList(selectedUser, list2)
  }

  handleMultiInvisible = (ids) => {
    const { selectedUser, targetUserFileList } = this.state
    var list = targetUserFileList.map(item => item.file)

    var list2 = [...list]
    ids.forEach(id => {
      if (list.includes(id)) {
        let index = list2.indexOf(id)
        list2 = [...list2.slice(0,index), ...list2.slice(index + 1)]
      }
    })

    this.editUserFileList(selectedUser, list2)
  }

  checkDataRoomStatus = isDownloadingSelectedFiles => {
    const user = this.state.downloadUser && this.state.downloadUser.id;
    const water = this.state.downloadUser ? this.state.downloadUser.username + ',' + (this.state.downloadUser.org ? this.state.downloadUser.org.orgname : '多维海拓') + ',' + this.state.downloadUser.email : null;
    const files = this.state.selectedFiles.map(m => m.id).join(',');
    const password = this.state.pdfPassword;
    const params = { water, user };
    if (password) {
      params.password = password;
    }
    if (isDownloadingSelectedFiles) {
      params.files = files;
    }
    api.createAndCheckDataroomZip(this.state.id, params)
      .then(result => {
        if (result.data.code === 8005) {
          const part = isDownloadingSelectedFiles ? 1 : 0;
          this.setState({ 
            loading: false, 
            downloadUrl: api.downloadDataRoom(this.state.id, this.state.downloadUser && this.state.downloadUser.id, part),
            downloadUser: isLogin(),
          });
          // 重置下载链接， 防止相同下载链接不执行
          setTimeout(() => this.setState({ downloadUrl: null, disableEditPassword: false, pdfPassword: '' }), 1000);
        } else {
          this.setState({ loading: false, disableEditPassword: true });
          let waitingTime = '';
          if (result.data.seconds) {
            waitingTime = `${result.data.seconds}秒`
          }
          Modal.info({
            title: '请求已发送成功',
            content: <div>请耐心等待<span style={{ color: 'red', fontWeight: 'bold' }}>{waitingTime}</span>，稍后重试</div>, 
          })
        }
      })
      .catch(error => this.setState({ loading: false }, () => handleError(error)));
  }

  handleDownloadBtnClicked = () => {
    this.setState({ loading: true, visible: false });
    this.checkDataRoomStatus();
  }

  handleDownloadSelectedFilesBtnClicked = () => {
    this.setState({ loading: true, visible: false });
    this.checkDataRoomStatus(true);
  }

  handleSaveTemplate = (body) => {
    // const { dataroom: { id: dataroom }, id: dataroomUserfile, user: { id: user } } = item;
    // const body = { dataroomUserfile, dataroom, user };
    api.addDataroomTemp(body).then(() => {
      // Modal.success({ title: '成功', content: '模版保存成功!' });
      this.getDataRoomTemp();
    }).catch(handleError);
  }

  handleApplyTemplate = (item) => {
    // const { user: { id: userId } } = item;
    // this.dataRoomTempModalUserId = userId;
    this.setState({ showDataRoomTempModal: true });
  }

  handleConfirmSelectDataroomTemp = () => {
    const body = { user: this.state.dataRoomTempModalUserId };
    api.applyDataroomTemp(this.state.selectedDataroomTemp, body).then(() => {
      this.setState({ showDataRoomTempModal: false }, this.getAllUserFile);
    });
    api.editDataroomTemp(
      this.state.selectedDataroomTemp,
      { password: this.state.pdfPasswordForTemp },
    ).then(this.getDataRoomTemp);
  }

  handlePasswordChange = e => {
    this.setState({ pdfPassword: e.target.value });
  }

  handleDataroomSearch = async (content) => {
    if (!content) {
      this.setState({ data: this.allDataroomFiles });
      return;
    }
    this.setState({ loading: true });
    const req = await api.searchDataroom(this.state.id, content);
    const { data } = req.data;

    let newData = this.formatSearchData(data);
    if (this.state.parentId !== -999) {
      const allParents = this.findAllParents(this.state.parentId);
      const parentFolder = this.allDataroomFiles.filter(f => f.id === this.state.parentId);
      newData = newData.concat(allParents).concat(parentFolder);
    }
    this.setState({ loading: false, data: newData });
  }

  handleClickAllFilesBtn = () => {
    this.setState(
      { searchContent: '', parentId: -999 },
      () => this.handleDataroomSearch(this.state.searchContent),
    );
  }

  handleClickFolder = file => {
    this.setState({ parentId: file.id });
  }

  findAllParents = (fileId) => {
    let allParents = [];
    const react = this;
    function findParents (id) {
      const currentFile = react.allDataroomFiles.filter(f => f.id === id);
      const parent = react.allDataroomFiles.filter(f => f.id === currentFile[0].parent);
      allParents = allParents.concat(parent);
      if (parent.length > 0) {
        findParents(parent[0].id);
      }
      return allParents;
    }
    return findParents(fileId);
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n('dataroom.project_name')} 
        name={this.state.title}
        // style={disableSelect}
      >
      
        {hasPerm('dataroom.admin_adddataroom') || this.state.isMakeUser || this.state.isTakeUser ?
          <div style={{ marginBottom: 20, marginTop: 6 }}>
            <DataRoomUser
              list={this.state.list}
              newUser={this.state.newUser}
              onSelectUser={this.handleChangeUser}
              onAddUser={this.state.hasPermissionForDataroomTemp ? this.handleAddUser : undefined}
              onDeleteUser={this.handleDeleteUser}
              selectedUser={this.state.selectedUser}
              onChange={this.handleSelectUser}
              onSendEmail={this.handleSendEmail}
              onSaveTemplate={this.state.hasPermissionForDataroomTemp ? this.handleSaveTemplate : undefined}
              onApplyTemplate={this.state.hasPermissionForDataroomTemp ? this.handleApplyTemplate : undefined}
              dataRoomTemp={this.state.dataRoomTemp}
            />
          </div>
          : null}

        <div style={{ marginBottom: '16px' }} className="clearfix">
          <Search
            style={{ width: 200, float: 'right' }}
            placeholder="文件/目录"
            onSearch={this.handleDataroomSearch}
            onChange={searchContent => this.setState({ searchContent })}
            value={this.state.searchContent}
          />
        </div>

        <FileMgmt
          location={this.props.location}
          isClose={this.state.isClose}
          data={this.state.data}
          onCreateNewFolder={this.handleCreateNewFolder.bind(this)}
          onManageUser={this.showModal}
          userOptions={this.state.userOptions}
          fileUserList={this.state.fileUserList}
          onSelectFileUser={this.handleSelectFileUser}
          onDeselectFileUser={this.handleDeselectFileUser}
          onNewFolderNameChange={this.handleNewFolderNameChange.bind(this)}
          onConfirm={this.handleConfirm.bind(this)}
          onCancel={this.handleCancel.bind(this)}
          onDeleteFiles={this.handleDeleteFiles.bind(this)}
          onMoveFiles={this.handleOnMoveFiles.bind(this)}
          onUploadFile={this.handleUploadFile.bind(this)}
          selectedUser={this.state.selectedUser}
          onSelectUser={this.handleSelectUser}
          loading={this.state.loading}
          targetUserFileList={this.state.targetUserFileList}
          onToggleVisible={this.handleToggleVisible}
          onMultiVisible={this.handleMultiVisible}
          onMultiInvisible={this.handleMultiInvisible}
          onDownloadBtnClicked={(selectedFiles) => this.setState({ visible: true, selectedFiles })}
          isMakeUser={this.state.isMakeUser}
          isTakeUser={this.state.isTakeUser}
          onClickAllFilesBtn={this.handleClickAllFilesBtn}
          onClickFolder={this.handleClickFolder}
        />

        <iframe style={{display: 'none' }} src={this.state.downloadUrl}></iframe>

          <Modal
            title="请选择全部下载或者选中文件下载"
            footer={null}
            onCancel={this.hideModal}
            closable={true}
            visible={this.state.visible}>
          <DataRoomUserList
            list={this.state.list.filter(f => this.state.fileUserList.map(m => m.user).includes(f.user.id))}
            selectedUser={this.state.downloadUser}
            onChange={user => this.setState({ downloadUser: user })}
            onConfirm={this.handleDownloadBtnClicked}
            onDownloadSelectedFiles={this.handleDownloadSelectedFilesBtnClicked}
            disableDownloadSelectedFilesButton={this.state.selectedFiles.filter(f => f.isFile).length === 0}
            displayEditPasswordField={(hasPerm('usersys.as_trader') || isLogin().is_superuser) || this.state.isMakeUser || this.state.isTakeUser}
            password={this.state.pdfPassword}
            passwordChange={this.handlePasswordChange}
            disableEditPassword={this.state.disableEditPassword}
          />
          </Modal>

        {this.state.showDataRoomTempModal &&
          <Modal
            title="选择Dataroom模版"
            visible={true}
            onOk={this.handleConfirmSelectDataroomTemp}
            onCancel={() => this.setState({ showDataRoomTempModal: false })}
          >
            <div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <Select
                    defaultValue={this.state.dataRoomTemp.length > 0 ? '' + this.state.dataRoomTemp[0].id : undefined}
                    style={{ width: 120 }}
                    onChange={value => this.setState({ selectedDataroomTemp: value })}
                    value={this.state.selectedDataroomTemp + ''}
                  >
                    {this.state.dataRoomTemp.map(m => <Option key={m.id} value={m.id + ''}>{m.userInfo.username}</Option>)}
                  </Select>
                </div>
                <div style={{ margin: '0 10px' }}>应用到</div>
                <div>
                  <Select
                    defaultValue={this.state.list.length > 0 ? '' + this.state.list[0].user.id : undefined}
                    style={{ width: 120 }}
                    onChange={value => this.setState({ dataRoomTempModalUserId: value })}
                    value={this.state.dataRoomTempModalUserId + ''}
                  >
                    {this.state.list.map(m => m.user).map(m => <Option key={m.id} value={m.id + ''}>{m.username}</Option>)}
                  </Select>
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'grid', width: 400, gridTemplateColumns: 'auto 1fr' }}>
                <div style={{ alignSelf: 'center', marginRight: 10 }}>设置pdf默认编辑密码</div>
                <Input
                  placeholder="不输入该密码，pdf文件将默认不加密"
                  value={this.state.pdfPasswordForTemp}
                  onChange={e => this.setState({ pdfPasswordForTemp: e.target.value })}
                />
                <div style={{ gridColumn: 2, fontSize: 12, fontStyle: 'oblique' }}>该密码仅针对pdf文件有效</div>
              </div>

            </div>
          </Modal>
        }

        <Modal
          title="新文件"
          footer={null}
          onCancel={() => this.setState({ showNewFileModal: false })}
          closable
          visible={this.state.showNewFileModal}
        >
          {this.state.newDataroomFile.map(m => {
            return (
              <li><a href={m.fileurl} target="_blank">{m.filename}</a></li>
            );
          })}
        </Modal>

      </LeftRightLayout>
    )
  }
}

export default connect()(DataRoom)
