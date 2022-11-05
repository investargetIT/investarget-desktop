import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, exchange, hasPerm, getCurrentUser, getCurrencyFromId } from '../utils/util'
import * as api from '../api'
import styles from './ProjectForm.css'

import { Collapse, Form, Row, Col, Button, Icon, Input, Switch, Radio, Select, Cascader, InputNumber, Checkbox } from 'antd'
const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const InputGroup = Input.Group

import {
  BasicFormItem,
  CurrencyFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'
 
import {
  TreeSelectTag,
  SelectRole,
  SelectYear,
  SelectTransactionType,
  SelectCurrencyType,
  CascaderCountry,
  CascaderIndustry,
  InputCurrency,
  InputPhoneNumber,
  RadioTrueOrFalse,
  SelectService,
  SelectExistUser,
  SelectAllUser, 
  SelectTrader,
  SelectIndustryGroup,
  SelectExistProject,
  SelectProjectBD,
} from '../components/ExtraInput'

class SelectProjectStatus extends React.Component {

  handleChange = (value) => {
    this.props.onChange(Number(value))
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['projstatus'] })
  }

  render() {
    const {options, children, dispatch, status, value, onChange, ...extraProps} = this.props
    let _options = []

    if (status < 4) {
      _options = options.filter(item => item.value <= status + 1)
    } else {
      _options = options
    }

    return (
      <Select value={String(value)} onChange={this.handleChange} {...extraProps}>
        {
          _options.map(item =>
            <Option key={item.value} value={String(item.value)}>{item.label}</Option>
          )
        }
      </Select>
    )
  }
}

SelectProjectStatus = connect(function(state) {
  const { projstatus } = state.app
  const options = projstatus ? projstatus.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})(SelectProjectStatus)



class ProjectConnectForm1 extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)

    // const { getFieldDecorator } = this.props.form
    this.currentUserId = getCurrentUser()
  }

  phoneNumberValidator = (_, value) => {
    const isPhoneNumber = /([0-9]+)-([0-9]+)/
    if (isPhoneNumber.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(i18n('validation.please_input_correct_phone_number'));
    }
  }

  isCurrentUserSupportUser = getFieldValue => {
    const supportUser = getFieldValue('supportUser');
    if (!supportUser) return false;
    return this.currentUserId === supportUser.id;
  }

  // projectTeamValidator = (_, value, callback) => {
  //   if (value.length === 1) return callback('请至少选择两位项目团队成员');
  //   return callback();
  // }

  render() {
    return (
      <Form ref={this.props.forwardedRef}>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            if (this.isCurrentUserSupportUser(getFieldValue) || hasPerm('proj.get_secretinfo')) {
              return (
                <BasicFormItem
                  label={i18n('project.contact_person')}
                  name="contactPerson"
                  required
                  whitespace
                >
                  <Input />
                </BasicFormItem>
              );
            }
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            if (this.isCurrentUserSupportUser(getFieldValue) || hasPerm('proj.get_secretinfo')) {
              return (
                <BasicFormItem
                  label={i18n('project.phone')}
                  name="phoneNumber"
                  required
                  validator={this.phoneNumberValidator}
                >
                  <InputPhoneNumber />
                </BasicFormItem>
              );
            }
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            if (this.isCurrentUserSupportUser(getFieldValue) || hasPerm('proj.get_secretinfo')) {
              return (
                <BasicFormItem label={i18n('project.email')} name="email" required valueType="email">
                  <Input type="email" />
                </BasicFormItem>
              );
            }
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            if (this.isCurrentUserSupportUser(getFieldValue) || hasPerm('proj.get_secretinfo')) {
              return (
                <BasicFormItem label={i18n('project.uploader')} name="supportUserName" initialValue={this.currentUserId}>
                  <Input disabled />
                </BasicFormItem>
              );
            }
          }}
        </Form.Item>

        <BasicFormItem label="项目发起人" name="sponsor" valueType="number">
          <SelectAllUser type="trader" />
        </BasicFormItem>
        
        {/* {hasPerm('proj.admin_manageproj') ? */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              return (
                <BasicFormItem label="开发团队" name="takeUser" valueType="array">
                  {/* <SelectAllUser type="trader" /> */}
                  <SelectTrader
                    mode="multiple"
                    // disabledOption={getFieldValue('makeUser')}
                  />
                </BasicFormItem>
              );
            }}
          </Form.Item>
          {/* :
          <BasicFormItem label={i18n('project.development')} name="takeUserName">
            <Input disabled />
          </BasicFormItem>
        } */}

        {/* {hasPerm('proj.admin_manageproj') ? */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              return (
                <BasicFormItem label="执行团队" name="makeUser" valueType="array">
                  {/* <SelectAllUser type="trader" /> */}
                  <SelectTrader
                    mode="multiple"
                    // disabledOption={getFieldValue('takeUser')}
                  />
                </BasicFormItem>
              );
            }}
          </Form.Item>
          {/* :
          <BasicFormItem label={i18n('project.team')} name="makeUserName">
            <Input disabled />
          </BasicFormItem> */}
        {/* } */}

        {/* {hasPerm('proj.admin_manageproj') ? */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              return (
                <BasicFormItem label="项目经理" name="PM">
                  <SelectTrader />
                </BasicFormItem>
              );
            }}
          </Form.Item>
          {/* :
          <BasicFormItem label="PM" name="PMName">
            <Input disabled />
          </BasicFormItem>
        } */}
      </Form>
    )
  }
}
const ProjectConnectForm = React.forwardRef((props, ref) => <ProjectConnectForm1 {...props} forwardedRef={ref} />);


function GovernmentProjectDetailForm1(props) {
  window.echo('governmentProject');
  return (
    <Form ref={props.forwardedRef}>
      <BasicFormItem label="公司简介" name="p_introducteC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Company Introduction" name="p_introducteE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="目标市场" name="targetMarketC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Target Market" name="targetMarketE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="核心产品" name="productTechnologyC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Core Product" name="productTechnologyE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="商业模式" name="businessModelC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Business Model" name="businessModelE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="品牌渠道" name="brandChannelC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Brand Channel" name="brandChannelE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="管理团队" name="managementTeamC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Management Team" name="managementTeamE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="商业伙伴" name="BusinesspartnersC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Business Partner" name="BusinesspartnersE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="资金用途" name="useOfProceedC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Use of Proceeds" name="useOfProceedE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="融资历史" name="financingHistoryC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Financing History" name="financingHistoryE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="经营数据" name="operationalDataC" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
      <BasicFormItem label="Operational Data" name="operationalDataE" initialValue={''}>
        <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
      </BasicFormItem>
    </Form>
  );

}
const GovernmentProjectDetailForm = React.forwardRef((props, ref) => <GovernmentProjectDetailForm1 {...props} forwardedRef={ref} />);

export {
  GovernmentProjectDetailForm,
  ProjectConnectForm,
};
