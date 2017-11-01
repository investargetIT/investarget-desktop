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
import { i18n } from '../utils/util'


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
        <BasicFormItem label={i18n('schedule.title')} name="comments" required>
          <Input />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.schedule_time')} name="scheduledtime" valueType="object" required>
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.address')} name="address" required>
          <Input />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.project')} name="proj" valueType="number" required>
          <SelectExistProject />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.investor')} name="user" valueType="number" required>
          <SelectExistInvestor />
        </BasicFormItem>
      </Form>
    )
  }
}

export default ScheduleForm
