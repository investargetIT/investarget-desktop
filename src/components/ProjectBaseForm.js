import React from 'react'
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
  CascaderCountry,
  CascaderIndustry,
  RadioTrueOrFalse,
  SelectService, 
  SelectExistUser,
  SelectIndustryGroup,
  SelectExistProject,
  SelectProjectBD,
} from '../components/ExtraInput'

const paraStyle = {lineHeight: 2, marginBottom: '8px'}



class ProjectBaseForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  constructor(props) {
    super(props)
    window.form = props.form
  }

  getChildContext() {
    return { form: this.props.form }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    return (
      <Form ref={this.props.forwardedRef}>
        <BasicFormItem label={i18n('project.is_hidden')} name="isHidden" valueType="boolean" initialValue={false}>
          <RadioTrueOrFalse />
        </BasicFormItem>

        <BasicFormItem label="对应项目BD" name="projectBD" valueType="number">
          <SelectProjectBD />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.project_chinese_name')} name="projtitleC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.project_english_name')} name="projtitleE" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.real_name')} name="realname" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.tags')} name="tags" valueType="array" required>
          <TreeSelectTag editable />
        </BasicFormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue, setFieldsValue }) => {
            return (
              <IndustryDynamicFormItem
                industry={this.props.industry}
                formRef={{ current: { getFieldValue, setFieldsValue } }} /> 
            );
          }}
        </FormItem>
        
        <BasicFormItem label={i18n('project.country')} name="country" required valueType="number">
          <CascaderCountry size="large" />
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

        <BasicFormItem label={i18n('project.industry_group')} name="indGroup" valueType="number">
          <SelectIndustryGroup />
        </BasicFormItem>

        {/* { hasPerm('proj.admin_manageproj') ? 
        <BasicFormItem label={i18n('project.uploader')} name="supportUser" initialValue={getCurrentUser()} valueType="number">
           <SelectExistUser />
        </BasicFormItem>
        : null } */}

        <BasicFormItem label="上一轮项目" name="lastProject" valueType="number">
          <SelectExistProject />
        </BasicFormItem>

        <div style={{textAlign: 'center'}}>
          <div style={paraStyle}>
            <FormItem
              style={{'display': 'inline'}}
              name="isAgreed"
              valuePropName="checked"
              rules={[{type: 'boolean'}, {required: true}, {validator: (_, value) => {
                if (value) { return Promise.resolve() } else { return Promise.reject('请同意相关协议') }
              }}]}
              initialValue={true}
            >
              <Checkbox><Link to="/app/agreement" target="_blank">{i18n('project.agreement')}</Link></Checkbox>
            </FormItem>
          </div>
          <p style={paraStyle}>{i18n('project.agreement_tip')}</p>
        </div>
      </Form>
    )
  }

}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

// export default connect(mapStateToPropsIndustry)(ProjectBaseForm)
const ConnectedProjectForm = connect(mapStateToPropsIndustry)(ProjectBaseForm);
export default React.forwardRef((props, ref) => <ConnectedProjectForm {...props} forwardedRef={ref} />);
