import React from 'react'
import { Icon, Upload, Cascader, Checkbox, Form, Input, InputNumber, Select, Row, Col, Button, Radio } from 'antd'
import { i18n, exchange } from '../utils/util'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { InputCurrency, CascaderIndustry } from './ExtraInput'
import styles from './ProjectForm.css'
import IndustryImage from './IndustryImage'

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
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14, offset: 6 },
  }
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
    { required: props.required, message: i18n('can_not_be_empty')},
  ]

  if (props.whitespace) {
    rules.push({ whitespace: props.whitespace })
  }
  if (props.validator) {
    rules.push({ validator: props.validator })
  }

  let options = { rules: rules }
  if ('initialValue' in props) {
    options.initialValue = props.initialValue
  }
  if ('valuePropName' in props) {
    options.valuePropName = props.valuePropName
  }
  if ('onChange' in props) {
    options.onChange = props.onChange
  }


  return (
    <FormItem {...(props.layout || formItemLayout)} {...props.layout} label={props.label}>
      {context.form.getFieldDecorator(props.name, options)(props.children)}
    </FormItem>
  )
}
BasicFormItem.contextTypes = {
  form: PropTypes.object
}



const Email = props => <BasicFormItem label={i18n("email")} name="email" valueType="email" required><Input onBlur={props.onBlur}/></BasicFormItem>

const Group = props => <BasicFormItem label={i18n("role")} name="readOnlyGroup" required><Input disabled={props.disabled} /></BasicFormItem>

const FullName = props => <BasicFormItem label={i18n("username")} name="username" required><Input disabled={props.disabled} /></BasicFormItem>

const ChineseFullName = props => <BasicFormItem label={i18n("username")} name="usernameC" required><Input /></BasicFormItem>

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
  <BasicFormItem label={i18n("position")} name="title" required>
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
            required: true, message: i18n('can_not_be_empty'),
          }],
        })(<Input size="large" />)}
      </Col>
      <Col span={12}>
        <Button
          loading={props.loading}
          disabled={props.value ? true : false}
          onClick={props.onFetchButtonClicked} size="large">
          {props.loading ? "正在获取验证码" : props.value || i18n("fetch_code")}
        </Button>
      </Col>
    </Row>
  </FormItem>
)
Code.contextTypes = {
  form: PropTypes.object
}

const Mobile = (props, context) => {
  const { getFieldDecorator } = context.form

  return (
    <BasicFormItem label={i18n("mobile")} required={props.required} name="mobileInfo">
      <Input.Group compact>
        <Select style={{ width: 60 }} onChange={props.onSelectChange} value={props.countryID + ''}>
          {props.country.map(c => <Option key={c.id} value={c.id + ''}>
            <img src={c.url} style={{ width: 28, height: 18, marginTop: 4, display: 'block' }} />
          </Option>)}
        </Select>
        <Input style={{ width: '10%' }} value={props.areaCode} onChange={props.onAreaCodeChange} />
        <Input style={{ width: '30%' }} name="mobile" onChange={props.onMobileChange} />
      </Input.Group>
    </BasicFormItem>
  )
}
Mobile.contextTypes = {
  form: PropTypes.object
}

const Role = props => (
  <BasicFormItem label={i18n("role")} name="type" required>
    <RadioGroup disabled={props.disabled}>
      <Radio value={'investor'}>{i18n("investor")}</Radio>
      <Radio value={'trader'}>{i18n("transaction")}</Radio>
    </RadioGroup>
  </BasicFormItem>
)

