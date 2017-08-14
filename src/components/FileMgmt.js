import React from 'react'
import { getDataRoomFile } from '../api'
import { Upload, message, Tree, Modal, Input, Button, Table } from 'antd'
import { getRandomInt, formatBytes, isLogin, hasPerm } from '../utils/util'
import { BASE_URL } from '../constants'

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
      loading: false,
    }

    this.handleNameChange = this.handleNameChange.bind(this)
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

  folderClicked(file) {
    if (!file) {
      this.setState({ parentId: -999 })
      return
    }
    if (file.isFolder) {
      this.setState({ parentId: file.id })
    } else {
      const watermark = isLogin().email || 'Investarget'
      const url = '/pdf_viewer.html?file=' + encodeURIComponent(file.fileurl) +
        '&watermark=' + encodeURIComponent(watermark)
      window.open(url)
    }
  }

  handleNameChange(unique, evt) {

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
    const subObjArr = this.props.data.filter(f => f.parentId === id)
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
        const existKeyList = this.data.map(m => m.unique)
        const maxKey = Math.max(...existKeyList)
        const id = maxKey + 1
        const unique = id
        const parentId = targetId

        const rootIndex = contentId.indexOf(m.id)
        if(rootIndex > -1) {
          content.splice(rootIndex, 1)
        }
        const newValue = {...m, id, unique, parentId}
        this.copyContents = this.copyContents.concat(newValue)
        this.data = this.data.concat(newValue)
        return this.copyContentsFunc(content, [m.id], id)
      })
    })
  }

  handleConfirm(unique) {
    const index = this.props.data.map(m => m.unique).indexOf(unique)
    if (index < 0) return
    const value = this.props.data[index]
    if (value.id) {
      const newRenameRows = this.state.renameRows.slice()
      const rowIndex = newRenameRows.indexOf(value.id)
      newRenameRows.splice(rowIndex, 1)
      this.setState({ renameRows: newRenameRows })
    }
    this.props.onConfirm(unique)
  }

  handleCancel(unique) {
    const index = this.props.data.map(m => m.unique).indexOf(unique)
    if (index < 0) return
    const value = this.props.data[index]
    if (value.id) {
      const newRenameRows = this.state.renameRows.slice()
      const rowIndex = newRenameRows.indexOf(value.id)
      newRenameRows.splice(rowIndex, 1)
      this.setState({ renameRows: newRenameRows })
    }
    this.props.onCancel(unique)
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
        // Server is responsible for recrusive
        react.props.onDeleteFiles(react.state.selectedRows.map(m => m.id))
        react.setState({ selectedRows: [] })
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
    let newData = this.props.data.slice()

    if (this.state.action === "move") {
      // this.state.selectedRows.map(m => {
      //   const index = newData.map(m => m.id).indexOf(m.id)
      //   newData[index].parentId = targetId
      // })

      this.props.onMoveFiles(this.state.selectedRows, targetId)

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

      this.props.onCopyFiles(this.state.selectedRows, targetId)

      newData = newData.concat(this.copyContents)
    }

    this.setState({
      selectedRows: [],
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
          <img style={{ width: 26, verticalAlign: 'middle' }} src={ record.isFolder ? !record.isShadow ? "/images/folder.png" : "/images/avatar1.png" : "/images/pdf.png" } />
          { record.id && !this.state.renameRows.includes(record.id) ?
              <span onClick={this.folderClicked.bind(this, record)} style={{ cursor: 'pointer', verticalAlign: 'middle', marginLeft: 10 }}>{text}</span>
              : (<span>
              <Input
                style={{ width: '60%', marginLeft: 6, verticalAlign: 'middle' }}
                value={record.rename}
                onChange={this.props.onNewFolderNameChange.bind(this, record.unique)} />
          <Button onClick={this.handleConfirm.bind(this, record.unique)} type="primary" style={{ marginLeft: 6, verticalAlign: 'middle' }}>确定</Button>
          <Button onClick={this.handleCancel.bind(this, record.unique)} style={{ marginLeft: 6, verticalAlign: 'middle' }}>取消</Button> </span>) }
        </div>
      ),
    }, {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: text => text && formatBytes(text),
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
    let parentFolder = null
    if (this.state.parentId !== -999) {
      const parentFolderArr = this.props.data.filter(f => f.id === currentFolder.parentId)
      if (parentFolderArr.length > 0) {
        parentFolder = parentFolderArr[0]
      }
    }
    const base = this.state.parentId === -999 ? "全部文件" : (
      <span>
        <a onClick={this.folderClicked.bind(this, parentFolder)}>返回上一级</a>
        &nbsp;|&nbsp;
        <a onClick={this.folderClicked.bind(this, null)}>全部文件</a>
      </span>
    )

    const tree = id => this.props.data.filter(f => f.isFolder && f.parentId === id).map(item => {
      const children = this.props.data.filter(f => f.isFolder && f.parentId === item.id)
      if (children.length > 0) {
        return (
          <TreeNode key={item.unique} title={item.name}>
            {tree(item.id)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.unique} title={item.name} />
    })

    const react = this

    const props = {
      name: 'file',
      action: BASE_URL + '/service/qiniubigupload?bucket=file',
      showUploadList: false,
      multiple: true,
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`)
          react.setState({ loading: false })
          react.props.onUploadFile(info.file, react.state.parentId)
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
          react.setState({ loading: false })
        } else if (info.file.status === 'uploading') {
          react.setState({ loading: true })
        }
      },
    }

    const unableToOperate = this.state.parentId === -999 || this.props.location.query.isClose === 'true'
    const hasEnoughPerm = hasPerm('dataroom.admin_adddataroom')

    const operation = () => {
      if (unableToOperate) return null
      return (
        <div>
          { hasEnoughPerm ? 
          <Upload {...props}>
            <Button type="primary" style={{ marginRight: 10 }}>上传</Button>
          </Upload>
          : null }

          { hasEnoughPerm ? 
          <Button
            onClick={this.props.onCreateNewFolder.bind(this, this.state.parentId)}
            style={{ marginRight: 10 }}>新建文件夹</Button>
          : null }

          {this.state.selectedRows.length > 0 && hasEnoughPerm ? <Button onClick={this.handleDelete} style={{ marginRight: 10 }}>删除</Button> : null}
          {this.state.selectedRows.length > 0 && this.state.selectedRows.filter(f => f.isShadow).length === 0 ? <Button onClick={this.handleRename} style={{ marginRight: 10 }}>重命名</Button> : null}
          {this.state.selectedRows.length > 0 && this.state.selectedRows.filter(f => f.isShadow).length === 0 && hasEnoughPerm ? <Button onClick={this.handleCopy} style={{ marginRight: 10 }}>复制到</Button> : null}
          {this.state.selectedRows.length > 0 && this.state.selectedRows.filter(f => f.isShadow).length === 0 ? <Button onClick={this.handleMove} style={{ marginRight: 10 }}>移动到</Button> : null}
        </div>
      )
    }

    return (
      <div>

       {operation()}

        <div style={{ margin: '10px 0' }}>
          { base }
          {
            this.parentFolderFunc(this.state.parentId)
              .map(
                m => m.id !== this.state.parentId ?
                <span key={m.unique}>&nbsp;>&nbsp;<a onClick={this.folderClicked.bind(this, m)}>{m.name}</a></span>
                :
                <span key={m.unique}>&nbsp;>&nbsp;{m.name}</span>
              )
          }
        </div>

        <Table
          columns={columns}
          rowKey={record => record.unique}
          rowSelection={rowSelection}
          dataSource={this.props.data.filter(f => f.parentId === this.state.parentId)}
          loading={this.state.loading}
          pagination={false} />

        <Modal
          title={actionName[this.state.action]}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancelModal}>

          <Tree onSelect={this.onSelect}>{tree(-999)}</Tree>

        </Modal>

      </div>
    )
  }
}

export default FileMgmt
