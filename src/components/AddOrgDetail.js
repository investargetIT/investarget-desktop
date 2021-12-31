import React from 'react';
import { 
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
  Select,
} from 'antd';
import { 
  BasicFormItem,
  Email,
  Mobile,
} from '../components/Form';
import { 
  i18n,
  checkMobile,
  requestAllData,
  handleError,
} from '../utils/util';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import * as api from '../api';
import { 
  SelectExistOrganizationWithID,
  CascaderCountry,
  SelectLibIndustry,
  SelectOrAddDate,
  SelectProjectLibrary,
} from './ExtraInput';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class ContactForm extends React.Component {
  
  contactFormRef = React.createRef();

  handleSubmit = () => {
    this.contactFormRef.current.validateFields()
      .then((values) => {
        const body = { ...values, org: this.props.org };
        api.addOrgContact(body)
          .then(result => {
            this.props.onNewDetailAdded();
          })
          .catch(handleError)
    });
  }

  checkMobileInfo = (_, value) => {
    if (value) {
      if (checkMobile(value)) {
        return Promise.resolve();
      }
      return Promise.reject('格式错误')
    }
    return Promise.resolve();
  }

  render() {

    return (
        <Form onFinish={this.handleSubmit} ref={this.contactFormRef}>
        <BasicFormItem label="地址" name="address">
          <Input />
        </BasicFormItem>

        <FormItem {...formItemLayout} label={i18n('organization.telephone')} style={{ marginBottom: 0 }}>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem name="countrycode" rules={[{ message: '' }]} initialValue="86">
                <Input prefix="+" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem name="areacode"><Input placeholder="区号" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem required name="numbercode" rules={[
                { message: 'Please input' },
                { validator: this.checkMobileInfo }, 
              ]}>
                <Input />
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <FormItem {...formItemLayout} label="传真" style={{ marginBottom: 0 }}>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem name="countrycode" rules={[{ message: '' }]} initialValue="86">
                <Input prefix="+" disabled />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem name="areacode"><Input placeholder="区号" disabled /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="faxcode" rules={[
                { message: 'Please input' },
                { validator: this.checkMobileInfo },
              ]}>
                <Input />
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n("account.email")} name="email" valueType="email">
          <Input  />
        </BasicFormItem>

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
          >
          确定 
          </Button>
        </FormItem>

      </Form>
    );
  }
}

class ManageFundForm extends React.Component {
  
  fundFormRef = React.createRef();

  handleSubmit = () => {
    this.fundFormRef.current.validateFields()
      .then((values) => {
        console.log('Received values of form: ', values);
        values.fundraisedate = values.fundraisedate.format('YYYY-MM-DDT00:00:00');
        const body = { ...values, org: this.props.org };
        api.addOrgManageFund(body)
          .then(result => {
              this.props.onNewDetailAdded();
            })
          .catch(handleError)
    });
  }

