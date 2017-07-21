import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { i18n } from '../utils/util'
import { Link } from 'dva/router'

import { Form, Input, Radio, Checkbox, Upload, Icon, Button, message, Modal } from 'antd'
const FormItem = Form.Item

import {
  BasicFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'

import {
  SelectTag,
  CascaderCountry,
  CascaderIndustry,
} from '../components/ExtraInput'

// currentUserId
const userInfo = localStorage.getItem('user_info')
const currentUserId = userInfo ? JSON.parse(userInfo).id : null


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

    const file = props.value
    if (file) {
      file.uid = -1
      file.name = file.key
      file.status = 'done'
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
      message.error(error.message, 2)
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
      this.props.onChange(file)
    }
  }

  componentWillReceiveProps(nextProps) {
    const file = nextProps.value
    if (file) {
      file.uid = -1
      file.name = file.key
      file.status = 'done'
      this.setState({ fileList: [file] })
    } else {
      this.setState({ fileList: [] })
    }
  }

  render() {
    return (
      <Upload
        action="http://192.168.1.201:8000/service/qiniubigupload?bucket=file"
        accept={fileExtensions.join(',')}
        beforeUpload={this.beforeUpload}
        fileList={this.state.fileList}
        onChange={this.handleFileChange}
        onRemove={this.handleFileRemoveConfirm}
      >
        <Button>
          <Icon type="upload" /> 上传
        </Button>
      </Upload>
    )
  }
}




class MarketPlaceForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)

    const { getFieldDecorator } = props.form

    getFieldDecorator('supportUser', {
      rules: [{required: true, type: 'number'}],
      initialValue: currentUserId,
    })
  }

  render() {
    return (
      <Form>
        <BasicFormItem label="项目中文名" name="projtitleC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label="项目英文名" name="projtitleE" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label="热门标签" name="tags" valueType="array" required>
          <SelectTag mode="multiple" />
        </BasicFormItem>

        <IndustryDynamicFormItem />

        <BasicFormItem label="国家" name="country" required valueType="number">
          <CascaderCountry size="large" />
        </BasicFormItem>

        {/* TODO 上传者 */}

        <BasicFormItem label="附件" name="attachment" required valueType="object">
          <UploadFile />
        </BasicFormItem>
      </Form>
    )
  }
}

export default MarketPlaceForm
