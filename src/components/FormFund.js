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
  SelectInvestmentRound,
} from '../components/ExtraInput'
import { EditOutlined, DeleteOutlined , CloudUploadOutlined, LoadingOutlined } from '@ant-design/icons';

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
      const date = moment(formValues.date)
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

function FundBankInfoForm(props) {
  
  const [form] = Form.useForm();

  useEffect(() => {
    const formValuesStr = localStorage.getItem('FundBankInfoFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      form.setFieldsValue(formValues);
    }
    return () => {
      form.validateFields()
        .then(formValues => {
          localStorage.setItem('FundBankInfoFormValues', JSON.stringify(formValues));
        });
    };
  }, []);

  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaBasicFormItem label="托管银行" name="fundbank">
        <Input />
      </FaBasicFormItem>
      <FaUploadFormItem label="托管协议" name="FundBankInfoOthers" />
    </Form>
  );
}

const ConnectedFundBankInfoForm = connect()(FundBankInfoForm);
const FormFundBankInfo = React.forwardRef((props, ref) => <ConnectedFundBankInfoForm {...props} forwardedRef={ref} />);

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

function FundFilingForm(props) {
  const [form] = Form.useForm();
  useEffect(() => {
    const formValuesStr = localStorage.getItem('FundFilingFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      const startdate = moment(formValues.startdate);
      const enddate = moment(formValues.enddate);
      form.setFieldsValue({ ...formValues, startdate, enddate });
    }
    return () => {
      form.validateFields()
        .then(formValues => {
          localStorage.setItem('FundFilingFormValues', JSON.stringify(formValues));
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
  };
  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="备案申请日期" name="startdate" valueType="object">
            <DatePicker style={{ width: '100%' }} />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="备案状态" name="status">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="备案通过日期" name="enddate" valueType="object">
            <DatePicker style={{ width: '100%' }} />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="备案编号" name="no">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>
      <FaBasicFormItem label="备案说明" name="FundFilingAfterwards">
        <Input />
      </FaBasicFormItem>
      <FaUploadFormItem label="合伙人确认书" name="hehuorenquerenshu" required />
      <FaUploadFormItem label="企业合伙人名录" name="FundFilingSummary" />
      <FaUploadFormItem label="验资报告" name="yanzibaogao" />
      <FaUploadFormItem label="执行事务合伙人委托书" name="hehuorenweituoshu" />
      <FaUploadFormItem label="其他文档" name="others" />
    </Form>
  );
}
const ConnectedFundFilingForm = connect()(FundFilingForm);
const FormFundFiling = React.forwardRef((props, ref) => <ConnectedFundFilingForm {...props} forwardedRef={ref} />);

function DecisionMeetingForm(props) {

  const [form] = Form.useForm();

  useEffect(() => {
    const formValuesStr = localStorage.getItem('decisionMeetingFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      const date = moment(formValues.date);
      form.setFieldsValue({ ...formValues, date });
    }
    return () => {
      form.validateFields()
        .then(formValues => {
          localStorage.setItem('decisionMeetingFormValues', JSON.stringify(formValues));
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
          <FaBasicFormItem layout={layout} label="会议日期" name="date" valueType="object">
            <DatePicker style={{ width: '100%' }} />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="会议结论" name="result">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>

      <FaBasicFormItem label="内部参会人员" name="accountoffice">
        <Input />
      </FaBasicFormItem>

      <FaBasicFormItem label="外部参会人员" name="accountant">
        <Input />
      </FaBasicFormItem>

      <FaBasicFormItem label="会议报告" name="provider">
        <Input />
      </FaBasicFormItem>

      <FaBasicFormItem label="决策会议决议" name="vendorPeople">
        <Input />
      </FaBasicFormItem>

    </Form>
  );
}

const ConnectedDecisionMeetingForm = connect()(DecisionMeetingForm);
const FormDecisionMeeting = React.forwardRef((props, ref) => <ConnectedDecisionMeetingForm {...props} forwardedRef={ref} />);

function InvestmentDocsForm(props) {
  const [form] = Form.useForm();
  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaUploadFormItem label="投资协议" name="investmentAgreements" required />
      <FaUploadFormItem label="退出协议" name="withdrawAgreements" required />
      <FaUploadFormItem label="他方投资" name="thirdPartyInvestment" />
      <FaUploadFormItem label="老股转让" name="stockTransfer" />
      <FaUploadFormItem label="ESOP" name="esop" />
      <FaUploadFormItem label="股改" name="stockUpdate" />
      <FaUploadFormItem label="重组" name="chongzu" />
      <FaUploadFormItem label="其他" name="qita" />
      <FaUploadFormItem label="减资" name="jianzi" />
      <FaUploadFormItem label="债权投资" name="zhaiquantouzi" />
      <FaUploadFormItem label="资本公积转增" name="zibengongjizhuanzen" />
      <FaUploadFormItem label="分拆" name="fenchai" />
    </Form>
  );
}
const ConnectedInvestmentDocsForm = connect()(InvestmentDocsForm);
const FormInvestmentDocs = React.forwardRef((props, ref) => <ConnectedInvestmentDocsForm {...props} forwardedRef={ref} />);

function FundEstForm(props) {
  const [form] = Form.useForm();
  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <FaUploadFormItem label="注册文档" name="fundest_zhucewendang" required />
      <FaUploadFormItem label="营业执照" name="fundest_yingyezhizhao" required />
      <FaUploadFormItem label="开户许可证" name="fundest_kaihuxukezheng" required />
      <FaUploadFormItem label="登记材料" name="fundest_dengjicailiao" required />
      <FaUploadFormItem label="其它文档" name="fundest_others" required />
    </Form>
  );
}
const ConnectedFundEstForm = connect()(FundEstForm);
const FormFundEst = React.forwardRef((props, ref) => <ConnectedFundEstForm {...props} forwardedRef={ref} />);

function FundInfoForm(props) {

  const [form] = Form.useForm();

  useEffect(() => {
    const formValuesStr = localStorage.getItem('FundInfoFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      form.setFieldsValue({ ...formValues });
    }
    return () => {
      form.validateFields()
        .then(formValues => {
          localStorage.setItem('FundInfoFormValues', JSON.stringify(formValues));
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
          <FaBasicFormItem layout={layout} label="基金名称" name="lawoffice" required>
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="基金全称" name="fullname" required>
            <Input />
          </FaBasicFormItem>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="组织形式" name="accountoffice" required>
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="注册地" name="accountant" valueType="number">
            <CascaderCountry isShowProvince />
          </FaBasicFormItem>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="基金币种" name="provider" valueType="number">
            <SelectCurrencyType />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="目标规模" name="vendorPeople" valueType="number">
            <InputNumber style={{ width: '100%' }} formatter={value => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </FaBasicFormItem>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="存续期" name="jiaoyiqianzonggushu">
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="投资期管理费率(%)" name="jiaoyihouzonggushu">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="退出期管理费率(%)" name="tuichuqi">
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="延长期管理费率(%)" name="yanchangqi">
            <Input />
          </FaBasicFormItem>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="基石投资人出资比例" name="touhouguzhi">
            <Input />
          </FaBasicFormItem>
        </div>

        <div style={{ flex: 1 }}>
          <FaBasicFormItem layout={layout} label="基石投资人出资金额" name="wosichigubili" valueType="number">
            <InputNumber style={{ width: '100%' }} formatter={value => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </FaBasicFormItem>
        </div>
      </div>

      <FaBasicFormItem label="基石投资人出资要求" name="requirements">
        <Input />
      </FaBasicFormItem>

      <FaBasicFormItem label="基金简介" name="remark">
        <Input />
      </FaBasicFormItem>

    </Form>
  );
}

const ConnectedFundInfoForm = connect()(FundInfoForm);
const FormFundInfo = React.forwardRef((props, ref) => <ConnectedFundInfoForm {...props} forwardedRef={ref} />);

export {
  FormProjectBasicInfo,
  FormProjectBasicInfoDocs,
  FormKickoffMeeting,
  FormFundBankInfo,
  FormInvestigationInfo,
  FormInvestigationDocs,
  FormFundFiling,
  FormDecisionMeeting,
  FormInvestmentDocs,
  FormFundEst,
  FormFundInfo,
};
