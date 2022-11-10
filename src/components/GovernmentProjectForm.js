import React, { useEffect } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, exchange, hasPerm, getCurrentUser, getCurrencyFromId, customRequest } from '../utils/util'
import * as api from '../api'
import styles from './ProjectForm.css'
import { Collapse, Form, Row, Col, Button, Icon, Input, Switch, Radio, Select, Cascader, InputNumber, Checkbox, Upload } from 'antd'
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
  InboxOutlined,
} from '@ant-design/icons';
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
      <Select value={value && String(value)} onChange={this.handleChange} defaultValue="2" {...extraProps}>
        {
          _options.map(item =>
            <Select.Option key={item.value} value={String(item.value)}>{item.label}</Select.Option>
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

export { SelectProjectStatus };


class ProjectConnectForm1 extends React.Component {

  constructor(props) {
    super(props)

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

        <BasicFormItem label="联络人" name="trader-0">
          <SelectTrader allowClear />
        </BasicFormItem>

        <BasicFormItem label="对接人" name="trader-1">
          <SelectTrader allowClear />
        </BasicFormItem>
        
        <BasicFormItem label="上传人" name="trader-2">
          <SelectTrader allowClear />
        </BasicFormItem>
        
        <BasicFormItem label="发起人" name="trader-3">
          <SelectTrader allowClear />
        </BasicFormItem>
        
        <BasicFormItem label="开发团队" name="trader-4" valueType="array">
          <SelectTrader mode="multiple" />
        </BasicFormItem>
      
        <BasicFormItem label="执行团队" name="trader-5" valueType="array">
          <SelectTrader mode="multiple" />
        </BasicFormItem>

        <BasicFormItem label="项目经理" name="trader-6">
          <SelectTrader allowClear />
        </BasicFormItem>
 
      </Form>
    )
  }
}
const ProjectConnectForm = React.forwardRef((props, ref) => <ProjectConnectForm1 {...props} forwardedRef={ref} />);


function GovernmentProjectDetailForm1(props) {
  
  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'goverInfoType' });
  }, []);
  
  function normFile(e) {
    const fileList = Array.isArray(e) ? e : (e && e.fileList);
    return fileList.map(file => ({
      ...file,
      bucket: file.response ? file.response.result.bucket : file.bucket,
      key: file.response ? file.response.result.key : file.key,
      realfilekey: file.response ? file.response.result.realfilekey : file.key,
      url: file.response ? file.response.result.url : file.url,
      filename: file.name,
    }));
  }

  function handleUploadChange(e) {
    // window.echo('handle upload change', e);
  }

  return (
    <Form ref={props.forwardedRef}>
      {props.goverInfoType.map(m => (
        <div key={m.id}>
          <BasicFormItem label={m.label} name={[m.id, 'info']} initialValue="">
            <Input.TextArea rows={8} />
          </BasicFormItem>
          <BasicFormItem
            label="附件"
            name={[m.id, 'fileList']}
            valuePropName="fileList"
            getValueFromEvent={normFile}
            valueType="array"
            initialValue={[]}
          >
            <Upload.Dragger
              multiple
              customRequest={customRequest}
              data={{ bucket: 'file' }}
              onChange={handleUploadChange}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            </Upload.Dragger>
          </BasicFormItem>
        </div>
      ))}
    </Form>
  );

}

function mapStateToProps(state) {
  const { goverInfoType } = state.app;
  return { goverInfoType };
}

const ConnectedGovernmentProjectDetailForm = connect(mapStateToProps)(GovernmentProjectDetailForm1);
const GovernmentProjectDetailForm = React.forwardRef((props, ref) => <ConnectedGovernmentProjectDetailForm {...props} forwardedRef={ref} />);

export {
  GovernmentProjectDetailForm,
  ProjectConnectForm,
};
