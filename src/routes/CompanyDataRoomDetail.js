import React from 'react'
import { connect } from 'dva'
import LeftRightLayout from '../components/LeftRightLayout'
import CompanyFileMgmt from '../components/CompanyFileMgmt';
import * as api from '../api'
import { Modal } from 'antd'
import { getURLParamValue, isLogin, i18n, handleError } from '../utils/util'
import { 
  DataRoomUser, 
  DataRoomUserList, 
} from '../components/DataRoomUser';
import Tree from 'antd/lib/tree';
import { Search } from '../components/Search';

class DataRoom extends React.Component {

  constructor(props) {
    super(props)

    const id = getURLParamValue(props, 'id');
    const isClose = getURLParamValue(props, 'isClose');
    const projectTitle = getURLParamValue(props, 'projectTitle');
    const parentID = getURLParamValue(props, 'parentID');
    const projectID = getURLParamValue(props, 'projectID');

    this.state = {
      id: id,
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
      downloadUser: null,
      loading: false,

      searchContent: '',

      parentId: parseInt(parentID, 10) || -999,

      projectID,
      isProjTrader: false,
    }

    this.allDataroomFiles = [];
  }

  componentDidMount() {
    api.getProjLangDetail(this.state.projectID)
      .then(res => {
        const { projTraders } = res.data;
        const isProjTrader = projTraders ? projTraders.filter(f => f.user).map(m => m.user.id).includes(isLogin().id) : false;
        this.setState({
          title: res.data.projtitle,
          isProjTrader,
        });
      })
      .catch(handleError);
    this.getDataRoomFile()
    this.getAllUserFile()
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
      this.setState({ list, userOptions, userDataroomIds, userDataroomMap })
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
    if (!value.id) {
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
        const newItem = { ...item, parentId, name, rename, unique, isFolder, date }
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
    if (!value.id) {
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
      this.setState({ data: newData })
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
    }).catch(error => {
      handleError(error)
    })
  }

  handleDeleteUser = (id) => {
    api.deleteUserDataRoom(id).then(result => {
      this.getAllUserFile()
    }).catch(error => {
      handleError(error)
    })
  }

