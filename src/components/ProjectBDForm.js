import React from 'react'
import { hasPerm, getCurrencyFromId, exchange, getUserInfo } from '../utils/util'
import { Form, Input, Row, Col, Switch } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea

import { BasicFormItem, CurrencyFormItem } from './Form'
import {
  SelectBDStatus,
  SelectBDSource,
  SelectTitle,
  SelectPartner, 
  SelectAllUser, 
  SelectOrganizatonArea, 
  CascaderCountry,
  SelectIndustryGroup,
  SelectCurrencyType,
  SelectTrader,
  SelectAreaWithShortcut,
} from './ExtraInput'
import { 
  i18n, 
  checkMobile,
} from '../utils/util';
import * as api from '../api'
import { connect } from 'dva';
import { formItemLayout } from '../constants';
import LayoutItem from './LayoutItem';

class ProjectBDForm extends React.Component {

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
      email:null,
      wechat: null,
    }
  }

  initialDataLoaded = false
  componentWillReceiveProps(nextProps) {
    // 表单拿到bd数据时
    if (!this.initialDataLoaded && nextProps.data && ('bduser' in nextProps.data)) {
      this.initialDataLoaded = true
      let bduserId = nextProps.data.bduser
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
      const { title, mobile, email, wechat } = result.data
      this.setState({
        contactTitle: title ? title.name : '',
        contactMobile: mobile,
        email: email,
        wechat,
      })
    })
  }

  toggleManualInput = () => {
    const { getFieldValue } = this.props.forwardedRef.current;
    this.setState({
      isSelect: false,
      _bduser: getFieldValue('bduser'),
    })
  }

  toggleSelect = () => {
    const { getFieldValue } = this.props.forwardedRef.current;
    this.setState({
      isSelect: true,
      _username: getFieldValue('username'),
      _usertitle: getFieldValue('usertitle'),
      _usermobile: getFieldValue('usermobile'),
    })
    // 模拟触发改变 bduser 字段
    this.handleChangeBduser(this.state._bduser)
  }

  // 处理货币相关表单联动
  handleCurrencyTypeChange = (currencyId, getFieldValue, setFieldsValue) => {
    let currency = getCurrencyFromId(currencyId)
    // 如果是虚拟货币的话，和美元同价
    if (currency === 'USDT') {
      currency = 'USD';
    }
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

  checkMobileInfo = (_, value) => {
    if (value && !checkMobile(value)) {
      return Promise.reject(new Error(i18n('mobile_incorrect_format')));
    }
    return Promise.resolve();
  }

  render() {
    return (
      <Form ref={this.props.forwardedRef}>
        <BasicFormItem label="重点BD" name="isimportant" valueType="boolean" valuePropName="checked">
          <Switch />
        </BasicFormItem>

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

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue, setFieldsValue }) => {
            return (
              <BasicFormItem label={i18n('project_bd.finance_currency')} name="financeCurrency" valueType="number">
                <SelectCurrencyType onChange={value => this.handleCurrencyTypeChange(value, getFieldValue, setFieldsValue)} />
              </BasicFormItem>
            );
          }}
        </FormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue, setFieldsValue }) => {
            return (
              <CurrencyFormItem
                label={i18n('project_bd.finance_amount')}
                name="financeAmount"
                currencyType={getFieldValue('financeCurrency')}
                setFieldsValue={setFieldsValue}
              />
            );
          }}
        </FormItem>

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
          <CascaderCountry isDetail />
        </BasicFormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const countryObj = getFieldValue('country');
            let country = null;
            if (countryObj && this.props.country.length > 0) {
              country = this.props.country.filter(f => f.id === countryObj.value)[0];
            }
            if (['中国', 'China'].includes(country && (country.label || country.country))) {
              return (
                <BasicFormItem label={i18n('project_bd.area')} name="location" required valueType="number">
                  {/* <SelectOrganizatonArea showSearch /> */}
                  <SelectAreaWithShortcut />
                </BasicFormItem>
              );
            }
          }}
        </FormItem>

        {this.state.isSelect ? (
          <div>
            <BasicFormItem label={i18n('project_bd.contact')} name="bduser" valueType="number" initialValue={this.state._bduser}>
              <SelectPartner onChange={this.handleChangeBduser} />
            </BasicFormItem>
            <LayoutItem label="" style={{marginTop:-24}}>
              <div>联系人不在库里？<a onClick={this.toggleManualInput}>手动输入</a></div>
            </LayoutItem>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                if (getFieldValue('bduser')) {
                  return (
                    <LayoutItem label={i18n('project_bd.contact_title')}>
                      {this.state.contactTitle}
                    </LayoutItem>
                  );
                }
              }}
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                if (getFieldValue('bduser')) {
                  return (
                    <LayoutItem label={i18n('project_bd.contact_mobile')}>
                      {this.state.contactMobile}
                    </LayoutItem>
                  );
                }
              }}
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                if (getFieldValue('bduser')) {
                  return (
                    <LayoutItem label={i18n('project_bd.email')}>
                      {this.state.email}
                    </LayoutItem>
                  );
                }
              }}
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                if (getFieldValue('bduser')) {
                  return (
                    <LayoutItem label="微信">
                      {this.state.wechat}
                    </LayoutItem>
                  );
                }
              }}
            </Form.Item>

          </div>
        ) : (
          <div>
            <BasicFormItem label={i18n('project_bd.contact_name')} name="username" initialValue={this.state._username}>
              <Input />
            </BasicFormItem>
            <LayoutItem label="" style={{marginTop:-24}}>
              <div>联系人在库里？<a onClick={this.toggleSelect}>选择联系人</a></div>
            </LayoutItem>

            <BasicFormItem label={i18n('project_bd.contact_title')} name="usertitle" valueType="number" initialValue={this.state._usertitle}>
              <SelectTitle showSearch />
            </BasicFormItem>

              <FormItem {...formItemLayout} label={i18n('project_bd.contact_mobile')}>
                <Row gutter={8}>
                  <Col span={6}>
                    <FormItem noStyle shouldUpdate>
                      {({ getFieldValue }) => {
                        const countryObj = getFieldValue('country');
                        let country = null;
                        if (countryObj && this.props.country.length > 0) {
                          country = this.props.country.filter(f => f.id === countryObj.value)[0];
                        }
                        return (
                          <FormItem
                            style={{ marginBottom: 0 }}
                            name="mobileAreaCode"
                            rules={[]}
                            initialValue={country && country.areaCode || '86'}
                          >
                            <Input prefix="+" />
                          </FormItem>
                        )
                      }}
                    </FormItem>
                  </Col>
                  <Col span={18}>
                    <FormItem
                      style={{ marginBottom: 0 }}
                      name="mobile"
                      rules={[{ validator: this.checkMobileInfo }]}
                    >
                      <Input />
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
            <BasicFormItem label={i18n('project_bd.email')} name="email" valueType="email">
              <Input />
            </BasicFormItem>
            <BasicFormItem label="微信" name="wechat">
              <Input />
            </BasicFormItem>
          </div>
        )}

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const createuser = getFieldValue('createuser');
            if (hasPerm('BD.manageProjectBD') || getUserInfo().id === createuser) {
              return (
                <BasicFormItem label={i18n('project_bd.manager')} name="manager" valueType="array" required>
                  <SelectTrader mode="multiple" />
                </BasicFormItem>
              );
            }
          }}
        </Form.Item>
        
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
const ConnectedProjectBDForm = connect(mapStateToProps)(ProjectBDForm);
export default React.forwardRef((props, ref) => <ConnectedProjectBDForm {...props} forwardedRef={ref} />);
