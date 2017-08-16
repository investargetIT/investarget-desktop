import React from 'react'
import PropTypes from 'prop-types'
import { i18n, hasPerm, intersection } from '../utils/util'
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
import { UploadImage } from './Upload'


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

    const { getFieldDecorator } = this.props.form
    getFieldDecorator('cardBucket', {
      rules: [{required: true}], initialValue: 'image'
    })

    if (!hasPerm('usersys.admin_adduser') && hasPerm('usersys.user_adduser')) {
      getFieldDecorator('groups', {
        rules: [{required: true}], initialValue: [] // 未审核投资人
      })

    }
    
    this.state = {
      investorGroup: [], // 投资人所在的用户组
    }
    this.isEditUser = false
    let perm
    switch (props.type) {
      case 'edit':
        perm = 'usersys.admin_getuser'
        this.isEditUser = true
        break
      case 'add':
        perm = 'usersys.admin_adduser'
        break
    }
    this.hasPerm = hasPerm(perm)
  }

  componentDidMount() {
    api.queryUserGroup({ type: 'investor', page_size: 100 })
    .then(data => this.setState({ investorGroup: data.data.data.map(m => m.id) }))
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const isAdmin = hasPerm('usersys.admin_adduser')
    const targetUserIsInvestor = getFieldValue('groups') && intersection(getFieldValue('groups'), this.state.investorGroup).length > 0
    return (
      <Form>

        <BasicFormItem label="用户组" name="groups" valueType="array" required>
          <SelectUserGroup type={isAdmin || 'investor'} />
        </BasicFormItem>

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
                    <Input onBlur={this.props.mobileOnBlur} />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n("email")} name="email" valueType="email" required><Input onBlur={this.props.emailOnBlur} /></BasicFormItem>

        <BasicFormItem label="姓名" name="usernameC" required><Input /></BasicFormItem>

        <BasicFormItem label="英文名" name="usernameE" required><Input /></BasicFormItem>

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

        <BasicFormItem label={i18n("department")} name="department"><Input /></BasicFormItem>

        <BasicFormItem label="区域" valueType="number" name="orgarea">
          <SelectOrganizatonArea />
        </BasicFormItem>

        <BasicFormItem label={i18n("country")} name="country" valueType="number">
          <CascaderCountry />
        </BasicFormItem>

        <BasicFormItem label={i18n("tag")} name="tags" valueType="array">
          <SelectTag mode="multiple" />
        </BasicFormItem>

        <BasicFormItem label="标的需求" name="targetdemand"><Input.TextArea rows={4} /></BasicFormItem>
        <BasicFormItem label="近年并购动态" name="mergedynamic"><Input.TextArea rows={4} /></BasicFormItem>
        <BasicFormItem label="是否有产业基金或成立计划" name="ishasfundorplan"><Input.TextArea rows={4} /></BasicFormItem>
        
        {
          this.hasPerm ? (
            <BasicFormItem label={i18n("status")} name="userstatus" valueType="number" initialValue={2}>
              <RadioAudit />
            </BasicFormItem>
          ) : null
        }

        <div style={{ display: targetUserIsInvestor && this.isEditUser && this.hasPerm ? 'block' : 'none' }}>
          <BasicFormItem label="强交易师" name="major_trader">
            <SelectUser 
            mode="single" 
            onSelect={this.props.onSelectMajorTrader}
            disabledOption={getFieldValue('minor_traders')} />
          </BasicFormItem>
        </div>

        <div style={{ display: targetUserIsInvestor && this.isEditUser && this.hasPerm ? 'block' : 'none' }}>
          <BasicFormItem label="弱交易师" name="minor_traders" valueType="array">
            <SelectUser mode="multiple"
              onSelect={this.props.onSelectMinorTrader}
              onDeselect={this.props.onDeselectMinorTrader} 
              disabled={!getFieldValue('major_trader')}
              disabledOption={getFieldValue('major_trader')} />
          </BasicFormItem>
        </div>

        <div style={{ display: targetUserIsInvestor && this.isEditUser && this.hasPerm ? 'block' : 'none' }}>
          <BasicFormItem label="IR" name="IR">
            <SelectUser mode="single" type="admin" />
          </BasicFormItem>
        </div>

        <BasicFormItem label="名片" name="cardKey">
          <UploadImage />
        </BasicFormItem>

      </Form>
    )
  }
}


export default UserForm
