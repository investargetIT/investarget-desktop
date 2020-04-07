import React from 'react'
import PropTypes from 'prop-types'
import { i18n, getCurrentUser, hasPerm } from '../utils/util'
import { connect } from 'dva'
import { Link } from 'dva/router'
import styles from './ProjectForm.css'

import { Form, Input, Radio, Checkbox, Switch, Button, Icon, InputNumber } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item
const TextArea = Input.TextArea;

import {
  BasicFormItem,
  IndustryDynamicFormItem,
} from './Form'

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
  SelectYear,
  SelectSeason,
} from './ExtraInput'

const paraStyle = {lineHeight: 2, marginBottom: '8px'}

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14, offset: 6 },
  },
};

let uuid = 0;
class OKRForm extends React.Component {

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

  add = () => {
    uuid++;
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  remove = (k) => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      return (
        <div key={k} style={{ backgroundColor: '#f8f8f8', padding: '20px 0', margin: '20px 0', position: 'relative' }}>
            <BasicFormItem label="关键结果" name={`krs_${k}`}>
              <Input />
            </BasicFormItem>
            <BasicFormItem label="信心指数" name={`confidence_${k}`} valueType="number">
              <InputNumber min={1} max={100} />
            </BasicFormItem>
            <Icon
              style={{ position: 'absolute', top: 20, right: 20 }}
              className="dynamic-delete-button"
              type="delete"
              onClick={() => this.remove(k)}
            />
        </div>
      );
    });
    return (
      <Form>

        <BasicFormItem label="年份" name="year" valueType="number" required>
          <SelectYear />
        </BasicFormItem>

        <BasicFormItem label="是否为年度目标" name="okrType" valueType="boolean" valuePropName="checked">
          <Switch />
        </BasicFormItem>

        <BasicFormItem label="季度" name="quarter" valueType="number">
          <SelectSeason />
        </BasicFormItem>

        <BasicFormItem label="总体目标" name="target">
          <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
        </BasicFormItem>

        {formItems}
        
        <FormItem {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
            <Icon type="plus" /> 添加关键结果及信心指数 
          </Button>
        </FormItem>

      </Form>
    )
  }

}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

export default connect(mapStateToPropsIndustry)(OKRForm)
