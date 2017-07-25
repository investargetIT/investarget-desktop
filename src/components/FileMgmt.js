import React from 'react'
import { getDataRoomFile } from '../api'
import { Upload, message, Tree, Modal, Input, Button, Table } from 'antd'
import { getRandomInt } from '../utils/util'

const confirm = Modal.confirm
const TreeNode = Tree.TreeNode

const actionName = {
  'copy': '复制到',
  'move': '移动到',
}

class FileMgmt extends React.Component {
    constructor(props) {

    super(props)

    this.state = {
      data: props.data,
      parentId: -999,
      name: null,
      renameRows: [],
      selectedRows: [],
      visible: false,
      action: null,
      uploading: false,
    }

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleCreateFolder = this.handleCreateFolder.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleRename = this.handleRename.bind(this)
    this.deleteContent = this.deleteContent.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleCopy = this.handleCopy.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancelModal = this.handleCancelModal.bind(this)
    this.onSelect = this.onSelect.bind(this)
  }

  componentDidMount() {
  }

  folderClicked(id) {
    const folder = this.props.data.filter(f => f.id === id)
    if ((folder.length > 0 && folder[0].isFolder) || id === -999) {
      this.setState({parentId: id})
    }
  }

  handleNameChange(index, evt) {
    const newData = this.state.data.slice()
    newData[index].rename = evt.target.value
    this.setState({ data: newData })
  }

  current = []
  parentFolderFunc (parentId) {
    if (parentId === -999) return this.current
    const parentFolder = this.props.data.filter(f => f.id === parentId)[0]
    this.current.splice(0, 0, parentFolder)
    return this.parentFolderFunc(parentFolder.parentId)
  }

  contents = []
  deleteContent(id) {
    const subObjArr = this.state.data.filter(f => f.parentId === id)
    if (subObjArr.length === 0) {
      return this.contents
    } else {
      this.contents = this.contents.concat(subObjArr.map(m => m.id))
      return subObjArr.map(m => this.deleteContent(m.id))
    }
  }

  copyContents = []
  data = []
  copyContentsFunc(contentName, oldParentIds, targetId) {
    let content = contentName.slice()
    if (content.length === 0) return this.copyContents
    const contentId = content.map(m => m.id)
    oldParentIds.map(oldParentId => {
      content.filter(f => f.parentId === oldParentId).map(m => {
        const existKeyList = this.data.map(m => m.key)
        const maxKey = Math.max(...existKeyList)
        const id = maxKey + 1
        const key = id
        const parentId = targetId

        const rootIndex = contentId.indexOf(m.id)
        if(rootIndex > -1) {
          content.splice(rootIndex, 1)
        }
        const newValue = {...m, id, key, parentId}
        this.copyContents = this.copyContents.concat(newValue)
        this.data = this.data.concat(newValue)
        return this.copyContentsFunc(content, [m.id], id)
      })
    })
  }


  handleCreateFolder() {
    const newData = this.state.data.slice()
    const existKeyList = newData.map(m => m.key)
    const maxKey = Math.max(...existKeyList)

    newData.splice(0, 0, {
      name: "新建文件夹",
      isFolder: true,
      date: '2015-04-15 13:30',
      parentId: this.state.parentId,
      rename: "新建文件夹",
      key: maxKey + 1,
    })
    this.setState({ data: newData, name: "新建文件夹" })
  }

  handleConfirm(index) {
    const value = this.state.data[index]
    const name = value.name
    if (!value.id) {
      const newData = this.state.data.slice()
      newData[index].id = newData[index].key
      newData[index].name = newData[index].rename
      this.setState({ uploading: true, data: newData })
      this.props.onCreateNewFolder(this.state.parentId, newData[index].rename)
    } else {
      const newData = this.state.data.slice()
      newData[index].name = newData[index].rename
      const newRenameRows = this.state.renameRows.slice()
      const rowIndex = newRenameRows.indexOf(value.id)
      newRenameRows.splice(rowIndex, 1)
      this.setState({ data: newData, renameRows: newRenameRows })
    }
  }

  handleCancel(index) {
    const value = this.state.data[index]
    const name = value.name
    if (!value.id) {
      const newData = this.state.data.slice()
      newData.splice(index, 1)
      this.setState({ data: newData })
    } else {
      const newData = this.state.data.slice()
      newData[index].rename = newData[index].name
      const newRenameRows = this.state.renameRows.slice()
      const rowIndex = newRenameRows.indexOf(value.id)
      newRenameRows.splice(rowIndex, 1)
      this.setState({ data: newData, renameRows: newRenameRows })
    }
  }

  handleRename() {
    this.setState({
      renameRows: this.state.selectedRows.map(m => m.id)
    })
  }

  handleDelete() {
    const react = this
    confirm({
      title: '确定删除吗？',
      onOk() {
        react.state.selectedRows.map(m => react.deleteContent(m.id))
        const deleteContents = react.contents.concat(react.state.selectedRows.map(m => m.id))
        const newData = react.state.data.slice()
        deleteContents.map(d => {
          const index = newData.map(m => m.id).indexOf(d)
          newData.splice(index, 1)
        })
        react.setState({
          data: newData,
          selectedRows: [],
        })
      }
    })
  }

  handleCopy() {
    this.setState({ visible: true, action: 'copy' })
  }

  handleMove() {
    this.setState({ visible: true, action: 'move' })
  }

