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
  Row,
  Col,
  Spin, 
} from 'antd'
import QRCode from 'qrcode.react';
const TabPane = Tabs.TabPane
const Dragger = Upload.Dragger


const ellipsisStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: '#656565'
}
const fileitemStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 10,
  padding: '0 4px',
}
const filetypeStyle = {
  flexShrink: 0,
  width: '225px',
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

function DirectoryCell(props) {
  return (
    <Row style={{ padding: '0 20px', borderBottom: '1px solid lightgray' }}>
      <Col span={16}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', fontSize: 16, color: '#05161e' }}>{props.name}</div>
      </Col>
      <Col span={8}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <Upload {...props.upload}><span style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传</span></Upload>
      <span style={{ marginLeft: 10, padding: '4px 20px', color: 'white', backgroundColor: '#f4b348', borderRadius: 4 }}>手机上传</span>
      </div>
      </Col>
    </Row>
  );
}

class ProjectAttachments extends React.Component {

  uploading = {}

  constructor(props) {
    super(props)

    this.state = {
      fileList: [],
      dirs: fixedDirs.slice(),
      activeDir: fixedDirs[0],
      newDir: '',
      qrCodeValue: null,
      spinning: false,
      highlight: null,
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
    this.setState({ spinning: false });

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
    this.setState({ spinning: false });
    const index  = _.findIndex(this.state.fileList, function(item) {
      return item.filetype == file.filetype && item.filename == file.filename
    })
    this.setState({
      fileList: [ ...this.state.fileList.slice(0, index), file, ...this.state.fileList.slice(index+1) ]
    })
  }

  handleFileRemove = (file) => {
    this.setState({ spinning: true });
    this.removeAttachment(file).then(result => {
      const index  = _.findIndex(this.state.fileList, function(item) {
        return item.filetype == file.filetype && item.filename == file.filename
      })
      this.setState({
        fileList: [ ...this.state.fileList.slice(0, index), ...this.state.fileList.slice(index+1) ],
        spinning: false
      })
    }, error => {
      this.handleError(error)
    })
  }


  getAttachment = () => {
    const projId = this.props.projId
    api.getProjAttachment(projId).then(result => {
      return result.data.data
    })
    .then(fileList => {
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
    })
    .catch(error => {
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
      this.getAttachment()
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

  handleConfirmRemoveFile = file => {
    Modal.confirm({
      title: i18n('project.message.delete_file_title'),
      content: file.name,
      onOk: this.handleFileRemove.bind(this, file),
    })
  }

  beforeUpload = (key, file) => {
    this.setState({ spinning: true, activeDir: key });
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
    this.getAttachment()
  }

  handleError = (error) => {
    this.props.dispatch({
      type: 'app/findError',
      payload: error
    })
  }

  queryQrCodeStatus = () => {
    api.getQRCodeStatus(this.qrCodeKey)
    .then(result => {
      const record = result.data[this.qrCodeKey];
      if (record.key) {
        clearInterval(this.pull);
        this.setState({ qrCodeValue: null });
        const file = {...record, filetype: this.state.activeDir};
        this.addAttachment(file);
      }
    });
  }

  handleMobileUploadBtnClicked = () => {
    api.getMobileUploadKey()
    .then(result => {
      let record;
      const object = result.data;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          record = key;
        }
      }
      this.qrCodeKey = record;
      this.setState({ qrCodeValue: 'http://192.168.1.113:3000/upload?key=' + record });
      this.pull = setInterval(this.queryQrCodeStatus, 1000);
    }); 
  }

  handleCancelMobileUpload = () => {
    this.setState({ qrCodeValue: null });
    clearInterval(this.pull);
    api.cancelMobileUpload(this.qrCodeKey);
  }

  render() {
    const { fileList, dirs } = this.state

    let panes = dirs.map(item => ({ title: item, key: item, closable: !fixedDirs.includes(item) }))
    let targetFileList = fileList.filter(item => item.filetype == this.state.activeDir)
    let doneFileList = fileList.filter(file => file.status == 'done')

    const uploadProps = {
      action: BASE_URL + "/service/qiniubigupload?bucket=file",
      accept: fileExtensions.join(','),
      fileList: targetFileList,
      onChange: this.handleFileChange,
      onRemove: this.handleFileRemoveConfirm,
      showUploadList: false
    }

    return (
      <div style={{ paddingTop: 15 }}>

        <div style={{ marginBottom: 16 }}>
          <Input
            value={this.state.newDir}
            onChange={(e) => {this.setState({ newDir: e.target.value })}}
            style={{width: 'auto', marginRight: '8px'}}
            placeholder={i18n('project.add_directory')}
          />
          <Button onClick={this.addDir} disabled={this.state.newDir == ''}>ADD</Button>
        </div>

        <div style={{ height: 20 }} />
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
        <Button onClick={this.handleMobileUploadBtnClicked} style={{ margin: '20px 0' }}>手机上传</Button>
        
        <Row style={{ backgroundColor: '#ebf0f3', padding: '0 20px' }}>
          <Col span={16}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', color: '#282828', fontSize: 14  }}>目录</div>
          </Col>
          <Col span={8}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ color: '#282828', fontSize: 14 }}>添加目录</span>
              <span style={{ marginLeft: 10, marginBottom: 4, color: '#237ccc', fontSize: 30, fontWeight: 'normal' }}>+</span>
            </div>
          </Col>
        </Row>

        <div style={{ position: 'relative' }}>
          {panes.map(pane => <DirectoryCell
            name={pane.title}
            key={pane.key}
            upload={{ ...uploadProps, beforeUpload: this.beforeUpload.bind(this, pane.key) }} />
          )}
          { this.state.spinning ? 
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin />
          </div>
          : null }
        </div>

        <div style={{ marginTop: 30 }}>
          <p style={{ marginBottom: '8px', fontSize: 16, color: '#282828', fontWeight: 'bold' }}>{i18n('project.has_attachments')} (<span>{ doneFileList.length }</span>)</p>
          <div style={{ marginLeft: '8px', marginTop: 20 }}>
          {
            doneFileList.map(file =>
              <div 
                key={file.key} 
                style={{ ...fileitemStyle, backgroundColor: this.state.highlight === file.key ? 'blanchedalmond': 'inherit'}} 
                onMouseEnter={() => this.setState({highlight: file.key})}
                onMouseLeave={() => this.setState({highlight: null})}
              >
                <span style={filetypeStyle}>{file.filetype}</span>
                <span style={filenameStyle}>{file.filename}</span>
                { this.state.highlight === file.key ? 
                <span style={{ cursor: 'pointer' }} onClick={this.handleConfirmRemoveFile.bind(this, file)}>x</span>
                : null }
              </div>
            )
          }
          </div>
        </div>

        { this.state.qrCodeValue ? 
        <Modal
          width={230}
          visible={true}
          footer={null}
          onCancel={this.handleCancelMobileUpload}
        >
          <div style={{ width: 128, margin: '20px auto', marginBottom: 10 }}>
            <QRCode value={this.state.qrCodeValue} />
          </div>
          <p style={{ marginBottom: 10 }}>请使用手机扫描二维码上传附件</p>
        </Modal>
        : null }

      </div>
    )
  }
}

export default connect()(ProjectAttachments)
