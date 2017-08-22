import React from 'react'

import { Form, InputNumber } from 'antd'
import { SelectNumber } from '../components/ExtraInput'
import { BasicFormItem } from '../components/Form'
import { SelectTransactionStatus } from '../components/ExtraInput'

import { i18n } from '../utils/util'


class TimelineForm extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Form>
        <BasicFormItem label={i18n('timeline.transaction_status')} name="status" valueType="number" required>
          <SelectTransactionStatus />
        </BasicFormItem>
        <BasicFormItem label={i18n('timeline.alert_cycle')} name="cycle" valueType="number" required>
          <InputNumber min={1} max={7} />
        </BasicFormItem>
        <BasicFormItem label={i18n('timeline.trader')} name="transaction" valueType="number" required>
          <SelectNumber options={this.props.transactionOptions} />
        </BasicFormItem>
      </Form>
    )
  }
}

export default TimelineForm
