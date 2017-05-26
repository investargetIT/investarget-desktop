import React from 'react'
import { Form, Input } from 'antd'

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
      {props.decorator(props.name, {
        rules: [{
          type: props.type, message: 'The input is not valid!',
        }, {
          required: props.required, message: 'The input can not be empty!',
        }],
      })(<Input />)}
    </FormItem>
  )
}

const Email = props => <InputFormItem label="EEE-mail" decorator={props.decorator} name="email" type="email" required />

const FullName = props => <InputFormItem label="Full Name" decorator={props.decorator} name="username" required />

module.exports = {
  Email,
  FullName
}
