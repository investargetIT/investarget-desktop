import React from 'react'
import PropTypes from 'prop-types'
import { i18n } from '../utils/util'
import * as api from '../api'
import { Link } from 'dva/router'

import { Form, Input, Row, Col, Button } from 'antd'
const FormItem = Form.Item
import {
  BasicFormItem,
} from '../components/Form'

import {
  SelectTag,
  SelectTitle,
  SelectYear,
  CascaderCountry,
  SelectExistOrganization,
  SelectOrganizatonArea,
  SelectUserGroup,
  RadioAudit,
  SelectUser,
} from '../components/ExtraInput'
import { Role, Mobile } from './Form'



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

// 其他字段
// gender, description, remark, school, specialty,



class UserForm extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form>
        <BasicFormItem label="用户组" name="groups" valueType="array" required>
          <SelectUserGroup />
        </BasicFormItem>

        <BasicFormItem label="姓名" name="usernameC" required><Input /></BasicFormItem>

        <BasicFormItem label="英文名" name="usernameE" required><Input /></BasicFormItem>

        <BasicFormItem label={i18n("email")} name="email" valueType="email" required><Input /></BasicFormItem>

        <FormItem {...formItemLayout} label={i18n("mobile")} required>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem required>
                {
                  getFieldDecorator('mobileAreaCode', {
                    rules: [{ message: '' }, {required: true}], initialValue: '86'
                  })(
                    <Input prefix="+" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={18}>
              <FormItem required>
                {
                  getFieldDecorator('mobile', {
                    rules: [{ message: 'Please input' }, {required: true}]
                  })(
                    <Input />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n("wechat")} name="wechat"><Input /></BasicFormItem>

        <BasicFormItem label={i18n("position")} name="title" valueType="number" required>
          <SelectTitle />
        </BasicFormItem>

        <BasicFormItem label={i18n("org")} name="org" valueType="number">
          {/*<div style={{display: 'flex', alignItems: 'center'}}>*/}
            <SelectExistOrganization size="large" />
            {/*<Link to="/app/organization/add" target="_blank"><Button size="large" style={{marginLeft: '8px'}}>新增</Button></Link>*/}
          {/*</div>*/}
        </BasicFormItem>

        {/*待确认*/}
        {/*<BasicFormItem label="区域" valueType="number" name="area">
          <SelectOrganizatonArea />
        </BasicFormItem>*/}

        <BasicFormItem label={i18n("country")} name="country" valueType="number">
          <CascaderCountry />
        </BasicFormItem>

        <BasicFormItem label={i18n("tag")} name="tags" valueType="array">
          <SelectTag mode="multiple" />
        </BasicFormItem>

        <BasicFormItem label={i18n("status")} name="userstatus" valueType="number" initialValue={1}>
          <RadioAudit />
        </BasicFormItem>
        
        { this.props.data && this.props.data.groups && this.props.data.groups.value.includes(1) ? 
        <BasicFormItem label="强交易师" name="major_trader">
          <SelectUser mode="single" />
        </BasicFormItem> : null }

        { this.props.data && this.props.data.groups && this.props.data.groups.value.includes(1) ? 
        <BasicFormItem label="弱交易师" name="minor_traders" valueType="array">
          <SelectUser mode="multiple" />
        </BasicFormItem> : null }

      </Form>
    )
  }
}


export default UserForm
