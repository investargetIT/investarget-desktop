import React from 'react'
import PropTypes from 'prop-types'
import { 
  i18n, 
  hasPerm, 
  intersection, 
  checkMobile,
  handleError,
  requestAllData,
} from '../utils/util';
import * as api from '../api'
import { Link } from 'dva/router'
import { 
  Form, 
  Input, 
  Row, 
  Col, 
  Button, 
  Switch, 
} from 'antd';
import {
  BasicFormItem,
} from '../components/Form'
import {
  SelectTitle,
  SelectYear,
  CascaderCountry,
  SelectExistOrCreateNewOrganization,
  SelectUserGroup,
  RadioAudit,
  SelectTrader,
  SelectOrganizatonArea,
  RadioFamLv,
  TreeSelectTag,
} from '../components/ExtraInput'
import { Role, Mobile } from './Form'
import { UploadImage } from './Upload'

const FormItem = Form.Item

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

// 其他字段
// gender, description, remark, school, specialty,



class UserForm extends React.Component {

  constructor(props) {
    super(props)

    // const { getFieldDecorator } = this.props.form
    // getFieldDecorator('cardBucket', {
    //   rules: [{required: true}], initialValue: 'image'
    // })

    this.state = {
      investorGroup: [], // 投资人所在的用户组
      isFetchingNumber: false, // 是否在获取随机号码
      isDsiablePhoneInput: false, // 获取随机号码后手机号码文本框禁止编辑
    }
    this.isEditUser = false
    let perm
    switch (props.type) {
      case 'edit':
        perm = 'usersys.admin_manageuser'
        this.isEditUser = true
        break
      case 'add':
        perm = 'usersys.admin_manageuser'
        break
    }
    this.hasPerm = true;
  }

  componentDidMount() {
    requestAllData(api.queryUserGroup, { type: 'investor' }, 100)
    .then(data => this.setState({ investorGroup: data.data.data.map(m => m.id) }))
  }

  handleUnknowPhoneButtonClicked = () => {
    this.setState({ isFetchingNumber: true });
    api.getRandomPhoneNumber()
      .then(result => {
        this.props.forwardedRef.current.setFieldsValue({ mobile: result.data.toString(), mobileAreaCode: '86' });
        this.setState({ isDsiablePhoneInput: true });
      })
      .catch(handleError)
      .finally(() => this.setState({ isFetchingNumber: false }));
  }

  checkMobileInfo = (_, value) => {
    if (value == '') {
      return Promise.reject(new Error(i18n('mobile_not_empty')));
    } else if (!checkMobile(value)) {
      return Promise.reject(new Error(i18n('mobile_incorrect_format')));
    } else {
      return Promise.resolve();
    }
  }

  ifShowMajorTraderFormItem = getFieldValue => {
    const targetUserIsInvestor = getFieldValue('groups') && intersection(getFieldValue('groups'), this.state.investorGroup).length > 0;
    const userIsApproved = getFieldValue('userstatus') === 2;
    return targetUserIsInvestor && userIsApproved && this.isEditUser && this.hasPerm;
  }

