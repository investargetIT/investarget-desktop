import React from 'react'
import { connect } from 'dva'
import { 
  i18n, 
  exchange, 
  getCurrencyFromId, 
  checkMobile,
} from '../utils/util';
import { Form, Input, InputNumber, Row, Col } from 'antd'
const FormItem = Form.Item

import {
  SelectOrganizationType,
  CascaderIndustry,
  SelectTransactionPhase,
  RadioTrueOrFalse,
  RadioCurrencyType,
  RadioAudit,
  TreeSelectTag,
} from '../components/ExtraInput'

import {
  BasicFormItem,
} from '../components/Form'


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

/**
 *  OrganizationForm 的字段 :
 *  'orgnameC', 'orgnameE', 'orgtype', 'industry', 'orgtransactionphase', 'stockcode', 'investoverseasproject', 'currency',
 *  'companyEmail', 'webSite', 'mobileAreaCode', 'mobile', 'weChat',
 *  'address', 'description', 'typicalCase', 'partnerOrInvestmentCommiterMember', 'decisionCycle', 'decisionMakingProcess',
 *  'orgstatus'
 */


class OrganizationForm extends React.Component {

  constructor(props) {
    super(props)
  }

  // componentDidMount() {
  //   if (!hasPerm('org.admin_manageorg')) {
  //     this.props.dispatch(routerRedux.replace('/403'))
  //     return
  //   }
  // }

  checkMobileInfo = (_, value) => {
    if (value && !checkMobile(value)) {
      return Promise.reject(new Error(i18n('mobile_incorrect_format')));
    }
    return Promise.resolve();
  }

  render() {
    return (
      <Form ref={this.props.forwardedRef}>

        <BasicFormItem label={i18n('organization.cn_name')} name="orgnameC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.en_name')} name="orgnameE" whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.full_name')} name="orgfullname" whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.org_type')} name="orgtype" valueType="number">
          <SelectOrganizationType />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.industry')} name="industry" valueType="number">
          <CascaderIndustry disabled={[]} />
        </BasicFormItem>

        <BasicFormItem label="标签" name="tags" valueType="array">
          <TreeSelectTag />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.transaction_phase')} name="orgtransactionphase" valueType="array">
          <SelectTransactionPhase mode="multiple" allowClear />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.stock_code')} name="stockcode">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('filter.invest_oversea')} name="investoverseasproject" valueType="boolean" initialValue={false}>
          <RadioTrueOrFalse />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.currency')} name="currency" valueType="number">
          <RadioCurrencyType />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.company_email')} name="companyEmail" valueType="email">
          <Input type="email" />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.company_website')} name="webSite">
          <Input />
        </BasicFormItem>

        <FormItem {...formItemLayout} label={i18n('organization.telephone')}>
          <Row gutter={8}>
            <Col span={4}>
              <FormItem name="mobileAreaCode" rules={[{ message: '' }]} initialValue="86">
                <Input prefix="+" />
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem name="mobileCode"><Input placeholder="区号" /></FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                name="mobile"
                rules={[
                  { message: 'Please input' },
                  { validator: this.checkMobileInfo},
                ]}>
                <Input />
              </FormItem>
            </Col>
          </Row>
        </FormItem>

        <BasicFormItem label={i18n('organization.wechat')} name="weChat">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.address')} name="address">
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.description')} name="description">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.typical_case')} name="typicalCase">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.partner_or_investment_committee_member')} name="partnerOrInvestmentCommiterMember">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.decision_cycle')} name="decisionCycle" valueType="number">
          <InputNumber style={{ width: '100%' }} />
        </BasicFormItem>

        <BasicFormItem label={i18n('organization.decision_process')} name="decisionMakingProcess">
          <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        {/* { hasPerm('org.admin_manageorg') ? */}
        <BasicFormItem label={i18n('organization.audit_status')} name="orgstatus" valueType="number" initialValue={1}>
          <RadioAudit />
        </BasicFormItem>
        {/* : null } */}

      </Form>
    )
  }
}

const ConnectedOrgForm = connect()(OrganizationForm);
export default React.forwardRef((props, ref) => <ConnectedOrgForm {...props} forwardedRef={ref} />);
