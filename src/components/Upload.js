import React from 'react'
import { connect } from 'dva'
import { Upload, Button, Icon, Modal, message } from 'antd'
import { BASE_URL } from '../constants'

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


class UploadFile extends React.Component {
  constructor(props) {
    super(props)

    const key = props.value
    if (key) {
      let file = {
        'uid': -1,
        'name': key,
        'status': 'done',
        'bucket': 'file',
        'key': key,
      }
      this.state = { fileList: [file] }
    } else {
      this.state = { fileList: [] }
    }
  }

  beforeUpload = (file) => {
    if (mimeTypes.indexOf(file.type) == -1) {
      message.warning('不支持的文件格式', 2)
      return false
    }
    if (this.state.fileList.length == 1) {
      message.warning('只能上传一个文件', 2)
      return false
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

  handleFileChange = ({ file, fileList, event }) => {
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
    this.setState({ fileList: [file] })
  }

  handleFileUploadDone = (file) => {
    file.bucket = 'file'
    file.key = file.response.result.key
    // file.url = file.response.result.url
    this.setState({ fileList: [file] }, this.onChange)
  }

  handleFileUploadError = (file) => {
    this.setState({ fileList: [ file ] })
  }

  handleFileRemove = (file) => {
    this.removeAttachment(file).then(result => {
      this.setState({ fileList: [] }, this.onChange)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  removeAttachment = (file) => {
    const bucket = file.bucket
    const key = file.key
    if (bucket && key) {
      // 删除已有附件
      return api.qiniuDelete(bucket, key)
    } else {
      // 上传过程中删除
      return Promise.resolve(true)
    }
  }

  onChange = () => {
    if (this.props.onChange) {
      let file = this.state.fileList[0] || null
      let key = file ? file.key : null
      this.props.onChange(key)
    }
  }

  componentWillReceiveProps(nextProps) {
    const key = nextProps.value
    if (key) {
      let file = {
        'uid': -1,
        'name': key,
        'status': 'done',
        'bucket': 'file',
        'key': key,
      }

      this.setState({ fileList: [file] })
    } else {
      this.setState({ fileList: [] })
    }
  }

  render() {

    return (
      <Upload
        name="file"
        action={BASE_URL + "/service/qiniubigupload?bucket=file"}
        accept={fileExtensions.join(',')}
        beforeUpload={this.beforeUpload}
        fileList={this.state.fileList}
        onChange={this.handleFileChange}
        onRemove={this.handleFileRemoveConfirm}
      >
      {
        this.state.fileList.length == 0 ? (
          <Button>
            <Icon type="upload" /> 上传
          </Button>
        ) : null
      }
      </Upload>
    )
  }
}

UploadFile = connect()(UploadFile)


const buttonStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
}

const iconStyle = {
  fontSize: '28px',
  color: '#999',
}

const imageExtensions = ['jpeg', 'png']
const imageMimeTypes = ['image/jpeg', 'image/png']

/**
 * 上传图片（头像、名片）
 */
class UploadImage extends React.Component {
  constructor(props) {
    super(props)

    const key = props.value
    if (key) {
      let file = {
        'uid': -1,
        'name': key,
        'status': 'done',
        'bucket': 'image',
        'key': key,
      }
      api.downloadUrl(file.bucket, file.key).then(result => {
        file['url'] = result.data
        this.state = { fileList: [file] }
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    } else {
      this.state = { fileList: [] }
    }
  }

  beforeUpload = (file) => {
    if (imageMimeTypes.indexOf(file.type) == -1) {
      message.warning('请上传 jpeg 或 png 格式的图片', 2)
      return false
    }
    if (this.state.fileList.length == 1) {
      message.warning('只能上传一个文件', 2)
      return false
    }
  }

  handleFileRemoveConfirm = (file) => {
    return new Promise(function(resolve, reject) {
      Modal.confirm({
        title: '删除图片',
        content: file.name,
        onOk: function() { resolve(true) },
        onCancel: function() { resolve(false) },
      })
    })
  }

  handleFileChange = ({ file, fileList, event }) => {
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
    this.setState({ fileList: [file] })
  }

  handleFileUploadDone = (file) => {
    file.bucket = 'image'
    file.key = file.response.result.key
    file.url = file.response.result.url
    this.setState({ fileList: [file] }, this.onChange)
  }

  handleFileUploadError = (file) => {
    this.setState({ fileList: [ file ] })
  }

  handleFileRemove = (file) => {
    this.removeAttachment(file).then(result => {
      this.setState({ fileList: [] }, this.onChange)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  removeAttachment = (file) => {
    const bucket = file.bucket
    const key = file.key
    if (bucket && key) {
      // 删除已有附件
      return api.qiniuDelete(bucket, key)
    } else {
      // 上传过程中删除
      return Promise.resolve(true)
    }
  }

  onChange = () => {
    if (this.props.onChange) {
      let file = this.state.fileList[0] || null
      let key = file ? file.key : null
      this.props.onChange(key)
    }
  }

  componentWillReceiveProps(nextProps) {
    const key = nextProps.value
    if (key) {
      let file = {
        'uid': -1,
        'name': key,
        'status': 'done',
        'bucket': 'image',
        'key': key,
      }
      api.downloadUrl(file.bucket, file.key).then(result => {
        file['url'] = result.data
        this.setState({ fileList: [file] })
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    } else {
      this.setState({ fileList: [] })
    }
  }

  render() {

    const uploadButton = (
      <div style={buttonStyle}>
        <Icon type="plus" style={iconStyle} />
      </div>
    )

    return (
      <Upload
        name="file"
        action={BASE_URL + "/service/qiniubigupload?bucket=image"}
        accept={imageExtensions.join(',')}
        beforeUpload={this.beforeUpload}
        fileList={this.state.fileList}
        listType="picture-card"
        onPreview={this.handlePreview}
        onChange={this.handleFileChange}
        onRemove={this.handleFileRemoveConfirm}
      >
        {this.state.fileList.length == 1 ? null : uploadButton}
      </Upload>
    )
  }
}

UploadImage = connect()(UploadImage)

export { UploadFile, UploadImage }
