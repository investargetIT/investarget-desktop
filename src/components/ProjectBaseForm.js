import React from 'react'
import PropTypes from 'prop-types'
import { i18n } from '../utils/util'
import { connect } from 'dva'
import { Link } from 'dva/router'
import styles from './ProjectForm.css'

import { Form, Input, Radio, Checkbox } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item

import {
  BasicFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'

import {
  SelectTag,
  SelectRole,
  SelectTransactionType,
  CascaderCountry,
  CascaderIndustry,
  RadioTrueOrFalse,
  SelectService,
} from '../components/ExtraInput'

const paraStyle = {lineHeight: 2, marginBottom: '8px'}


// currentUserId
const userInfo = localStorage.getItem('user_info')
const currentUserId = userInfo ? JSON.parse(userInfo).id : null


class ProjectBaseForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  constructor(props) {
    super(props)
    window.form = props.form
    const { getFieldDecorator } = props.form

    getFieldDecorator('supportUser', {
      rules: [{required: true, type: 'number'}],
      initialValue: currentUserId,
    })
  }

  getChildContext() {
    return { form: this.props.form }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form>
        <BasicFormItem label={i18n('project.is_hidden')} name="isHidden" valueType="boolean" initialValue={false}>
          <RadioTrueOrFalse />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.project_chinese_name')} name="projtitleC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.project_english_name')} name="projtitleE" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.tags')} name="tags" valueType="array" required>
          <SelectTag mode="multiple" />
        </BasicFormItem>

        <IndustryDynamicFormItem industry={this.props.industry} />

        <BasicFormItem label={i18n('project.country')} name="country" required valueType="number">
          <CascaderCountry size="large" />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.engagement_in_transaction')} name="character" required valueType="number">
          <SelectRole />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.transaction_type')} name="transactionType" required valueType="array">
          <SelectTransactionType mode="multiple" />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.service_type')} name="service" required valueType="array">
          <SelectService mode="multiple" />
        </BasicFormItem>

        <div style={{textAlign: 'center'}}>
          <div style={paraStyle}>
            <FormItem style={{'display': 'inline'}}>
              {
                getFieldDecorator('isAgreed', {
                  valuePropName: 'checked',
                  rules: [{type: 'boolean'}, {required: true}, {validator: (rule, value, callback) => {
                    if (value) { callback() } else { callback('Please check the agreement') }
                  }}],
                  initialValue: true,
                })(
                  <Checkbox><Link to="/app/agreement" target="_blank">{i18n('project.agreement')}</Link></Checkbox>
                )
              }
            </FormItem>
          </div>
          <p style={paraStyle}>{i18n('project.agreement_tip')}</p>
        </div>
      </Form>
    )
  }

}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

export default connect(mapStateToPropsIndustry)(ProjectBaseForm)
