import React from 'react'
import { Form, Input } from 'antd'
import { i18n } from '../utils/util'

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

function InputFormItem(props) {
  return (
    <FormItem {...formItemLayout} label={props.label}>
      {props.form.getFieldDecorator(props.name, {
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

const Email = props => <InputFormItem label={i18n("email")} form={props.form} name="email" valueType="email" required />

const FullName = props => <InputFormItem label={i18n("username")} form={props.form} name="username" required />

const Password = props => <InputFormItem label={i18n("password")} form={props.form} name="password" required type="password" />

const ConfirmPassword = props => {

  function validator(rule, value, callback) {
    const password = props.form.getFieldValue('password')
    if (value && password && value !== password) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  return <InputFormItem label={i18n("confirm_password")} form={props.form} name="confirm" required type="password" validator={validator} />
}

module.exports = {
  Email,
  FullName,
  Password,
  ConfirmPassword
}
