import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import { Modal, Select, Checkbox, Row, Col, Upload, Spin } from 'antd';
import { baseUrl } from '../utils/request';
import { Modal as GModal } from './GlobalComponents';
import _ from 'lodash';

const Option = Select.Option

const fileExtensions = [
  '.pdf',
  '.doc',
  '.xls',
  '.ppt',
  '.docx',
  '.xlsx',
  '.pptx',
];
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
];

class SelectProjectStatus extends React.Component {
  constructor(props) {
    super(props)
  }

  handleChange = (value) => {
    this.props.onChange(Number(value))
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['projstatus'] })
  }

  render() {
    const {options, children, dispatch, status, value, onChange, ...extraProps} = this.props
    let _options = []

    if (status < 4) {
      _options = options.filter(item => item.value <= status + 1)
    } else {
      _options = options
    }

    return (
      <Select size="large" value={String(value)} onChange={this.handleChange} {...extraProps}>
        {
          _options.map(item =>
            <Option key={item.value} value={String(item.value)}>{item.label}</Option>
          )
        }
      </Select>
    )
  }
}

SelectProjectStatus = connect(function(state) {
  const { projstatus } = state.app
  const options = projstatus ? projstatus.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})(SelectProjectStatus)

function DirectoryCell(props) {
  return (
    <Row style={{ padding: '0 20px', borderBottom: '1px solid lightgray' }}>
      <Col span={8}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', fontSize: 16, color: '#05161e' }}>{props.name}</div>
      </Col>
      <Col span={16}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Upload {...props.upload}><span style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传</span></Upload>
          <span onClick={props.onMobileUploadClicked} style={{ marginLeft: 10, padding: '4px 20px', color: 'white', backgroundColor: '#f4b348', borderRadius: 4, cursor: 'pointer' }}>手机上传</span>
        </div>
      </Col>
    </Row>
  );
}

class AuditProjectModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fileList: [],
      spinning: false,
      dirs: ['term_sheet'],
      activeDir: 'term_sheet',
    };
  }

  handleSendEmailChange = (e) => {
    this.props.onSendEmailChange(e.target.checked)
  }

  handleSendWechatChange = e => {
    this.props.onSendWechatChange(e.target.checked);
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
    const index  = _.findIndex(this.state.fileList, function(item) {
      return item.filetype == file.filetype && item.filename == file.filename
    })
    this.addAttachment(file).then(result => {
      this.getAttachment();
      Modal.success({
        title: i18n('success'),
        content: '附件已成功上传',
      });
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
      page_size: 10000
    }
    api.getProjAttachment(param).then(result => {
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

  addAttachment = file => {
    const projId = this.props.projId
    const data = {
      proj: this.props.projId,
      filetype: this.state.activeDir, 
      bucket: file.bucket,
      filename: file.filename,
      key: file.key,
      realfilekey: file.realfilekey,
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

    if (mimeTypes.indexOf(file.type) == -1) {
      message.error(i18n('project.message.unsupported_formart'), 2)
      return false
    }

    const { fileList } = this.state

    // 同一个目录下不允许重复上传相同的文件
    const dir = key // current dir
    for (let i = 0, len = fileList.length; i < len; i++) {
      let _file = fileList[i]
      if (dir === _file.filetype && file.name === _file.filename) {
        message.error(i18n('project.message.upload_same_file'), 2)
        return false
      }
    }

    this.setState({ spinning: true, activeDir: key });

    return true
  }

  onMobileUploadComplete(status, record) {
    if (!status) return;
    const files = record.map(m => ({ ...m, filetype: this.state.activeDir }));
    this.addAttachments(files);
  }

  handleMobileUploadBtnClicked() {
    GModal.MobileUploader.upload && GModal.MobileUploader.upload(this.onMobileUploadComplete.bind(this));
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

  render() {
    const { visible, currentStatus, status, sendEmail, confirmLoading, onStatusChange, onSendEmailChange, onOk, onCancel, sendWechat } = this.props

    const uploadProps = {
      action: baseUrl + "/service/qiniubigupload?bucket=file",
      accept: fileExtensions.join(','),
      onChange: this.handleFileChange,
      onRemove: this.handleFileRemoveConfirm,
      showUploadList: false
    }

    return (
      <Modal title={i18n('project.modify_project_status')} visible={visible} onOk={onOk} onCancel={onCancel} confirmLoading={confirmLoading}>
        <div style={{width: '60%', display: 'flex', alignItems: 'center', margin: '0 auto'}}>
          <span style={{marginRight: '8px'}}>{i18n('project.project_status')} : </span>
          <SelectProjectStatus style={{flexGrow: '1'}} status={currentStatus} value={status} onChange={onStatusChange} />
        </div>
        {
          status === 4 ? 
          <div style={{ marginTop: 20, marginLeft: 170 }}>
            <div>
              <Checkbox checked={sendEmail} onChange={this.handleSendEmailChange}>{i18n('project.is_send_email')}</Checkbox>
            </div> 
            <div style={{ marginTop: 6 }}>
              <Checkbox checked={sendWechat} onChange={this.handleSendWechatChange}>是否分享到微信群？</Checkbox>
            </div>
          </div> 
          : null
        }
        {status === 7 &&
          <div style={{ position: 'relative' }}>
            <DirectoryCell
              name="term sheet"
              key="term_sheet"
              upload={{ ...uploadProps, beforeUpload: this.beforeUpload.bind(this, 'term_sheet') }}
              onMobileUploadClicked={() => this.setState({ activeDir: 'term_sheet' }, this.handleMobileUploadBtnClicked)}
            />
            {this.state.spinning &&
              <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin />
              </div>
            }
          </div>
        }
      </Modal>
    )
  }

}


export default AuditProjectModal
