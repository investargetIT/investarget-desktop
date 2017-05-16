import React from 'react'
import { Form, Radio, Button, Select, Input, Row, Col, Checkbox } from 'antd'
import { injectIntl } from 'react-intl'
import { t } from '../utils/util'
import { getOrg } from '../api'
import MainLayout from '../components/MainLayout'
import { connect } from 'dva'
import RecommendFriendsComponent from '../components/RecommendFriends'
import RecommendProjectsComponent from '../components/RecommendProjects'


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
  constructor(props) {
    super(props)
    this.state = {
      value: 1,
      org: [],
    }
    this.onFriendToggle = this.onFriendToggle.bind(this)
    this.onFriendsSkip = this.onFriendsSkip.bind(this)
    this.onFriendsSubmit = this.onFriendsSubmit.bind(this)
    this.onProjectToggle = this.onProjectToggle.bind(this)
    this.onProjectsSkip = this.onProjectsSkip.bind(this)
    this.onProjectsSubmit = this.onProjectsSubmit.bind(this)
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
        this.props.dispatch({
          type: 'currentUser/register',
          payload: values
        })
      }
    })
  }

  handleOrgChange = value => {
    if (value.length < 2 || this.state.org.map(i => i.name).includes(value)) {
      return
    }

    getOrg(value).then(data => {
      this.setState({ org: data.data.data })
    })
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

  // recommend_friends
  onFriendToggle(friend) {
    this.props.dispatch({
      type: 'recommendFriends/toggleFriend',
      payload: friend
    })
  }

  onFriendsSkip() {
    this.props.dispatch({
      type: 'recommendFriends/skipFriends',
    })
  }

  onFriendsSubmit() {
    this.props.dispatch({
      type: 'recommendFriends/addFriends'
    })
  }

  // recommend_projects

  onProjectToggle(project) {
    this.props.dispatch({
      type: 'recommendProjects/toggleProject',
      payload: project
    })
  }

  onProjectsSkip() {
    this.props.dispatch({
      type: 'recommendProjects/skipProjects',
    })
  }

  onProjectsSubmit() {
    this.props.dispatch({
      type: 'recommendProjects/addProjects'
    })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getCountries' })
    this.props.dispatch({ type: 'app/getTitles' })
  }

  render() {
    const containerStyle = {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }
    const wrapperStyle = {
      position: 'absolute',
      zIndex: 1,
      width: '300%',
      height: '100%',
      left: (- (this.props.registerStep - 1) * 100) + '%',
      top: 0,
      transition: 'left 500ms ease',
      WebkitTransition: 'left 500ms ease',
    }
    const itemStyle = {
      float: 'left',
      width: '33.33%',
      height: '100%',
      overflow: 'auto',
    }

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

    const options = this.state.org.map(d => <Option key={d.name}>{d.name}</Option>)

    return (
      <div style={containerStyle}>
        <div style={wrapperStyle} className="clearfix">
          <div style={this.props.currentUser ? Object.assign({},itemStyle,{opacity: 0}) : itemStyle}>
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
                {getFieldDecorator('mobile', {
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
                <Button type="primary" htmlType="submit" size="large" loading={this.props.loading}>Register</Button>
              </FormItem>

            </Form>
          </MainLayout>
          </div>
          <div style={itemStyle}>
            <RecommendFriendsComponent
              key={1}
              friends={this.props.friends}
              selectedFriends={this.props.selectedFriends}
              onFriendToggle={this.onFriendToggle}
              onFriendsSkip={this.onFriendsSkip}
              onFriendsSubmit={this.onFriendsSubmit}
            />
          </div>
          <div style={itemStyle}>
            <RecommendProjectsComponent
              projects={this.props.projects}
              selectedProjects={this.props.selectedProjects}
              onProjectToggle={this.onProjectToggle}
              onProjectsSkip={this.onProjectsSkip}
              onProjectsSubmit={this.onProjectsSubmit}
            />
          </div>
        </div>
    </div>
    );
  }

}
function mapStateToProps(state) {
  const { currentUser } = state
  const { tags, countries, titles, registerStep } = state.app
  const { friends, selectedFriends } = state.recommendFriends
  const { projects, selectedProjects } = state.recommendProjects
  return {
    currentUser,
    tags, countries, titles,
    registerStep,
    loading: (state.loading.effects['currentUser/register'] || state.loading.effects['currentUser/login']),
    friends, selectedFriends,
    projects, selectedProjects
  }
}

export default connect(mapStateToProps)(Form.create()(injectIntl(Register)))
