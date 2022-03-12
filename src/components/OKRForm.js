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
let ppid = 0;
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

  add = () => {
    uuid++;
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  addKrs = (key) => {
    window.echo('add krs', key);
    ppid++;
    const { form } = this.props;
    const keys = form.getFieldValue(key);
    const nextKeys = keys.concat(ppid);
    form.setFieldsValue({
      [key]: nextKeys,
    });
  }

  removeFormItem = (key, value) => {
    const { form } = this.props;
    const keyValues = form.getFieldValue(key);
    const body = {};
    body[key] = keyValues.filter(k => k !== value);
    form.setFieldsValue(body);
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((m, mIndex) => {
      const krsKeys = `okr_${m}`;
      getFieldDecorator(krsKeys, { initialValue: [] });
      const allKrsKeys = getFieldValue(krsKeys);
      const krsFormItems = allKrsKeys.map((k) => {
        return (
          <div key={k} style={{ backgroundColor: '#f8f8f8', padding: '20px 0', paddingBottom: 0, margin: '20px 0', position: 'relative', borderTop: '1px dashed grey' }}>
            <BasicFormItem label="关键结果" name={`${krsKeys}_krs_${k}`}>
              <Input />
            </BasicFormItem>
            <BasicFormItem label="信心指数(%)" name={`${krsKeys}_confidence_${k}`} valueType="number">
              <InputNumber min={0} max={100} />
            </BasicFormItem>
            <Icon
              style={{ position: 'absolute', top: 20, right: 20 }}
              className="dynamic-delete-button"
              type="delete"
              onClick={() => this.removeFormItem(krsKeys, k)}
            />
          </div>
        );
      });

      return (
        <div key={m} style={{ backgroundColor: '#f8f8f8', padding: '20px 0', paddingTop: 0, margin: '20px 0', position: 'relative' }}>
          
          <div style={{ marginBottom: 20, backgroundColor: 'lightgrey', lineHeight: '32px', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
            <span>目标{mIndex + 1}</span>
            <Icon
              style={{ cursor: 'pointer', marginLeft: 10 }}
              type="delete"
              onClick={() => this.removeFormItem('keys', m)}
            />
          </div>
          
          <BasicFormItem label="目标" name={`okr_${m}_target`}>
            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
          </BasicFormItem>

          {krsFormItems}

          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={() => this.addKrs(krsKeys)} style={{ width: '100%' }}>
              <Icon type="plus" /> 添加关键结果及信心指数
            </Button>
          </FormItem>

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

        {!getFieldValue('okrType') &&
          <BasicFormItem label="季度" name="quarter" valueType="number">
            <SelectSeason />
          </BasicFormItem>
        }

        {formItems}

        <FormItem {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
            <Icon type="plus" /> 添加目标
          </Button>
        </FormItem>

      </Form>
    );
  }

}


export default connect()(OKRForm);
