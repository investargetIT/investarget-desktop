import React from 'react'
import PropTypes, { func } from 'prop-types'
import {hasPerm, getCurrencyFromId, exchange} from '../utils/util'
import { Form, Input, Radio, Checkbox, Row, Col, DatePicker } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item
const TextArea = Input.TextArea

import { BasicFormItem, CurrencyFormItem } from './Form'
import {
  SelectBDStatus,
  SelectBDSource,
  SelectTitle,
  SelectArea,
  SelectPartner, 
  SelectAllUser, 
  SelectOrganizatonArea, 
  CascaderCountry,
  SelectIndustryGroup,
  SelectCurrencyType,
  SelectTrader,
} from './ExtraInput'
import { 
  i18n, 
  checkMobile,
} from '../utils/util';
import * as api from '../api'
import { connect } from 'dva';
import moment from 'moment';

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
function range(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}
class ProjectBDForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)

    this.state = {
      // 是否是选择联系人的模式
      isSelect: true,

      // 缓存表单的数据
      _username: null,
      _usertitle: null,
      _usermobile: null,
      _bduser: null,
      contactTitle: null,
      contactMobile: null,
      email:null
    }
  }

  initialDataLoaded = false
  componentWillReceiveProps(nextProps) {
    // 表单拿到bd数据时
    if (!this.initialDataLoaded && nextProps.data && ('bduser' in nextProps.data)) {
      this.initialDataLoaded = true
      let bduserId = nextProps.data.bduser.value
      if (bduserId) {
        this.getUserDetail(bduserId)
      } else {
        this.setState({ isSelect: false })
      }
    }
  }

  handleChangeBduser = (id) => {
    if (id) {
      this.getUserDetail(id)
    }
  }

  getUserDetail = (id) => {
    api.getUserInfo(id).then(result => {
      const { title, mobile, email } = result.data
      this.setState({
        contactTitle: title ? title.name : '',
        contactMobile: mobile,
        email: email
      })
    })
  }

  toggleManualInput = () => {
    const { getFieldValue } = this.props.form
    this.setState({
      isSelect: false,
      _bduser: getFieldValue('bduser'),
    })
  }

  toggleSelect = () => {
    const { getFieldValue } = this.props.form
    this.setState({
      isSelect: true,
      _username: getFieldValue('username'),
      _usertitle: getFieldValue('usertitle'),
      _usermobile: getFieldValue('usermobile'),
    })
    // 模拟触发改变 bduser 字段
    this.handleChangeBduser(this.state._bduser)
  }

  handleCountryChange = country => {
    this.props.form.setFieldsValue({
      mobileAreaCode: country.areaCode,
    });
  }

  // 处理货币相关表单联动
  handleCurrencyTypeChange = (currencyId) => {
    const { getFieldValue, setFieldsValue } = this.props.form
    const currency = getCurrencyFromId(currencyId)
    exchange(currency).then((rate) => {
      const fields = ['financeAmount'];
      const values = {};
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
    const { getFieldDecorator, getFieldValue } = this.props.form
    const countryObj = getFieldValue('country');
    let country = null;
    if (countryObj && this.props.country.length > 0) {
      country = this.props.country.filter(f => f.id === countryObj.value)[0];
    }
    return (
      <Form>
        <BasicFormItem label={i18n('project_bd.project_name')} name="com_name" required initialValue={this.props.comName}>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.bd_status')} name="bd_status" required valueType="number">
          <SelectBDStatus />
        </BasicFormItem>

        {hasPerm('BD.manageProjectBD') &&
        <BasicFormItem label={i18n('project_bd.contractors')} name="contractors" valueType="number">
          <SelectAllUser type="trader" />
        </BasicFormItem>
        }

        <BasicFormItem label={i18n('project_bd.finance_currency')} name="financeCurrency" valueType="number" onChange={this.handleCurrencyTypeChange}>
          <SelectCurrencyType />
        </BasicFormItem>

        <CurrencyFormItem label={i18n('project_bd.finance_amount')} name="financeAmount" currencyType={getFieldValue('financeCurrency')} />

        {/* <BasicFormItem label={i18n('project_bd.expirationtime')} name="expirationtime" valueType="object" initialValue={moment().startOf('hour')}>
          <DatePicker
            disabledDate={current => current && current < moment().startOf('day')}
            disabledTime={() => ({ disabledMinutes: () => range(1, 30).concat(range(31, 60)) })}
            showTime={{
              hideDisabledOptions: true,
              format: 'HH:mm',
            }}
            showToday={false}
            format="YYYY-MM-DD HH:mm" 
          />
        </BasicFormItem> */}

        <BasicFormItem label={i18n('project_bd.industry_group')} name="indGroup" valueType="number" required>
          <SelectIndustryGroup />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.import_methods')} name="source_type" required valueType="number">
          <SelectBDSource />
        </BasicFormItem>

        <BasicFormItem 
          label={i18n('user.country')} 
          name="country" 
          required 
          valueType="object" 
          getValueFromEvent={(id, detail) => detail}
        >
          <CascaderCountry size="large" isDetail />
        </BasicFormItem>

        {['中国', 'China'].includes(country && (country.label || country.country)) ? 
        <BasicFormItem label={i18n('project_bd.area')} name="location" required valueType="number">
          <SelectOrganizatonArea showSearch />
        </BasicFormItem>
        : null }

        {this.state.isSelect ? (
          <div>
            <BasicFormItem label={i18n('project_bd.contact')} name="bduser" valueType="number" onChange={this.handleChangeBduser} initialValue={this.state._bduser}>
              <SelectPartner />
            </BasicFormItem>
            <LayoutItem label="" style={{marginTop:-24}}>
              <div>联系人不在库里？<a href="javascript:void(0)" onClick={this.toggleManualInput}>手动输入</a></div>
            </LayoutItem>
            {getFieldValue('bduser') ? (
              <LayoutItem label={i18n('project_bd.contact_title')}>
                {this.state.contactTitle}
              </LayoutItem>
            ) : null}
            {getFieldValue('bduser') ? (
              <LayoutItem label={i18n('project_bd.contact_mobile')}>
                {this.state.contactMobile}
              </LayoutItem>
            ) : null}
            {getFieldValue('bduser') ? (
              <LayoutItem label={i18n('project_bd.email')}>
                {this.state.email}
              </LayoutItem>
            ) : null}
          </div>
        ) : (
          <div>
            <BasicFormItem label={i18n('project_bd.contact_name')} name="username" initialValue={this.state._username}>
              <Input />
            </BasicFormItem>
            <LayoutItem label="" style={{marginTop:-24}}>
              <div>联系人在库里？<a href="javascript:void(0)" onClick={this.toggleSelect}>选择联系人</a></div>
            </LayoutItem>

            <BasicFormItem label={i18n('project_bd.contact_title')} name="usertitle" valueType="number" initialValue={this.state._usertitle}>
              <SelectTitle showSearch />
            </BasicFormItem>

              <FormItem {...formItemLayout} label={i18n('project_bd.contact_mobile')}>
                <Row gutter={8}>
                  <Col span={6}>
                    <FormItem>
                      {
                        getFieldDecorator('mobileAreaCode', {
                          rules: [], initialValue: country && country.areaCode || '86'
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
                          rules: [{ validator: (rule, value, callback) => value ? checkMobile(value) ? callback() : callback('格式错误') : callback() }]
                        })(
                          <Input onBlur={this.props.mobileOnBlur} />
                          )
                      }
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
            <BasicFormItem label={i18n('project_bd.email')} name="email" valueType="email">
              <Input />
            </BasicFormItem>

          </div>
        )}
        {hasPerm('BD.manageProjectBD') ?
        <BasicFormItem label={i18n('project_bd.manager')} name="manager" valueType="array" required>
          <SelectTrader mode="multiple" />
        </BasicFormItem> :null}

        {'isAdd' in this.props ? (
          <BasicFormItem label={i18n('remark.comment')} name="comments">
            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
          </BasicFormItem>
        ) : null}
      </Form>
    )
  }
}

function mapStateToProps(state) {
  const { country } = state.app;
  return { country };
}
export default connect(mapStateToProps)(ProjectBDForm)


function LayoutItem({ label, children, style }) {
  return (
    <Row style={{marginBottom:24,...style}}>
      <Col sm={6} xs={24}>
        {label ? (
          <span style={{float:'right',color:'rgba(0, 0, 0, 0.85)'}}>{label}<span style={{margin: '0 8px 0 2px'}}>:</span></span>
        ) : null}
      </Col>
      <Col sm={14} xs={24}>{children}</Col>
    </Row>
  )
}
