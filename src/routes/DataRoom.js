import React from 'react'
import { connect } from 'dva'
import LeftRightLayout from '../components/LeftRightLayout'
import FileMgmt from '../components/FileMgmt'
import * as Api from '../api'
import { Modal } from 'antd'
import { hasPerm, isLogin } from '../utils/util'

class DataRoomList extends React.Component {

  constructor(props) {
    super(props)
    this.dataRoomRelation = []

    let data = []
    if (hasPerm('dataroom.admin_getdataroom')) {
      data = [
        {
          id: -3,
          name: 'Investor Folder',
          rename: 'Investor Folder',
          unique: -3,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -2,
          name: 'Project Owner Folder',
          rename: 'Project Owner Folder',
          unique: -2,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -1,
          name: 'Public Folder',
          rename: 'Public Folder',
          unique: -1,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        }
      ]
    } else if (isLogin().id === parseInt(this.props.location.query.projectOwnerID, 10)) {
      data = [
        {
          id: -2,
          name: 'Project Owner Folder',
          rename: 'Project Owner Folder',
          unique: -2,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -1,
          name: 'Public Folder',
          rename: 'Public Folder',
          unique: -1,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        }
      ]
    } else if (isLogin().id === parseInt(this.props.location.query.investorID, 10)) {
      data = [
        {
          id: -3,
          name: 'Investor Folder',
          rename: 'Investor Folder',
          unique: -3,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -1,
          name: 'Public Folder',
          rename: 'Public Folder',
          unique: -1,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        }
      ]
    } else {
      data = [
        {
          id: -1,
          name: 'Public Folder',
          rename: 'Public Folder',
          unique: -1,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        }
      ]
    }
    this.state = {
      title: decodeURIComponent(this.props.location.query.projectTitle),
      data: data
    }
  }

