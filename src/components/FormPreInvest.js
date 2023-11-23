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

  const [fileName, setFileName] = useState();
  const [fileUrl, setFileUrl] = useState();
  const [fileSize, setFileSize] = useState();
  const [fileDate, setFileDate] = useState();
  const [uploader, setUploader] = useState();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const formValuesStr = localStorage.getItem('kickoffDocsFormValues');
    if (formValuesStr) {
      const formValues = JSON.parse(formValuesStr);
      const { fileName, fileUrl, fileSize, fileDate, uploader } = formValues;
      setFileName(fileName);
      setFileUrl(fileUrl);
      setFileSize(fileSize);
      setFileDate(fileDate);
      setUploader(uploader);
    }
  }, []);

  const normFile = (e) => {
    const fileList = Array.isArray(e) ? e : (e && e.fileList);
    const file = fileList[0];
    return file ? [
      {
        ...file,
        bucket: file.response ? file.response.result.bucket : file.bucket,
        key: file.response ? file.response.result.realfilekey : file.key,
        url: file.response ? file.response.result.url : file.url,
      },
    ] : [];
  };

  const handleUploadChange = (e) => {
    if (e.file.status === 'done') {
      const { file } = e;
      const { name, size, lastModified, response } = file;
      const { bucket, key, realfilekey, url } = response.result;
      api.downloadUrl(bucket, realfilekey).then(result => {
        const downloadUrl = result.data;
        setIsLoading(false);
        setFileName(name);
        setFileUrl(downloadUrl);
        setFileSize(size);
        setFileDate(lastModified);
        const currentUser = getUserInfo();
        setUploader(currentUser.username)

        const formValues = {
          fileName: name,
          fileUrl: downloadUrl,
          fileSize: size,
          fileDate: lastModified,
          uploader: currentUser.username,
        };
        localStorage.setItem('kickoffDocsFormValues', JSON.stringify(formValues));
      })
    } else {
      setIsLoading(true);
    }
  };

  const faUploadFormItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
  }

  return (
    <Form ref={props.forwardedRef} form={form} className="fa-form">
      <Row style={{ borderRight: '1px solid #d9d9d9' }}>
        <Col span={6}>
          <Form.Item
            className="fa-upload-form-item"
            style={{ flex: 1 }}
            label="立项报告"
            labelAlign="left"
            colon={false}
            required
            name="fileList"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            {...faUploadFormItemLayout}
          >
            <Upload
              name="file"
              customRequest={customRequest}
              data={{ bucket: 'file' }}
              maxCount={1}
              onChange={handleUploadChange}
              showUploadList={false}
            >
              <Button icon={isLoading ? <LoadingOutlined /> : <CloudUploadOutlined />} type="link" />
            </Upload>

          </Form.Item>
        </Col>

        <Col span={18} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #d9d9d9' }}>
          <div style={{ flex: 1, padding: '0 10px' }}>
            {fileName && getFileIconByType(getFileTypeByName(fileName))}
            <a target="_blank" href={fileUrl}>{fileName}</a>
          </div>
          <div style={{ width: 100, padding: '0 10px' }}>{fileSize && formatBytes(fileSize)}</div>
          <div style={{ width: 100, padding: '0 10px' }}>{uploader}</div>
          <div style={{ width: 150, padding: '0 10px' }}>{fileDate && moment(fileDate).format('YYYY-MM-DD HH:mm')}</div>
        </Col>
      </Row>

      <FaBasicFormItem label="其它材料" name="otherDocs">
        <Input />
      </FaBasicFormItem>
    </Form>
  );
}

const ConnectedKickoffDocsForm = connect()(KickoffDocsForm);
const FormKickoffDocs = React.forwardRef((props, ref) => <ConnectedKickoffDocsForm {...props} forwardedRef={ref} />);

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


class ProjectDetailForm1 extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Form ref={this.props.forwardedRef}>
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
    )
  }
}
const ProjectDetailForm = React.forwardRef((props, ref) => <ProjectDetailForm1 {...props} forwardedRef={ref} />);

export {
  FormProjectBasicInfo,
  FormKickoffMeeting,
  FormKickoffDocs,
  ProjectDetailForm,
  ProjectConnectForm,
}
