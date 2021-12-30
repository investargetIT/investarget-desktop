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
  checkMobileInfo = (_, value) => {
    if (value == '') {
      return Promise.reject(new Error(i18n('mobile_not_empty')));
    } else if (!checkMobile(value)) {
      return Promise.reject(new Error(i18n('mobile_incorrect_format')));
    } else {
      return Promise.resolve();
    }
  }
  render() {
    return (
      <Form ref={this.props.forwardedRef} initialValues={this.props.data}>
        <BasicFormItem label={i18n('project_bd.contact_name')} name="username" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.contact_title')} name="usertitle" valueType="number" required>
          <SelectTitle showSearch />
        </BasicFormItem>

        <FormItem {...formItemLayout} label={i18n('project_bd.contact_mobile')} required>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem name="mobileAreaCode" rules={[{ message: i18n('validation.not_empty'), required: true }]} initialValue="86">
                <Input prefix="+" />
              </FormItem>
            </Col>
            <Col span={18}>
              <FormItem name="mobile" rules={[
                { message: i18n('validation.not_empty'), required: true },
                { validator: this.checkMobileInfo }
              ]}>
                <Input onBlur={this.props.mobileOnBlur} />
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

export default React.forwardRef((props, ref) => <ContactForm {...props} forwardedRef={ref} />);
