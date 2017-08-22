import React from 'react'
import { connect } from 'dva'
import { Upload, Button, Icon, Modal, message } from 'antd'
import { BASE_URL } from '../constants'
import { i18n } from '../utils/util'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

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
      message.warning(i18n('project.message.unsupported_formart'), 2)
      return false
    }
    if (this.state.fileList.length == 1) {
      message.warning(i18n('project.message.only_one'), 2)
      return false
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
    this.setState({ fileList: [] }, this.onChange)
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
            <Icon type="upload" /> {i18n('common.upload')}
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
    this.state = {
      fileList: [],
      previewVisible: false,
      previewImage: '',
    }

    const key = props.value
    if (key) {
      this.getDownloadUrl(key).then(url => {
        const file = { uid: -1, status: 'done', bucket: 'image', key, url }
        this.setState({ fileList: [file] })
      })
    }
  }

  handleCancel = () => {
    this.setState({ previewVisible: false })
    this.viewer.hide()
  }

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
    this.viewer.show()
  }

  beforeUpload = (file) => {
    const isFormatAllowed = imageMimeTypes.indexOf(file.type) != -1
    if (!isFormatAllowed) {
      message.error(i18n('project.message.supported_image_format'), 2)
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(i18n('project.message.image_size_limit'), 2);
    }
    return isFormatAllowed && isLt2M
  }

  handleFileChange = ({ file, fileList, event }) => {
    if (file.status == 'removed') {
      this.props.onChange(null)
    } else {
      if (file.status == 'done') {
        let { key } = file.response.result
        this.props.onChange(key)
      } else {
        this.setState({ fileList })
      }
    }
  }

  getDownloadUrl = (key) => {
    return api.downloadUrl('image', key).then(result => {
      return result.data
    })
  }

  componentWillReceiveProps(nextProps) {
    const key = nextProps.value
    if (key == null) {
      this.setState({ fileList: [] })
    } else {
      this.getDownloadUrl(key).then(url => {
        const file = { uid: -1, status: 'done', bucket: 'image', key, url }
        this.setState({ fileList: [file] })
      })
    }
  }

  componentDidMount() {
    this.viewer = new Viewer(this.refs.img, {
      navbar: false,
      scalable: false,
      fullscreen: false,
    })
  }

  componentWillUnmout() {
    this.viewer.destroy()
  }

  render() {
    const { fileList, previewVisible, previewImage } = this.state

    const uploadButton = (
      <div style={buttonStyle}>
        <Icon type="plus" style={iconStyle} />
      </div>
    )

    return (
      <div className="clearfix">
        <Upload
          style={{ cursor: this.props.disabled ? 'not-allowed' : 'pointer' }}
          disabled={this.props.disabled || false}
          name="file"
          action={BASE_URL + "/service/qiniubigupload?bucket=image"}
          accept={imageExtensions.join(',')}
          beforeUpload={this.beforeUpload}
          fileList={fileList}
          listType="picture-card"
          onPreview={this.handlePreview}
          onChange={this.handleFileChange}
        >
          {fileList.length == 0 ? uploadButton : null}
        </Upload>
        <img ref="img" src={fileList[0] && fileList[0].url} style={{display: 'none'}} onLoad={this.handleImgLoad} />
        {/* <Modal visible={previewVisible} footer={null} closable={false} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <Button onClick={this.handleCancel}>关闭</Button>
          </div>
        </Modal> */}
      </div>
    )
  }
}

export { UploadFile, UploadImage }
