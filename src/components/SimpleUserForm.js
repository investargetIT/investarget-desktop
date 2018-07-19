import React from 'react'
import { 
  Form, 
  Input, 
  Row,
  Col,
} from 'antd';
import {
  BasicFormItem,
} from '../components/Form'
import {
  SelectUserGroup,
} from '../components/ExtraInput'
import { 
  i18n,
  checkRealMobile, 
} from '../utils/util';

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

class SimpleUserForm extends React.Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>

        <BasicFormItem label={i18n('user.group')} name="groups" valueType="array" required>
          <SelectUserGroup type="investor" />
        </BasicFormItem>

        <BasicFormItem label={i18n('account.name')} name="usernameC" required><Input /></BasicFormItem>

        <FormItem {...formItemLayout} label={i18n("user.mobile")} required>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem required>
                {
                  getFieldDecorator('mobileAreaCode', {
                    rules: [{ message: i18n('validation.not_empty'), required: true }], initialValue: '86'
                  })(
                    <Input prefix="+" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={18}>
              <FormItem required>
                {
                  getFieldDecorator('mobile', {
                    rules: [
                      { message: i18n('validation.not_empty'), required: true },
                      { validator: (rule, value, callback) => value ? checkRealMobile(value) ? callback() : callback('手机号码格式错误') : callback() },
                    ]
                  })(
                    <Input />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n("user.email")} name="email" required valueType="email"><Input /></BasicFormItem>

        <BasicFormItem label={i18n("user.wechat")} name="wechat"><Input /></BasicFormItem>

      </Form>
    );
  }
}

export default SimpleUserForm; 