  handleSelectUser = (value) => {
    this.setState({ selectedUser: value })
    const list = this.state.fileUserList.filter(item => item.user == value)
    this.setState({ targetUserFileList: list })
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

  checkDataRoomStatus = () => {

    const water = this.state.downloadUser ? this.state.downloadUser.username + ',' + (this.state.downloadUser.org ? this.state.downloadUser.org.orgname : '多维海拓') + ',' + this.state.downloadUser.email : null;

    api.checkDataRoomStatus(this.state.id, this.state.downloadUser && this.state.downloadUser.id, water)
      .then(result => {
        if (result.data.code === 8005) {
          this.setState({ 
            loading: false, 
            downloadUrl: api.downloadDataRoom(this.state.id, this.state.downloadUser && this.state.downloadUser.id),
            downloadUser: null
          });
          // 重置下载链接， 防止相同下载链接不执行
          setTimeout(() => this.setState({ downloadUrl: null }), 1000);
        } else {
          this.setState({ loading: false });
          Modal.info({
            title: '请求已发送成功',
            content: '请耐心等待并稍后重试', 
          })
        }
      });
  }

  handleDownloadBtnClicked = () => {
    this.setState({ loading: true, visible: false });
    this.checkDataRoomStatus();
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
    this.setState({ loading: false, data: newData })
  }

  handleClickAllFilesBtn = () => {
    if (!this.state.searchContent) return;
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

  createOrFindFolder = async (folderName, parentFolderID) => {
    // 检查当前目录下是否有同名文件夹
    const files = this.state.data.filter(f => f.parentId === parentFolderID);
    const sameNameFolderIndex = files.map(item => item.name).indexOf(folderName);
    if (sameNameFolderIndex > -1) {
      window.echo('find duplaicate folder', files[sameNameFolderIndex]);
      return files[sameNameFolderIndex].id;
    }

    const body = {
      dataroom: Number(this.state.id),
      filename: folderName,
      isFile: false,
      orderNO: 1,
      parent: parentFolderID == -999 ? null : parentFolderID,
    }
    const data = await api.addDataRoomFile(body);
    const item = data.data
    const parentId = item.parent || -999
    const name = item.filename
    const rename = item.filename
    const unique = item.id
    const isFolder = !item.isFile
    const date = item.lastmodifytime || item.createdtime
    const justCreated = true; // 以此为标识用户刚新建的文件夹，否则会被自动隐藏空文件夹功能隐藏
    const newItem = { ...item, parentId, name, rename, unique, isFolder, date, justCreated }
    const newData = this.state.data.slice();
    newData.push(newItem);
    this.setState({ data: newData });
    return unique;
  }
  
  createOrFindFolderLoop = async (folderArr, initialParentId) => {
    let parentFolderID = initialParentId;
    for (let index = 0; index < folderArr.length; index++) {
      const folderName = folderArr[index];
      const newFolderId = await this.createOrFindFolder(folderName, parentFolderID);
      parentFolderID = newFolderId;
    }
    return parentFolderID;
  }

  async handleUploadFileWithDir(file, parentId) {
    const { webkitRelativePath } = file;
    const splitPath = webkitRelativePath.split('/');
    const dirArray = splitPath.slice(0, splitPath.length - 1);
    const finalFolderID = await this.createOrFindFolderLoop(dirArray, parentId);

    const files = this.state.data.filter(f => f.parentId === finalFolderID);
    if (files.some(item => item.name == file.name)) {
      message.warning(`文件 ${file.webkitRelativePath} 已存在`);
      return;
    }
    const body = {
      dataroom: parseInt(this.state.id),
      filename: file.name,
      isFile: true,
      orderNO: 1,
      parent: finalFolderID == -999 ? null : finalFolderID,
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
      const newData = this.state.data.slice();
      newData.push(newItem)
      this.setState({ data: newData });
    }).catch(error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n('dataroom.project_name')} 
        name={this.state.title}
      >
      
        {/* {hasPerm('dataroom.admin_adddataroom') ?
          <div style={{ marginBottom: 20, marginTop: 6 }}>
            <DataRoomUser
              list={this.state.list}
              newUser={this.state.newUser}
              onSelectUser={this.handleChangeUser}
              onAddUser={this.handleAddUser}
              onDeleteUser={this.handleDeleteUser}
              selectedUser={this.state.selectedUser}
              onChange={this.handleSelectUser}
            />
          </div>
          : null} */}

        <div style={{ marginBottom: '16px' }} className="clearfix">
          <Search
            style={{ width: 200, float: 'right' }}
            placeholder="文件名/文件内容"
            onSearch={this.handleDataroomSearch}
            onChange={searchContent => this.setState({ searchContent })}
            value={this.state.searchContent}
          />
        </div>

        <CompanyFileMgmt
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
          onDownloadBtnClicked={() => this.setState({ visible: true})}
          onClickAllFilesBtn={this.handleClickAllFilesBtn}
          onClickFolder={this.handleClickFolder}
          isProjTrader={this.state.isProjTrader}
          onUploadFileWithDir={this.handleUploadFileWithDir.bind(this)}
        />

        <iframe style={{display: 'none' }} src={this.state.downloadUrl}></iframe>

          <Modal
            title={i18n('choose_investor_download')}
            footer={null}
            onCancel={this.hideModal}
            closable={false}
            visible={this.state.visible}>
          <DataRoomUserList
              list={this.state.list.filter(f => this.state.fileUserList.map(m => m.user).includes(f.user.id))}
              selectedUser={this.state.downloadUser}
              onChange={user => this.setState({ downloadUser: user })}
              onConfirm={this.handleDownloadBtnClicked}
              />
          </Modal>
      </LeftRightLayout>
    )
  }
}

export default connect()(DataRoom)
