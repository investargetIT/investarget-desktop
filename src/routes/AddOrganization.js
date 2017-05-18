import React from 'react'
import { connect } from 'dva'
import { Form, Input, Radio, Select, Cascader, Button, Row, Col } from 'antd'
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


function AddOrganization({ dispatch, intl, form, organizationTypeOptions, currencyOptions, auditOptions, transactionPhaseOptions, industryOptions, overseaOptions }) {

  const { formatMessage } = intl

  const { getFieldDecorator } = form
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

  return (
    <MainLayout location={location}>
      <div>

        <Row>
          <Col span={24} offset={0}>
            <h3 style={{textAlign: 'center', marginBottom: '24px', fontSize: '20px'}}>{}</h3>
          </Col>
        </Row>

        <Form>
          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.cn_name'})}>
            {
              getFieldDecorator('nameC', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.en_name'})}>
            {
              getFieldDecorator('nameE', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.org_type'})}>
            {
              getFieldDecorator('orgtype', {
                rules: [{ required: true, message: 'Please input' }]
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

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.currency'})}>
            {
              getFieldDecorator('currency', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <RadioGroup options={currencyOptions} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.industry'})}>
            {
              getFieldDecorator('industry', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Cascader options={industryOptions} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.transaction_range'})} className="ant-form-item-required">
              <Row>
                <Col span="6">
                  <FormItem>
                    {
                      getFieldDecorator('transactionAmountF', {
                        rules: [{ required: true, message: 'Please input' }]
                      })(
                        <Input />
                      )
                    }
                  </FormItem>
                </Col>
                <Col span="1">
                  <p className="ant-form-split">-</p>
                </Col>
                <Col span="6">
                  <FormItem>
                    {
                      getFieldDecorator('transactionAmountT', {
                        rules: [{ required: true, message: 'Please input' }]
                      })(
                        <Input />
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.fund_size'})}>
            {
              getFieldDecorator('fundSize', {
                rules: [{ required: true, message: 'Please input'}]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.decision_cycle'})}>
            {
              getFieldDecorator('decisionCycle', {
                rules: [{ required: true, message: 'Please input'}]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.company_email'})}>
            {
              getFieldDecorator('companyEmail', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.company_website'})}>
            {
              getFieldDecorator('webSite', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.telephone'})}>
            {
              getFieldDecorator('mobile', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.wechat'})}>
            {
              getFieldDecorator('weChat', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.transaction_phase'})}>
            {
              getFieldDecorator('transactionPhases', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Select mode="multiple">
                  {
                    transactionPhaseOptions.map(item =>
                      <Option key={item.value.toString()} value={item.value.toString()}>{item.label}</Option>
                    )
                  }
                </Select>
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.audit_status'})}>
            {
              getFieldDecorator('auditUser', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <RadioGroup options={auditOptions} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.stock_code'})}>
            {
              getFieldDecorator('orgcode', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.invest_oversea_project'})}>
            {
              getFieldDecorator('investoverseasproject', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <RadioGroup options={overseaOptions}></RadioGroup>
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.address'})}>
            {
              getFieldDecorator('address', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.description'})}>
            {
              getFieldDecorator('description', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.typical_case'})}>
            {
              getFieldDecorator('typicalCase', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.partner_or_investment_committee_member'})}>
            {
              getFieldDecorator('partnerOrInvestmentCommiterMember', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem {...formItemLayout} label={formatMessage({id: 'organization.decision_process'})}>
            {
              getFieldDecorator('decisionMakingProcess', {
                rules: [{ required: true, message: 'Please input' }]
              })(
                <Input type="textarea" rows={4} />
              )
            }
          </FormItem>

          <FormItem>
            {
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit" size="large" style={{margin: '0 8px'}}>
                  {formatMessage({id: 'common.submit'})}
                </Button>
                <Button size="large" style={{margin: '0 8px'}} onClick={goBack}>
                  {formatMessage({id: 'common.back'})}
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


  return {
    organizationTypeOptions,
    currencyOptions,
    auditOptions,
    transactionPhaseOptions,
    industryOptions,
  }
}

AddOrganization.propTypes = {
  intl: intlShape.isRequired
}

export default connect(mapStateToProps)(injectIntl(Form.create()(AddOrganization)))
