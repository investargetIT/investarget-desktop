import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, hasPerm, getCurrentUser } from '../utils/util'
import { Link } from 'dva/router'

import { Form, Input, Radio, Checkbox, Upload, Icon, Button, message, Modal } from 'antd'
const FormItem = Form.Item

import {
  BasicFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'

import {
  TreeSelectTag,
  CascaderCountry,
  CascaderIndustry,
  InputPhoneNumber,
  SelectExistUser,
} from '../components/ExtraInput'
import { UploadFile } from './Upload'



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
    this.currentUserId = getCurrentUser()
    getFieldDecorator('supportUser', {
      rules: [{required: true, type: 'number'}],
      initialValue: this.currentUserId,
    })
  }

  phoneNumberValidator = (rule, value, callback) => {
    const isPhoneNumber = /^\d*\-?\d*$/
    if (isPhoneNumber.test(value)) {
      callback()
    } else {
      callback(i18n('validation.please_input_correct_phone_number'))
    }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    return (
      <Form>
        <BasicFormItem label={i18n('project.chinese_name')} name="projtitleC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.english_name')} name="projtitleE" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.real_name')} name="realname" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.tags')} name="tags" valueType="array" required>
          <TreeSelectTag />
        </BasicFormItem>

        <IndustryDynamicFormItem industry={this.props.industry} />

        <BasicFormItem label={i18n('project.country')} name="country" required valueType="number">
          <CascaderCountry size="large" />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.attachment')} name="linkpdfkey" required>
          <UploadFile />
        </BasicFormItem>

        {
          hasPerm('proj.get_secretinfo') ? (
            <BasicFormItem label={i18n('project.contact_person')} name="contactPerson" required whitespace><Input /></BasicFormItem>
          ) : null
        }

        {
          hasPerm('proj.get_secretinfo') ? (
            <BasicFormItem label={i18n('project.phone')} name="phoneNumber" required validator={this.phoneNumberValidator}><Input /></BasicFormItem>
          ) : null
        }

        {
          hasPerm('proj.get_secretinfo') ? (
            <BasicFormItem label={i18n('project.email')} name="email" required valueType="email">
              <Input type="email" />
            </BasicFormItem>
          ) : null
        }

        {/* 管理员上传项目权限 -> 可以设置 supportUser, 默认值是自己 */}
        {
          hasPerm('proj.admin_addproj') ? (
            <BasicFormItem label={i18n('project.uploader')} name="supportUser" required valueType="number" initialValue={this.currentUserId}>
              <SelectExistUser />
            </BasicFormItem>
          ) : null
        }

        <BasicFormItem label={i18n('project.take_user')} name="takeUser" required valueType="number">
          <SelectExistUser />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.make_user')} name="makeUser" required valueType="number">
          <SelectExistUser />
        </BasicFormItem>

      </Form>
    )
  }
}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

export default connect(mapStateToPropsIndustry)(MarketPlaceForm)
