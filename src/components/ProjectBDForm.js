import React from 'react'
import PropTypes, { func } from 'prop-types'

import { Form, Input, Radio, Checkbox, Row, Col } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item
const TextArea = Input.TextArea

import { BasicFormItem } from './Form'
import {
  SelectBDStatus,
  SelectBDSource,
  SelectTitle,
  SelectArea,
  SelectOrgUser,
  SelectPartner, 
  SelectAllUser, 
  SelectOrganizatonArea,
} from './ExtraInput'
import { i18n } from '../utils/util'
import * as api from '../api'

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

class ProjectBDForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)

    this.state = {
      // 是否是选择联系人的模式
      isSelect: true,

      // 缓存表单的数据
      _username: null,
      _usertitle: null,
      _usermobile: null,
      _bduser: null,
      contactTitle: null,
      contactMobile: null,
    }
  }

  initialDataLoaded = false
  componentWillReceiveProps(nextProps) {
    // 表单拿到bd数据时
    if (!this.initialDataLoaded && nextProps.data && ('bduser' in nextProps.data)) {
      this.initialDataLoaded = true
      let bduserId = nextProps.data.bduser.value
      if (bduserId) {
        this.getUserDetail(bduserId)
      } else {
        this.setState({ isSelect: false })
      }
    }
  }

  handleChangeBduser = (id) => {
    if (id) {
      this.getUserDetail(id)
    }
  }

  getUserDetail = (id) => {
    api.getUserDetailLang(id).then(result => {
      const { title, mobile } = result.data
      this.setState({
        contactTitle: title ? title.name : '',
        contactMobile: mobile,
      })
    })
  }

  toggleManualInput = () => {
    const { getFieldValue } = this.props.form
    this.setState({
      isSelect: false,
      _bduser: getFieldValue('bduser'),
    })
  }

  toggleSelect = () => {
    const { getFieldValue } = this.props.form
    this.setState({
      isSelect: true,
      _username: getFieldValue('username'),
      _usertitle: getFieldValue('usertitle'),
      _usermobile: getFieldValue('usermobile'),
    })
    // 模拟触发改变 bduser 字段
    this.handleChangeBduser(this.state._bduser)
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form

    return (
      <Form>
        <BasicFormItem label={i18n('project_bd.project_name')} name="com_name" required initialValue={this.props.comName}>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.bd_status')} name="bd_status" required valueType="number">
          <SelectBDStatus />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.import_methods')} name="source_type" required valueType="number">
          <SelectBDSource />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.area')} name="location" required valueType="number">
          <SelectOrganizatonArea />
        </BasicFormItem>

        {this.state.isSelect ? (
          <div>
            <BasicFormItem label={i18n('project_bd.contact')} name="bduser" valueType="number" required onChange={this.handleChangeBduser} initialValue={this.state._bduser}>
              <SelectPartner />
            </BasicFormItem>
            <LayoutItem label="" style={{marginTop:-24}}>
              <div>联系人不在库里？<a href="javascript:void(0)" onClick={this.toggleManualInput}>手动输入</a></div>
            </LayoutItem>
            {getFieldValue('bduser') ? (
              <LayoutItem label={i18n('project_bd.contact_title')}>
                {this.state.contactTitle}
              </LayoutItem>
            ) : null}
            {getFieldValue('bduser') ? (
              <LayoutItem label={i18n('project_bd.contact_mobile')}>
                {this.state.contactMobile}
              </LayoutItem>
            ) : null}
          </div>
        ) : (
          <div>
            <BasicFormItem label={i18n('project_bd.contact_name')} name="username" required initialValue={this.state._username}>
              <Input />
            </BasicFormItem>
            <LayoutItem label="" style={{marginTop:-24}}>
              <div>联系人在库里？<a href="javascript:void(0)" onClick={this.toggleSelect}>选择联系人</a></div>
            </LayoutItem>

            <BasicFormItem label={i18n('project_bd.contact_title')} name="usertitle" valueType="number" required initialValue={this.state._usertitle}>
              <SelectTitle />
            </BasicFormItem>

            {/* <BasicFormItem label={i18n('project_bd.contact_mobile')} name="usermobile" required initialValue={this.state._usermobile}>
              <Input />
            </BasicFormItem> */}

              <FormItem {...formItemLayout} label={i18n('project_bd.contact_mobile')} required>
                <Row gutter={8}>
                  <Col span={6}>
                    <FormItem required>
                      {
                        getFieldDecorator('mobileAreaCode', {
                          rules: [{ message: i18n('validation.not_empty'), required: true }], initialValue: '86'
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
                          rules: [{ message: i18n('validation.not_empty'), required: true }]
                        })(
                          <Input onBlur={this.props.mobileOnBlur} />
                          )
                      }
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>

          </div>
        )}

        <BasicFormItem label={i18n('project_bd.manager')} name="manager" valueType="number" required>
          <SelectAllUser type="trader" /> 
        </BasicFormItem>

        {'isAdd' in this.props ? (
          <BasicFormItem label={i18n('remark.comment')} name="comments">
            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
          </BasicFormItem>
        ) : null}
      </Form>
    )
  }
}

export default ProjectBDForm


function LayoutItem({ label, children, style }) {
  return (
    <Row style={{marginBottom:24,...style}}>
      <Col sm={6} xs={24}>
        {label ? (
          <span style={{float:'right',color:'rgba(0, 0, 0, 0.85)'}}>{label}<span style={{margin: '0 8px 0 2px'}}>:</span></span>
        ) : null}
      </Col>
      <Col sm={14} xs={24}>{children}</Col>
    </Row>
  )
}