  handleOk() {
    this.setState({ visible: false })
    this.state.selectedRows.map(m => this.deleteContent(m.id))
    const notAllowedKeys = this.contents.concat(this.state.selectedRows.map(m => m.id), this.state.parentId)

    if (notAllowedKeys.includes(parseInt(this.selectedKeys[0], 10))) {
      message.error("不能将文件复制或移动到自身及子目录下")
      return
    }

    const targetId = parseInt(this.selectedKeys[0], 10)
    let newData = this.state.data.slice()

    if (this.state.action === "move") {
      this.state.selectedRows.map(m => {
        const index = newData.map(m => m.id).indexOf(m.id)
        newData[index].parentId = targetId
      })
    } else if (this.state.action === "copy") {
      const index = notAllowedKeys.indexOf(this.state.parentId)
      if (index > -1) {
        notAllowedKeys.splice(index, 1)
      }
      const contentsToCopy = notAllowedKeys.map(m => {
        const result = newData.filter(f => f.id === m)
        return result[0]
      })
      const parentIds = this.state.selectedRows.map(m => m.parentId)
      const parentIdSet = new Set(parentIds)
      this.copyContentsFunc(contentsToCopy, [...parentIdSet], targetId)
      newData = newData.concat(this.copyContents)
    }

    this.setState({
      selectedRows: [],
      data: newData,
    })
  }

  handleCancelModal() {
    this.setState({ visible: false })
  }

  selectedKeys = []
  onSelect(keys) {
    this.selectedKeys = keys
  }

  render () {

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({ selectedRows: selectedRowKeys.map(m => this.props.data.filter(f => f.id === m)[0]) })
      },
      selectedRowKeys: this.state.selectedRows.map(m => m.id),
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',    // Column configuration not to be checked
      }),
    }

    const columns = [{
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <div>
          <img style={{ width: 26, verticalAlign: 'middle' }} src={ record.isFolder ? "/images/folder.png" : "/images/pdf.png" } />
          { record.id && !this.state.renameRows.includes(record.id) ?
              <span onClick={this.folderClicked.bind(this, record.id)} style={{ cursor: 'pointer', verticalAlign: 'middle', marginLeft: 10 }}>{text}</span>
              : (<span>
          <Input style={{ width: '60%', marginLeft: 6, verticalAlign: 'middle' }} value={record.rename} onChange={this.handleNameChange.bind(this, index)} />
          <Button onClick={this.handleConfirm.bind(this, index)} type="primary" style={{ marginLeft: 6, verticalAlign: 'middle' }}>确定</Button>
          <Button onClick={this.handleCancel.bind(this, index)} style={{ marginLeft: 6, verticalAlign: 'middle' }}>取消</Button> </span>) }
        </div>
      ),
    }, {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    }, {
      title: '修改日期',
      dataIndex: 'date',
      key: 'date',
    }]


    this.current = []
    this.contents = []
    this.data = this.props.data
    this.copyContents = []

    const currentFolder = this.props.data.filter(f => f.id === this.state.parentId)[0]
    const base = this.state.parentId === -999 ? "全部文件" : (
      <span>
        <a onClick={this.folderClicked.bind(this, currentFolder.parentId)}>返回上一级</a>
        &nbsp;|&nbsp;
        <a onClick={this.folderClicked.bind(this, -999)}>全部文件</a>
      </span>
    )

    const tree = id => this.props.data.filter(f => f.isFolder && f.parentId === id).map(item => {
      const children = this.props.data.filter(f => f.isFolder && f.parentId === item.id)
      if (children.length > 0) {
        return (
          <TreeNode key={item.key} title={item.name}>
            {tree(item.id)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.key} title={item.name} />
    })

    const react = this

    const props = {
      name: 'file',
      action: '//jsonplaceholder.typicode.com/posts/',
      headers: {
        authorization: 'authorization-text',
      },
      showUploadList: false,
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);

          const newData = react.props.data.slice()
          const existKeyList = newData.map(m => m.key)
          const maxKey = Math.max(...existKeyList)

          newData.push({
            id: maxKey + 1,
            name: info.file.name,
            isFolder: false,
            date: '2015-04-15 13:30',
            parentId: react.state.parentId,
            rename: info.file.name,
            key: maxKey + 1,
          })
          react.setState({ data: newData, uploading: false })
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
          react.setState({ uploading: false })
        } else if (info.file.status === 'uploading') {
          react.setState({ uploading: true })
        }
      },
    }

    return (
      <div>

        <Upload {...props}>
          <Button type="primary">上传</Button>
        </Upload>

        <Button onClick={this.handleCreateFolder} style={{ marginLeft: 10 }}>新建文件夹</Button>
        { this.state.selectedRows.length > 0 ? <Button onClick={this.handleDelete} style={{ marginLeft: 10 }}>删除</Button> : null }
        { this.state.selectedRows.length > 0 ? <Button onClick={this.handleRename} style={{ marginLeft: 10 }}>重命名</Button> : null }
        { this.state.selectedRows.length > 0 ? <Button onClick={this.handleCopy} style={{ marginLeft: 10 }}>复制到</Button> : null }
        { this.state.selectedRows.length > 0 ? <Button onClick={this.handleMove} style={{ marginLeft: 10 }}>移动到</Button> : null }

        <div style={{ margin: '10px 0' }}>
          { base }
          {
            this.parentFolderFunc(this.state.parentId)
              .map(
                m => m.id !== this.state.parentId ?
                <span key={m.key}>&nbsp;>&nbsp;<a onClick={this.folderClicked.bind(this, m.id)}>{m.name}</a></span>
                :
                <span key={m.key}>&nbsp;>&nbsp;{m.name}</span>
              )
          }
        </div>

        <Table
          columns={columns}
          rowKey={record => record.key}
          rowSelection={rowSelection}
          dataSource={this.props.data.filter(f => f.parentId === this.state.parentId)}
          loading={this.state.uploading}
          pagination={false} />

        <Modal
          title={actionName[this.state.action]}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancelModal}>

          <Tree onSelect={this.onSelect}>{tree(0)}</Tree>

        </Modal>

      </div>
    )
  }
}

export default FileMgmt