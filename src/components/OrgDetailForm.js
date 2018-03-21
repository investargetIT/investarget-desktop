import React from 'react';
import { 
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
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

const FormItem = Form.Item;

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

  function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

class OrgDetailForm extends React.Component {
  
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

OrgDetailForm.childContextTypes = {
  form: PropTypes.object
};

export default connect()(Form.create()(OrgDetailForm));