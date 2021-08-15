import React from 'react'
import { 
  Form, 
  Input, 
  Row,
  Col,
} from 'antd';
import {
  BasicFormItem,
} from './Form'
import {
  SelectUserGroup,
  SelectTitle,
} from './ExtraInput'
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

  constructor(props) {
    super(props);
  }
  
  checkMobileInfo = (_, value) => {
    if (value) {
      if (checkRealMobile(value)) {
        return Promise.resolve();
      }
      return Promise.reject('手机号码格式错误')
    }
    return Promise.resolve();
  }

  render() {
    return (
      <Form ref={this.props.forwardedRef}>

        <BasicFormItem label={i18n('user.group')} name="groups" valueType="array" initialValue={[1]} required>
          <SelectUserGroup type="investor" />
        </BasicFormItem>

        <BasicFormItem label={i18n('account.name')} name="usernameC" required><Input /></BasicFormItem>

        <FormItem {...formItemLayout} label={i18n("user.mobile")} required>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                required
                name="mobileAreaCode"
                rules={[{ message: i18n('validation.not_empty'), required: true }]}
                initialValue="86"
              >
                <Input prefix="+" />
              </FormItem>
            </Col>
            <Col span={18}>
              <FormItem
                required
                name="mobile"
                rules={[
                  { message: i18n('validation.not_empty'), required: true },
                  { validator: this.checkMobileInfo },
                ]}
              >
                <Input />
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n("user.email")} name="email" required valueType="email"><Input /></BasicFormItem>

        <BasicFormItem label={i18n("user.position")} name="title" valueType="number">
          <SelectTitle showSearch />
        </BasicFormItem>

        <BasicFormItem label={i18n("user.wechat")} name="wechat"><Input /></BasicFormItem>

      </Form>
    );
  }
}

// export default SimpleUserForm;
export default React.forwardRef((props, ref) => <SimpleUserForm {...props} forwardedRef={ref} />);
