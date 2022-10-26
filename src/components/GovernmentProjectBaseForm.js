import React, { useEffect } from 'react';
import PropTypes from 'prop-types'
import { i18n, getCurrentUser, hasPerm } from '../utils/util'
import { connect } from 'dva'
import { Link } from 'dva/router'
import styles from './ProjectForm.css'

import { Form, Input, Radio, Checkbox } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item

import {
  BasicFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'

import {
  TreeSelectTag,
  SelectRole,
  SelectTransactionType,
  CascaderIndustry,
  RadioTrueOrFalse,
  SelectService, 
  SelectExistUser,
  SelectIndustryGroup,
  SelectMultipleExistProject,
  SelectProjectBD,
  CascaderChina,
} from '../components/ExtraInput'

const paraStyle = {lineHeight: 2, marginBottom: '8px'}



function GovernmentProjectBaseForm(props) {

  useEffect(() => {
    props.dispatch({ type: 'app/getSourceList', payload: ['industry'] });
  }, []);

  return (
    <Form ref={props.forwardedRef}>
      <BasicFormItem label={i18n('project.is_hidden')} name="isHidden" valueType="boolean" initialValue={false}>
        <RadioTrueOrFalse />
      </BasicFormItem>

      <BasicFormItem label="对应平台项目" name="projectBD" valueType="array">
        <SelectMultipleExistProject />
      </BasicFormItem>

      <BasicFormItem label={i18n('project.project_chinese_name')} name="projtitleC" required whitespace>
        <Input />
      </BasicFormItem>

      <BasicFormItem label={i18n('project.real_name')} name="realname" required whitespace>
        <Input />
      </BasicFormItem>

      <BasicFormItem label={i18n('project.tags')} name="tags" valueType="array" required>
        <TreeSelectTag />
      </BasicFormItem>

      <FormItem noStyle shouldUpdate>
        {({ getFieldValue, setFieldsValue }) => {
          return (
            <IndustryDynamicFormItem
              industry={props.industry}
              formRef={{ current: { getFieldValue, setFieldsValue } }} />
          );
        }}
      </FormItem>

      <BasicFormItem label={i18n('project.country')} name="country" required valueType="number">
        <CascaderChina />
      </BasicFormItem>

      <BasicFormItem label={i18n('project.engagement_in_transaction')} name="character" required valueType="number">
        <SelectRole />
      </BasicFormItem>

      <BasicFormItem label={i18n('project.transaction_type')} name="transactionType" required valueType="array">
        <SelectTransactionType mode="multiple" />
      </BasicFormItem>

      <BasicFormItem label={i18n('project.service_type')} name="service" required valueType="array">
        <SelectService mode="multiple" />
      </BasicFormItem>

      <div style={{ textAlign: 'center' }}>
        <div style={paraStyle}>
          <FormItem
            style={{ 'display': 'inline' }}
            name="isAgreed"
            valuePropName="checked"
            rules={[{ type: 'boolean' }, { required: true }, {
              validator: (_, value) => {
                if (value) { return Promise.resolve() } else { return Promise.reject('请同意相关协议') }
              }
            }]}
            initialValue={true}
          >
            <Checkbox><Link to="/app/agreement" target="_blank">{i18n('project.agreement')}</Link></Checkbox>
          </FormItem>
        </div>
        <p style={paraStyle}>{i18n('project.agreement_tip')}</p>
      </div>
    </Form>
  );

}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

// export default connect(mapStateToPropsIndustry)(ProjectBaseForm)
const ConnectedGovernmentProjectForm = connect(mapStateToPropsIndustry)(GovernmentProjectBaseForm);
export default React.forwardRef((props, ref) => <ConnectedGovernmentProjectForm {...props} forwardedRef={ref} />);