  componentDidMount() {
    let queryDataRoomArr = []
    if (hasPerm('dataroom.admin_getdataroom')) {
      queryDataRoomArr = [
        // Public Folder
        Api.queryDataRoom({
          proj: this.props.location.query.projectID,
          isPublic: 1
        }),
        // Project Owner Folder
        Api.queryDataRoom({
          proj: this.props.location.query.projectID,
          user: this.props.location.query.projectOwnerID,
          isPublic: 0
        }),
        // Investor Folder
        Api.queryDataRoom({
          proj: this.props.location.query.projectID,
          investor: this.props.location.query.investorID,
          isPublic: 0
        }),
      ]
    } else {
      queryDataRoomArr = [
        Api.queryDataRoom({
          proj: this.props.location.query.projectID,
          isPublic: 1
        })
      ]
      if (isLogin().id === parseInt(this.props.location.query.projectOwnerID, 10)) {
        queryDataRoomArr.push(
          Api.queryDataRoom({
            proj: this.props.location.query.projectID,
            user: this.props.location.query.projectOwnerID,
            isPublic: 0
          })
        )
      } else if (isLogin().id === parseInt(this.props.location.query.investorID, 10)) {
        queryDataRoomArr.push(
          Api.queryDataRoom({
            proj: this.props.location.query.projectID,
            investor: this.props.location.query.investorID,
            isPublic: 0
          })
        )
      }
    }
    Promise.all(queryDataRoomArr)
    .then(data => {
      // return
      let getDataRoomFileArr = []
      if (hasPerm('dataroom.admin_getdataroom')) {
        this.dataRoomRelation[data[2].data.data[0].id] = -3
        this.dataRoomRelation[data[1].data.data[0].id] = -2
        this.dataRoomRelation[data[0].data.data[0].id] = -1

        const newData = this.state.data.slice()
        newData[0]['dataroom'] = data[2].data.data[0].id
        newData[1]['dataroom'] = data[1].data.data[0].id
        newData[2]['dataroom'] = data[0].data.data[0].id

        newData[0].name = data[2].data.data[0].investor.username
        newData[0].rename = data[2].data.data[0].investor.username
        newData[1].name = data[1].data.data[0].proj.supportUser.username
        newData[1].rename = data[1].data.data[0].proj.supportUser.username

        this.setState({ data: newData })

        getDataRoomFileArr = [
          Api.getDataRoomFile({ dataroom: data[2].data.data[0].id }), // Investor Folder
          Api.getDataRoomFile({ dataroom: data[1].data.data[0].id }), // Project Owner Folder
          Api.getDataRoomFile({ dataroom: data[0].data.data[0].id }) // Public Folder
        ]
      } else {
        this.dataRoomRelation[data[0].data.data[0].id] = -1
        const newData = this.state.data.slice()
        getDataRoomFileArr = [
          Api.getDataRoomFile({ dataroom: data[0].data.data[0].id })
        ]
        if (isLogin().id === parseInt(this.props.location.query.projectOwnerID, 10)) {
          this.dataRoomRelation[data[1].data.data[0].id] = -2
          newData[0]['dataroom'] = data[1].data.data[0].id
          newData[0].name = data[1].data.data[0].proj.supportUser.username
          newData[0].rename = data[1].data.data[0].proj.supportUser.username

          getDataRoomFileArr.push(
            Api.getDataRoomFile({ dataroom: data[1].data.data[0].id })
          )
        } else if (isLogin().id === parseInt(this.props.location.query.investorID, 10)) {
          this.dataRoomRelation[data[1].data.data[0].id] = -3
          newData[0]['dataroom'] = data[1].data.data[0].id
          newData[0].name = data[1].data.data[0].investor.username
          newData[0].rename = data[1].data.data[0].investor.username
          getDataRoomFileArr.push(
            Api.getDataRoomFile({ dataroom: data[1].data.data[0].id })
          )
        }
        this.setState({ data: newData })
      }

      return Promise.all(getDataRoomFileArr)
    }).then(data => {
      const formattedData = data.map((m, index) => m.data.data.map(item => {
        let parent
        if (hasPerm('dataroom.admin_getdataroom')) {
          switch (index) {
            case 0:
              parent = -3
              break
            case 1:
              parent = -2
              break
            case 2:
              parent = -1
              break
          }
        } else {
          if (isLogin().id === parseInt(this.props.location.query.projectOwnerID, 10)) {
            switch (index) {
              case 0:
                parent = -1
                break
              case 1:
                parent = -2
                break
            }
          } else if (isLogin().id === parseInt(this.props.location.query.investorID, 10)) {
            switch (index) {
              case 0:
                parent = -1
                break
              case 1:
                parent = -3
                break
            }
          } else {
            parent = -1
          }
        }
        const parentId = item.parent || parent
        const name = item.filename
        const rename = item.filename
        const unique = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime
        return { ...item, parentId, name, rename, unique, isFolder, date }
      })).reduce((acc, val) => acc.concat(val), [])
      const newData = this.state.data.concat(formattedData)
      this.setState({ data: newData }, () => {
        // Create children of shadow directory
        this.state.data.filter(f => f.isShadow).map(m => {
          this.findAllSubFiles(m.shadowdirectory)
          this.createShadowFiles(this.allSubFiles, m.shadowdirectory, m.id)
        })
        this.setState({ data: this.state.data.concat(this.shadowContents)})
      })

    }).catch(err => {
      this.props.dispatch({
        type: 'app/findError',
        payload: err
      })
    })
  }

