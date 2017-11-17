import React from 'react'
import { Form, Radio, Button, Select, Input, Row, Col, Checkbox, message, Modal } from 'antd'
import { getOrg, sendSmsCode, checkUserExist } from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import RecommendFriendsComponent from '../components/RecommendFriends'
import RecommendProjectsComponent from '../components/RecommendProjects'
import PropTypes from 'prop-types'
import { Submit, Agreement, Role, Mobile, Code, Org, Email, FullName, Password, ConfirmPassword, Position, Tags } from '../components/Form'
import { ApiError } from '../utils/request'
import { i18n } from '../utils/util'
import { BasicFormItem } from '../components/Form'
import { SelectExistOrganization } from '../components/ExtraInput'

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

class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 1,
      org: [],
      fetchSmsCodeValue: null,
      intervalId: null,
      loading: false,
    }
    this.onFriendToggle = this.onFriendToggle.bind(this)
    this.onFriendsSkip = this.onFriendsSkip.bind(this)
    this.onFriendsSubmit = this.onFriendsSubmit.bind(this)
    this.onProjectToggle = this.onProjectToggle.bind(this)
    this.onProjectsSkip = this.onProjectsSkip.bind(this)
    this.onProjectsSubmit = this.onProjectsSubmit.bind(this)
    this.timer = this.timer.bind(this)

    const { state } = this.props.location;
    if (state) {
      const { mobile, areaCode } = state;
      this.mobile = mobile;
      this.areaCode = areaCode;
    }
  }

  getChildContext() {
    return {
      form: this.props.form
    }
  }

  onChange = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  }

  handleSubmit = e => {
    e.preventDefault()
    const smstoken = localStorage.getItem('smstoken')
    if (!smstoken) {
      message.error(i18n('account.require_code'))
      return
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { mobileInfo, ...otherValues } = values
        const { areaCode: prefix, mobile } = mobileInfo
        this.props.dispatch({
          type: 'currentUser/register',
          payload: { prefix, mobile, ...otherValues, smstoken }
        })
      }
    })
  }

  handleOrgChange = value => {

    if (value === '') {
      this.setState({ org: [] })
      return
    } else if (value.length < 2) {
      this.setState({ org: [] })
      return
    } else if (this.state.org.map(i => i.name).includes(value)) {
      return
    }

    getOrg({search: value}).then(data => {
      const org = data.data.data.map(item => {
        return { id: item.id, name: item.orgname }
      })
      this.setState({ org: org })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
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

  timer() {
    if (this.state.fetchSmsCodeValue > 0) {
    this.setState({ fetchSmsCodeValue: this.state.fetchSmsCodeValue - 1 })
    } else {
      clearInterval(this.state.intervalId)
      this.setState({
        fetchSmsCodeValue: null,
        loading: false,
        intervalId: null
      })
    }
  }

  handleFetchButtonClicked() {
    const { getFieldValue } = this.props.form
    const mobileInfo = getFieldValue('mobileInfo')
    const { areaCode: areacode, mobile } = mobileInfo
    if (!areacode) {
      message.error(i18n('account.require_areacode'))
      return
    }
    if (!mobile) {
      message.error(i18n('account.require_mobile'))
      return
    }
    this.setState({ loading: true })
    const body = {
      mobile: mobile,
      areacode: areacode
    }
    checkUserExist(mobile)
    .then(data => {
      const isExist = data.data.result
      if (isExist) {
        throw new ApiError(20041)
      }
      return sendSmsCode(body)
    })
    .then(data => {
      if (data.data.status !== 'success') {
        throw new Error(data.data.msg)
      }
      message.success(i18n('account.code_sent'))
      localStorage.setItem('smstoken', data.data.smstoken)
      const intervalId = setInterval(this.timer, 1000)
      this.setState({
        loading: false,
        intervalId: intervalId,
        fetchSmsCodeValue: 60
      })
    }).catch(error => {
      this.setState({ loading: false })
    })
  }

  handleMobileBlur = (evt) => {
    if (!evt.target.value) return
    checkUserExist(evt.target.value)
    .then(data => {
      const isExist = data.data.result
      if (isExist) {
        Modal.confirm({
          closable: false,
          maskClosable: false,
          title: i18n('message.mobile_exist'),
          cancelText: i18n('retrieve_password'),
          okText: i18n('to_login'),
          onCancel: () => {
            this.props.router.push('/password')
          },
          onOk: () => {
            this.props.router.push('/login')
          }
        })
      }
    })
    .catch(error => {
      this.props.dispatch({ type: 'app/findError', payload: error })
    })
  }

  handleEmailOnBlur = evt => {
    if (!evt.target.value) return
    checkUserExist(evt.target.value)
    .then(data => {
      const isExist = data.data.result
      if (isExist) throw new ApiError(20042)
    })
    .catch(error => {
      this.props.dispatch({ type: 'app/findError', payload: error })
    })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['tag', 'country', 'title'] })
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

    const { getFieldDecorator } = this.props.form;

    return (
      <div style={containerStyle}>
        <div style={wrapperStyle} className="clearfix">
          <div style={this.props.currentUser ? Object.assign({},itemStyle,{opacity: 0}) : itemStyle}>
            <LeftRightLayout location={this.props.location}>

              <Form onSubmit={this.handleSubmit}>
                <Role />
                <Mobile 
                disabled={this.mobile&&this.areaCode?true:false}
                country={this.props.country} 
                onBlur={this.handleMobileBlur} 
                required
                mobile={this.mobile}
                areaCode={this.areaCode} 
                />
                <Code
                  loading={this.state.loading}
                  value={this.state.fetchSmsCodeValue ? i18n('account.send_wait_time', {'second': this.state.fetchSmsCodeValue}) : null}
                  onFetchButtonClicked={this.handleFetchButtonClicked.bind(this)} />
                <Email onBlur={this.handleEmailOnBlur} />
                <FullName />

                <BasicFormItem label={i18n("user.institution")} name="organization" required>
                  <SelectExistOrganization size="large" allowCreate />
                </BasicFormItem>

                <Position title={this.props.title} />
                <Tags required tag={this.props.tag} />
                <Password />
                <ConfirmPassword />
                <Agreement />
                <Submit loading={this.props.loading} />
              </Form>

          </LeftRightLayout>
          </div>
          <div style={itemStyle}>
            {/* <RecommendFriendsComponent
              key={1}
              friends={this.props.friends}
              selectedFriends={this.props.selectedFriends}
              onFriendToggle={this.onFriendToggle}
              onFriendsSkip={this.onFriendsSkip}
              onFriendsSubmit={this.onFriendsSubmit}
            /> */}
          </div>
          <div style={itemStyle}>
            {/* <RecommendProjectsComponent
              projects={this.props.projects}
              selectedProjects={this.props.selectedProjects}
              onProjectToggle={this.onProjectToggle}
              onProjectsSkip={this.onProjectsSkip}
              onProjectsSubmit={this.onProjectsSubmit}
            /> */}
          </div>
        </div>
    </div>
    );
  }

}
function mapStateToProps(state) {
  const { currentUser } = state
  var { tag, country, title, registerStep } = state.app
  country = country.filter(item => item.level == 2)
  const { friends, selectedFriends } = state.recommendFriends
  const { projects, selectedProjects } = state.recommendProjects
  return {
    currentUser,
    tag, country, title,
    registerStep,
    loading: (state.loading.effects['currentUser/register'] || state.loading.effects['currentUser/login']),
    friends, selectedFriends,
    projects, selectedProjects
  }
}
Register.childContextTypes = {
  form: PropTypes.object
}

export default connect(mapStateToProps)(withRouter(Form.create()(Register)))
