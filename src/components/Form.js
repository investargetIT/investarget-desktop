import React from 'react'
import { Checkbox, Form, Input, Select, Row, Col, Button, Radio } from 'antd'
import { i18n } from '../utils/util'
import PropTypes from 'prop-types'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

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

const tailFormItemLayout = { 
  wrapperCol: {
    xs: {
      span: 24, 
      offset: 0,
    },  
    sm: {
      span: 14, 
      offset: 6,
    },  
  },  
}

function BasicFormItem(props, context) {

  const rules = [
    { type: props.valueType, message: 'The input is not valid!'},
    { required: props.required, message: 'The input can not be empty!'},
  ]

  if (props.validator) {
    rules.push({ validator: props.validator })
  }

  return (
    <FormItem {...formItemLayout} {...props.layout} label={props.label}>
      {context.form.getFieldDecorator(props.name, {rules: rules})(props.children)}
    </FormItem>
  )
}
BasicFormItem.contextTypes = {
  form: PropTypes.object
}

const Email = () => <BasicFormItem label={i18n("email")} name="email" valueType="email" required><Input /></BasicFormItem>

const FullName = () => <BasicFormItem label={i18n("username")} name="username" required><Input /></BasicFormItem>

const Password = () => <BasicFormItem label={i18n("password")} name="password" required><Input type="password" /></BasicFormItem>

const ConfirmPassword = (props, context) => {

  function validator(rule, value, callback) {
    const password = context.form.getFieldValue('password')
    if (value && password && value !== password) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  return <BasicFormItem label={i18n("confirm_password")} name="confirm" required type="password" validator={validator}><Input type="password" /></BasicFormItem>
}
ConfirmPassword.contextTypes = {
  form: PropTypes.object
}

const Position = props => (
  <BasicFormItem label={i18n("position")} name="position" required>
    <Select placeholder="Please select your position">
      { props.title.map(t => <Option key={t.id} value={t.id + ''}>{t.name}</Option>) }
    </Select>
  </BasicFormItem>
)

const Tags = props => (
  <BasicFormItem label={i18n("tag")} name="tags" required valueType="array">
    <Select mode="multiple" placeholder="Please choose your favorite tags">
      { props.tag.map(t => <Option key={t.id}>{t.name}</Option>) }
    </Select>
  </BasicFormItem>
)

const Org = props => (
  <BasicFormItem label={i18n("org")} name="organization" required>
    <Select mode="combobox" onChange={props.onChange}>
      { props.org.map(d => <Option key={d.id} value={d.name}>{d.name}</Option> )}
    </Select>
  </BasicFormItem>
)

const Code = (props, context) => (
  <FormItem {...formItemLayout} label={i18n("code")}>
    <Row gutter={8}>
      <Col span={12}>
        {context.form.getFieldDecorator("code", {
          rules: [{
            required: true, message: 'The input can not be empty!',
          }],
        })(<Input size="large" />)}
      </Col>
      <Col span={12}>
        <Button size="large">{i18n("fetch_code")}</Button>
      </Col>
    </Row>
  </FormItem>
)
Code.contextTypes = {
  form: PropTypes.object
}

const Mobile = (props, context) => {
  const prefixSelector = context.form.getFieldDecorator('prefix', {
    initialValue: '4',
  })( 
    <Select style={{ width: 60 }}>
      {props.country.map(c => <Option key={c.id} value={`${c.id}`}><img src={c.url} style={{ width: 28, height: 18, marginTop: 4, display: 'block' }} /></Option>)}
    </Select>
  )
  return (
    <BasicFormItem label={i18n("mobile")} name="mobile" required>
      <Input addonBefore={prefixSelector} />
    </BasicFormItem>
  )
}
Mobile.contextTypes = {
  form: PropTypes.object
}

const Role = () => (
  <BasicFormItem label={i18n("role")} name="role" required valueType="number">
    <RadioGroup>
      <Radio value={1}>{i18n("investor")}</Radio>
      <Radio value={2}>{i18n("transaction")}</Radio>
    </RadioGroup>
  </BasicFormItem>
)

const Agreement = () => {
  function checkAgreement(rule, value, callback) {
    if (!value) {
      callback('Please check agreement!')
    } else {
      callback()
    }
  }
  return (
    <BasicFormItem layout={tailFormItemLayout} name="agreement"  validator={checkAgreement} valueType="boolean">
      <Checkbox>{i18n("agreement")}I have read the <a href="">agreement</a></Checkbox>
    </BasicFormItem>
  )
}

const Submit = props => (
  <FormItem {...tailFormItemLayout}>
    <Button type="primary" htmlType="submit" size="large" loading={props.loading}>{i18n("register")}</Button>
  </FormItem>
)

module.exports = {
  Email,
  FullName,
  Password,
  ConfirmPassword,
  Position,
  Tags,
  Org,
  Code,
  Mobile,
  Role,
  Agreement,
  Submit,
}
