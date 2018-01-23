import React from 'react'
import { Icon, Upload, Cascader, Checkbox, Form, Input, InputNumber, Select, Row, Col, Button, Radio } from 'antd'
import { i18n, exchange, handleError, getCurrencyFromId } from '../utils/util'
import PropTypes from 'prop-types'
import { Link } from 'dva/router'
import { InputCurrency, CascaderIndustry } from './ExtraInput'
import styles from './ProjectForm.css'
import { UploadImage } from './Upload'
import GlobalMobile from './GlobalMobile'
import { baseUrl } from '../utils/request';

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
    { type: props.valueType, message: i18n('validation.not_valid')},
    { required: props.required, message: i18n('validation.not_empty')},
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



const Email = props => <BasicFormItem label={i18n("account.email")} name="email" valueType="email" required><Input size="large" onBlur={props.onBlur}/></BasicFormItem>

const Group = props => <BasicFormItem label={i18n("account.role")} name="readOnlyGroup" required><Input size="large" disabled={props.disabled} /></BasicFormItem>

const FullName = props => <BasicFormItem label={i18n("account.username")} name="username" required><Input size="large" disabled={props.disabled} /></BasicFormItem>

const Password = props => <BasicFormItem label={props.label || i18n("account.password")} name="password" required><Input size="large" type="password" /></BasicFormItem>

const ConfirmPassword = (props, context) => {

  function validator(rule, value, callback) {
    const password = context.form.getFieldValue('password')
    if (value && password && value !== password) {
      callback(i18n('validation.two_passwords_not_inconsistent'))
    } else {
      callback()
    }
  }

  return <BasicFormItem label={i18n("account.confirm_password")} name="confirm" required validator={validator}><Input size="large" type="password" /></BasicFormItem>
}
ConfirmPassword.contextTypes = {
  form: PropTypes.object
}

const OldPassword = () => <BasicFormItem label={i18n("account.old_password")} name="old_password" required><Input size="large" type="password" /></BasicFormItem>


const Position = props => (
  <BasicFormItem label={i18n("account.position")} name="title" required>
    <Select placeholder={i18n("account.choose_position")} disabled={props.disabled}>
      { props.title ? props.title.map(t => <Option key={t.id} value={t.id + ''} title={t.name}>{t.name}</Option>) : null }
    </Select>
  </BasicFormItem>
)

const Org = props => (
  <BasicFormItem label={i18n("account.org")} name="organization" required={props.required} >
    <Select mode="combobox" onChange={props.onChange} disabled={props.disabled}>
      { props.org ? props.org.map(d => <Option key={d.id} value={d.name}>{d.name}</Option> ) : null }
    </Select>
  </BasicFormItem>
)

const Code = (props, context) => (
  <FormItem {...formItemLayout} label={i18n("account.code")}>
    <Row gutter={8}>
      <Col span={12}>
        {context.form.getFieldDecorator("code", {
          rules: [{
            required: true, message: i18n('validation.not_empty'),
          }],
        })(<Input size="large" />)}
      </Col>
      <Col span={12}>
        <Button
          loading={props.loading}
          disabled={props.value ? true : false}
          onClick={props.onFetchButtonClicked} size="large">
          {props.loading ? i18n("account.is_fetching_code") : props.value || i18n("account.fetch_code")}
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
  const allowAreaCode = props.country.map(item => item.areaCode)

  function check(rule, value, callback) {
    if (value.areaCode == '') {
      callback(i18n('areacode_not_empty'))
    } else if (!allowAreaCode.includes(value.areaCode)) {
      callback(i18n('areacode_invalid'))
    } else if (value.mobile == '') {
      callback(i18n('mobile_not_empty'))
    } else if (!/^\d+$/.test(value.mobile)) {
      callback(i18n('mobile_incorrect_format'))
    } else {
      callback()
    }
  }

  return (
    <BasicFormItem label={i18n("account.mobile")} required={props.required} name="mobileInfo" valueType="object" validator={check} initialValue={{areaCode:props.areaCode||'86',mobile:props.mobile || '' }}>
      <GlobalMobile onBlur={props.onBlur} disabled={props.disabled} />
    </BasicFormItem>
  )
}
Mobile.contextTypes = {
  form: PropTypes.object
}

const Role = props => (
  <BasicFormItem label={i18n("account.role")} name="type" required>
    <RadioGroup disabled={props.disabled}>
      <Radio value={'investor'}>{i18n("account.investor")}</Radio>
      <Radio value={'trader'}>{i18n("account.trader")}</Radio>
    </RadioGroup>
  </BasicFormItem>
)

