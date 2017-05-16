import React from 'react'
import { Form, Input, Radio, Select, Cascader, Button, Row, Col } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

function AddOrganization({ form, industryOptions, goBack }) {

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

  const institutionOptions = [
    {value: 1, label: "基金"},
    {value: 2, label: "律所"},
    {value: 3, label: "投行"},
    {value: 4, label: "会计师事务所"},
    {value: 5, label: "咨询"},
    {value: 6, label: "证券"},
    {value: 7, label: "银行"},
    {value: 8, label: "信托"},
    {value: 9, label: "租赁"},
    {value: 10, label: "保险"},
    {value: 11, label: "期货"},
    {value: 12, label: "上市公司"},
    {value: 13, label: "新三板上市公司"},
    {value: 14, label: "非上市公司"},
    {value: 15, label: "政府引导性基金"},
    {value: 16, label: "金融机构直投基金"},
    {value: 17, label: "上市公司产业基金"},
    {value: 18, label: "其他"},
    {value: 19, label: "个人"}
  ]

  const currencyOptions = [
    {value: 1, label: "人民币"},
    {value: 2, label: "美元"},
    {value: 3, label: "人民币及美元"}
  ]

  const auditOptions = [
    {value: 1, label: "待审核"},
    {value: 2, label: "审核通过"},
    {value: 3, label: "审核退回"},
  ]

  const transactionPhaseOptions = [
    {value: 1, label: "种子天使轮"},
    {value: 4, label: "A轮"},
    {value: 6, label: "B轮"},
    {value: 7, label: "C轮"},
    {value: 8, label: "C+轮"},
    {value: 10, label: "Pre-IPO"},
    {value: 11, label: "兼并收购"},
  ]

  return (
    <div>

      <Row>
        <Col span={24} offset={0}>
          <h3 style={{textAlign: 'center', marginBottom: '24px', fontSize: '20px'}}>新增机构</h3>
        </Col>
      </Row>

      <Form>
        <FormItem {...formItemLayout} label="名称">
          {
            getFieldDecorator('nameC', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="英文名称">
          {
            getFieldDecorator('nameE', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="机构类型">
          {
            getFieldDecorator('institution', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Select>
                {
                  institutionOptions.map(item =>
                    <Option key={item.value.toString()} value={item.value.toString()}>{item.label}</Option>
                  )
                }
              </Select>
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="货币类型">
          {
            getFieldDecorator('currency', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <RadioGroup options={currencyOptions} />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="行业">
          {
            getFieldDecorator('industry', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Cascader options={industryOptions} />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="交易范围" className="ant-form-item-required">
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

        <FormItem {...formItemLayout} label="基金规模">
          {
            getFieldDecorator('fundSize', {
              rules: [{ required: true, message: 'Please input'}]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="决策周期（天）">
          {
            getFieldDecorator('decisionCycle', {
              rules: [{ required: true, message: 'Please input'}]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="公司邮箱">
          {
            getFieldDecorator('companyEmail', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="公司官网">
          {
            getFieldDecorator('webSite', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="电话">
          {
            getFieldDecorator('mobile', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="微信公众号">
          {
            getFieldDecorator('weChat', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="轮次">
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

        <FormItem {...formItemLayout} label="审核状态">
          {
            getFieldDecorator('auditUser', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <RadioGroup options={auditOptions} />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="股票代码">
          {
            getFieldDecorator('orgcode', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="是否投海外项目">
          {
            getFieldDecorator('investoverseasproject', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <RadioGroup>
                <Radio value={0}>否</Radio>
                <Radio value={1}>是</Radio>
              </RadioGroup>
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="地址">
          {
            getFieldDecorator('address', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="描述">
          {
            getFieldDecorator('description', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input type="textarea" rows={4} />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="典型投资案例">
          {
            getFieldDecorator('typicalCase', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input type="textarea" rows={4} />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="合伙人/投委会成员">
          {
            getFieldDecorator('partnerOrInvestmentCommiterMember', {
              rules: [{ required: true, message: 'Please input' }]
            })(
              <Input type="textarea" rows={4} />
            )
          }
        </FormItem>

        <FormItem {...formItemLayout} label="决策流程">
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
              <Button type="primary" htmlType="submit" size="large" style={{margin: '0 8px'}}>提交</Button>
              <Button size="large" style={{margin: '0 8px'}} onClick={goBack}>返回</Button>
            </div>
          }
        </FormItem>

      </Form>
    </div>
  )
}

export default Form.create()(AddOrganization)
