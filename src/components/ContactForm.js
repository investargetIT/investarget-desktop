import React from 'react';
import { Form, Row, Col, Input } from 'antd';
import { BasicFormItem } from './Form';
import { SelectTitle } from './ExtraInput';
import { i18n, checkMobile } from '../utils/util';

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
};

class ContactForm extends React.Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <BasicFormItem label={i18n('project_bd.contact_name')} name="username" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.contact_title')} name="usertitle" valueType="number" required>
          <SelectTitle showSearch />
        </BasicFormItem>

        <FormItem {...formItemLayout} label={i18n('project_bd.contact_mobile')} required>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem>
                {
                  getFieldDecorator('mobileAreaCode', {
                    rules: [{ message: i18n('validation.not_empty'), required: true }], initialValue: '86',
                  })(
                    <Input prefix="+" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={18}>
              <FormItem>
                {
                  getFieldDecorator('mobile', {
                    rules: [
                      { message: i18n('validation.not_empty'), required: true },
                      { validator: (rule, value, callback) => value ? checkMobile(value) ? callback() : callback('格式错误') : callback() }
                    ]
                  })(
                    <Input onBlur={this.props.mobileOnBlur} />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n('project_bd.email')} name="email" valueType="email">
          <Input />
        </BasicFormItem>
      </Form>
    );
  }
}

export default ContactForm;
