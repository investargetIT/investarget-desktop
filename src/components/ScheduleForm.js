import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, DatePicker, InputNumber } from 'antd'
import moment from 'moment';
import {
  BasicFormItem,
} from '../components/Form'
import {
  SelectExistProject,
  SelectExistInvestor,
  SelectArea,
  CascaderCountry,
  SelectOrganizatonArea,
  SelectScheduleType,
  SelectTrader,
} from '../components/ExtraInput'
import { i18n } from '../utils/util'

const FormItem = Form.Item;

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
      getFieldDecorator('type', { initialValue: 3 });
    }
  }

  disabledDate = current => current && current < moment().startOf('day');
  disabledTime = () => ({ disabledMinutes: () => range(1, 30).concat(range(31, 60)) });

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const countryObj = getFieldValue('country');
    const scheduleType = getFieldValue('type');
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form>

        <BasicFormItem label="日程类型" name="type" required valueType="number">
          <SelectScheduleType />
        </BasicFormItem>

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
        <BasicFormItem label={i18n('schedule.address')} name="address">
          <Input />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.project')} name="proj" valueType="number">
          <SelectExistProject />
        </BasicFormItem>
        <BasicFormItem label={i18n('schedule.investor')} name="user" valueType="number">
          <SelectExistInvestor />
        </BasicFormItem>
        { scheduleType === 4 &&
        <div style={{ paddingTop: 30, borderTop: '1px solid #ccc' }}>
          <BasicFormItem label={i18n('schedule.password')} name="password">
            <Input />
          </BasicFormItem>
          <FormItem
            {...formItemLayout}
            label="持续时间"
          >
            {getFieldDecorator('duration', { initialValue: 60 })(
              <InputNumber min={1} max={100} />
            )}
            <span className="ant-form-text">分钟</span>
          </FormItem>
          <BasicFormItem label={i18n('schedule.attendee')} name="attendee" valueType="array">
            <SelectTrader mode="multiple" />
          </BasicFormItem>
        </div>
        }
      </Form>
    )
  }
}

export default ScheduleForm
