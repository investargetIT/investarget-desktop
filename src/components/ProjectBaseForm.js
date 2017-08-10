import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
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
  static propTypes = {
    intl: intlShape.isRequired
  }

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
        <BasicFormItem label="是否隐藏" name="isHidden" valueType="boolean" initialValue={false}>
          <RadioTrueOrFalse />
        </BasicFormItem>

        <BasicFormItem label="项目中文名" name="projtitleC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label="项目英文名" name="projtitleE" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label="热门标签" name="tags" valueType="array" required>
          <SelectTag mode="multiple" />
        </BasicFormItem>

        <IndustryDynamicFormItem industry={this.props.industry} />

        <BasicFormItem label="国家" name="country" required valueType="number">
          <CascaderCountry size="large" />
        </BasicFormItem>

        <BasicFormItem label="我的角色" name="character" required valueType="number">
          <SelectRole />
        </BasicFormItem>

        <BasicFormItem label="交易类型" name="transactionType" required valueType="array">
          <SelectTransactionType mode="multiple" />
        </BasicFormItem>

        <BasicFormItem label="服务类型" name="service" required valueType="array">
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
                  <Checkbox><Link to="">已阅读并接受《免责声明》《平台保密声明》《信息准确性上传者承诺》</Link></Checkbox>
                )
              }
            </FormItem>
          </div>
          <p style={paraStyle}>您所填写的信息均为项目审核所需，我们会在与您核实项目信息后确定项目信息的发布方式及发布渠道</p>
        </div>
      </Form>
    )
  }

}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

export default connect(mapStateToPropsIndustry)(injectIntl(ProjectBaseForm))
