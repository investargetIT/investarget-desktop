import React from 'react'

import { Form, InputNumber } from 'antd'
import { SelectNumber } from '../components/ExtraInput'
import { BasicFormItem } from '../components/Form'
import { SelectTimelineProcess } from '../components/ExtraInput'




class TimelineForm extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Form>
        <BasicFormItem label="当前状态" name="status" valueType="number" required>
          <SelectTimelineProcess />
        </BasicFormItem>
        <BasicFormItem label="提醒周期" name="cycle" valueType="number" required>
          <InputNumber min={1} max={7} />
        </BasicFormItem>
        <BasicFormItem label="交易师" name="transaction" valueType="number" required>
          <SelectNumber options={this.props.transactionOptions} />
        </BasicFormItem>
      </Form>
    )
  }
}

export default TimelineForm
