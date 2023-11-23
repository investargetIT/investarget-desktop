import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, exchange, hasPerm, getUserInfo, formatBytes, customRequest, getFileTypeByName, getFileIconByType } from '../utils/util'
import * as api from '../api'
import styles from './ProjectForm.css'
import moment from 'moment';

import { Collapse, Form, Row, Col, Button, Icon, Input, Switch, Radio, Select, Cascader, InputNumber, Checkbox, DatePicker, Upload, Spin } from 'antd'
const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const InputGroup = Input.Group

import {
  BasicFormItem,
  FaBasicFormItem,
  FaUploadFormItem,
  CurrencyFormItem,
  IndustryDynamicFormItem,
} from '../components/Form';
 
import {
  SelectPriority,
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
import { EditOutlined, DeleteOutlined , CloudUploadOutlined, LoadingOutlined } from '@ant-design/icons';

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

function ProjectBasicInfoForm(props) {

  const [form] = Form.useForm();

  useEffect(() => {
    const formValuesStr = localStorage.getItem('projectBasicInfoFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      form.setFieldsValue(formValues);
    }
    return () => {
      form.validateFields()
        .then(formValues => {
          localStorage.setItem('projectBasicInfoFormValues', JSON.stringify(formValues));
        });
    };
  }, []);

  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaBasicFormItem label="项目名称" name="name" required>
        <Input />
      </FaBasicFormItem>

      <FaBasicFormItem label="重要级别" name="priority" valueType="number">
        <SelectPriority />
      </FaBasicFormItem>
      
      <FaBasicFormItem label="所属行业" name="industry" valueType="number">
        <CascaderIndustry disabled={[]} />
      </FaBasicFormItem>

      <FaBasicFormItem label="总部城市" name="headquarter" valueType="number">
        <CascaderCountry />
      </FaBasicFormItem>

      <FaBasicFormItem label="最新进展" name="latest">
        <Input />
      </FaBasicFormItem>
    </Form>
  );
}

const ConnectedProjectBaseForm = connect()(ProjectBasicInfoForm);
const FormProjectBasicInfo = React.forwardRef((props, ref) => <ConnectedProjectBaseForm {...props} forwardedRef={ref} />);

function ProjectBasicInfoDocsForm(props) {
  
  const [form] = Form.useForm();

  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaUploadFormItem label="Teaser" name="teaser" required />
      <FaUploadFormItem label="Memo" name="memo" />
      <FaUploadFormItem label="BP" name="bp" />
      <FaUploadFormItem label="Presentation" name="Presentation" />
      <FaUploadFormItem label="Brochure" name="Brochure" />
      <FaUploadFormItem label="Datapackage" name="Datapackage" />
      <FaUploadFormItem label="FAQ" name="FAQ" />
      <FaUploadFormItem label="Cap Table" name="CapTable" />
      <FaUploadFormItem label="PB" name="PB" />
    </Form>
  );
}

const ConnectedProjectBasicInfoDocsForm = connect()(ProjectBasicInfoDocsForm);
const FormProjectBasicInfoDocs = React.forwardRef((props, ref) => <ConnectedProjectBasicInfoDocsForm {...props} forwardedRef={ref} />);

function KickoffMeetingForm(props) {
  
  const [form] = Form.useForm();

  useEffect(() => {
    const formValuesStr = localStorage.getItem('kickoffMeetingFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      const date = moment(formValues.data)
      form.setFieldsValue({ ...formValues, date });
    }
    return () => {
      form.validateFields()
        .then(formValues => {
          localStorage.setItem('kickoffMeetingFormValues', JSON.stringify(formValues));
        });
    };
  }, []);

  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaBasicFormItem label="会议日期" name="date" valueType="object" required>
        <DatePicker style={{ width: '100%' }} />
      </FaBasicFormItem>

      <FaBasicFormItem label="会议主题" name="topic">
        <Input />
      </FaBasicFormItem>
      
      <FaBasicFormItem label="会议地点" name="address">
        <Input />
      </FaBasicFormItem>

      <FaBasicFormItem label="会议内容" name="content">
        <Input />
      </FaBasicFormItem>

      <FaBasicFormItem label="内部参会人员" name="people">
        <Input />
      </FaBasicFormItem>
    </Form>
  );
}

const ConnectedKickoffMeetingForm = connect()(KickoffMeetingForm);
const FormKickoffMeeting = React.forwardRef((props, ref) => <ConnectedKickoffMeetingForm {...props} forwardedRef={ref} />);

function KickoffDocsForm(props) {
  
  const [form] = Form.useForm();

  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaUploadFormItem label="立项报告" name="kickoffDocsReport" required />
      <FaUploadFormItem label="其它材料" name="kickoffDocsOthers" />
    </Form>
  );
}

const ConnectedKickoffDocsForm = connect()(KickoffDocsForm);
const FormKickoffDocs = React.forwardRef((props, ref) => <ConnectedKickoffDocsForm {...props} forwardedRef={ref} />);

function InvestigationInfoForm(props) {

  const [form] = Form.useForm();

  useEffect(() => {
    const formValuesStr = localStorage.getItem('investigationInfoFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      form.setFieldsValue(formValues);
    }
    return () => {
      form.validateFields()
        .then(formValues => {
          localStorage.setItem('investigationInfoFormValues', JSON.stringify(formValues));
        });
    };
  }, []);

  const layout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 12 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
    },
  }

  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="律师事务所" name="lawoffice">
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="服务人员" name="lawofficePeople">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="会计事务所" name="accountoffice">
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="服务人员" name="accountant">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>
      
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="业务服务商" name="provider">
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="服务人员" name="vendorPeople">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>
    </Form>
  );
}

const ConnectedInvestigationInfoForm = connect()(InvestigationInfoForm);
const FormInvestigationInfo = React.forwardRef((props, ref) => <ConnectedInvestigationInfoForm {...props} forwardedRef={ref} />);

function InvestigationDocsForm(props) {
  const [form] = Form.useForm();
  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaUploadFormItem label="尽调文件" name="investigationDocs" required />
      <FaUploadFormItem label="TS签署版" name="ts" required />
      <FaUploadFormItem label="尽调访谈计划" name="interviewPlan" />
      <FaUploadFormItem label="尽调访谈纪要" name="interviewSummary" />
      <FaUploadFormItem label="财务尽调报告" name="financialReport" />
      <FaUploadFormItem label="法律尽调报告" name="lawReport" />
    </Form>
  );
}
const ConnectedInvestigationDocsForm = connect()(InvestigationDocsForm);
const FormInvestigationDocs = React.forwardRef((props, ref) => <ConnectedInvestigationDocsForm {...props} forwardedRef={ref} />);

export {
  FormProjectBasicInfo,
  FormProjectBasicInfoDocs,
  FormKickoffMeeting,
  FormKickoffDocs,
  FormInvestigationInfo,
  FormInvestigationDocs,
};
