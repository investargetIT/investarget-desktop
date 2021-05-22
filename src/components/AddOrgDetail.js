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
} from '../utils/util';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import * as api from '../api';
import { 
  SelectExistOrganization,
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
  
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const body = { ...values, org: this.props.org };
        echo('body', body);
        api.addOrgContact(body)
          .then(result => {
              echo('resul', result)
              this.props.onNewDetailAdded();
            })
      }
    });
  }

  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
        <Form onSubmit={this.handleSubmit}>
        <BasicFormItem label="地址" name="address">
          <Input />
        </BasicFormItem>

        <FormItem {...formItemLayout} label={i18n('organization.telephone')}>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem>
                {
                  getFieldDecorator('countrycode', {
                    rules: [{ message: '' }],
                    initialValue: '86'
                  })(
                    <Input prefix="+" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem>{getFieldDecorator('areacode')(<Input placeholder="区号" />)}</FormItem>
            </Col>
            <Col span={12}>
              <FormItem required>
                {
                  getFieldDecorator('numbercode', {
                    rules: [
                      { message: 'Please input' },
                      { validator: (rule, value, callback) => value ? checkMobile(value) ? callback() : callback('格式错误') : callback() },
                  ]
                  })(
                    <Input />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <FormItem {...formItemLayout} label="传真">
          <Row gutter={8}>
            <Col span={6}>
              <FormItem>
                {
                  getFieldDecorator('countrycode', {
                    rules: [{ message: '' }],
                    initialValue: '86'
                  })(
                    <Input prefix="+" disabled />
                  )
                }
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem>{getFieldDecorator('areacode')(<Input placeholder="区号" disabled />)}</FormItem>
            </Col>
            <Col span={12}>
              <FormItem>
                {
                  getFieldDecorator('faxcode', {
                    rules: [
                      { message: 'Please input' },
                      { validator: (rule, value, callback) => value ? checkMobile(value) ? callback() : callback('格式错误') : callback() },
                  ]
                  })(
                    <Input />
                  )
                }
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
            disabled={hasErrors(getFieldsError())}
          >
          确定 
          </Button>
        </FormItem>

      </Form>
    );
  }
}

ContactForm.childContextTypes = {
  form: PropTypes.object
};

ContactForm = Form.create()(ContactForm);

class ManageFundForm extends React.Component {
  
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        values.fundraisedate = values.fundraisedate.format('YYYY-MM-DDT00:00:00');
        const body = { ...values, org: this.props.org };
        api.addOrgManageFund(body)
          .then(result => {
              echo('resul', result)
              this.props.onNewDetailAdded();
            })
      }
    });
  }

  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>

        <BasicFormItem label="基金" name="fund" >
          <SelectExistOrganization allowCreate formName="userform" />
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
            disabled={hasErrors(getFieldsError())}
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

ManageFundForm.childContextTypes = {
  form: PropTypes.object
};

ManageFundForm = Form.create()(ManageFundForm);

class InvestEventForm extends React.Component {
  
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.addEvent(values);
      }
    });
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
      });
  }

  handleTargetChange = () => this.props.form.setFieldsValue({ investDate: null });

  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;
    const investarget = this.props.form.getFieldValue('investTarget');
    return (
      <Form onSubmit={this.handleSubmit}>

        <BasicFormItem label="投资项目" name="investTarget" required valueType="number" onChange={this.handleTargetChange}>
          <SelectProjectLibrary />
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

        { investarget !== undefined ?
        <BasicFormItem label="投资时间" name="investDate" valueType="object" required>
          <SelectOrAddDate com_id={investarget} />
        </BasicFormItem>
        : null }

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
            disabled={hasErrors(getFieldsError())}
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

InvestEventForm.childContextTypes = {
  form: PropTypes.object
};

InvestEventForm = Form.create()(InvestEventForm);

class CooperationForm extends React.Component {
  
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        values.investDate = values.investDate.format('YYYY-MM-DDT00:00:00');
        const body = { ...values, org: this.props.org };
        api.addOrgCooperation(body)
          .then(result => {
              this.props.onNewDetailAdded();
            })
      }
    });
  }

  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>

        <BasicFormItem label="合作投资机构" name="cooperativeOrg" >
          <SelectExistOrganization allowCreate formName="userform" />
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
            disabled={hasErrors(getFieldsError())}
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

CooperationForm.childContextTypes = {
  form: PropTypes.object
};

CooperationForm = Form.create()(CooperationForm);

class BuyoutForm extends React.Component {
  
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        values.buyoutDate = values.buyoutDate.format('YYYY-MM-DDT00:00:00');
        const body = { ...values, org: this.props.org };
        api.addOrgBuyout(body)
          .then(result => {
              this.props.onNewDetailAdded();
            })
      }
    });
  }

  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>

        <BasicFormItem label="企业名称" name="comshortname">
          <Input />
        </BasicFormItem>

        <BasicFormItem label="退出时间" name="buyoutDate" valueType="object">
          <DatePicker format="YYYY-MM-DD" />
        </BasicFormItem>

        <BasicFormItem label="退出基金" name="buyoutorg" >
          <SelectExistOrganization allowCreate formName="userform" />
        </BasicFormItem>

        <BasicFormItem label="退出方式" name="buyoutType">
          <Input />
        </BasicFormItem>

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            确定
          </Button>
        </FormItem>

      </Form>
    );
  }
}

BuyoutForm.childContextTypes = {
  form: PropTypes.object
};

BuyoutForm = Form.create()(BuyoutForm);

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