  render() {

    return (
      <Form onFinish={this.handleSubmit} ref={this.fundFormRef}>

        <BasicFormItem label="基金" name="fund" valueType="number">
          <SelectExistOrganizationWithID size="middle" />
        </BasicFormItem>

        <BasicFormItem label="类型" name="type">
          <Input />
        </BasicFormItem>

        <BasicFormItem label="资本来源" name="fundsource">
          <Input />
        </BasicFormItem>

        <BasicFormItem label="募集完成时间" name="fundraisedate" valueType="object">
          <DatePicker format="YYYY-MM-DD" />
        </BasicFormItem>

        <BasicFormItem label="募集规模" name="fundsize">
          <Input />
        </BasicFormItem>

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

class InvestEventForm extends React.Component {
  
  investEventFormRef = React.createRef();

  handleSubmit = () => {
    this.investEventFormRef.current.validateFields()
      .then((values) => {
        console.log('Received values of form: ', values);
        this.addEvent(values);
      })
      .catch(handleError);
  }

  addEvent = async values => {
    const com_id = isNaN(values.investTarget) ? undefined : parseInt(values.investTarget);
    let comshortname = isNaN(values.investTarget) ? values.investTarget: undefined;
    const investDate = values.investDate.format('YYYY-MM-DDT00:00:00');

    let industrytype, Pindustrytype;
    if (com_id !== undefined && comshortname === undefined) {
      const result = await api.getLibProjSimple({ com_id });
      const { com_name, com_cat_name, com_sub_cat_name } = result.data.data[0];
      comshortname = com_name;
      industrytype = com_sub_cat_name;
      Pindustrytype = com_cat_name; 
    }

    const requestEvents = await requestAllData(api.getLibEvent, { com_id }, 100);
    const event = requestEvents.data.data.filter(f => f.date === values.investDate.format('YYYY-MM-DD'))[0];

    const body = {
      ...values,
      org: this.props.org,
      com_id,
      comshortname,
      investDate,
      investTarget: undefined,
      investType: event && event.round,
      investSize: event && event.money,
      industrytype,
      Pindustrytype,
    };
    return api.addOrgInvestEvent(body)
      .then(result => {
        this.props.onNewDetailAdded();
      })
      .catch(handleError);
  }

  render() {
    return (
      <Form onFinish={this.handleSubmit} ref={this.investEventFormRef}>

        <BasicFormItem label="投资项目" name="investTarget" required valueType="number">
          <SelectProjectLibrary size="middle" />
        </BasicFormItem>

        {/* <BasicFormItem label="行业分类" name="industrytype">
          <SelectLibIndustry />
        </BasicFormItem>

        <BasicFormItem label="地区" name="area" valueType="number">
          <CascaderCountry isShowProvince />
        </BasicFormItem>

        <BasicFormItem label="投资人" name="investor">
          <Input />
        </BasicFormItem> */}

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const investarget = getFieldValue('investTarget');
            if (investarget !== undefined) {
              return (
                <BasicFormItem label="投资时间" name="investDate" valueType="object" required>
                  <SelectOrAddDate com_id={investarget} />
                </BasicFormItem>
              );
            }
          }}
        </FormItem>

        {/* <BasicFormItem label="投资性质" name="investType">
          <Input />
        </BasicFormItem>

        <BasicFormItem label="投资金额" name="investSize">
          <Input />
        </BasicFormItem> */}

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

class CooperationForm extends React.Component {
 
  cooperationFormRef = React.createRef();

  handleSubmit = () => {
    this.cooperationFormRef.current.validateFields()
      .then((values) => {
        console.log('Received values of form: ', values);
        values.investDate = values.investDate.format('YYYY-MM-DDT00:00:00');
        const body = { ...values, org: this.props.org };
        api.addOrgCooperation(body)
          .then(result => {
            this.props.onNewDetailAdded();
          })
          .catch(handleError);
      });
  }

  render() {
    return (
      <Form onFinish={this.handleSubmit} ref={this.cooperationFormRef}>

        <BasicFormItem label="合作投资机构" name="cooperativeOrg" valueType="number">
          <SelectExistOrganizationWithID size="middle" />
        </BasicFormItem>

        <BasicFormItem label="投资时间" name="investDate" valueType="object">
          <DatePicker format="YYYY-MM-DD" />
        </BasicFormItem>

        <BasicFormItem label="合作投资企业" name="comshortname">
          <Input />
        </BasicFormItem>

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

class BuyoutForm extends React.Component {
  
  buyoutFormRef = React.createRef();

  handleSubmit = () => {
    this.buyoutFormRef.current.validateFields()
    .then((values) => {
        console.log('Received values of form: ', values);
        values.buyoutDate = values.buyoutDate.format('YYYY-MM-DDT00:00:00');
        const body = { ...values, org: this.props.org };
        api.addOrgBuyout(body)
          .then(result => {
              this.props.onNewDetailAdded();
            })
          .catch(handleError);
    });
  }

  render() {

    return (
      <Form onFinish={this.handleSubmit} ref={this.buyoutFormRef}>

        <BasicFormItem label="企业名称" name="comshortname">
          <Input />
        </BasicFormItem>

        <BasicFormItem label="退出时间" name="buyoutDate" valueType="object">
          <DatePicker format="YYYY-MM-DD" />
        </BasicFormItem>

        <BasicFormItem label="退出基金" name="buyoutorg" valueType="number">
          <SelectExistOrganizationWithID size="middle" />
        </BasicFormItem>

        <BasicFormItem label="退出方式" name="buyoutType">
          <Input />
        </BasicFormItem>

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

class AddOrgDetail extends React.Component {

  allForms = {
    contact: <ContactForm {...this.props} />,
    managefund: <ManageFundForm {...this.props} />,
    investevent: <InvestEventForm {...this.props} />,
    cooperation: <CooperationForm {...this.props} />,
    buyout: <BuyoutForm {...this.props} />,
  }

  state = {
    value: 'contact',
  }

  render() {
    return (
      <div>

        <FormItem {...formItemLayout} label="类别">
          <Select defaultValue="contact" style={{ width: 120 }} onChange={value => this.setState({ value })}>
            <Option value="contact">联系方式</Option>
            <Option value="managefund">管理基金</Option>
            <Option value="investevent">投资事件</Option>
            <Option value="cooperation">合作关系</Option>
            <Option value="buyout">退出分析</Option>
          </Select>
        </FormItem>

        { this.allForms[this.state.value] }

      </div>
    );
  }
}

export default AddOrgDetail;