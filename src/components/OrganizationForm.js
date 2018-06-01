import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { 
  i18n, 
  exchange, 
  hasPerm, 
  getCurrencyFromId, 
  checkMobile,
} from '../utils/util';
import { routerRedux } from 'dva/router'
import { Form, Input, InputNumber, Button, Row, Col } from 'antd'
const FormItem = Form.Item

import {
  SelectOrganizationType,
  CascaderIndustry,
  SelectTransactionPhase,
  RadioTrueOrFalse,
  RadioCurrencyType,
  RadioAudit,
  SelectTag,
  SelectOrgLevel,
} from '../components/ExtraInput'

import {
  BasicFormItem,
  CurrencyFormItem,
} from '../components/Form'


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

/**
 *  OrganizationForm 的字段 :
 *  'orgnameC', 'orgnameE', 'orgtype', 'industry', 'orgtransactionphase', 'stockcode', 'investoverseasproject', 'currency',
 *  'transactionAmountF', 'transactionAmountT', 'fundSize', 'companyEmail', 'webSite', 'mobileAreaCode', 'mobile', 'weChat',
 *  'address', 'description', 'typicalCase', 'partnerOrInvestmentCommiterMember', 'decisionCycle', 'decisionMakingProcess',
 *  'orgstatus'
 */


class OrganizationForm extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (!hasPerm('org.admin_addorg') && !hasPerm('org.user_addorg')) {
      this.props.dispatch(routerRedux.replace('/403'))
      return
    }
  }

  handleCurrencyTypeChange = currencyType => {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    const currency = getCurrencyFromId(currencyType || 2)
    exchange(currency).then((rate) => {
      const fields = ['transactionAmountF', 'transactionAmountT', 'fundSize']
      const values = {}
      fields.forEach(field => {
        let value = getFieldValue(field)
        values[field + '_USD'] = value == undefined ? value : Math.round(value * rate)
      })
      setFieldsValue({...values, currencyType})
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    return (
      <Form>

        <BasicFormItem label={i18n('organization.cn_name')} name="orgnameC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.en_name')} name="orgnameE" whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.full_name')} name="orgfullname" whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.org_type')} name="orgtype" valueType="number">
          <SelectOrganizationType />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.industry')} name="industry" valueType="number">
          <CascaderIndustry disabled={[]} />
        </BasicFormItem>

        <BasicFormItem label="标签" name="tags" valueType="array">
          <SelectTag mode="multiple" />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.transaction_phase')} name="orgtransactionphase" valueType="array">
          <SelectTransactionPhase mode="multiple" allowClear />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.stock_code')} name="stockcode">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.invest_oversea_project')} name="investoverseasproject" valueType="boolean" initialValue={false}>
          <RadioTrueOrFalse />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.currency')} name="currency" valueType="number" onChange={this.handleCurrencyTypeChange}>
          <RadioCurrencyType onChange={this.handleCurrencyTypeChange} />
        </BasicFormItem>

        <CurrencyFormItem label={i18n('organization.transaction_amount_from')} name="transactionAmountF" currencyType={this.props.form.getFieldValue('currency')}/>

        <CurrencyFormItem label={i18n('organization.transaction_amount_to')} name="transactionAmountT" currencyType={this.props.form.getFieldValue('currency')} />

        <CurrencyFormItem label={i18n('organization.fund_size')} name="fundSize" currencyType={this.props.form.getFieldValue('currency')} />

        <BasicFormItem label={i18n('organization.company_email')} name="companyEmail" valueType="email">
          <Input type="email" />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.company_website')} name="webSite">
          <Input />
        </BasicFormItem>

        <FormItem {...formItemLayout} label={i18n('organization.telephone')}>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem>
                {
                  getFieldDecorator('mobileAreaCode', {
                    rules: [{ message: '' }],
                    initialValue: '86'
                  })(
                    <Input prefix="+" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>{getFieldDecorator('mobileCode')(<Input placeholder="区号" />)}</FormItem>
            </Col>
            <Col span={16}>
              <FormItem>
                {
                  getFieldDecorator('mobile', {
                    rules: [
                      { message: 'Please input' },
                      { validator: (rule, value, callback) => value ? checkMobile(value) ? callback() : callback('格式错误') : callback() },
                  ]
                  })(
                    <Input />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n('organization.wechat')} name="weChat">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.address')} name="address">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.description')} name="description">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.typical_case')} name="typicalCase">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.partner_or_investment_committee_member')} name="partnerOrInvestmentCommiterMember">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.decision_cycle')} name="decisionCycle" valueType="number">
          <InputNumber style={{ width: '100%' }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.decision_process')} name="decisionMakingProcess">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label="机构状态" name="orglevel" valueType="number">
          <SelectOrgLevel />
        </BasicFormItem>

        { hasPerm('org.admin_addorg') ?
        <BasicFormItem label={i18n('organization.audit_status')} name="orgstatus" valueType="number" initialValue={1}>
          <RadioAudit />
        </BasicFormItem>
        : null }

      </Form>
    )
  }
}

export default connect()(OrganizationForm)
