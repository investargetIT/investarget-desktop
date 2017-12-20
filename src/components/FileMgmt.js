import React from 'react'
import { Upload, message, Tree, Modal, Input, Button, Table, Select, Tag, Checkbox, Icon, Tooltip } from 'antd'
import { getRandomInt, formatBytes, isLogin, hasPerm, time, i18n } from '../utils/util'
import { BASE_URL } from '../constants'
import qs from 'qs'
import styles from './FileMgmt.css'

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

const buttonStyle = {
  backgroundColor: 'transparent', 
  color: '#989898', 
  border: 'none', 
  textDecoration: 'underline', 
}

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

  componentWillReceiveProps(nextProps) {
    const parentId = this.props.location.query.parentID
    const parentId2 = nextProps.location.query.parentID
    if (parentId !== parentId2) {
      // 切换目录时，清空选中的行
      this.setState({ selectedRows: [] })
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
      // 切换目录时，清空选中的行
      this.setState({ selectedRows: [] })
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
    this.setState({ selectedRows: [] })
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

  handleMultiVisible = () => {
    const ids = this.getSelectFileIds()
    this.props.onMultiVisible(ids)
    this.setState({ selectedRows: [] })
  }

  handleMultiInvisible = () => {
    const ids = this.getSelectFileIds()
    this.props.onMultiInvisible(ids)
    this.setState({ selectedRows: [] })
  }

  getSelectFileIds = () => {
    const list = this.props.data
    const { selectedRows } = this.state
    const baseFileIds = selectedRows.filter(item=>item.isFile).map(item=>item.id)
    const baseDirIds = selectedRows.filter(item=>item.isFolder).map(item=>item.id)

    function getFiles(list, id) {
      const children = list.filter(item => item.parent == id)
      const files = children.filter(item => item.isFile).map(item => item.id)
      const dirs = children.filter(item => item.isFolder).map(item => item.id)
      const subFiles = dirs.map(id => getFiles(list, id))
                           .reduce((a,b) => a.concat(b), [])
      return files.concat(subFiles)
    }

    return baseFileIds.concat(
      baseDirIds.map(id => getFiles(list, id))
                .reduce((a, b) => a.concat(b), [])
    )

  }

  handleDownloadBtnClicked = () => {
    this.props.onDownloadBtnClicked();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loading != nextProps.loading) {
      this.setState({loading: nextProps.loading});
    }
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
      render: (text, record, index) => {
        const childDocs = this.props.data.filter(f => f.parentId == record.id).length
        return (
        <div>
          <img style={{ width: 26, verticalAlign: 'middle' }} src={ !record.isFolder ? "/images/pdf.png" : childDocs==0 ? "/images/folder.png":"/images/fullFolder.png"  } />
          { record.id && !this.state.renameRows.includes(record.id) ?
              <span onClick={this.folderClicked.bind(this, record)} style={{ cursor: 'pointer', verticalAlign: 'middle', marginLeft: 10 }}>{text}</span>
              : (<span>
              <Input
                size="large"
                style={{ width: '60%', marginLeft: 6, verticalAlign: 'middle' }}
                value={record.rename}
                onChange={this.props.onNewFolderNameChange.bind(this, record.unique)} />
          <Button size="large" onClick={this.handleConfirm.bind(this, record.unique)} type="primary" style={{ marginLeft: 6, verticalAlign: 'middle' }}>{i18n('common.confirm')}</Button>
          <Button size="large" onClick={this.handleCancel.bind(this, record.unique)} style={{ marginLeft: 6, verticalAlign: 'middle' }}>{i18n('common.cancel')}</Button> </span>) }
        </div>
      )},
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
      if (this.props.selectedUser) {
        columns.push({
          title: i18n('permission'),
          key: 'visible',
          render: (text, record) => {
            const file = this.props.targetUserFileList.filter(item => item.file == record.id)[0]
            const visible = Boolean(file)
            return record.isFile ? (
              <Tooltip title={i18n('dataroom.click_toggle_visible')}>
                {/* <Icon
                  type={visible ? 'check' : 'close'}
                  onClick={this.props.onToggleVisible.bind(this, record.id)}
                  className={styles['visible']}
                  style={{fontSize:24}} /> */}
                <VisiblitySwitch vis={visible} onClick={this.props.onToggleVisible.bind(this, record.id)} />
              </Tooltip>
            ) : null
          }
        })
      } else {
        columns.push({
          title: i18n('dataroom.visible_user'),
          key: 'visible_user',
          render: (text, record) => {
            const fileId = record.id
            const users = this.props.fileUserList.filter(item => item.file == fileId).map(item => String(item.user))
            return record.isFile ? (
              <Select
                style={{width: '100%'}}
                mode="multiple"
                size="large"
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
        {/* <a onClick={this.folderClicked.bind(this, parentFolder)}>{i18n('dataroom.back')}</a>
        &nbsp;|&nbsp; */}
        <a onClick={this.folderClicked.bind(this, null)} style={{ fontSize: 16, color: '#282828' }}>{i18n('dataroom.all')}</a>
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
    const hasDownloadPerm = hasPerm('dataroom.downloadDataroom');
    const selectMoreThanOneRow = this.state.selectedRows.length > 0
    const selectMoreThanTwoRow = this.state.selectedRows.length > 1
    const noFileInSelectedRows = this.state.selectedRows.filter(f => !f.isFolder).length === 0

    const operation = () => {
      if (unableToOperate ) return null
      return (
        <div style={{ textAlign: 'right' }}>

          { hasEnoughPerm ?
          <Upload {...props}>
            <Button size="large" type="primary" style={{...buttonStyle, color: '#237ccc'}}>
            <img style={{marginRight: 4, marginBottom: 3}} src="/images/upload.png" />{i18n('dataroom.upload')}
            </Button>
          </Upload>
          : null }

          { hasDownloadPerm ?
            <Button size="large" type="primary" style={buttonStyle} onClick={this.handleDownloadBtnClicked} loading={this.props.isDownloadBtnLoading}>
              <img style={{marginRight: 4, marginBottom: 3}} src="/images/download.png" />{i18n('download_package')}
            </Button>
          : null }

          { hasEnoughPerm ?
          <Button
            size="large"
            onClick={this.props.onCreateNewFolder.bind(this, this.state.parentId)}
            style={buttonStyle}><img style={{marginRight: 4, marginBottom: 3}} src="/images/create_folder.png" />{i18n('dataroom.new_folder')}</Button>
          : null }

          { hasEnoughPerm ?
            <Button onClick={this.props.onManageUser} size="large" style={buttonStyle}>{i18n('dataroom.user_management')}</Button>
          : null}

          {selectMoreThanOneRow && hasEnoughPerm ?
            <Button onClick={this.handleDelete} size="large" style={buttonStyle}>{i18n('dataroom.delete')}</Button>
          : null}

          {selectMoreThanOneRow ?
            <Button onClick={this.handleRename} size="large" style={buttonStyle} disabled={selectMoreThanTwoRow}>{i18n('dataroom.rename')}</Button>
          : null}

          {selectMoreThanOneRow ?
            <Button onClick={this.handleMove} size="large" style={buttonStyle}>{i18n('dataroom.move_to')}</Button>
          : null}
        </div>
      )
    }
    
    return (
      <div>

       

        <div style={{ lineHeight: '40px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgb(233, 241, 243)' }}>
          <div>
            { base }
            {this.props.data.length > 0 &&
              this.parentFolderFunc(this.state.parentId)
                .map(
                  m => m.id !== this.state.parentId ?
                  <span key={m.unique}>&nbsp;>&nbsp;<a onClick={this.folderClicked.bind(this, m)} style={{ fontSize: 14, color: '#282828'}}>{m.name}</a></span>
                  :
                  <span key={m.unique} style={{ fontSize: 14, color: '#237ccc' }}>&nbsp;>&nbsp;{m.name}</span>
                )
            }
          </div>

          {operation()}
          {/* {hasEnoughPerm ? (
            <UserCheckableTag
              options={this.props.userOptions}
              value={this.props.selectedUser}
              onChange={this.props.onSelectUser} />
          ) : null} */}
        </div>

        <Table
          size="small"
          columns={columns}
          rowKey={record => record.unique}
          rowSelection={rowSelection}
          dataSource={this.props.data.filter(f => f.parentId === this.state.parentId).sort(sortByFileTypeAndName)}
          loading={this.state.loading}
          pagination={false} />

        <div style={{display: (this.props.selectedUser && selectMoreThanOneRow) ? 'block' : 'none', marginTop: 16}}>
          <Button type="primary" size="large" style={{marginRight:8}} onClick={this.handleMultiVisible}>{i18n('dataroom.visible')}</Button>
          <Button size="large" onClick={this.handleMultiInvisible}>{i18n('dataroom.invisible')}</Button>
        </div>

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

function sortByFileTypeAndName(a, b) {
  return 10 * sortByFileType(a, b) + sortByFileName(a, b)
}

function sortByFileType(a, b) {
  const va = a.isFolder ? 0 : 1
  const vb = b.isFolder ? 0 : 1
  return va - vb
}

function sortByFileName(a, b) {
  if (a.name < b.name) {
    return -1;
  } else if (a.name > b.name) {
    return 1;
  } else {
    return 0;
  }
}

export default FileMgmt

const CheckableTag = Tag.CheckableTag
// 单选
class UserCheckableTag extends React.Component {

  handleChange = (value, checked) => {
    this.props.onChange(checked ? value : null)
  }

  render() {
    return (
      <div>
        {this.props.options.map(option => (
          <CheckableTag
            key={option.value}
            checked={option.value == this.props.value}
            onChange={this.handleChange.bind(this, option.value)}
          >
            {option.label}
          </CheckableTag>
        ))}
      </div>
    )
  }
}

const activeStyle = {
  backgroundColor: '#237ccc', 
  color: 'white'
};
function VisiblitySwitch(props) {
  return (
    <span onClick={props.onClick} style={{ border: '1px solid #c3c3c3', borderRadius: '4px', fontSize: 12, color: '#989898', display: 'inline-block', cursor: 'pointer' }}>
      <span style={{ borderRadius: '4px', padding: '2px 10px', backgroundColor: props.vis ? '#237ccc' : 'transparent', color: props.vis ? 'white' : 'inherit' }}>可见</span>
      <span style={{ borderRadius: '4px', padding: '2px 4px', backgroundColor: !props.vis ? '#237ccc' : 'transparent', color: !props.vis ? 'white' : 'inherit' }}>不可见</span>
    </span>
  )
}
