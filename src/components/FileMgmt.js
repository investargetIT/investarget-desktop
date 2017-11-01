import React from 'react'
import { Upload, message, Tree, Modal, Input, Button, Table, Select } from 'antd'
import { getRandomInt, formatBytes, isLogin, hasPerm, time, i18n } from '../utils/util'
import { BASE_URL } from '../constants'
import qs from 'qs'

const confirm = Modal.confirm
const TreeNode = Tree.TreeNode

const actionName = {
  'copy': i18n('dataroom.copy_to'),
  'move': i18n('dataroom.move_to'),
}

const validFileTypes = [
  'application/msword',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

class FileMgmt extends React.Component {
    constructor(props) {
    super(props)

    this.state = {
      data: props.data,
      parentId: parseInt(props.location.query.parentID, 10) || -999,
      name: null,
      renameRows: [],
      selectedRows: [],
      visible: false,
      action: null,
      loading: false,
    }

    // this.handleNameChange = this.handleNameChange.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleRename = this.handleRename.bind(this)
    this.deleteContent = this.deleteContent.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancelModal = this.handleCancelModal.bind(this)
    this.onSelect = this.onSelect.bind(this)
  }

  componentDidMount() {
    window.onpopstate = () => {
      const query = qs.parse(location.search)
      this.setState({ parentId: parseInt(query.parentID, 10) || -999 })
    }
  }

  folderClicked(file) {
    if (!file) {
      this.props.location.query.parentID = undefined
      history.pushState(undefined, '', `?${qs.stringify(this.props.location.query)}`)
      this.setState({ parentId: -999 })
      return
    }
    if (file.isFolder) {
      this.props.location.query.parentID = file.id
      history.pushState(undefined, '', `?${qs.stringify(this.props.location.query)}`)
      this.setState({ parentId: file.id })
    } else {
      const watermark = isLogin().email || 'Investarget'
      const url = '/pdf_viewer.html?file=' + encodeURIComponent(file.fileurl) +
        '&watermark=' + encodeURIComponent(watermark)
      window.open(url)
    }
  }

  // handleNameChange(unique, evt) {

  // }

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
      title: i18n('dataroom.message.confirm_delete_files'),
      onOk() {
        react.state.selectedRows.map(m => react.deleteContent(m.id))
        const deleteContents = react.contents.concat(react.state.selectedRows.map(m => m.id))
        // Server is responsible for recrusive
        react.props.onDeleteFiles(react.state.selectedRows.map(m => m.id))
        react.setState({ selectedRows: [] })
      }
    })
  }

  handleMove() {
    this.setState({ visible: true, action: 'move' })
  }

  handleOk() {
    this.setState({ visible: false })
    this.state.selectedRows.map(m => this.deleteContent(m.id))
    const notAllowedKeys = this.contents.concat(this.state.selectedRows.map(m => m.id), this.state.parentId)

    if (notAllowedKeys.includes(parseInt(this.selectedKeys[0], 10))) {
      message.error('dataroom.message.error_move_files')
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
    const isAdmin = hasPerm('usersys.as_admin')

    const rowSelection = isAdmin ? {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({ selectedRows: selectedRowKeys.map(m => this.props.data.filter(f => f.id === m)[0]) })
      },
      selectedRowKeys: this.state.selectedRows.map(m => m.id),
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',    // Column configuration not to be checked
      }),
    } : null

    const columns = [{
      title: i18n('dataroom.filename'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => {
        const nameA = a.name.toUpperCase()
        const nameB = b.name.toUpperCase()
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      },
      render: (text, record, index) => (
        <div>
          <img style={{ width: 26, verticalAlign: 'middle' }} src={ record.isFolder ? "/images/folder.png" : "/images/pdf.png" } />
          { record.id && !this.state.renameRows.includes(record.id) ?
              <span onClick={this.folderClicked.bind(this, record)} style={{ cursor: 'pointer', verticalAlign: 'middle', marginLeft: 10 }}>{text}</span>
              : (<span>
              <Input
                style={{ width: '60%', marginLeft: 6, verticalAlign: 'middle' }}
                value={record.rename}
                onChange={this.props.onNewFolderNameChange.bind(this, record.unique)} />
          <Button onClick={this.handleConfirm.bind(this, record.unique)} type="primary" style={{ marginLeft: 6, verticalAlign: 'middle' }}>{i18n('common.confirm')}</Button>
          <Button onClick={this.handleCancel.bind(this, record.unique)} style={{ marginLeft: 6, verticalAlign: 'middle' }}>{i18n('common.cancel')}</Button> </span>) }
        </div>
      ),
    }, {
      title: i18n('dataroom.size'),
      dataIndex: 'size',
      key: 'size',
      sorter: (a, b) => a.size - b.size,
      render: text => text && formatBytes(text),
    }, {
      title: i18n('dataroom.modified_time'),
      dataIndex: 'date',
      key: 'date',
      render: (date, record) => date && time(date+record.timezone),
    }]
    if (isAdmin && !this.props.isClose) {
      columns.push({
        title: i18n('dataroom.visible_user'),
        render: (text, record) => {
          const fileId = record.id
          const users = this.props.fileUserList.filter(item => item.file == fileId).map(item => String(item.user))
          return record.isFile ? (
            <Select
              style={{width: '100%'}}
              mode="multiple"
              optionLabelProp="children"
              value={users}
              onSelect={(userId) => {this.props.onSelectFileUser(fileId, Number(userId))}}
              onDeselect={(userId) => {this.props.onDeselectFileUser(fileId, Number(userId))}}>
              {this.props.userOptions.map(option => (
                <Select.Option key={option.value} value={String(option.value)}>{option.label}</Select.Option>
              ))}
            </Select>
          ) : null
        }
      })
    }

    this.current = []
    this.contents = []
    this.data = this.props.data
    // this.copyContents = []

    const currentFolder = this.props.data.filter(f => f.id === this.state.parentId)[0]
    let parentFolder = null
    if (this.state.parentId !== -999) {
      const parentFolderArr = this.props.data.filter(f => f.id === currentFolder.parentId)
      if (parentFolderArr.length > 0) {
        parentFolder = parentFolderArr[0]
      }
    }
    const base = (
      <span>
        <a onClick={this.folderClicked.bind(this, parentFolder)}>{i18n('dataroom.back')}</a>
        &nbsp;|&nbsp;
        <a onClick={this.folderClicked.bind(this, null)}>{i18n('dataroom.all')}</a>
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
      beforeUpload: file => {
        const fileType = file.type
        if (!validFileTypes.includes(fileType)) {
          Modal.error({
            title: '不支持的文件类型',
            content: '请上传 office 或 pdf 文档',
          })
          return false
        }
        return true
      },
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

    const unableToOperate = this.props.location.query.isClose === 'true'
    const hasEnoughPerm = hasPerm('dataroom.admin_adddataroom')
    const selectMoreThanOneRow = this.state.selectedRows.length > 0
    const noShadowInSelectedRows = this.state.selectedRows.filter(f => f.isShadow).length === 0
    const noFileInSelectedRows = this.state.selectedRows.filter(f => !f.isFolder).length === 0

    const operation = () => {
      if (unableToOperate ) return null
      return (
        <div>
          { hasEnoughPerm ?
          <Upload {...props}>
            <Button type="primary" style={{ marginRight: 10 }}>{i18n('dataroom.upload')}</Button>
          </Upload>
          : null }

          { hasEnoughPerm ?
          <Button
            onClick={this.props.onCreateNewFolder.bind(this, this.state.parentId)}
            style={{ marginRight: 10 }}>{i18n('dataroom.new_folder')}</Button>
          : null }

          { hasEnoughPerm ?
            <Button onClick={this.props.onManageUser} style={{ marginRight: 10 }}>{i18n('dataroom.user_management')}</Button>
          : null}

          {selectMoreThanOneRow && hasEnoughPerm ?
            <Button onClick={this.handleDelete} style={{ marginRight: 10 }}>{i18n('dataroom.delete')}</Button>
          : null}

          {selectMoreThanOneRow && noShadowInSelectedRows ?
            <Button onClick={this.handleRename} style={{ marginRight: 10 }}>{i18n('dataroom.rename')}</Button>
          : null}

          {selectMoreThanOneRow && noShadowInSelectedRows && noFileInSelectedRows ?
            <Button onClick={this.handleMove} style={{ marginRight: 10 }}>{i18n('dataroom.move_to')}</Button>
          : null}
        </div>
      )
    }

    return (
      <div>

       {operation()}

        <div style={{ margin: '10px 0' }}>
          { base }
          {this.props.data.length > 0 &&
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
