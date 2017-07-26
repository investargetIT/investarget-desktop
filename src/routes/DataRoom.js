import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import FileMgmt from '../components/FileMgmt'
import * as Api from '../api'

class DataRoomList extends React.Component {

  constructor(props) {
    super(props)
    this.dataRoomRelation = []
    this.state = {
      title: '项目名称',
      data: [
        {
          id: -3,
          name: 'Investor Folder',
          rename: 'Investor Folder',
          key: -3,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -2,
          name: 'Project Owner Folder',
          rename: 'Project Owner Folder',
          key: -2,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -1,
          name: 'Public Folder',
          rename: 'Public Folder',
          key: -1,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        }
      ]
    }
  }

  componentDidMount() {
    Api.queryDataRoomDetail(this.props.location.query.id).then(data => {
      const project = data.data.proj
      const investor = data.data.investor
      const projectOwner = project.supportUser
      const newData = this.state.data.slice()
      newData[0].name = investor.username
      newData[0].rename = investor.username
      newData[1].name = projectOwner.username
      newData[1].rename = projectOwner.username
      this.setState({
        title: project.projtitle,
        data: newData
      })

      const queryDataRoomArr = [
        // Public Folder
        Api.queryDataRoom({
          proj: project.id,
          isPublic: 1
        }),
        // Project Owner Folder
        Api.queryDataRoom({
          proj: project.id,
          user: projectOwner.id
        }),
      ]
      return Promise.all(queryDataRoomArr)
    }).then(data => {

      this.dataRoomRelation[this.props.location.query.id] = -3
      this.dataRoomRelation[data[1].data.data[0].id] = -2
      this.dataRoomRelation[data[0].data.data[0].id] = -1
      
      const newData = this.state.data.slice()
      newData[0]['dataroom'] = this.props.location.query.id
      newData[1]['dataroom'] = data[1].data.data[0].id
      newData[2]['dataroom'] = data[0].data.data[0].id

      this.setState({ data: newData })

      const getDataRoomFileArr = [
        Api.getDataRoomFile({ dataroom: this.props.location.query.id }), // Investor Folder
        Api.getDataRoomFile({ dataroom: data[1].data.data[0].id}), // Project Owner Folder
        Api.getDataRoomFile({ dataroom: data[0].data.data[0].id}) // Public Folder
      ]
      return Promise.all(getDataRoomFileArr)
    }).then(data => {
      const formattedData = data.map((m, index) => m.data.data.map(item => {
        let parent
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
        const parentId = item.parent || parent
        const name = item.filename
        const rename = item.filename
        const key = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime
        return { ...item, parentId, name, rename, key, isFolder, date }
      })).reduce((acc, val) => acc.concat(val), [])
      const newData = this.state.data.concat(formattedData)
      this.setState({ data: newData })
    }).catch(err => console.error(err))
  }

  handleCreateNewFolder(parentId) {
    const newData = this.state.data.slice()
    const existKeyList = newData.map(m => m.key)
    const maxKey = Math.max(...existKeyList)

    newData.splice(0, 0, {
      name: "新建文件夹",
      isFolder: true,
      parentId: parentId,
      rename: "新建文件夹",
      key: maxKey + 1,
    })
    this.setState({ data: newData, name: "新建文件夹" })
  }

  handleNewFolderNameChange(key, evt) {
    const newData = this.state.data.slice()
    const index = newData.map(m => m.key).indexOf(key)
    if (index > -1) {
      newData[index].rename = evt.target.value
      this.setState({ data: newData })
    }
  }

  handleConfirm(key) {
    const newData = this.state.data.slice()
    const index = newData.map(m => m.key).indexOf(key)
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
        const key = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime
        const newItem = { ...item, parentId, name, rename, key, isFolder, date }
        newData.push(newItem)
        this.setState({ data: newData })
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
      })
    }
  }

  handleCancel(key) {
    const newData = this.state.data.slice()
    const index = newData.map(m => m.key).indexOf(key)
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
    })
  }

  handleCopyFiles(files, targetID) {
    files.map(m => {
      const body = {
        isShadow: true,
        shadowdirectory: m.id,
        dataroom: m.dataroom,
        filename: m.filename,
        isFile: m.isFile,
        parent: [-1, -2, -3].includes(targetID) ? null : targetID
      }
      Api.addToDataRoom(body).then(data => {
        const newData = this.state.data.slice()
        const item = data.data
        const parentId = item.parent || this.dataRoomRelation[item.dataroom]
        const name = item.filename
        const rename = item.filename
        const key = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime
        const newItem = { ...item, parentId, name, rename, key, isFolder, date }
        newData.push(newItem)
        this.setState({ data: newData })
      })
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
      size: file.size
    }

    Api.addToDataRoom(body).then(data => {
      const item = data.data
      const parentId = item.parent || this.dataRoomRelation[item.dataroom]
      const name = item.filename
      const rename = item.filename
      const key = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime
      const newItem = { ...item, parentId, name, rename, key, isFolder, date }
      newData.push(newItem)
      this.setState({ data: newData })
    })
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={'项目名称：' + this.state.title}>

        <FileMgmt
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

export default DataRoomList