const Agreement = () => {
  function checkAgreement(rule, value, callback) {
    if (!value) {
      callback(i18n('please_check_agreement'))
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



const Status = props => (
  <BasicFormItem label={i18n("status")} name="status" required={false} valueType="number">
    <RadioGroup options={props.options} />
  </BasicFormItem>
)

const UploadAvatar = (props, context) => {

  const uploadStyle = {
    display: 'block',
    border: '1px dashed #d9d9d9',
    borderRadius: 6,
    cursor: 'pointer',
    width: 150,
    height: 150
  }

  function normFile(e) {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }

  function handleChange(info) {
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      props.onUploaded(info.file.response.result)
    }
  }

  return (
    <FormItem {...formItemLayout} label={i18n("photo")}>
      <div className="dropbox">
        {context.form.getFieldDecorator('dragger', {
          valuePropName: 'fileList',
          getValueFromEvent: normFile,
        })(
          <Upload
          name="avatar"
          action={props.photoKey ? "http://192.168.1.201:8000/service/qiniucoverupload?bucket=image&key=" + props.photoKey : "http://192.168.1.201:8000/service/qiniubigupload?bucket=image"}
          onChange={handleChange}
          style={uploadStyle}>
            { props.avatarUrl ? <img src={props.avatarUrl} style={{ width: 150, height: 150 }} alt="" /> :
            <Icon type="plus" style={{ display: 'table-cell', verticalAlign: 'middle', fontSize: 28, color: '#999', width: 150, height: 150 }} />
            }
          </Upload>
        )}
      </div>
    </FormItem>
  )
}
UploadAvatar.contextTypes = {
  form: PropTypes.object
}





let CurrencyFormItem = ({ label, name, required, validator, currencyType }, context) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = context.form

  function onChange(value) {
    const currencyMap = {'1': 'CNY', '2': 'USD', '3': 'CNY'}
    const currency = currencyType || 2
    exchange(currencyMap[String(currency)]).then((rate) => {
      setFieldsValue({
        [name + '_USD']: value == undefined ? value : Math.round(value * rate),
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  let rules = [{ type: 'number' }]
  if (required) { rules.push({ required }) }
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
              <InputCurrency currencyType={currencyType || 2} />
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
              <InputCurrency currencyType={2} disabled />
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
CurrencyFormItem = connect()(CurrencyFormItem)


class IndustryDynamicFormItem extends React.Component {

  static contextTypes = {
    form: PropTypes.object
  }

  industryUuid = 1


  constructor(props, context) {
    super(props)

    this.state = {
      disabled: [],
    }

    const { getFieldDecorator, getFieldValue } = context.form
    getFieldDecorator('industriesKeys', { rules: [{type: 'array'}], initialValue: [1] })
    // set disabled
    var t = setInterval(() => {
      const keys = getFieldValue('industriesKeys')
      if (keys.length > 0) {
        let ids = keys.map(key => getFieldValue('industries-' + key))
        this.setState({ disabled: ids })
        clearInterval(t)
      }
    }, 100)
  }

  // Industry 多 field
  removeIndustry = (k) => {
    const { getFieldValue, setFieldsValue } = this.context.form
    var keys = getFieldValue('industriesKeys')
    if (keys.length === 1) {
      return
    }

    keys = keys.filter(key => key !== k)
    setFieldsValue({ industriesKeys: keys })

    let oldKey = getFieldValue('industries-image-' + k)
    this.deleteImage(oldKey)
    //
    const ids = keys.map(item => getFieldValue('industries-' + item))
                              .filter(item => item != null)
    this.setState({ disabled: ids })
  }

  addIndustry = () => {
    const { getFieldValue, setFieldsValue } = this.context.form
    this.industryUuid += 1
    const keys = getFieldValue('industriesKeys')
    const nextKeys = keys.concat(this.industryUuid)
    setFieldsValue({
      industriesKeys: nextKeys,
    })
  }

  handleIndustryChange = (k, id) => {
    const { getFieldValue, setFieldsValue } = this.context.form
    const { industry } = this.props
    if (id) {
      let i = industry.filter(item => item.id == id)[0]
      let oldKey = getFieldValue('industries-image-' + k)
      this.deleteImage(oldKey)
      setFieldsValue({ ['industries-image-' + k]: i.key })
    }
    //
    const keys = getFieldValue('industriesKeys')
    var ids = keys.map(item => getFieldValue('industries-' + item))
    var index = keys.indexOf(k)
    ids = [ ...ids.slice(0, index), id, ...ids.slice(index+1) ]
    ids = ids.filter(item => item != null)
    this.setState({ disabled: ids })
  }

  handleIndustryImageChange = (k, key) => {
    const { getFieldValue } = this.context.form
    const oldKey = getFieldValue('industries-image-' + k)
    this.deleteImage(oldKey)
  }

  deleteImage = (key) => {
    if (key == undefined) {
      return
    }
    // 判断图片是默认还是自己上传的
    const isDefaultImage = this.props.industry.some(item => item.key == key)
    if (!isDefaultImage) {
      api.qiniuDelete('image', key).then(result => {
        //
      }, error => {
        //
      })
    }
  }

  render() {
    const { getFieldValue, getFieldDecorator } = this.context.form
    const industriesKeys = getFieldValue('industriesKeys')

    return (
      <div>
        {industriesKeys.map((k, index) => {
          return (
            <FormItem {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)} key={k} label={index === 0 ? '项目行业' : ''}>
              {
                getFieldDecorator(`industries-${k}`, {
                  rules: [
                    { type: 'number', message: 'The input is not valid!'},
                    { required: true, message: 'The input can not be empty!'},
                  ],
                  onChange: this.handleIndustryChange.bind(this, k)
                })(
                  <CascaderIndustry size="large" disabled={this.state.disabled} />
                )
              }
              <Icon
                type="minus-circle-o"
                disabled={industriesKeys.length === 1}
                onClick={() => this.removeIndustry(k)}
                className={styles['dynamic-delete-button']}
              />
            </FormItem>
          )
        })}
        <FormItem {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.addIndustry} style={{ width: '100%' }}>
            <Icon type="plus" />
            添加
          </Button>
        </FormItem>

        <FormItem {...formItemLayoutWithOutLabel}>
          {
            industriesKeys.map((k, index) => {
              const id = getFieldValue('industries-' + k)
              return (
                <FormItem key={k} style={{ float: 'left', marginRight: '8px', marginBottom: '8px' }}>
                  {
                    getFieldDecorator(`industries-image-${k}`, {
                      rules: [
                        { type: 'string' },
                        { required: true },
                        { whitespace: true },
                      ],
                      onChange: this.handleIndustryImageChange.bind(this, k)
                    })(
                      <IndustryImage disabled={!id} />
                    )
                  }
                </FormItem>
              )
            })
          }
        </FormItem>
      </div>
    )
  }
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
  BasicFormItem,
  CurrencyFormItem,
  ChineseFullName,
  IndustryDynamicFormItem,
  Group
}
