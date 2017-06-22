import React from 'react'
import { connect } from 'dva'
import { injectIntl, intlShape } from 'react-intl'
import { i18n, exchange } from '../utils/util'
import { Collapse, Form, Row, Col, Button, Icon, Input, Switch, Radio, Select, Cascader, InputNumber, Checkbox } from 'antd'
const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const InputGroup = Input.Group
import MainLayout from '../components/MainLayout'
import {
  BasicFormItem,
  CurrencyFormItem,
  IndustryDynamicFormItem,
  FinanceDynamicFormItem,
} from '../components/Form'
import {
  SelectTag,
  SelectRole,
  SelectYear,
  SelectTransactionType,
  SelectCurrencyType,
  CascaderCountry,
  CascaderIndustry,
  InputCurrency,
  InputPhoneNumber,
} from '../components/ExtraInput'
import ProjectAttachments from '../components/ProjectAttachments'
import { Link } from 'dva/router'
import styles from './AddProject.css'
import * as api from '../api'
import PropTypes from 'prop-types'


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
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14, offset: 6 },
    }
  }

  const deleteIconStyle = {
    cursor: 'pointer',
    position: 'absolute',
    top: '4px',
    marginLeft: '8px',
    fontSize: '24px',
    color: '#999',
    transition: 'all .3s',
  }

  // currentUserId
  const userInfo = JSON.parse(localStorage.user_info)
  const currentUserId = userInfo.id


class AddProject extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired
  }

  static childContextTypes = {
    form: PropTypes.object
  }


  constructor(props) {
    super(props)
    window.form = props.form
    const { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue, validateFields } = form

    getFieldDecorator('supportUser', {
      rules: [{required: true, type: 'number'}],
      initialValue: currentUserId,
    })

  }

  getChildContext() {
    return { form: this.props.form }
  }


  phoneNumberValidator = (rule, value, callback) => {
    console.log(rule, value, callback)
    const isPhoneNumber = /([0-9]+)-([0-9]+)/
    if (isPhoneNumber.test(value)) {
      callback()
    } else {
      callback('Please input correct phone number')
    }
  }


  // 处理货币相关表单联动
  handleCurrencyTypeChange = (currency) => {
    const { getFieldValue, setFieldsValue } = this.props.form
    const currencyMap = {'1': 'CNY','2': 'USD','3': 'CNY'}
    exchange(currencyMap[Number(currency)]).then((rate) => {
      console.log(rate)
      const fields = ['financeAmount', 'companyValuation']
      getFieldValue('financeKeys').forEach(key => {
        fields.push(`finance-${key}.revenue`)
        fields.push(`finance-${key}.netIncome`)
      })
      const values = {}
      fields.forEach(field => {
        let value = getFieldValue(field)
        values[field + '_USD'] = value == undefined ? value : Math.round(value * rate)
      })
      setFieldsValue(values)
    })
  }

  // TODO  保存项目可以做成存储在 localStorage, 再加一个按钮 重置
  saveProject = () => {
    const values = this.props.form.getFieldsValue()
    const data = toData(values)
    localStorage.setItem('projectData', JSON.stringify(data))
  }

  submitProject = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        api.createProj(param).then(result => {
          cosnole.log('ok', result)
        })
      } else {
        console.log('err', err)
      }
    })
  }


  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form

  return(
    <MainLayout location={this.props.location}>
      <div>
        <Row>
          <Col span={24} offset={0}>
            <h3 style={{textAlign: 'center', marginBottom: '24px', fontSize: '20px'}}>{}</h3>
          </Col>
        </Row>

        <Form onSubmit={this.submitProject}>
          <Collapse defaultActiveKey={['1','2','3','4', '5']} style={{marginBottom: '48px'}}>
            <Panel header="基本信息" key="1">

              <BasicFormItem label="是否隐藏" name="isHidden" valueType="boolean">
                <RadioGroup options={[{value: false, label: i18n('no')}, {value: true, label: i18n('yes')}]} />
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

              <IndustryDynamicFormItem />

              <BasicFormItem label="国家" name="country" required valueType="number" initialValue={[1,5]}>
                <CascaderCountry size="large" />
              </BasicFormItem>

              <BasicFormItem label="我的角色" name="character" required valueType="number">
                <SelectRole />
              </BasicFormItem>

              <BasicFormItem label="交易类型" name="transactionType" required valueType="array">
                <SelectTransactionType mode="multiple" />
              </BasicFormItem>

            </Panel>

            <Panel header="财务信息" key="2">

              <BasicFormItem label="公司成立年份" name="companyYear" valueType="number">
                <SelectYear />
              </BasicFormItem>

              <BasicFormItem label="货币类型" name="currency" required valueType="number" onChange={this.handleCurrencyTypeChange}>
                <SelectCurrencyType />
              </BasicFormItem>

              <CurrencyFormItem label="拟交易规模" name="financeAmount" required />

              <CurrencyFormItem label="公司估值" name="companyValuation" />

              <BasicFormItem label="公开财务信息" name="financeIsPublic" valueType="boolean" valuePropName="checked">
                <Switch checkedChildren={'ON'} unCheckedChildren={'OFF'} />
              </BasicFormItem>

              <FinanceDynamicFormItem>
                <BasicFormItem label="年份" name="fYear" valueType="number" required>
                  <SelectYear />
                </BasicFormItem>

                <CurrencyFormItem label="营业收入" name="revenue" required />

                <CurrencyFormItem label="净利润" name="netIncome" required />

                <BasicFormItem label="息税折旧摊销前利润" name="EBITDA" valueType="number" initialValue={0}>
                  <InputNumber />
                </BasicFormItem>

                <BasicFormItem label="毛利润" name="grossProfit" valueType="number" initialValue={0}>
                  <InputNumber />
                </BasicFormItem>

                <BasicFormItem label="总资产" name="totalAsset" valueType="number" initialValue={0}>
                  <InputNumber />
                </BasicFormItem>

                <BasicFormItem label="净资产" name="stockholdersEquity" valueType="number" initialValue={0}>
                  <InputNumber />
                </BasicFormItem>

                <BasicFormItem label="经营性现金流" name="operationalCashFlow" valueType="number" initialValue={0}>
                  <InputNumber />
                </BasicFormItem>

                <BasicFormItem label="净现金流" name="grossMerchandiseValue" valueType="number" initialValue={0}>
                  <InputNumber />
                </BasicFormItem>
              </FinanceDynamicFormItem>

            </Panel>

            <Panel header="联系方式" key="3">

              <BasicFormItem label="联系人" name="contactPerson" required whitespace><Input /></BasicFormItem>

              <BasicFormItem label="联系号码" name="phoneNumber" required validator={this.phoneNumberValidator}><InputPhoneNumber /></BasicFormItem>

              <BasicFormItem label="邮箱" name="email" required valueType="email">
                <Input type="email" />
              </BasicFormItem>

              {/*<BasicFormItem label="上传者" name="supportUser" required initialValue={currentUserId}>
                <Select />
              </BasicFormItem>*/}

            </Panel>

            <Panel header="项目详情" key="4">
              <BasicFormItem label="公司简介" name="b_introducteC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Company Introduction" name="b_introducteE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="目标市场" name="targetMarketC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="TargetMarket" name="targetMarketE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="核心产品" name="productTechnologyC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Core Product" name="productTechnologyE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="商业模式" name="businessModelC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Business Model" name="businessModelE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="品牌渠道" name="brandChannelC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Brand Channel" name="brandChannelE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="管理团队" name="managementTeamC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Management Team" name="managementTeamE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="商业伙伴" name="BusinesspartnersC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Business Partner" name="BusinesspartnersE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="资金用途" name="useOfProceedC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Use of Proceeds" name="useOfProceedE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="融资历史" name="financingHistoryC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Financing History" name="financingHistoryE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="经营数据" name="operationalDataC">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
              <BasicFormItem label="Operational Data" name="operationalDataE">
                <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
              </BasicFormItem>
            </Panel>

            <Panel header="附件上传" key="5">
              <FormItem>
                {getFieldDecorator('projAttachment', {
                  rules: [{type: 'array'}],
                  initialValue: [],
                })(<ProjectAttachments />)}
              </FormItem>
            </Panel>

          </Collapse>

          <div style={{textAlign: 'center'}}>
            <div style={{lineHeight: 2, marginBottom: '8px'}}>
              <FormItem style={{display: 'inline'}}>
                {
                  getFieldDecorator('isAgreed', {
                    valuePropName: 'checked',
                    rules: [{type: 'boolean'}, {required: true}, {validator: (rule, value, callback) => {
                      if (value) {
                        callback()
                      } else {
                        callback('please check the agreement')
                      }
                    }}],
                    initialValue: true,
                  })(
                    <Checkbox>
                      <Link to="" className={styles["link"]}>已阅读并接受《免责声明》《平台保密声明》《信息准确性上传者承诺》</Link>
                    </Checkbox>
                  )
                }
              </FormItem>
            </div>
            <p style={{lineHeight: 2, marginBottom: '8px'}}>您所填写的信息均为项目审核所需，我们会在与您核实项目信息后确定项目信息的发布方式及发布渠道</p>
          </div>

          <div style={{textAlign: 'center'}}>
            <Button type="primary" size="large" style={{margin: '0 8px'}} onClick={this.saveProject}>保存</Button>
            <Button type="primary" htmlType="submit" size="large" style={{margin: '0 8px'}}>发布</Button>
          </div>

        </Form>
      </div>
    </MainLayout>
  )
  }
}




