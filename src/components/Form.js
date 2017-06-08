import React from 'react'
import { Icon, Upload, Cascader, Checkbox, Form, Input, InputNumber, Select, Row, Col, Button, Radio } from 'antd'
import { i18n } from '../utils/util'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import _ from 'lodash'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

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

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
}

function BasicFormItem(props, context) {

  const rules = [
    { type: props.valueType, message: 'The input is not valid!'},
    { required: props.required, message: 'The input can not be empty!'},
  ]

  if (props.whitespace) {
    rules.push({ whitespace: props.whitespace })
  }
  if (props.validator) {
    rules.push({ validator: props.validator })
  }

  return (
    <FormItem {...formItemLayout} {...props.layout} label={props.label}>
      {context.form.getFieldDecorator(props.name, {rules: rules})(props.children)}
    </FormItem>
  )
}
BasicFormItem.contextTypes = {
  form: PropTypes.object
}

const Email = () => <BasicFormItem label={i18n("email")} name="email" valueType="email" required><Input /></BasicFormItem>

const FullName = props => <BasicFormItem label={i18n("username")} name="username" required><Input disabled={props.disabled} /></BasicFormItem>

const Password = props => <BasicFormItem label={props.label || i18n("password")} name="password" required><Input type="password" /></BasicFormItem>

