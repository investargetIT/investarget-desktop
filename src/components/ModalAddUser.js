import React, { useState } from 'react';
import * as api from '../api';
import {
  Modal,
  Form, 
  Input, 
  Row,
  Col,
} from 'antd';
// import { BasicFormItem } from './Form';
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

const BasicFormItem = props => {
  const rules = [
    { type: props.valueType, message: i18n('validation.not_valid')},
    { required: props.required, message: i18n('validation.not_empty')},
  ]

  if (props.whitespace) {
    rules.push({ whitespace: props.whitespace })
  }
  if (props.validator) {
    rules.push({ validator: props.validator })
  }

  let options = { rules: rules }
  if ('initialValue' in props) {
    options.initialValue = props.initialValue
  }
  if ('valuePropName' in props) {
    options.valuePropName = props.valuePropName
  }
  if ('onChange' in props) {
    options.onChange = props.onChange
  }
  if ('getValueFromEvent' in props) {
    options.getValueFromEvent = props.getValueFromEvent;
  }
  if ('hidden' in props) {
    options.hidden = props.hidden;
  }

  return (
    <FormItem
      name={props.name}
      {...(props.layout || formItemLayout)}
      {...props.layout} label={props.label}
      {...options}
    >
      {props.children}
    </FormItem>
  )
}

const ModalAddUser = props => {

  const [isLoading, setIsLoading] = useState(false);
  const [addForm] = Form.useForm();

  function checkMobileInfo(_, value) {
    if (value) {
      if (checkRealMobile(value)) {
        return Promise.resolve();
      }
      return Promise.reject('手机号码格式错误')
    }
    return Promise.resolve();
  }

  function handleSubmitBtnClicked() {
    addForm.validateFields()
      .then(values => {
        setIsLoading(true);
        addUserAndRelation(values)
          .then(props.onCancel)
          .catch(handleError) // 可能会添加一个已经存在的投资人所以要捕获这个错误
          .finally(() => setIsLoading(false));
      });
  }

  async function addUserAndRelation(values) {
    values.userstatus = 1; // 默认待审核
    values.registersource = 3; // 标记注册来源
    values.org = props.org.id;
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
      confirmLoading={isLoading}
      onOk={handleSubmitBtnClicked}
    >
      <Form form={addForm}>

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
