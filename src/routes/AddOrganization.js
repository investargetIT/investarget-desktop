import React from 'react'
import { connect } from 'dva'
import { Form, Input, InputNumber, Radio, Select, Cascader, Button, Row, Col } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

import MainLayout from '../components/MainLayout';
import {
  mapStateToPropsForOrganizationType,
  mapStateToPropsForCurrency,
  mapStateToPropsForAudit,
  mapStateToPropsForTransactionPhase,
  mapStateToPropsForIndustry,
} from '../components/Filter'
import { injectIntl, intlShape } from 'react-intl'



function AddOrganization({ dispatch, intl, form, organizationTypeOptions, currencyOptions, auditOptions, transactionPhaseOptions, industryOptions, exchangeRate }) {

  const { formatMessage } = intl

  const { getFieldDecorator, getFieldValue, setFieldsValue } = form
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

  function goBack() {
    dispatch({
      type: 'addOrganization/goBack'
    })
  }

  const overseaOptions = [
    { value: true, label: intl.formatMessage({id: 'yes'}) },
    { value: false, label: intl.formatMessage({id: 'no'})}
  ]

  const CNYFormatter = value => '￥ ' + value.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  const CNYParser    = value => value.replace(/\￥\s?|(,*)/g, '')
  const USDFormatter = value => '$ ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const USDParser    = value => value.replace(/\$\s?|(,*)/g, '')

  function onSubmit(e) {
    e.preventDefault()
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // 表单项类型转换
        if (values.industry) {
          values.industry = values.industry[values.industry.length - 1]
        }
        if (values.orgtype) {
          values.orgtype = Number(values.orgtype)
        }
        if (values.orgtransactionphase) {
          values.orgtransactionphase = values.orgtransactionphase.map(item => Number(item))
        }
        dispatch({
          type: 'addOrganization/submit',
          payload: values
        })
      }
    })
  }

  function handleCurrencyChange(e) {
    const currency = e.target.value
    const allRelatedFields = ['transactionAmountF', 'transactionAmountT', 'fundSize']
    const CNYTypes = [1,3]
    const rate = CNYTypes.includes(currency) ? exchangeRate : 1
    const values = {}
    allRelatedFields.forEach(item => {
      const val = getFieldValue(item)
      if (val != undefined) {
        values[item + '_USD'] = parseInt(val * rate, 10)
      }
    })
    setFieldsValue(values)
  }

  function handleCurrencyValueChange(fieldName, val) {
    const currency = getFieldValue('currency')
    const CNYTypes = [1,3]
    const rate = CNYTypes.includes(currency) ? exchangeRate : 1
    if (val != undefined) {
      setFieldsValue({ [fieldName + '_USD']: parseInt(val * rate, 10) })
    }
  }

  return (
    <MainLayout location={location}>
      <div>

        <Row>
          <Col span={24} offset={0}>
            <h3 style={{textAlign: 'center', marginBottom: '24px', fontSize: '20px'}}>{}</h3>
          </Col>
        </Row>

        <Form onSubmit={onSubmit}>
          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.cn_name'})}>
            {
              getFieldDecorator('nameC', {
                rules: [{ required: true, whitespace: true }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.en_name'})}>
            {
              getFieldDecorator('nameE', {
                rules: [{ message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.org_type'})}>
            {
              getFieldDecorator('orgtype', {
                rules: [{ type: "string" }],
              })(
                <Select>
                  {
                    organizationTypeOptions.map(item =>
                      <Option key={item.value.toString()} value={item.value.toString()}>{item.label}</Option>
                    )
                  }
                </Select>
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.industry'})}>
            {
              getFieldDecorator('industry', {
                rules: [{ type: "array" }]
              })(
                <Cascader options={industryOptions} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.transaction_phase'})}>
            {
              getFieldDecorator('orgtransactionphase', {
                rules: [{ type: "array" }]
              })(
                <Select mode="multiple" allowClear>
                  {
                    transactionPhaseOptions.map(item =>
                      <Option key={item.value.toString()} value={item.value.toString()}>{item.label}</Option>
                    )
                  }
                </Select>
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.stock_code'})}>
            {
              getFieldDecorator('orgcode', {
                rules: [{ message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.invest_oversea_project'})}>
            {
              getFieldDecorator('investoverseasproject', {
                rules: [{ type: "boolean" }],
                initialValue: false
              })(
                <RadioGroup options={overseaOptions}></RadioGroup>
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.currency'})}>
            {
              getFieldDecorator('currency', {
                rules: [{ type: "number" }]
              })(
                <RadioGroup
                  options={currencyOptions}
                  onChange={handleCurrencyChange}
                />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.transaction_amount_from'})}>
              <Row>
                <Col span={12}>
                  <FormItem>
                    {
                      getFieldDecorator('transactionAmountF', {
                        rules: [{ type: "number" }]
                      })(
                        <InputNumber
                          style={{width: '100%'}}
                          formatter={[1,3].includes(getFieldValue('currency')) ? CNYFormatter : USDFormatter}
                          parser={[1,3].includes(getFieldValue('currency')) ? CNYParser : USDParser}
                          onChange={handleCurrencyValueChange.bind(null, 'transactionAmountF')} />
                      )
                    }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem>
                    {
                      getFieldDecorator('transactionAmountF_USD', {
                        rules: [{ type: "number" }]
                      })(
                        <InputNumber
                          disabled
                          style={{width: '100%'}}
                          formatter={USDFormatter}
                          parser={USDParser} />
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.transaction_amount_to'})}>
            <Row>
              <Col span={12}>
                <FormItem>
                  {
                    getFieldDecorator('transactionAmountT', {
                      rules: [{ type: "number" }]
                    })(
                      <InputNumber
                        style={{width: '100%'}}
                        formatter={[1,3].includes(getFieldValue('currency')) ? CNYFormatter : USDFormatter}
                        parser={[1,3].includes(getFieldValue('currency')) ? CNYParser : USDParser}
                        onChange={handleCurrencyValueChange.bind(null, 'transactionAmountT')} />
                    )
                  }
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem>
                    {
                      getFieldDecorator('transactionAmountT_USD', {
                        rules: [{ type: "number" }]
                      })(
                        <InputNumber
                          disabled
                          style={{width: '100%'}}
                          formatter={USDFormatter}
                          parser={USDParser} />
                      )
                    }
                  </FormItem>
                </Col>
            </Row>
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.fund_size'})}>
            <Row>
              <Col span={12}>
                <FormItem>
                  {
                    getFieldDecorator('fundSize', {
                      rules: [{ type: "number"}]
                    })(
                      <InputNumber
                        style={{width: '100%'}}
                        formatter={[1,3].includes(getFieldValue('currency')) ? CNYFormatter : USDFormatter}
                        parser={[1,3].includes(getFieldValue('currency')) ? CNYParser : USDParser}
                        onChange={handleCurrencyValueChange.bind(null, 'fundSize')} />
                    )
                  }
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem>
                  {
                    getFieldDecorator('fundSize_USD', {
                      rules: [{ type: "number"}]
                    })(
                      <InputNumber
                        disabled
                        style={{width: '100%'}}
                        formatter={USDFormatter}
                        parser={USDParser} />
                    )
                  }
                </FormItem>
              </Col>
            </Row>
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.company_email'})}>
            {
              getFieldDecorator('companyEmail', {
                rules: [{ type: "email" }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.company_website'})}>
            {
              getFieldDecorator('webSite', {
                rules: [{ message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

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

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.wechat'})}>
            {
              getFieldDecorator('weChat', {
                rules: [{ message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.address'})}>
            {
              getFieldDecorator('address', {
                rules: [{ message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.description'})}>
            {
              getFieldDecorator('description', {
                rules: [{ message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.typical_case'})}>
            {
              getFieldDecorator('typicalCase', {
                rules: [{ message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.partner_or_investment_committee_member'})}>
            {
              getFieldDecorator('partnerOrInvestmentCommiterMember', {
                rules: [{ message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.decision_cycle'})}>
            {
              getFieldDecorator('decisionCycle', {
                rules: [{ type: "number"}]
              })(
                <InputNumber
                  style={{ width: '100%' }} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.decision_process'})}>
            {
              getFieldDecorator('decisionMakingProcess', {
                rules: [{ message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.audit_status'})}>
            {
              getFieldDecorator('orgstatus', {
                rules: [{ type: "number" }],
                initialValue: 1
              })(
                <RadioGroup options={auditOptions} />
              )
            }
          </FormItem>

          <FormItem>
            {
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit" size="large" style={{margin: '0 8px'}}>
                  {formatMessage({id: 'submit'})}
                </Button>
                <Button size="large" style={{margin: '0 8px'}} onClick={goBack}>
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


function mapStateToProps(state) {
  const { organizationTypeOptions } = mapStateToPropsForOrganizationType(state)
  const { currencyOptions } = mapStateToPropsForCurrency(state)
  const { auditOptions } = mapStateToPropsForAudit(state)
  const { transactionPhaseOptions } = mapStateToPropsForTransactionPhase(state)
  const { industryOptions } = mapStateToPropsForIndustry(state)

  const { exchangeRate } = state.addOrganization

  return {
    organizationTypeOptions,
    currencyOptions,
    auditOptions,
    transactionPhaseOptions,
    industryOptions,
    exchangeRate
  }
}

AddOrganization.propTypes = {
  intl: intlShape.isRequired
}


export default connect(mapStateToProps)(injectIntl(Form.create()(AddOrganization)))
