import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { i18n, exchange } from '../utils/util'
import * as api from '../api'
import styles from './ProjectForm.css'

import { Collapse, Form, Row, Col, Button, Icon, Input, Switch, Radio, Select, Cascader, InputNumber, Checkbox } from 'antd'
const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const InputGroup = Input.Group

import {
  BasicFormItem,
  CurrencyFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'

import {
  SelectTag,
  SelectRole,
  SelectYear,
  SelectTransactionType,
  SelectCurrencyType,
  CascaderCountry,
  CascaderIndustry,
  InputCurrency,
  InputPhoneNumber,
  RadioTrueOrFalse,
} from '../components/ExtraInput'


class YearFinanceForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)
  }

  render() {

    const { currencyType } = this.props

    return (
      <Form>
        <BasicFormItem label="年份" name="fYear" valueType="number" required>
          <SelectYear />
        </BasicFormItem>

        <CurrencyFormItem label="营业收入" name="revenue" required currencyType={currencyType} />

        <CurrencyFormItem label="净利润" name="netIncome" required currencyType={currencyType} />

        <BasicFormItem label="息税折旧摊销前利润" name="EBITDA" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label="毛利润" name="grossProfit" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label="总资产" name="totalAsset" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label="净资产" name="stockholdersEquity" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label="经营性现金流" name="operationalCashFlow" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label="净现金流" name="grossMerchandiseValue" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>
      </Form>
    )
  }
}



export default YearFinanceForm
