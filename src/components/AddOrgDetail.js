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
} from '../utils/util';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import * as api from '../api';
import { SelectExistOrganization } from './ExtraInput';

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

class AddOrgDetail extends React.Component {

  allForms = {
    contact: <ContactForm {...this.props} />,
    managefund: <ManageFundForm {...this.props} />,
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