function onValuesChange(props, values) {
  console.log(values)
}

function toFormData(data) {
  function splitData(name, value) {
    var data = {}
    var keys = _.range(1, 1 + value.length)
    data[name + 'Keys'] = {value: keys}
    keys.forEach((key, index) => {
      var prefix = name + '-' + key
      var obj = value[index]
      if (_.isPlainObject(obj)) { // 判断 obj 的类型是对象，不是数组及其他
        for (let prop in obj) {
          data[prefix + '.' + prop] = {value: obj[prop]}
        }
      } else {
        data[prefix] = {value: obj}
      }
    })
    return data
  }

  var formData = {}
  for (let prop in data) {
    if (['industries', 'finance'].includes(prop)) {
      // 转换形式 industries: [{}, {}] 为 industriesKeys: [1,2] industries-1: {}  industries-2: {}
      let partData = splitData(prop, data[prop])
      _.assign(formData, partData)
    } else {
      formData[prop] = {value: data[prop]}
    }
  }
  formData['isAgreed'] = {value: true}

  return formData
}



function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) &&
        !/finance-.*/.test(prop) &&
        !['industriesKeys', 'financeKeys', 'isAgreed', 'areaCode', 'phoneNumber'].includes(prop)
    ) {
      data[prop] = formData[prop]
    }
  }
  // 针对  industries, finance 特殊处理
  ['industries', 'finance'].forEach(prop => {
    data[prop] = formData[prop + 'Keys'].map(key => formData[prop + '-' + key])
  })

  return data
}


function mapPropsToFields(props) {
  let data = localStorage.getItem('projectData')
  data = JSON.parse(data)
  return toFormData(data)
}

export default connect()(injectIntl(Form.create({mapPropsToFields, onValuesChange})(AddProject)))
