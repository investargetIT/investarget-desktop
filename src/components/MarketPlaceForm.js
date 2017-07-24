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
import { UploadFile } from './Upload'

// currentUserId
const userInfo = localStorage.getItem('user_info')
const currentUserId = userInfo ? JSON.parse(userInfo).id : null







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

        <BasicFormItem label="附件" name="linkpdfkey" required>
          <UploadFile />
        </BasicFormItem>
      </Form>
    )
  }
}

export default MarketPlaceForm
