import React from 'react';
import * as api from '../api';
import {
  Modal,
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
  handleError,
  isLogin,
  i18n,
  checkRealMobile, 
} from '../utils/util'

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

const ModalAddUser = props => {

  const [form] = Form.useForm();

  function checkMobileInfo (_, value) {
    if (value) {
      if (checkRealMobile(value)) {
        return Promise.resolve();
      }
      return Promise.reject('手机号码格式错误')
    }
    return Promise.resolve();
  }

  function handleSubmitBtnClicked () {
    this.addForm.validateFields((err, values) => {
      if (!err) {
        this.setState({ isLoading: true });
        this.addUserAndRelation(values)
          .then(this.props.onCancel)
          .catch(handleError) // 可能会添加一个已经存在的投资人所以要捕获这个错误
          .finally(() => this.setState({ isLoading: false }));
      }
    })
  }

  async function addUserAndRelation(values) {
    values.userstatus = 1; // 默认待审核
    values.registersource = 3; // 标记注册来源
    values.org = this.props.org.id;
    const user = await api.addUser(values);
    const investoruserid = user.data.id;
    const body = {
      relationtype: true,
      investoruser: investoruserid,
      traderuser: isLogin().id
    };
    await api.addUserRelation(body);
  }

  return (
    <Modal
      title={`为 ${props.org.orgname} 添加投资人`}
      visible={true}
      onCancel={props.onCancel}
      // confirmLoading={this.state.isLoading}
      onOk={handleSubmitBtnClicked}
    >
      <Form form={form}>

        <BasicFormItem label={i18n('user.group')} name="groups" valueType="array" initialValue={[1]} required>
          <SelectUserGroup type="investor" />
        </BasicFormItem>

        <BasicFormItem label={i18n('account.name')} name="usernameC" required>
          <Input />
        </BasicFormItem>

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
                  { validator: checkMobileInfo },
                ]}
              >
                <Input />
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n("user.email")} name="email" required valueType="email">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n("user.position")} name="title" valueType="number">
          <SelectTitle showSearch />
        </BasicFormItem>

        <BasicFormItem label={i18n("user.wechat")} name="wechat">
          <Input />
        </BasicFormItem>

      </Form>
    </Modal>
  );

}

export default ModalAddUser;