const Agreement = () => {
  function checkAgreement(rule, value, callback) {
    if (!value) {
      callback(i18n('account.please_check_agreement'))
    } else {
      callback()
    }
  }
  return (
    <BasicFormItem layout={tailFormItemLayout} name="agreement"  validator={checkAgreement} valueType="boolean">
      <Checkbox><Link to="/app/agreement" target="_blank">{i18n("account.agreement")}</Link></Checkbox>
    </BasicFormItem>
  )
}

const Submit = props => (
  <FormItem {...tailFormItemLayout}>
    <Button type="primary" htmlType="submit" size="large" loading={props.loading}>{i18n("common.submit")}</Button>
  </FormItem>
)

const UploadAvatar = (props, context) => {

  const uploadStyle = {
    display: 'block',
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
    <FormItem {...formItemLayout} label={props.name=='avatar' ? i18n("user.photo") : i18n("user.card")}>
      <div className="dropbox">
        {context.form.getFieldDecorator(props.name, {
          valuePropName: 'fileList',
          getValueFromEvent: normFile,
        })(
          <Upload
          name="avatar"
          action={props.photoKey ? (baseUrl + "/service/qiniucoverupload?bucket=image&key=" + props.photoKey) : (baseUrl + "/service/qiniubigupload?bucket=image")}
          onChange={handleChange}
          style={uploadStyle}>
            { props.avatarUrl ? <img src={props.avatarUrl} style={{ width: 150,maxHeight:150}} alt="" /> :
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
    const currency = getCurrencyFromId(currencyType || 2)
    exchange(currency).then((rate) => {
      setFieldsValue({
        [name + '_USD']: value == undefined ? value : Math.round(value * rate),
      })
    }, error => {
      handleError(error)
    })
  }

  let rules = [
    { type: 'number', message: i18n('validation.not_valid') },
  ]
  if (required) { rules.push({ required, message: i18n('validation.not_empty') }) }
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

    const { getFieldDecorator, getFieldValue, setFieldsValue } = context.form

    getFieldDecorator('industriesKeys', { rules: [{type: 'array'}], initialValue: [1] })
    // set disabled
    var t = setInterval(() => {
      const keys = getFieldValue('industriesKeys')
      const ids = keys.map(key => getFieldValue('industries-' + key))
      const images = keys.map(key => getFieldValue('industries-image-' + key))

      this.industryUuid = ids.length

      const _ids = ids.filter(id => id != null)
      if (_ids.length > 0 && this.props.industry.length > 0) {
        this.setState({ disabled: _ids })
        // get default image
        _ids.forEach((id, index) => {
          const i = this.props.industry.filter(item => item.id == id)[0]
          if (i && i.key && !getFieldValue('industries-image-' + keys[index])) {
            setFieldsValue({ ['industries-image-' + keys[index]]: i.key })
          }
        })
        clearInterval(t)
      }
    }, 300)
  }

  // Industry 多 field
  removeIndustry = (k) => {
    const { getFieldValue, setFieldsValue, validateFields } = this.context.form
    var keys = getFieldValue('industriesKeys')
    if (keys.length === 1) {
      return
    }

    keys = keys.filter(key => key !== k)
    setFieldsValue({ industriesKeys: keys })
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

    if (id) {
      let i = this.props.industry.filter(item => item.id == id)[0]
      setFieldsValue({ ['industries-image-' + k]: i.key })
    }
    // set diabled
    const keys = getFieldValue('industriesKeys')
    var ids = keys.map(item => getFieldValue('industries-' + item))
    var index = keys.indexOf(k)
    ids = [ ...ids.slice(0, index), id, ...ids.slice(index+1) ]
    ids = ids.filter(item => item != null)
    this.setState({ disabled: ids })
  }

  isDefault = (key) => {
    return this.props.industry.filter(item => item.id == key)[0] ? true : false
  }

  render() {
    const { getFieldValue, getFieldDecorator } = this.context.form
    const industriesKeys = getFieldValue('industriesKeys')

    return (
      <div>
        {industriesKeys.map((k, index) => {
          return (
            <FormItem {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)} key={k} label={index === 0 ? i18n('project.industry') : ''}>
              {
                getFieldDecorator(`industries-${k}`, {
                  rules: [
                    { type: 'number', message: i18n('validation.not_valid')},
                    { required: true, message: i18n('validation.not_empty')},
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
            {i18n('project.add_industry')}
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
                        { validator: function(rule, value, callback) {
                          if (!value) {
                            callback(i18n('project.message.validation_industry_image_not_null'))
                          } else {
                            callback()
                          }
                        } }
                      ],
                    })(
                      <UploadImage disabled={!id} />
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
  Org,
  Code,
  Mobile,
  Role,
  Agreement,
  Submit,
  UploadAvatar,
  BasicFormItem,
  CurrencyFormItem,
  IndustryDynamicFormItem,
  Group
}
