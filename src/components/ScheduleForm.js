import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, DatePicker } from 'antd'
import moment from 'moment';
import {
  BasicFormItem,
} from '../components/Form'
import {
  SelectExistProject,
  SelectExistInvestor,
  SelectArea,
  CascaderCountry,
  SelectOrganizatonArea
} from '../components/ExtraInput'
import { i18n } from '../utils/util'

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

class ScheduleForm extends React.Component {

  constructor(props) {
    super(props)
    const { getFieldDecorator } = this.props.form

    if ('isAdd' in props) {
      getFieldDecorator('scheduledtime', {
        rules: [{required: true}], initialValue: props.date,
      })
      getFieldDecorator('country', { initialValue: props.country });
    }
  }

  disabledDate = current => current && current < moment().startOf('day');
  disabledTime = () => ({ disabledMinutes: () => range(1, 30).concat(range(31, 60)) });

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const countryObj = getFieldValue('country');
    return (
      <Form>
        <BasicFormItem label={i18n('schedule.title')} name="comments" required>
          <Input />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.schedule_time')} name="scheduledtime" valueType="object" required>
          <DatePicker
            disabledDate={this.disabledDate}
            disabledTime={this.disabledTime}
            showTime={{
              hideDisabledOptions: true,
              format: 'HH:mm',
            }}
            showToday={false}
            format="YYYY-MM-DD HH:mm" 
          />
        </BasicFormItem>

        <BasicFormItem 
          label={i18n('user.country')} 
          name="country" 
          required 
          valueType="object" 
          getValueFromEvent={(id, detail) => detail}
        >
          <CascaderCountry size="large" isDetail />
        </BasicFormItem>

        {['中国', 'China'].includes(countryObj && countryObj.label) ? 
        <BasicFormItem label={i18n('project_bd.area')} name="location" required valueType="number">
          <SelectOrganizatonArea showSearch />
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
