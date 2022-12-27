import React from 'react'
import { connect } from 'dva'
import _ from 'lodash'
import * as api from '../api'
import { customRequest, i18n, requestAllData } from '../utils/util'
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
import { mobileUploadUrl } from '../utils/request';
// import { MobileUploader } from './GlobalComponents';
import { Modal as GModal } from './GlobalComponents';
import { Link } from 'dva/router';

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
  ...ellipsisStyle,
}


// const fileExtensions = [
//   '.pdf',
//   '.doc',
//   '.xls',
//   '.ppt',
//   '.docx',
//   '.xlsx',
//   '.pptx',
// ]
// const mimeTypes = [
//   'application/pdf',
//   'application/msword',
//   'application/vnd.ms-excel',
//   'application/vnd.ms-powerpoint',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
//   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//   'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
//   'application/vnd.openxmlformats-officedocument.presentationml.template',
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
// ]


export const fixedDirs = ['Teaser', 'Memo', 'BP', 'Presentation', 'Brochure', 'Datapackage', 'FAQ', 'Cap Table', 'PB']

function DirectoryCell(props) {
  return (
    <Row style={{ padding: '0 20px', borderBottom: '1px solid lightgray' }}>
      <Col span={16}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', fontSize: 16, color: '#05161e' }}>{props.name}</div>
      </Col>
      <Col span={8}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <Upload {...props.upload}><span style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传</span></Upload>
      {/* <span onClick={props.onMobileUploadClicked} style={{ marginLeft: 10, padding: '4px 20px', color: 'white', backgroundColor: '#f4b348', borderRadius: 4, cursor: 'pointer' }}>手机上传</span> */}
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
      spinning: false,
      highlight: null,
      addNewDir: false,
      audioTrans: [],
    }

    this.audioToTextFileUid = [];
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
    if (this.state.newDir.length === 0) return;
    const newDir = this.state.newDir
    this.setState({
      dirs: [ ...this.state.dirs, newDir ],
      newDir: '',
      activeDir: newDir,
      addNewDir: false,
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

  handleFileChange = ({ file }) => {
    if (file.status === 'done') {
      this.handleFileUploadDone(file)
    } 
  }

  handleFileUploadDone = (file) => {
    file.bucket = 'file'
    file.key = file.response.result.key
    file.url = file.response.result.url
    file.realfilekey = file.response.result.realfilekey;
    file.filename = file.name; 
    if (this.audioToTextFileUid.includes(file.uid)) {
      file.audioToText = true;
    }
    const index  = _.findIndex(this.state.fileList, function(item) {
      return item.filetype == file.filetype && item.filename == file.filename
    })
    this.addAttachment(file).then(result => {
      this.getAttachment(); 
    }, error => {
      file.status = 'error'
      file.error = error
      this.setState({
        fileList: [ ...this.state.fileList.slice(0, index), file ,...this.state.fileList.slice(index+1) ]
      })
    })
  }

  handleFileRemove = (file) => {
    this.setState({ spinning: true });
    this.removeAttachment(file)
      .then(this.getAttachment)
      .catch(this.handleError);
  }

  getAttachment = () => {
    this.setState({ spinning: true });
    const projId = this.props.projId
    const param = {
      proj: projId,
    }
    requestAllData(api.getProjAttachment, param, 100).then(result => {
      const allTransID = result.data.data.map(m => m.transid).filter(f => f !== null);
      this.getAudioTranslateStatus(allTransID);
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
        spinning: false, 
      })
    })
    .catch(error => {
      this.handleError(error)
    })
  }

  getAudioTranslateStatus = async transIDArr => {
    const reqAll = await Promise.all(
      transIDArr.map(m => api.getAudioTranslate(m))
    );
    const audioTrans = reqAll.map(m => m.data);
    this.setState({ audioTrans });
  }

  addAttachment = async file => {

    let transid = null;
    if (file.audioToText) {
      const { originFileObj: speechFile } = file;
      if (speechFile && speechFile instanceof File) {
        try {
          const { data } = await api.requestAudioTranslate({ key: file.key, file_name: file.filename });
          transid = data.id;
        } catch (error) {
          handleError(error)
          return
        }
      }
    }

    const data = {
      proj: this.props.projId,
      filetype: this.state.activeDir, 
      bucket: file.bucket,
      filename: file.filename,
      key: file.key,
      realfilekey: file.realfilekey,
      transid,
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

  beforeUpload = (key, file, list) => {
    this.setState({ spinning: true, activeDir: key });
    if (/\.(wav|flac|opus|m4a|mp3)$/.test(file.name)) {
      return new Promise((resolve) => {
        const react = this;
        Modal.confirm({
          title: '发现语音文件，是否语音转文字？',
          content: file.name,
          okText: '是',
          cancelText: '否',
          onOk() {
            react.audioToTextFileUid = react.audioToTextFileUid.concat(file.uid);
            resolve();
          },
          onCancel() {
            resolve();
          },
        });
      })
    }
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

  onMobileUploadComplete(status, record) {
    if (!status) return;
    const files = record.map(m => ({ ...m, filetype: this.state.activeDir }));
    this.addAttachments(files);
  }

  addAttachments = (files) => {
    const requests = files.map((file) => {
      const data = {
        proj: this.props.projId,
        filetype: this.state.activeDir,
        bucket: file.bucket,
        filename: file.filename,
        key: file.key,
        realfilekey: file.realfilekey,
      };
      return api.addProjAttachment(data);
    });
    return Promise.all(requests).then(() => {
      this.getAttachment();
    }, (error) => {
      this.handleError(error);
    });
  }

  handleMobileUploadBtnClicked() {
    GModal.MobileUploader.upload && GModal.MobileUploader.upload(this.onMobileUploadComplete.bind(this));
  }

  checkAudisTransFinish = file => {
    const { transid } = file;
    if (!transid) return false;
    const audioTrans = this.state.audioTrans.find(f => f.id === parseInt(transid));
    if (!audioTrans) return false;
    if (audioTrans.taskStatus !== '9') return <span style={{ color: 'red', marginLeft: 20 }}>语音识别中...</span>;
    return (
      <Link
        target="_blank"
        style={{ color: 'red', marginLeft: 20 }}
        to={`/app/speech-to-text/${file.transid}?speechKey=${file.key}`}
      >
        语音转文字
      </Link>
    );
  }

  render() {
    const { fileList, dirs } = this.state

    let panes = dirs.map(item => ({ title: item, key: item, closable: !fixedDirs.includes(item) }))
    let doneFileList = fileList.filter(file => file.status == 'done')

    const uploadProps = {
      customRequest,
      multiple: true,
      data: { bucket: 'file' },
      // accept: fileExtensions.join(','),
      onChange: this.handleFileChange,
      onRemove: this.handleFileRemoveConfirm,
      showUploadList: false
    }

    return (
      <div style={{ paddingTop: 15 }}>

        <Row style={{ backgroundColor: '#ebf0f3', padding: '0 20px' }}>
          <Col span={16}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', color: '#282828', fontSize: 14  }}>目录</div>
          </Col>
          <Col span={8}>
            <div onClick={() => this.setState({ addNewDir: true })} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer' }}>
              <span style={{ color: '#282828', fontSize: 14 }}>添加目录</span>
              <span style={{ marginLeft: 10, marginBottom: 4, color: '#237ccc', fontSize: 30, fontWeight: 'normal' }}>+</span>
            </div>
          </Col>
        </Row>

        {this.state.addNewDir ?
          <Row style={{ padding: '0 20px', borderBottom: '1px solid lightgray' }}>
            <Col span={24}>
              <div style={{ height: 64, display: 'flex', alignItems: 'center', fontSize: 16, color: '#05161e' }}>
                <input onBlur={this.addDir} style={{ border: 'none', backgroundColor: 'inherit', outline: 'none' }} value={this.state.newDir} onChange={e => this.setState({ newDir: e.target.value })} placeholder="添加项目名" />
              </div>
            </Col>
          </Row>
          : null}

        <div style={{ position: 'relative' }}>
          {panes.map(pane => <DirectoryCell
            name={pane.title}
            key={pane.key}
            upload={{ ...uploadProps, beforeUpload: this.beforeUpload.bind(this, pane.key) }} 
            onMobileUploadClicked={() => this.setState({ activeDir: pane.key }, this.handleMobileUploadBtnClicked)} />
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
            doneFileList.sort((a, b) => a.filetype.localeCompare(b.filetype)).map((file, idx) =>
              <div 
                key={idx} 
                style={{ ...fileitemStyle, backgroundColor: this.state.highlight === idx ? 'blanchedalmond': 'inherit'}} 
                onMouseEnter={() => this.setState({highlight: idx})}
                onMouseLeave={() => this.setState({highlight: null})}
              >
                <span style={filetypeStyle}>{file.filetype}</span>
                <div style={{ flex: 1 }}>
                  <span style={filenameStyle}>{file.filename}</span>
                  {this.checkAudisTransFinish(file)}
                </div>
                { this.state.highlight === idx ? 
                <span style={{ cursor: 'pointer' }} onClick={this.handleConfirmRemoveFile.bind(this, file)}>x</span>
                : null }
              </div>
            )
          }
          </div>
        </div>

      </div>
    )
  }
}

export default connect()(ProjectAttachments)
