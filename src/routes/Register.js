import React from 'react'
import { Form, Radio, Button, Select, Input, Row, Col, Checkbox } from 'antd'
import { injectIntl } from 'react-intl'
import { t } from '../utils/util'
import { getOrg } from '../api'
import MainLayout from '../components/MainLayout/MainLayout'
import { connect } from 'dva'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

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

const selectStyle = {
  width: '60px'
}

class Register extends React.Component {

  state = {
    value: 1,
    org: []
  }

  onChange = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values)
      }
    })
  }

  handleOrgChange = value => {
    if (this.state.org.map(i => i.value).includes(value)) {
      return
    }
    getOrg(value).then(data => this.setState({ org: data.data }))
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }

  checkAgreement = (rule, value, callback) => {
    if (!value) {
      callback('Please check agreement!')
    } else {
      callback()
    }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getTags' })
    this.props.dispatch({ type: 'app/getCountries' })
    this.props.dispatch({ type: 'app/getTitles' })
  }

  render() {
    const selectStylse = {
      width: '28px',
      height: '18px',
      marginTop: '4px',
      display: 'block'
    }
        const { getFieldDecorator } = this.props.form;

    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '4',
    })(
      <Select style={selectStyle}>
        {this.props.countries.map(c => <Option key={c.id} value={`${c.id}`}><img src={c.url} style={selectStylse} /></Option>)}
      </Select>
    );

    const options = this.state.org.map(d => <Option key={d.value}>{d.value}</Option>)

    return (
      <MainLayout location={this.props.location}>
      <Form onSubmit={this.handleSubmit}>

        <FormItem {...formItemLayout} label="Role">
          {getFieldDecorator('role', {
            rules: [{ required: true, message: 'Please choose your role!' }],
          })(

            <RadioGroup onChange={this.onChange}>
              <Radio value={1}>{t(this, "menu.investor")}</Radio>
              <Radio value={2}>{t(this, "menu.transaction")}</Radio>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Phone Number">
          {getFieldDecorator('phone', {
            rules: [{ required: true, message: 'Please input your phone number!' }],
          })(
            <Input addonBefore={prefixSelector} />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Captcha">
          <Row gutter={8}>
            <Col span={12}>
              {getFieldDecorator('captcha', {
                rules: [{ required: true, message: 'Please input the captcha you got!' }],
              })(
                <Input size="large" />
              )}
            </Col>
            <Col span={12}>
              <Button size="large">Get captcha</Button>
            </Col>
          </Row>
        </FormItem>

        <FormItem {...formItemLayout} label="E-mail" hasFeedback>
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: 'The input is not valid E-mail!',
            }, {
              required: true, message: 'Please input your E-mail!',
            }],
          })(
            <Input />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Name" extra="Make sure type real name." hasFeedback>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input your name!', whitespace: true }],
          })(
            <Input />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Organization" hasFeedback>
          {getFieldDecorator('organization', {
            rules: [{ required: true, message: 'Please input your organization!' }],
          })(
            <Select mode="combobox" onChange={this.handleOrgChange}>
              {options}
            </Select>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Title" hasFeedback>
          {getFieldDecorator('Title', {
            rules: [{ required: true, message: 'Please choose your title!' }],
          })(
            <Select placeholder="Please select">
              {this.props.titles.map(t => <Option key={t.id} value={t.id + ''}>{t.name}</Option>)}
            </Select>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Tags" hasFeedback>
          {getFieldDecorator('tags', {
            rules: [{ required: true, message: 'Please choose your favorite tags!' }],
          })(
            <Select mode="multiple" placeholder="Please select">
              { this.props.tags.map(t => <Option key={t.id}>{t.name}</Option>) }
            </Select>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Password" hasFeedback>
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: 'Please input your password!',
            }, {
              validator: this.checkConfirm,
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="Confirm Password" hasFeedback>
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: 'Please confirm your password!',
            }, {
              validator: this.checkPassword,
            }],
          })(
            <Input type="password" onBlur={this.handleConfirmBlur} />
          )}
        </FormItem>

        <FormItem {...tailFormItemLayout} style={{ marginBottom: 8 }}>
          {getFieldDecorator('agreement', {
            valuePropName: 'checked',
            rules: [
              { validator: this.checkAgreement },
            ]
          })(
            <Checkbox>I have read the <a href="">agreement</a></Checkbox>
          )}
        </FormItem>

        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" size="large">Register</Button>
        </FormItem>

      </Form>
    </MainLayout>
    );
  }

}
function mapStateToProps(state) {
  const { tags, countries, titles } = state.app
  return { tags, countries, titles }
}

export default connect(mapStateToProps)(Form.create()(injectIntl(Register)))
