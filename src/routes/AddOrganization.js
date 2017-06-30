import React from 'react'
import { injectIntl, intlShape } from 'react-intl'
import { i18n, exchange } from '../utils/util'
import * as api from '../api'

import { Form, Input, InputNumber, Button, Row, Col } from 'antd'
const FormItem = Form.Item

import MainLayout from '../components/MainLayout';

import {
  BasicFormItem,
  CurrencyFormItem,
} from '../components/Form'

import {
  SelectOrganizationType,
  CascaderIndustry,
  SelectTransactionPhase,
  RadioTrueOrFalse,
  RadioCurrencyType,
  RadioAudit,
} from '../components/ExtraInput'

import PageTitle from '../components/PageTitle'


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


class AddOrganization extends React.Component {

  constructor(props) {
    super(props)
    console.log(props)
  }

  goBack = () => {
    this.props.history.goBack()
  }

  onSubmit = (e) => {
    e.preventDefault()
    const { form, history } = this.props
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // 表单项类型转换

        api.addOrg(values).then((result) => {
          history.goBack()
        }, (error) => {

        })
      }
    })
  }

  // 处理货币相关表单联动
  handleCurrencyTypeChange = (e) => {
    const currency = e.target.value;
    const { getFieldValue, setFieldsValue } = this.props.form
    const currencyMap = {'1': 'CNY','2': 'USD','3': 'CNY'}
    exchange(currencyMap[String(currency)]).then((rate) => {
      console.log(rate)
      const fields = ['transactionAmountF', 'transactionAmountT', 'fundSize']
      const values = {}
      fields.forEach(field => {
        let value = getFieldValue(field)
        values[field + '_USD'] = value == undefined ? value : Math.round(value * rate)
      })
      setFieldsValue(values)
    })
  }

  render() {


  const { dispatch, intl, form } = this.props

  const { formatMessage } = intl

  const { getFieldDecorator, getFieldValue, setFieldsValue } = form

  return (
    <MainLayout location={location}>
      <div>
        <PageTitle title="新增机构" />

        <Row>
          <Col span={24} offset={0}>
            <h3 style={{textAlign: 'center', marginBottom: '24px', fontSize: '20px'}}>{}</h3>
          </Col>
        </Row>

        <Form onSubmit={this.onSubmit}>

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
            <CascaderIndustry />
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

          <BasicFormItem label={formatMessage({id: 'organization.audit_status'})} name="orgstatus" valueType="number" initialValue={1}>
            <RadioAudit />
          </BasicFormItem>


          <FormItem>
            {
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit" size="large" style={{margin: '0 8px'}}>
                  {formatMessage({id: 'submit'})}
                </Button>
                <Button size="large" style={{margin: '0 8px'}} onClick={this.goBack}>
                  {formatMessage({id: 'back'})}
                </Button>
              </div>
            }
          </FormItem>

        </Form>
      </div>
    </MainLayout>
  )
  }
}



AddOrganization.propTypes = {
  intl: intlShape.isRequired
}

function onValuesChange(props, values) {
  console.log('>>>', values)
}


export default injectIntl(Form.create({onValuesChange})(AddOrganization))