const ConfirmPassword = (props, context) => {

  function validator(rule, value, callback) {
    const password = context.form.getFieldValue('password')
    if (value && password && value !== password) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  return <BasicFormItem label={i18n("confirm_password")} name="confirm" required validator={validator}><Input type="password" /></BasicFormItem>
}
ConfirmPassword.contextTypes = {
  form: PropTypes.object
}

const OldPassword = () => <BasicFormItem label={i18n("old_password")} name="old_password" required><Input type="password" /></BasicFormItem>


const Position = props => (
  <BasicFormItem label={i18n("position")} name="position" required>
    <Select placeholder="Please select your position" disabled={props.disabled}>
      { props.title ? props.title.map(t => <Option key={t.id} value={t.id + ''} title={t.name}>{t.name}</Option>) : null }
    </Select>
  </BasicFormItem>
)

const Tags = props => (
  <BasicFormItem label={i18n("tag")} name="tags" required={props.required} valueType="array">
    <Select mode="multiple" placeholder="Please choose your favorite tags">
      { props.tag ? props.tag.map(t => <Option key={t.id}>{t.name}</Option>) : null }
    </Select>
  </BasicFormItem>
)

const Org = props => (
  <BasicFormItem label={i18n("org")} name="organization" required={props.required} >
    <Select mode="combobox" onChange={props.onChange} disabled={props.disabled}>
      { props.org ? props.org.map(d => <Option key={d.id} value={d.name}>{d.name}</Option> ) : null }
    </Select>
  </BasicFormItem>
)

const Code = (props, context) => (
  <FormItem {...formItemLayout} label={i18n("code")}>
    <Row gutter={8}>
      <Col span={12}>
        {context.form.getFieldDecorator("code", {
          rules: [{
            required: true, message: 'The input can not be empty!',
          }],
        })(<Input size="large" />)}
      </Col>
      <Col span={12}>
        <Button size="large">{i18n("fetch_code")}</Button>
      </Col>
    </Row>
  </FormItem>
)
Code.contextTypes = {
  form: PropTypes.object
}

const Mobile = (props, context) => {
  const prefixSelector = context.form.getFieldDecorator('prefix', {
    initialValue: '4',
  })(
    <Select style={{ width: 60 }}>
      {props.country.map(c => <Option key={c.id} value={`${c.id}`}><img src={c.url} style={{ width: 28, height: 18, marginTop: 4, display: 'block' }} /></Option>)}
    </Select>
  )
  return (
    <BasicFormItem label={i18n("mobile")} name="mobile" required={props.required}>
      <Input addonBefore={prefixSelector} />
    </BasicFormItem>
  )
}
Mobile.contextTypes = {
  form: PropTypes.object
}

const Role = props => (
  <BasicFormItem label={i18n("role")} name="role" required valueType="number">
    <RadioGroup disabled={props.disabled}>
      <Radio value={1}>{i18n("investor")}</Radio>
      <Radio value={2}>{i18n("transaction")}</Radio>
    </RadioGroup>
  </BasicFormItem>
)

const Agreement = () => {
  function checkAgreement(rule, value, callback) {
    if (!value) {
      callback('Please check agreement!')
    } else {
      callback()
    }
  }
  return (
    <BasicFormItem layout={tailFormItemLayout} name="agreement"  validator={checkAgreement} valueType="boolean">
      <Checkbox>{i18n("agreement")}I have read the <a href="">agreement</a></Checkbox>
    </BasicFormItem>
  )
}

const Submit = props => (
  <FormItem {...tailFormItemLayout}>
    <Button type="primary" htmlType="submit" size="large" loading={props.loading}>{i18n("submit")}</Button>
  </FormItem>
)

const Company = () => <BasicFormItem label={i18n("company")} name="company" required><Input /></BasicFormItem>

const EnglishFullName = () => <BasicFormItem label={i18n("nameE")} name="engusername" required={false}><Input /></BasicFormItem>

const Department = () => <BasicFormItem label={i18n("department")} name="department" required={false}><Input /></BasicFormItem>

const Wechat = () => <BasicFormItem label={i18n("wechat")} name="wechat" required={false}><Input /></BasicFormItem>

const Area = props => (
  <BasicFormItem label={i18n("area")} name="area" required={false}>
    <Select showSearch>
      <Option value="上海">上海</Option>
      <Option value="广州">广州</Option>
      <Option value="深圳">深圳</Option>
      <Option value="北京">北京</Option>
      <Option value="杭州">杭州</Option>
    </Select>
  </BasicFormItem>
)

const options = [{
  value: 'zhejiang',
  label: 'Zhejiang',
  children: [{
    value: 'hangzhou',
    label: 'Hangzhou',
    children: [{
      value: 'xihu',
      label: 'West Lake',
    }],
  }],
}, {
  value: 'jiangsu',
  label: 'Jiangsu',
  children: [{
    value: 'nanjing',
    label: 'Nanjing',
    children: [{
      value: 'zhonghuamen',
      label: 'Zhong Hua Men',
    }],
  }],
}]
const Country = props => (
  <BasicFormItem label={i18n("country")} name="country" required={false} valueType="array">
    <Cascader options={options} placeholder="Please select" />
  </BasicFormItem>
)

const Trader = props => (
  <BasicFormItem label={i18n("trader_relation")} name="trader" required={false}>
    <Select>
      <Option value="吴军柯">吴军柯</Option>
      <Option value="许志铭">许志铭</Option>
      <Option value="杨晓明">杨晓明</Option>
    </Select>
  </BasicFormItem>
)

const Leader = props => (
  <BasicFormItem label={i18n("owner")} name="leader" required={false}>
    <Select>
      <Option value="Summer">Summer</Option>
    </Select>
  </BasicFormItem>
)

const IsHidden = () => (
  <BasicFormItem label={i18n('is_hidden')} name="ishidden" valueType="boolean">
    <RadioGroup>
      <Radio value={false}>{i18n('no')}</Radio>
      <Radio value={true}>{i18n('yes')}</Radio>
    </RadioGroup>
  </BasicFormItem>
)

const ProjectNameC = () => (<BasicFormItem label={i18n('project_titleC')} name="titleC" required><Input /></BasicFormItem>)

const ProjectNameE = () => (<BasicFormItem label={i18n('project_titleE')} name="titleE" required><Input /></BasicFormItem>)

const RealNameC = () => (<BasicFormItem label={i18n('real_nameC')} name="realNameC"><Input /></BasicFormItem>)

const RealNameE = () => (<BasicFormItem label={i18n('real_nameE')} name="realNameE"><Input /></BasicFormItem>)


class IndustryCascader extends React.Component {

  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange(value) {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value[1])
    }
  }

  render() {
    const industry = this.props.industry

    // Cascader 组件的 value 格式转换
    let pIndustries = industry.filter(item => item.id == item.Pindustry)
    pIndustries.forEach(item => {
      let Pindustry = item.id
      let subIndustries = industry.filter(item => item.Pindustry == Pindustry && item.id != Pindustry)
      item.children = subIndustries
    })
    const industryOptions = pIndustries.map(item => {
      return {
        label: item.industry,
        value: item.id,
        children: item.children.map(item => {
          return {
            label: item.industry,
            value: item.id
          }
        })
      }
    })

    const item = industry.filter(item => item.id == this.props.value)[0]
    const value = item ? [item.Pindustry, item.id] : undefined

    return (
      <Cascader options={industryOptions} value={value} onChange={this.onChange} size="large" />
    )
  }
}


class CountryCascader extends React.Component {

  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange(value) {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value[1])
    }
  }

  render() {
    const continent = this.props.continent
    const country = this.props.country

    const countryOptions = continent.map(continent => {
      return {
        label: continent.continent,
        value: continent.id,
        children: country.filter(country => country.continent == continent.id)
                         .map(country => ({ label: country.country, value: country.id }))
      }
    })

    const item = country.filter(item => item.id == this.props.value)[0]
    const value = item ? [item.continent, item.id] : undefined

    return (
      <Cascader options={countryOptions} value={value} onChange={this.onChange} size="large" />
    )
  }
}

const ProjectRole = () => (
  <BasicFormItem label={i18n('role')} name="characterId" required valueType="string">
    <Select>
      <Option value="1">项目公司</Option>
      <Option value="2">财务顾问</Option>
      <Option value="3">投资者</Option>
      <Option value="5">未披露</Option>
    </Select>
  </BasicFormItem>
)

const Status = props => (
  <BasicFormItem label={i18n("status")} name="status" required={false} valueType="number">
    <RadioGroup options={props.options} />
  </BasicFormItem>
)

