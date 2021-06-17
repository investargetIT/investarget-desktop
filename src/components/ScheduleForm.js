import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, DatePicker, InputNumber, Button, Row, Col, Checkbox } from 'antd'
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
  SelectMultiUsers,
  SelectScheduleTypeWithoutMeeting,
} from '../components/ExtraInput'
import { i18n, hasPerm } from '../utils/util';
import {
  PlusOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
}

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
    // const { getFieldDecorator } = this.props.form

    // if ('isAdd' in props) {
    //   getFieldDecorator('scheduledtime', {
    //     rules: [{required: true}], initialValue: props.date,
    //   })
    //   getFieldDecorator('country', { initialValue: props.country });
    //   getFieldDecorator('type', { initialValue: 3 });
    // }
    this.manualAttendeeNum = 0;
    this.scheduleFormRef = React.createRef();
  }

  disabledDate = current => current && current < moment().startOf('day');
  disabledTime = () => ({ disabledMinutes: () => range(1, 30).concat(range(31, 60)) });

  addAttendeeFormItem = () => {
    this.manualAttendeeNum = this.manualAttendeeNum + 1;
    // can use data-binding to get
    const keys = this.scheduleFormRef.current.getFieldValue('keys');
    const keyNums = keys.map(m => parseInt(m, 10));
    const maxKey = keyNums.length > 0 ? Math.max(...keyNums) : 0;
    const nextKeys = keys.concat(`${maxKey + 1}`);
    // can use data-binding to set
    // important! notify form to detect changes
    this.scheduleFormRef.current.setFieldsValue({
      keys: nextKeys,
    });
  }

  removeAttendeeFormItem = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = this.scheduleFormRef.current.getFieldValue('keys');
    // We need at least one passenger
    // if (keys.length === 1) {
    //   return;
    // }

    // can use data-binding to set
    this.scheduleFormRef.current.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  passwordValidator = (rule, value, callback) => {
    if (value && value.length >= 4) {
      callback();
    } else {
      callback('密码长度至少为四位');
    }
  }

  getInitialValueForScheduleType = () => {
    if ('isAdd' in this.props) {
      return 3;
    } 
  }

  getInitialValueForCountry = () => {
    if ('isAdd' in this.props) {
      return this.props.country;
    } 
  }

  getInitialValueForScheduleTime = () => {
    if ('isAdd' in this.props) {
      return this.props.date;
    } 
  }

  getRulesForScheduleTime = () => {
    if ('isAdd' in this.props) {
      return [{ required: true }];
    } 
  }

  render() {
    return (
      <Form ref={this.scheduleFormRef}>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            return (
              <BasicFormItem
                label="日程类型"
                name="type"
                required
                valueType="number"
                initialValue={this.getInitialValueForScheduleType()}
              >
                {hasPerm('usersys.as_trader') ? <SelectScheduleType size="normal" disabled={scheduleType === 4 && !this.props.isAdd} /> : <SelectScheduleTypeWithoutMeeting />}
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <BasicFormItem label={i18n('schedule.title')} name="comments" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem
          label={i18n('schedule.schedule_time')}
          name="scheduledtime"
          valueType="object"
          required
          initialValue={this.getInitialValueForScheduleTime()}
          rules={this.getRulesForScheduleTime()}
        >
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

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType === 4) return null;
            return (
              <BasicFormItem
                label={i18n('user.country')}
                name="country"
                required
                valueType="object"
                getValueFromEvent={(id, detail) => detail}
                initialValue={this.getInitialValueForCountry()}
              >
                <CascaderCountry size="normal" isDetail />
              </BasicFormItem>
            )
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType === 4) return null;
            const countryObj = getFieldValue('country');
            if (!['中国', 'China'].includes(countryObj && countryObj.label)) return null;
            return (
              <BasicFormItem label={i18n('project_bd.area')} name="location" required valueType="number">
                <SelectOrganizatonArea showSearch size="normal" />
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType === 4 && !this.props.isAdd) return null;
            return (
              <BasicFormItem label={i18n('schedule.address')} name="address">
                <Input />
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType === 4 && !this.props.isAdd) return null;
            return (
              <BasicFormItem label={i18n('schedule.project')} name="proj" valueType="number">
                <SelectExistProject size="normal" />
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType === 4) return null;
            return (
              <BasicFormItem label={i18n('schedule.investor')} name="user" valueType="number">
                <SelectExistInvestor size="normal" />
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType !== 4) return null;
            return (
              <div style={{ paddingTop: 30, borderTop: '1px solid #ccc' }}>
                <BasicFormItem label="会议密码" name="password" required validator={this.passwordValidator}>
                  <Input />
                </BasicFormItem>
              </div>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType !== 4) return null;
            return (
              <FormItem
                {...formItemLayout}
                label="持续时间"
                name="duration"
                initialValue={60}
              >
                <div>
                  <InputNumber min={1} />
                  <span className="ant-form-text">分钟</span>
                </div>
              </FormItem>
            );
          }}
        </Form.Item>

        {this.props.isAdd &&
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const scheduleType = getFieldValue('type');
              if (scheduleType !== 4) return null;
              const proj = getFieldValue('proj');
              return (
                <BasicFormItem label="投资人" name="investor-attendee" valueType="array" initialValue={[]}>
                  <SelectMultiUsers type="investor" proj={proj} />
                </BasicFormItem>
              );
            }}
          </Form.Item>
        }

        {this.props.isAdd &&
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const scheduleType = getFieldValue('type');
              if (scheduleType !== 4) return null;
              return (
                <BasicFormItem label="交易师" name="trader-attendee" valueType="array" initialValue={[]}>
                  <SelectMultiUsers type="trader" />
                </BasicFormItem>
              );
            }}
          </Form.Item>
        }

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            let keys = getFieldValue('keys');
            window.echo('keys', keys);
            if (!keys) {
              keys = [];
            }
            return keys.map(k => {
              return (
                <FormItem {...formItemLayoutWithOutLabel} key={k} className="dynamic-attendee-item">
                  <Row gutter={8} style={{ width: '88%' }}>
                    <Col span={7}>
                      <FormItem
                        name={`name-${k}`}
                        rules={[{ message: i18n('validation.not_empty'), required: true }]}
                        initialValue=""
                        required
                      >
                        <Input placeholder="姓名" />
                      </FormItem>
                    </Col>
                    <Col span={15}>
                      <FormItem
                        name={`email-${k}`}
                        rules={[{ message: '请输入正确的邮箱地址', required: true, type: 'email' }]}
                        initialValue=""
                        required
                      >
                        <Input placeholder="邮箱" />
                      </FormItem>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => this.removeAttendeeFormItem(k)}
                      />
                    </Col>
                  </Row>
                </FormItem>
              );
            });
          }}
        </Form.Item>

        {this.props.isAdd &&
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const scheduleType = getFieldValue('type');
              if (scheduleType !== 4) return null;
              return (
                <FormItem {...formItemLayoutWithOutLabel}>
                  <Button type="dashed" onClick={this.addAttendeeFormItem} style={{ width: '60%' }}>
                    <PlusOutlined /> 添加参会人
                  </Button>
                </FormItem>
              );
            }}
          </Form.Item>
        }

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType !== 4) return null;
            return (
              <BasicFormItem label="" name="keys" valueType="array" initialValue={[]}>
                <Input type="hidden" />
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const scheduleType = getFieldValue('type');
            if (scheduleType === 4) return null;
            return (
              <BasicFormItem layout={tailFormItemLayout} name="sendEmail" valueType="boolean" valuePropName="checked">
                <Checkbox>发送提醒邮件</Checkbox>
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const sendEmail = getFieldValue('sendEmail');
            const user = getFieldValue('user')
            if (!sendEmail || user) return null;
            return (
              <BasicFormItem label="姓名" name="username" required>
                <Input />
              </BasicFormItem>
            );
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const sendEmail = getFieldValue('sendEmail');
            if (!sendEmail) return null;
            return (
              <BasicFormItem label="目标邮箱" name="targetEmail" valueType="email" required>
                <Input />
              </BasicFormItem>
            );
          }}
        </Form.Item>

      </Form>
    )
  }
}

export default ScheduleForm