  handleCreateNewFolder(parentId) {
    const newData = this.state.data.slice()
    const existKeyList = newData.map(m => m.unique)
    const maxKey = Math.max(...existKeyList)

    newData.splice(0, 0, {
      name: "新建文件夹",
      isFolder: true,
      parentId: parentId,
      rename: "新建文件夹",
      unique: maxKey + 1,
    })
    this.setState({ data: newData, name: "新建文件夹" })
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
      if (parentIndex < 0) return
      const dataroom = newData[parentIndex].dataroom
      const body = {
        dataroom: dataroom,
        filename: value.rename,
        isFile: false,
        orderNO: 1,
        parent: [-1, -2, -3].includes(value.parentId) ? null : value.parentId
      }

      newData.splice(index, 1)

      Api.addToDataRoom(body).then(data => {
        const item = data.data
        const parentId = item.parent || this.dataRoomRelation[item.dataroom]
        const name = item.filename
        const rename = item.filename
        const unique = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime
        const newItem = { ...item, parentId, name, rename, unique, isFolder, date }
        newData.push(newItem)
        this.setState({ data: newData })
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    } else {
      // Rename
      const body = {
        fileid: value.id,
        filename: value.rename
      }
      Api.editInDataRoom(body).then(data => {
        newData[index].name = newData[index].rename
        this.setState({ data: newData })
      }, error => {
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
    Api.deleteFromDataRoom(body).then(data => {
      const newData = this.state.data.slice()
      idArr.map(d => {
        const index = newData.map(m => m.id).indexOf(d)
        newData.splice(index, 1)
      })
      this.setState({ data: newData })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleCopyFiles(files, targetID) {
    const targetFile = this.state.data.filter(f => f.id === targetID)[0]
    if (files.map(m => m.dataroom).includes(targetFile.dataroom)) {
      Modal.error({
        title: '不能在同一个 data room 中进行复制操作',
        content: '每个角色对应的目录为一个 data room，复制操作只有在跨 data room 的时候才允许执行 ',
      })
      return
    }
    files.map(m => {
      const body = {
        isShadow: true,
        shadowdirectory: m.id,
        dataroom: targetFile.dataroom,
        filename: m.filename,
        isFile: m.isFile,
        parent: [-1, -2, -3].includes(targetID) ? null : targetID
      }
      Api.addToDataRoom(body).then(data => {
        this.findAllSubFiles(m.id)
        const newData = this.state.data.slice()
        const item = data.data
        const parentId = item.parent || this.dataRoomRelation[item.dataroom]
        const name = item.filename
        const rename = item.filename
        const unique = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime
        const newItem = { ...item, parentId, name, rename, unique, isFolder, date }
        newData.push(newItem)

        this.createShadowFiles(this.allSubFiles, m.id, unique)

        this.setState({ data: newData.concat(this.shadowContents) })
      })
      .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
    })
  }

  allSubFiles = []
  findAllSubFiles = id => {
    const subObjArr = this.state.data.filter(f => f.parentId === id)
    if (subObjArr.length === 0) {
      return this.allSubFiles
    } else {
      this.allSubFiles = this.allSubFiles.concat(subObjArr)
      return subObjArr.map(m => this.findAllSubFiles(m.id))
    }
  }

  shadowContents = []
  data = []
  createShadowFiles(files, oldParentId, newParentId) {
    let content = files.slice()
    if (content.length === 0) return this.shadowContents
    const contentId = content.map(m => m.id)
    content.filter(f => f.parentId === oldParentId).map(m => {
      const existKeyList = this.data.map(m => m.unique)
      const maxKey = Math.max(...existKeyList)
      const id = maxKey + 99
      const unique = id
      const parentId = newParentId
      const isVirtual = true

      const rootIndex = contentId.indexOf(m.id)
      if (rootIndex > -1) {
        content.splice(rootIndex, 1)
      }
      const newValue = { ...m, id, unique, parentId, isVirtual }
      this.shadowContents = this.shadowContents.concat(newValue)
      this.data = this.data.concat(newValue)
      return this.createShadowFiles(content, m.id, id)
    })
  }

  handleOnMoveFiles(files, targetID) {
    files.map(m => {
      const body = {
        fileid: m.id,
        parent: [-1, -2, -3].includes(targetID) ? null : targetID
      }
      Api.editInDataRoom(body).then(data => {
        const index = this.state.data.map(m => m.id).indexOf(m.id)
        this.state.data[index].parentId = targetID
        this.setState({ data: this.state.data })
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    })
  }

  handleUploadFile(file, parentId) {
    const newData = this.state.data
    const parentIndex = newData.map(m => m.id).indexOf(parentId)
    if (parentIndex < 0) return
    const dataroom = newData[parentIndex].dataroom
    const body = {
      dataroom: dataroom,
      filename: file.name,
      isFile: true,
      orderNO: 1,
      parent: [-1, -2, -3].includes(parentId) ? null : parentId,
      key: file.response.result.key,
      size: file.size,
      bucket: 'file'
    }

    Api.addToDataRoom(body).then(data => {
      const item = data.data
      const parentId = item.parent || this.dataRoomRelation[item.dataroom]
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date }
      newData.push(newItem)
      this.setState({ data: newData })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render () {
    this.allSubFiles = []
    this.shadowContents = []
    this.data = this.state.data.slice()
    return (
      <LeftRightLayout
        location={this.props.location}
        title={'项目名称：' + this.state.title}>

        <FileMgmt
          location={this.props.location}
          data={this.state.data}
          onCreateNewFolder={this.handleCreateNewFolder.bind(this)}
          onNewFolderNameChange={this.handleNewFolderNameChange.bind(this)}
          onConfirm={this.handleConfirm.bind(this)}
          onCancel={this.handleCancel.bind(this)}
          onDeleteFiles={this.handleDeleteFiles.bind(this)}
          onCopyFiles={this.handleCopyFiles.bind(this)}
          onMoveFiles={this.handleOnMoveFiles.bind(this)}
          onUploadFile={this.handleUploadFile.bind(this)} />

      </LeftRightLayout>
    )
  }
}

export default connect()(DataRoomList)
