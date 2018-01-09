import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, DatePicker } from 'antd'

import {
  BasicFormItem,
} from '../components/Form'
import {
  SelectExistProject,
  SelectExistInvestor,
  SelectArea,
  CascaderCountryDetail,
  SelectOrganizatonArea
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
    const { getFieldDecorator, getFieldValue } = this.props.form
    const countryObj = getFieldValue('country');
    return (
      <Form>
        <BasicFormItem label={i18n('schedule.title')} name="comments" required>
          <Input />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.schedule_time')} name="scheduledtime" valueType="object" required>
          <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" />
        </BasicFormItem>
        <BasicFormItem label={i18n('user.country')} name="country" required valueType="object">
          <CascaderCountryDetail size="large"  />
        </BasicFormItem>
        {['中国', 'China'].includes(countryObj && countryObj.label) ? 
        <BasicFormItem label={i18n('project_bd.area')} name="location" required valueType="number">
          <SelectOrganizatonArea />
        </BasicFormItem>
        : null }
        <BasicFormItem label={i18n('schedule.address')} name="address" required>
          <Input />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.project')} name="proj" valueType="number">
          <SelectExistProject />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.investor')} name="user" valueType="number">
          <SelectExistInvestor />
        </BasicFormItem>
      </Form>
    )
  }
}

export default ScheduleForm