const UploadAvatar = (props, context) => {
  function normFile(e) {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  return (
    <FormItem {...formItemLayout} label={i18n("photo")}>
      <div className="dropbox">
        {context.form.getFieldDecorator('dragger', {
          valuePropName: 'fileList',
          getValueFromEvent: normFile,
        })(
          <Upload name="files" action="/upload.do" style={{ display: 'block', border: '1px dashed #d9d9d9', borderRadius: 6, cursor: 'pointer', width: 150, height: 150 }}>
            { false ? <img src="/images/defaultAvatar@2x.png" style={{ width: 150, height: 150 }} alt="" /> : null }
            <Icon type="plus" style={{ display: 'table-cell', verticalAlign: 'middle', fontSize: 28, color: '#999', width: 150, height: 150 }} />
          </Upload>
        )}
      </div>
    </FormItem>
  )
}
UploadAvatar.contextTypes = {
  form: PropTypes.object
}

const TrasactionType = ({ transactionType }) => {
  return (
    <BasicFormItem label={i18n('transaction_type')} name="transactionTypes" required valueType="string">
      <Select>
        {transactionType.map((item, index) =>
          <Option key={index} value={String(item.id)}>{item.name}</Option>
        )}
      </Select>
    </BasicFormItem>
  )
}

const Year = ({ label, name, required }) => {
  const currYear = new Date().getFullYear()
  const options = _.range(currYear, currYear - 100).map(item => {
    return { value: String(item), label: String(item) }
  })
  return (
    <BasicFormItem label={label} name={name} required={required || false} valueType="string">
      <Select>
        {options.map((item, index) =>
          <Option key={index} value={item.value}>{item.label}</Option>
        )}
      </Select>
    </BasicFormItem>
  )
}


const USDFormatter = function(value) {
  if (isNaN(value)) {
    return '$ '
  } else{
    return '$ ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}
const USDParser = function(value) {
  value = value.replace(/\$\s?|(,*)/g, '')
  return parseInt(value)
}
const CNYFormatter = function(value) {
  if (isNaN(value)) {
    return '￥ '
  } else {
    return '￥ ' + value.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  }
}
const CNYParser = function(value) {
  value = value.replace(/\￥\s?|(,*)/g, '')
  return parseInt(value)
}

class CurrencyInput extends React.Component {

  static formatterMap = {
    '1': CNYFormatter,
    '2': USDFormatter,
    '3': CNYFormatter,
  }
  static parserMap = {
    '1': CNYParser,
    '2': USDParser,
    '3': CNYParser,
  }

  render() {
    const { currencyType, formatter, parser, ...restProps } = this.props
    return (
      <InputNumber
        style={{width: '100%'}}
        formatter={CurrencyInput.formatterMap[currencyType]}
        parser={CurrencyInput.parserMap[currencyType]}
        {...restProps}
      />
    )
  }
}

const CurrencyTypeFormItem = ({ label, name, required, onChange, currencyType }, context) => {
  const { getFieldDecorator } = context.form
  return (
    <FormItem {...formItemLayout} label={label}>
      {
        getFieldDecorator(name, {
          rules: [{ required: required || false }, { type: 'string' }],
          onChange: onChange,
        })(
          <Select>
            {currencyType.map((item, index) =>
              <Option key={index} value={String(item.id)}>{item.currency}</Option>
            )}
          </Select>
        )
      }
    </FormItem>
  )
}
CurrencyTypeFormItem.contextTypes = {
  form: PropTypes.object
}


const CurrencyFormItem = ({ label, name, required, validator, currencyType, onChange }, context) => {
  const { getFieldDecorator } = context.form

  let rules = [{ type: 'number' }]
  console.log('>>>', label, required)
  if (required) { rules.push({ required }) }
  console.log(rules)
  if (validator) { rules.push({ validator }) }

  return (
    <FormItem {...formItemLayout} label={label} required={required}>
      <Row>
        <Col span={16}>
          <FormItem>
          {
            getFieldDecorator(name, {
              rules: rules,
              onChange: onChange
            })(
              <CurrencyInput currencyType={currencyType || 2} />
            )
          }
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem>
          {
            getFieldDecorator(`${name}_USD`, {
              rules: rules
            })(
              <CurrencyInput currencyType={2} disabled />
            )
          }
          </FormItem>
        </Col>
      </Row>
    </FormItem>
  )
}
CurrencyFormItem.contextTypes = {
  form: PropTypes.object
}


module.exports = {
  Email,
  FullName,
  Password,
  ConfirmPassword,
  OldPassword,
  Position,
  Tags,
  Org,
  Code,
  Mobile,
  Role,
  Agreement,
  Submit,
  Company,
  EnglishFullName,
  Department,
  Wechat,
  Area,
  Country,
  Trader,
  Leader,
  Status,
  UploadAvatar,
  IsHidden,
  ProjectNameC,
  ProjectNameE,
  RealNameC,
  RealNameE,
  IndustryCascader,
  ProjectRole,
  TrasactionType,
  Year,
  CountryCascader,
  BasicFormItem,
  CurrencyInput,
  CurrencyTypeFormItem,
  CurrencyFormItem,
}
