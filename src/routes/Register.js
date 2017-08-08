import React from 'react'
import { Form, Radio, Button, Select, Input, Row, Col, Checkbox, message } from 'antd'
import { injectIntl } from 'react-intl'
import { t } from '../utils/util'
import { getOrg, sendSmsCode, checkUserExist } from '../api'
import MainLayout from '../components/MainLayout'
import { connect } from 'dva'
import RecommendFriendsComponent from '../components/RecommendFriends'
import RecommendProjectsComponent from '../components/RecommendProjects'
import PropTypes from 'prop-types'
import { Submit, Agreement, Role, Mobile, Code, Org, Email, FullName, Password, ConfirmPassword, Position, Tags } from '../components/Form'
import { ApiError } from '../utils/request'

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
      areaCode: '86',
      countryID: '',
    }
    this.onFriendToggle = this.onFriendToggle.bind(this)
    this.onFriendsSkip = this.onFriendsSkip.bind(this)
    this.onFriendsSubmit = this.onFriendsSubmit.bind(this)
    this.onProjectToggle = this.onProjectToggle.bind(this)
    this.onProjectsSkip = this.onProjectsSkip.bind(this)
    this.onProjectsSubmit = this.onProjectsSubmit.bind(this)
    this.timer = this.timer.bind(this)
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
      message.error('请先获取短信验证码')
      return
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const prefix = this.state.areaCode
        const mobile = this.mobile
        this.props.dispatch({
          type: 'currentUser/register',
          payload: { ...values, smstoken, prefix, mobile }
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

  componentDidMount() {
    this.props.dispatch({ type: 'app/getCountries' })
    this.props.dispatch({ type: 'app/getTitles' })
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

  findAreaCodeByCountryID(countryID) {
    const country = this.props.country.filter(f => f.id === parseInt(countryID, 10))
    return country.length > 0 ? country[0].areaCode : null
  }

  findCountryIDByAreaCode(areaCode) {
    const country = this.props.country.filter(f => f.areaCode === areaCode)
    return country.length > 0 ? country[0].id : 'unknow'
  }

  handleFetchButtonClicked() {
    const areacode = this.state.areaCode
    if (!areacode) {
      message.error('请选择地区或直接填写地区代码')
      return
    }
    const mobile = this.mobile
    if (!mobile) {
      message.error('手机号码不能为空')
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
      message.success('验证码已发送至您的手机，请注意查收')
      localStorage.setItem('smstoken', data.data.smstoken)
      const intervalId = setInterval(this.timer, 1000)
      this.setState({
        loading: false,
        intervalId: intervalId,
        fetchSmsCodeValue: 60
      })
    }).catch(error => {
      this.setState({ loading: false })
      this.props.dispatch({ type: 'app/findError', payload: error })
    })
  }

  handleCountryChange(countryID) {
    const areaCode = this.findAreaCodeByCountryID(countryID)
    this.setState({
      areaCode: areaCode,
      countryID: countryID
    })
  }

  handleAreaCodeChange(evt) {
    const areaCode = evt.target.value
    const countryID = this.findCountryIDByAreaCode(areaCode)
    this.setState({
      areaCode: areaCode,
      countryID: countryID
    })
  }

  handleMobileChange(evt) {
    this.mobile = evt.target.value
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.country.length > 0) {
      const country = nextProps.country.filter(f => f.areaCode === this.state.areaCode)
      const countryID = country.length > 0 ? country[0].id : 'unknow'
      if (countryID) {
        this.setState({ countryID })
      }
    }
  }

  componentDidMount() {
    const countryID = this.findCountryIDByAreaCode(this.state.areaCode)
    if (countryID) {
      this.setState({ countryID })
    }
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
            <MainLayout location={this.props.location}>

              <Form onSubmit={this.handleSubmit}>
                <Role />
                <Mobile
                  required
                  onSelectChange={this.handleCountryChange.bind(this)}
                  country={this.props.country}
                  onAreaCodeChange={this.handleAreaCodeChange.bind(this)}
                  areaCode={this.state.areaCode}
                  countryID={this.state.countryID}
                  onMobileChange={this.handleMobileChange.bind(this)} />
                <Code
                  loading={this.state.loading}
                  value={this.state.fetchSmsCodeValue ? `${this.state.fetchSmsCodeValue}秒后重新获取` : null}
                  onFetchButtonClicked={this.handleFetchButtonClicked.bind(this)} />
                <Email onBlur={this.handleEmailOnBlur} />
                <FullName />
                <Org required org={this.state.org} onChange={this.handleOrgChange} />
                <Position title={this.props.title} />
                <Tags required tag={this.props.tag} />
                <Password />
                <ConfirmPassword />
                <Agreement />
                <Submit loading={this.props.loading} />
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

export default connect(mapStateToProps)(Form.create()(injectIntl(Register)))
