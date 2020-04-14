import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, exchange, hasPerm, getCurrentUser, getCurrencyFromId } from '../utils/util'
import * as api from '../api'
import styles from './ProjectForm.css'

import { Collapse, Form, Row, Col, Button, Icon, Input, Switch, Radio, Select, Cascader, InputNumber, Checkbox } from 'antd'
const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const InputGroup = Input.Group

import {
  BasicFormItem,
  CurrencyFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'
 
import {
  TreeSelectTag,
  SelectRole,
  SelectYear,
  SelectTransactionType,
  SelectCurrencyType,
  CascaderCountry,
  CascaderIndustry,
  InputCurrency,
  InputPhoneNumber,
  RadioTrueOrFalse,
  SelectService,
  SelectExistUser,
  SelectAllUser, 
  SelectTrader,
  SelectIndustryGroup,
  SelectExistProject,
} from '../components/ExtraInput'


class ProjectBaseForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    return (
      <Form>
        <BasicFormItem label={i18n('project.is_hidden')} name="isHidden" valueType="boolean">
          <RadioTrueOrFalse />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.project_chinese_name')} name="projtitleC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.project_english_name')} name="projtitleE" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.real_name')} name="realname" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.tags')} name="tags" valueType="array" required>
          <TreeSelectTag />
        </BasicFormItem>

        <IndustryDynamicFormItem industry={this.props.industry} />

        <BasicFormItem label={i18n('project.region')} name="country" required valueType="number">
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

        {/* <BasicFormItem label={i18n('project_bd.industry_group')} name="indGroup" valueType="number">
          <SelectIndustryGroup />
        </BasicFormItem> */}

        <BasicFormItem label="上一轮项目" name="lastProject" valueType="number">
          <SelectExistProject />
        </BasicFormItem>

      </Form>
    )
  }
}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}
ProjectBaseForm = connect(mapStateToPropsIndustry)(ProjectBaseForm)


class ProjectFinanceForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)
  }

  // 处理货币相关表单联动
  handleCurrencyTypeChange = (currencyId) => {
    const { getFieldValue, setFieldsValue } = this.props.form
    const currency = getCurrencyFromId(currencyId)
    exchange(currency).then((rate) => {
      const fields = ['financeAmount', 'companyValuation']
      const values = {}
      fields.forEach(field => {
        let value = getFieldValue(field)
        values[field + '_USD'] = value == undefined ? value : Math.round(value * rate)
      })
      setFieldsValue(values)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { getFieldValue } = this.props.form
    return (
      <Form>
        <BasicFormItem label={i18n('project.company_year')} name="companyYear" valueType="number">
          <SelectYear />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.currency')} name="currency" required valueType="number" onChange={this.handleCurrencyTypeChange}>
          <SelectCurrencyType />
        </BasicFormItem>

        <CurrencyFormItem label={i18n('project.transaction_size')} name="financeAmount" required currencyType={getFieldValue('currency')} />

        <CurrencyFormItem label={i18n('project.company_valuation')} name="companyValuation" currencyType={getFieldValue('currency')} />

        {/* <BasicFormItem label={i18n('project.disclose_financials')} name="financeIsPublic" valueType="boolean" valuePropName="checked">
          <Switch checkedChildren={'ON'} unCheckedChildren={'OFF'} />
        </BasicFormItem> */}


      </Form>
    )
  }
}

ProjectFinanceForm = connect()(ProjectFinanceForm)


class ProjectConnectForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)

    const { getFieldDecorator } = this.props.form
    this.currentUserId = getCurrentUser()
  }

  phoneNumberValidator = (rule, value, callback) => {
    console.log(rule, value, callback)
    const isPhoneNumber = /([0-9]+)-([0-9]+)/
    if (isPhoneNumber.test(value)) {
      callback()
    } else {
      callback(i18n('validation.please_input_correct_phone_number'))
    }
  }

  isCurrentUserSupportUser = () => {
    return this.currentUserId === this.props.form.getFieldValue('supportUser').id;
  }

  render() {
    const { getFieldValue } = this.props.form;
    return (
      <Form>
        {
          this.isCurrentUserSupportUser() || hasPerm('proj.get_secretinfo') ? (
            <BasicFormItem label={i18n('project.contact_person')} name="contactPerson" required whitespace><Input /></BasicFormItem>
          ) : null
        }

        {
           this.isCurrentUserSupportUser() || hasPerm('proj.get_secretinfo') ? (
            <BasicFormItem label={i18n('project.phone')} name="phoneNumber" required validator={this.phoneNumberValidator}><InputPhoneNumber /></BasicFormItem>
          ) : null
        }

        {
           this.isCurrentUserSupportUser() || hasPerm('proj.get_secretinfo') ? (
            <BasicFormItem label={i18n('project.email')} name="email" required valueType="email">
              <Input type="email" />
            </BasicFormItem>
          ) : null
        }

        {
         this.isCurrentUserSupportUser() || hasPerm('proj.get_secretinfo') ? (
            <BasicFormItem label={i18n('project.uploader')} name="supportUserName" initialValue={this.currentUserId}>
              <Input disabled />
            </BasicFormItem>
          ) : null
        } 

        
        {hasPerm('proj.admin_changeproj') ?
          <BasicFormItem label={i18n('project.take_user')} name="takeUser" valueType="array">
            {/* <SelectAllUser type="trader" /> */}
            <SelectTrader mode="multiple" disabledOption={getFieldValue('makeUser')} />
          </BasicFormItem>
          :
          <BasicFormItem label={i18n('project.take_user')} name="takeUserName">
            <Input disabled />
          </BasicFormItem>
        }

        {hasPerm('proj.admin_changeproj') ?
          <BasicFormItem label={i18n('project.make_user')} name="makeUser" valueType="array">
            {/* <SelectAllUser type="trader" /> */}
            <SelectTrader mode="multiple" disabledOption={getFieldValue('takeUser')} />
          </BasicFormItem>
          :
          <BasicFormItem label={i18n('project.make_user')} name="makeUserName">
            <Input disabled />
          </BasicFormItem>
        }
      </Form>
    )
  }
}


class ProjectDetailForm extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Form>
        <BasicFormItem label="公司简介" name="p_introducteC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Company Introduction" name="p_introducteE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="目标市场" name="targetMarketC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Target Market" name="targetMarketE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="核心产品" name="productTechnologyC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Core Product" name="productTechnologyE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="商业模式" name="businessModelC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Business Model" name="businessModelE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="品牌渠道" name="brandChannelC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Brand Channel" name="brandChannelE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="管理团队" name="managementTeamC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Management Team" name="managementTeamE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="商业伙伴" name="BusinesspartnersC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Business Partner" name="BusinesspartnersE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="资金用途" name="useOfProceedC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Use of Proceeds" name="useOfProceedE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="融资历史" name="financingHistoryC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Financing History" name="financingHistoryE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="经营数据" name="operationalDataC" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
        <BasicFormItem label="Operational Data" name="operationalDataE" initialValue={''}>
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>
      </Form>
    )
  }
}

export {
  ProjectBaseForm,
  ProjectFinanceForm,
  ProjectDetailForm,
  ProjectConnectForm,
}