  render() {
    const { forwardedRef, onValuesChange } = this.props;
    return (
      <Form ref={forwardedRef} onValuesChange={onValuesChange}>

         {/* { this.hasPerm || !this.isEditUser ? */}
        <BasicFormItem label={i18n('user.group')} name="groups" valueType="array" required>
          <SelectUserGroup type={(this.props.isTraderAddInvestor || !this.hasPerm) ? 'investor' : null} />
        </BasicFormItem>
        {/* : null }  */}

        <FormItem {...formItemLayout} label={i18n("user.mobile")} required>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                required
                name="mobileAreaCode"
                rules={[{ message: i18n('validation.not_empty'), required: true}]}
                initialValue="86"
              >
                <Input prefix="+" disabled={this.state.isDsiablePhoneInput} />
              </FormItem>
            </Col>
            <Col span={14}>
              <FormItem
                required
                name="mobile"
                rules={[
                  { message: i18n('validation.not_empty'), required: true },
                  { validator: this.checkMobileInfo }
                ]}
              >
                <Input onBlur={this.props.mobileOnBlur} disabled={this.state.isDsiablePhoneInput} />
              </FormItem>
            </Col>
            <Col span={4}>
              <Button style={{ width: '100%' }} loading={this.state.isFetchingNumber} onClick={this.handleUnknowPhoneButtonClicked}>号码未知</Button>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n("user.email")} name="email" required valueType="email">
          <Input onBlur={this.props.emailOnBlur} />
        </BasicFormItem>

        <BasicFormItem label={i18n('user.cn_name')} name="usernameC" required={window.LANG=='cn'? true:false} >
          <Input onBlur={this.props.cnNameOnBlur} />
        </BasicFormItem>

        <BasicFormItem label={i18n('user.en_name')} name="usernameE" required={window.LANG=='en'? true:false} ><Input /></BasicFormItem>

        <BasicFormItem label={i18n("user.wechat")} name="wechat"><Input /></BasicFormItem>

        <BasicFormItem label={i18n("user.position")} name="title" valueType="number" required>
          <SelectTitle showSearch />
        </BasicFormItem>

        <BasicFormItem label={i18n("user.institution")} name="org" required={!this.props.isTraderAddInvestor} valueType="object">
          <SelectExistOrCreateNewOrganization allowCreate size="large" />
        </BasicFormItem>

        <BasicFormItem label={i18n("user.department")} name="department"><Input /></BasicFormItem>

        <BasicFormItem label={i18n('user.area')} valueType="number" name="orgarea">
          <SelectOrganizatonArea showSearch />
        </BasicFormItem>

        <BasicFormItem label={i18n("user.country")} name="country" valueType="number">
          <CascaderCountry />
        </BasicFormItem>

        <BasicFormItem label={i18n("user.tags")} name="tags" valueType="array">
          <TreeSelectTag />
        </BasicFormItem>

        <BasicFormItem label={i18n('user.target_demand')} name="targetdemand"><Input.TextArea rows={4} /></BasicFormItem>
        <BasicFormItem label={i18n('user.merges')} name="mergedynamic"><Input.TextArea rows={4} /></BasicFormItem>
        <BasicFormItem label={i18n('user.industry_fund')} name="ishasfundorplan"><Input.TextArea rows={4} /></BasicFormItem>

        {
          this.hasPerm && !this.props.isTraderAddInvestor ? (
            <BasicFormItem label={i18n("user.status")} name="userstatus" valueType="number" initialValue={2}>
              <RadioAudit />
            </BasicFormItem>
          ) : null
        }

        { this.props.showFamlvRadio ? 
        <BasicFormItem label="熟悉程度" name="famlv" valueType="number">
          <RadioFamLv />
        </BasicFormItem>
        : null }

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue }) => {
            if (getFieldValue('onjob') !== undefined) {
              return (
                <FormItem {...formItemLayout} label="是否在职" name="onjob" valuePropName="checked">
                  <Switch defaultChecked={getFieldValue('onjob')} />
                </FormItem>
              );
            }
          }}
        </FormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue }) => {
            if (this.ifShowMajorTraderFormItem(getFieldValue)) {
              return (
                <BasicFormItem label={i18n('user.major_trader')} name="major_trader">
                  <SelectTrader
                    mode="single"
                    allowClear={true}
                    onChange={this.props.onMajorTraderChange}
                    onSelect={this.props.onSelectMajorTrader}
                    disabledOption={forwardedRef.current ? forwardedRef.current.getFieldValue('minor_traders') : []} />
                </BasicFormItem>
              );
            }
          }}
        </FormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue }) => {
            if (this.ifShowMajorTraderFormItem(getFieldValue)) {
              return (
                <BasicFormItem label={i18n('user.minor_traders')} name="minor_traders" valueType="array">
                  <SelectTrader mode="multiple"
                    onSelect={this.props.onSelectMinorTrader}
                    onDeselect={this.props.onDeselectMinorTrader}
                    disabledOption={forwardedRef.current ? forwardedRef.current.getFieldValue('major_trader') : []} />
                </BasicFormItem>
              );
            }
          }}
        </FormItem>

        <BasicFormItem label={i18n('user.card')} name="cardKey">
          <UploadImage />
        </BasicFormItem>

      </Form>
    )
  }
}


export default React.forwardRef((props, ref) => <UserForm {...props} forwardedRef={ref} />);
