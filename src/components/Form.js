import React from 'react'
import { Form, Input } from 'antd'
import { i18n } from '../utils/util'
import PropTypes from 'prop-types'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

function InputFormItem(props, context) {
  return (
    <FormItem {...formItemLayout} label={props.label}>
      {context.form.getFieldDecorator(props.name, {
        rules: [{
          type: props.valueType, message: 'The input is not valid!',
        }, {
          required: props.required, message: 'The input can not be empty!',
        }, {
          validator: props.validator
        }],
      })(<Input type={props.type} />)}
    </FormItem>
  )
}
InputFormItem.contextTypes = {
  form: PropTypes.object
}

const Email = () => <InputFormItem label={i18n("email")} name="email" valueType="email" required />

const FullName = () => <InputFormItem label={i18n("username")} name="username" required />

const Password = () => <InputFormItem label={i18n("password")} name="password" required type="password" />

const ConfirmPassword = (props, context) => {

  function validator(rule, value, callback) {
    const password = context.form.getFieldValue('password')
    if (value && password && value !== password) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  return <InputFormItem label={i18n("confirm_password")} name="confirm" required type="password" validator={validator} />
}
ConfirmPassword.contextTypes = {
  form: PropTypes.object
}


module.exports = {
  Email,
  FullName,
  Password,
  ConfirmPassword
}
