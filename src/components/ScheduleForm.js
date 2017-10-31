import React from 'react'
import PropTypes from 'prop-types'

import { Form, Input, DatePicker } from 'antd'

import {
  BasicFormItem,
} from '../components/Form'

import {
  SelectExistProject,
  SelectExistInvestor,
} from '../components/ExtraInput'


class ScheduleForm extends React.Component {

  constructor(props) {
    super(props)
    const { getFieldDecorator } = this.props.form

    if ('isAdd' in props) {
      getFieldDecorator('scheduledtime', {
        rules: [{required: true}], initialValue: props.date,
      })
    }
  }

  render() {
    return (
      <Form>
        <BasicFormItem label="标题" name="comments" required>
          <Input />
        </BasicFormItem>
        <BasicFormItem label="时间" name="scheduledtime" valueType="object" required>
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </BasicFormItem>
        <BasicFormItem label="地址" name="address" required>
          <Input />
        </BasicFormItem>
        <BasicFormItem label="项目" name="proj" valueType="number" required>
          <SelectExistProject />
        </BasicFormItem>
        <BasicFormItem label="投资人" name="user" valueType="number" required>
          <SelectExistInvestor />
        </BasicFormItem>
      </Form>
    )
  }
}

export default ScheduleForm
