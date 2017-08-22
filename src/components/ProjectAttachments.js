import React from 'react'
import { connect } from 'dva'
import _ from 'lodash'
import * as api from '../api'
import { BASE_URL } from '../constants'
import { i18n } from '../utils/util'
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


const ellipsisStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
const fileitemStyle = {
  display: 'flex',
  alignItems: 'center',
}
const filetypeStyle = {
  flexShrink: 0,
  width: '125px',
  marginRight: '25px',
  color: '#108ee9',
  ...ellipsisStyle,
}
const filenameStyle = {
  flexGrow: 1,
  ...ellipsisStyle,
}


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
        title: i18n('project.message.delete_dir_title'),
        content: i18n('project.message.delete_dir_content'),
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
      this.handleError(error)
    })
  }


  getAttachment = () => {
    const projId = this.props.projId
    return api.getProjAttachment(projId).then(result => {
      return result.data.data
    }, error => {
      this.handleError(error)
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
      this.handleError(error)
    })
  }

  removeAttachment = (file) => {
    const proj = file.proj
    const bucket = file.bucket
    const key = file.key
    const id = file.id

    if (bucket && key && id) {
      return api.deleteProjAttachment(id).then(result => {
        return Promise.resolve()
      }, error => {
        this.handleError(error)
      })
    } else {
      return Promise.resolve()
    }
  }


  handleFileRemoveConfirm = (file) => {
    return new Promise(function(resolve, reject) {
      Modal.confirm({
        title: i18n('project.message.delete_file_title'),
        content: file.name,
        onOk: function() { resolve(true) },
        onCancel: function() { resolve(false) },
      })
    })
  }

  beforeUpload = (file) => {
    const { fileList } = this.state

    if (mimeTypes.indexOf(file.type) == -1) {
      message.error(i18n('project.message.unsported_format'), 2)
      return false
    }
    // 不允许重复上传
    const dir = this.state.activeDir // current dir
    for (let i = 0, len = fileList.length; i < len; i++) {
      let _file = fileList[i]
      if (dir == _file.filetype && file.filename == _file.filename) {
        message.error(i18n('project.message.upload_same_file'), 2)
        return false
      }
    }
    //NDA文件和Teaser文件只能上传一个
    if (dir == 'NDA' && fileList.filter(item => item.filetype == 'NDA').length > 0) {
      message.error(i18n('project.message.only_one_NDA'), 2)
      return false
    }
    if (dir == 'Teaser' && fileList.filter(item => item.filetype == 'Teaser').length > 0) {
      message.error(i18n('project.message.only_one_teaser'), 2)
      return false
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
      this.handleError(error)
    })
  }

  handleError = (error) => {
    this.props.dispatch({
      type: 'app/findError',
      payload: error
    })
  }

  render() {
    const { fileList, dirs } = this.state

    let panes = dirs.map(item => ({ title: item, key: item, closable: !fixedDirs.includes(item) }))
    let targetFileList = fileList.filter(item => item.filetype == this.state.activeDir)
    let doneFileList = fileList.filter(file => file.status == 'done')

    return (
      <div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: '8px' }}>{i18n('project.has_attachments')} (<span>{ doneFileList.length }</span>)</p>
          <div style={{ marginLeft: '8px' }}>
          {
            doneFileList.map(file =>
              <div key={file.key} style={fileitemStyle}>
                <span style={filetypeStyle}>{file.filetype}</span>
                <span style={filenameStyle}>{file.filename}</span>
              </div>
            )
          }
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input
            value={this.state.newDir}
            onChange={(e) => {this.setState({ newDir: e.target.value })}}
            style={{width: 'auto', marginRight: '8px'}}
            placeholder={i18n('project.add_directory')}
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
          <p className="ant-upload-text">{i18n('project.click_drag_upload')}</p>
          <p className="ant-upload-hint">pdf, doc, docx, xls, xlsx, ppt, pptx</p>
        </Dragger>
      </div>
    )
  }
}

export default connect()(ProjectAttachments)
