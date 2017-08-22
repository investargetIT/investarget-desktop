import React from 'react'
import PropTypes from 'prop-types'
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

    const { currencyType, mode, disabledYears } = this.props

    return (
      <Form>
        <BasicFormItem label={i18n('project.year')} name="fYear" valueType="number" required>
          <SelectYear disabled={ mode == 'edit' } disabledYears={ mode == 'add' ? disabledYears : [] } />
        </BasicFormItem>

        <CurrencyFormItem label={i18n('project.revenue')} name="revenue" required currencyType={currencyType} />

        <CurrencyFormItem label={i18n('project.profits')} name="netIncome" required currencyType={currencyType} />

        <BasicFormItem label={i18n('project.EBITDA')} name="EBITDA" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.gross_profits')} name="grossProfit" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.total_assets')} name="totalAsset" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.net_assets')} name="stockholdersEquity" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.operating_cash_flow')} name="operationalCashFlow" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.net_cash_flow')} name="grossMerchandiseValue" valueType="number" initialValue={0}>
          <InputNumber />
        </BasicFormItem>
      </Form>
    )
  }
}



export default YearFinanceForm
