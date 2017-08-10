import React from 'react'
import { connect } from 'dva'
import _ from 'lodash'
import * as api from '../api'
import { BASE_URL } from '../constants'
import {
  Input,
  Button,
  Icon,
  Tabs,
  Upload,
  message,
  Modal,
} from 'antd'
const TabPane = Tabs.TabPane
const Dragger = Upload.Dragger


const fileExtensions = [
  '.pdf',
  '.doc',
  '.xls',
  '.ppt',
  '.docx',
  '.xlsx',
  '.pptx',
]
const mimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
]


const fixedDirs = ['NDA', 'Teaser', 'Executive Summary', 'BP', 'Presetation', 'Brochure', 'Financials', 'FAQ', 'Cap Table']

class ProjectAttachments extends React.Component {

  uploading = {}

  constructor(props) {
    super(props)

    this.state = {
      fileList: [],
      dirs: fixedDirs.slice(),
      activeDir: fixedDirs[0],
      newDir: '',
    }
  }


  handleTabsEdit = (targetDir, action) => {
    if (action == 'remove') {
      Modal.confirm({
        title: '删除目录',
        content: '该目录下的文件都将被删除',
        onOk: () => { this.removeDir(targetDir) },
      })
    }
  }

  addDir = () => {
    const newDir = this.state.newDir
    this.setState({
      dirs: [ ...this.state.dirs, newDir ],
      newDir: '',
      activeDir: newDir,
    })
  }

  removeDir = (targetDir) => {
    // todo remove related files

    const { activeDir, dirs } = this.state
    const index = dirs.indexOf(targetDir)
    this.setState({
      dirs: [ ...dirs.slice(0, index), ...dirs.slice(index+1)],
    })

    if (targetDir == activeDir) {
      this.setState({ activeDir: dirs[index - 1] })
    }

  }

  handleFileChange = ({ file, fileList, event }) => {
    console.log('>>>', file, fileList, event);
    if (file.status == 'uploading') {
      this.handleFileUpload(file)
    } else if (file.status == 'done') {
      this.handleFileUploadDone(file)
    } else if (file.status == 'error') {
      this.handleFileUploadError(file)
    } else if (file.status == 'removed') {
      this.handleFileRemove(file)
    }
  }

  handleFileUpload = (file) => {
    if (!file.filetype) {
      file.filetype = this.state.activeDir
      file.filename = file.name
      this.setState({ fileList: [ ...this.state.fileList, file] })
    } else {
      const index  = _.findIndex(this.state.fileList, function(item) {
        return item.filetype == file.filetype && item.filename == file.filename
      })
      this.setState({
        fileList: [ ...this.state.fileList.slice(0, index), file, ...this.state.fileList.slice(index+1) ]
      })
    }
  }

  handleFileUploadDone = (file) => {
    file.bucket = 'file'
    file.key = file.response.result.key
    file.url = file.response.result.url
    const index  = _.findIndex(this.state.fileList, function(item) {
      return item.filetype == file.filetype && item.filename == file.filename
    })
    this.addAttachment(file).then(result => {
      this.setState({
        fileList: [ ...this.state.fileList.slice(0, index), file ,...this.state.fileList.slice(index+1) ]
      })
    }, error => {
      file.status = 'error'
      file.error = error
      this.setState({
        fileList: [ ...this.state.fileList.slice(0, index), file ,...this.state.fileList.slice(index+1) ]
      })
    })
  }

  handleFileUploadError = (file) => {
    const index  = _.findIndex(this.state.fileList, function(item) {
      return item.filetype == file.filetype && item.filename == file.filename
    })
    this.setState({
      fileList: [ ...this.state.fileList.slice(0, index), file, ...this.state.fileList.slice(index+1) ]
    })
  }

  handleFileRemove = (file) => {
    this.removeAttachment(file).then(result => {
      const index  = _.findIndex(this.state.fileList, function(item) {
        return item.filetype == file.filetype && item.filename == file.filename
      })
      this.setState({
        fileList: [ ...this.state.fileList.slice(0, index), ...this.state.fileList.slice(index+1) ]
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }


  getAttachment = () => {
    const projId = this.props.projId
    return api.getProjAttachment(projId).then(result => {
      return result.data.data
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  addAttachment = (file) => {
    const projId = this.props.projId
    const data = {
      proj: this.props.projId,
      filetype: file.filetype,
      bucket: file.bucket,
      filename: file.filename,
      key: file.key,
    }
    return api.addProjAttachment(data).then(result => {
      console.log(result)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  removeAttachment = (file) => {
    const proj = file.proj
    const bucket = file.bucket
    const key = file.key
    const id = file.id

    if (bucket && key) {
      if (id) {
        // 删除已有附件
        return api.deleteProjAttachment(id).then(result => {
          return api.qiniuDelete(bucket, key)
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      } else {
        // 上传完成，添加附件失败时，删除
        return api.qiniuDelete(bucket, key)
      }
    } else {
      // 上传过程中删除
      return Promise.resolve()
    }
  }


  handleFileRemoveConfirm = (file) => {
    return new Promise(function(resolve, reject) {
      Modal.confirm({
        title: '删除文件',
        content: file.name,
        onOk: function() { resolve(true) },
        onCancel: function() { resolve(false) },
      })
    })
  }

  beforeUpload = (file) => {
    if (mimeTypes.indexOf(file.type) == -1) {
      message.warning('不支持的文件格式', 2)
      return false
    }
    // 不允许重复上传
    const dir = this.state.activeDir // current dir
    for (let i = 0, len = this.state.fileList.length; i < len; i++) {
      let _file = this.state.fileList[i]
      if (dir == _file.filetype && file.filename == _file.filename) {
        message.warning('不能上传同一文件', 2)
        return false
      }
    }
    return true
  }

  componentDidMount() {
    // test data
    this.getAttachment().then(fileList => {
      fileList.forEach((item, index) => {
        item.uid = -(index + 1)
        item.name = item.filename
        item.status = 'done'
      })
      const otherDirs = []
      fileList.forEach(item => {
        if (!this.state.dirs.includes(item.filetype)) {
          otherDirs.push(item.filetype)
        }
      })
      this.setState({
        fileList,
        dirs: [ ...this.state.dirs, ...otherDirs ],
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { fileList, dirs } = this.state

    let panes = dirs.map(item => ({ title: item, key: item, closable: !fixedDirs.includes(item) }))
    let targetFileList = fileList.filter(item => item.filetype == this.state.activeDir)

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Input
            value={this.state.newDir}
            onChange={(e) => {this.setState({ newDir: e.target.value })}}
            style={{width: 'auto', marginRight: '8px'}}
            placeholder="新建目录"
          />
          <Button onClick={this.addDir} disabled={this.state.newDir == ''}>ADD</Button>
        </div>

        <Tabs
          hideAdd
          onChange={(activeKey) => {this.setState({activeDir: activeKey})}}
          activeKey={this.state.activeDir}
          type="editable-card"
          onEdit={this.handleTabsEdit}
        >
          {panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}></TabPane>)}
        </Tabs>

        <Dragger
          action={BASE_URL + "/service/qiniubigupload?bucket=file"}
          accept={fileExtensions.join(',')}
          beforeUpload={this.beforeUpload}
          fileList={targetFileList}
          onChange={this.handleFileChange}
          onRemove={this.handleFileRemoveConfirm}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">点击或拖拽上传</p>
          <p className="ant-upload-hint">pdf, doc, docx, xls, xlsx, ppt, pptx</p>
        </Dragger>
      </div>
    )
  }
}

export default connect()(ProjectAttachments)
