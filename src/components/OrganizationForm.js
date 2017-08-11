import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { injectIntl, intlShape } from 'react-intl'
import { i18n, exchange, hasPerm } from '../utils/util'
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
 *  'orgnameC', 'orgnameE', 'orgtype', 'industry', 'orgtransactionphase', 'orgcode', 'investoverseasproject', 'currency',
 *  'transactionAmountF', 'transactionAmountT', 'fundSize', 'companyEmail', 'webSite', 'mobileAreaCode', 'mobile', 'weChat',
 *  'address', 'description', 'typicalCase', 'partnerOrInvestmentCommiterMember', 'decisionCycle', 'decisionMakingProcess',
 *  'orgstatus'
 */


class OrganizationForm extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (!hasPerm('org.admin_addorg') && !hasPerm('org.user_addorg')) {
      this.props.dispatch(routerRedux.replace('/403'))
      return
    }
  }

  handleCurrencyTypeChange = (currency) => {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    let currencyMap = {'1': 'CNY','2': 'USD','3': 'CNY'}
    exchange(currencyMap[String(currency)]).then((rate) => {
      const fields = ['transactionAmountF', 'transactionAmountT', 'fundSize']
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
    const { formatMessage } = this.props.intl
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    return (
      <Form>

        <BasicFormItem label={formatMessage({id: 'organization.cn_name'})} name="orgnameC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.en_name'})} name="orgnameE" whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.org_type'})} name="orgtype" valueType="number">
          <SelectOrganizationType />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.industry'})} name="industry" valueType="number">
          <CascaderIndustry disabled={[]} />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.transaction_phase'})} name="orgtransactionphase" valueType="array">
          <SelectTransactionPhase mode="multiple" allowClear />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.stock_code'})} name="orgcode">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.invest_oversea_project'})} name="investoverseasproject" valueType="boolean" initialValue={false}>
          <RadioTrueOrFalse />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.currency'})} name="currency" valueType="number" onChange={this.handleCurrencyTypeChange}>
          <RadioCurrencyType />
        </BasicFormItem>

        <CurrencyFormItem label={formatMessage({id: 'organization.transaction_amount_from'})} name="transactionAmountF" />

        <CurrencyFormItem label={formatMessage({id: 'organization.transaction_amount_to'})} name="transactionAmountT" />

        <CurrencyFormItem label={formatMessage({id: 'organization.fund_size'})} name="fundSize" />

        <BasicFormItem label={formatMessage({id: 'organization.company_email'})} name="companyEmail" valueType="email">
          <Input type="email" />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.company_website'})} name="webSite">
          <Input />
        </BasicFormItem>

        <FormItem {...formItemLayout} label={formatMessage({id: 'organization.telephone'})}>
          <Row gutter={8}>
            <Col span={6}>
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
            <Col span={18}>
              <FormItem>
                {
                  getFieldDecorator('mobile', {
                    rules: [{ message: 'Please input' }]
                  })(
                    <Input />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={formatMessage({id: 'organization.wechat'})} name="weChat">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.address'})} name="address">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.description'})} name="description">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.typical_case'})} name="typicalCase">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.partner_or_investment_committee_member'})} name="partnerOrInvestmentCommiterMember">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.decision_cycle'})} name="decisionCycle" valueType="number">
          <InputNumber style={{ width: '100%' }} />
        </BasicFormItem>

        <BasicFormItem label={formatMessage({id: 'organization.decision_process'})} name="decisionMakingProcess">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        { hasPerm('org.admin_addorg') ? 
        <BasicFormItem label={formatMessage({id: 'organization.audit_status'})} name="orgstatus" valueType="number" initialValue={1}>
          <RadioAudit />
        </BasicFormItem> 
        : null }

      </Form>
    )
  }
}

export default connect()(injectIntl(OrganizationForm))
