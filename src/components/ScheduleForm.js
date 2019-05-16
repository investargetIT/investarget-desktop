import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, DatePicker, InputNumber, Button, Icon, Row, Col } from 'antd'
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
  SelectMultiOrgs,
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
      getFieldDecorator('type', { initialValue: 4 });
    }
    this.manualAttendeeNum = 0;
  }

  disabledDate = current => current && current < moment().startOf('day');
  disabledTime = () => ({ disabledMinutes: () => range(1, 30).concat(range(31, 60)) });

  addAttendeeFormItem = () => {
    this.manualAttendeeNum = this.manualAttendeeNum + 1;
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(`items-${this.manualAttendeeNum}`);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  removeAttendeeFormItem = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    // if (keys.length === 1) {
    //   return;
    // }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const countryObj = getFieldValue('country');
    const scheduleType = getFieldValue('type');
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 6 },
      },
    };

    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const attendeeFormItems = keys.map(k => {
      return (
        <FormItem {...formItemLayoutWithOutLabel} key={k}>
          <Row gutter={8} style={{ width: '79%' }}>
            <Col span={7}>
              <FormItem required>
                {
                  getFieldDecorator(`name-${k}`, {
                    rules: [{ message: i18n('validation.not_empty'), required: true }], initialValue: ''
                  })(
                    <Input placeholder="姓名" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={15}>
              <FormItem required>
                {
                  getFieldDecorator(`email-${k}`, {
                    rules: [{ message: i18n('validation.not_empty'), required: true }], initialValue: ''
                  })(
                    <Input placeholder="邮箱" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={2}>
              <Icon
                className="dynamic-delete-button"
                type="minus-circle-o"
                // disabled={keys.length === 1}
                onClick={() => this.removeAttendeeFormItem(k)}
              />
            </Col>
          </Row>
        </FormItem>
      );
    });
   
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
          <BasicFormItem label="参会人" name="attendee" valueType="array">
            <SelectMultiOrgs />
          </BasicFormItem>

          { attendeeFormItems }

          <FormItem {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={this.addAttendeeFormItem} style={{ width: '60%' }}>
              <Icon type="plus" /> 添加参会人 
            </Button>
          </FormItem>
        </div>
        }
      </Form>
    )
  }
}

export default ScheduleForm
