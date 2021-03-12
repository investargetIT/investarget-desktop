import React from 'react'
import { Form, Radio, Button, Select, Input, Row, Col, Checkbox, message, Modal } from 'antd'
import { getOrg, sendSmsCode, checkUserExist } from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import PropTypes from 'prop-types'
import { Submit, Agreement, Role, Mobile, Code, Org, Email, FullName, Password, ConfirmPassword, Position, Tags } from '../components/Form'
import { ApiError } from '../utils/request'
import { i18n, handleError, checkRealMobile } from '../utils/util'
import { BasicFormItem } from '../components/Form'
import { SelectExistOrganization, SelectTitle, SelectTag } from '../components/ExtraInput'
import LoginContainer from '../components/LoginContainer'
import GlobalMobile from '../components/GlobalMobile'
import FormError from '../utils/FormError'
import HandleError from '../components/HandleError'

class Register extends React.Component {

  formRef = React.createRef();

  constructor(props) {
    super(props)
    this.state = {
      value: 1,
      org: [],
      fetchSmsCodeValue: null,
      intervalId: null,
      loading: false,
    }
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

  handleSubmit = values => {
    const smstoken = localStorage.getItem('smstoken');
    const { mobileInfo, ...otherValues } = values;
    const { areaCode: prefix, mobile } = mobileInfo;
    this.props.dispatch({
      type: 'currentUser/register1',
      payload: { prefix, mobile, ...otherValues, smstoken },
    });
    this.props.history.push('/register');
  }

  checkAgreement = (rule, value, callback) => {
    if (!value) {
      callback('请阅读并接受声明')
    } else {
      callback()
    }
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
    const { getFieldValue } = this.formRef.current;
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
      this.props.dispatch({ type: 'app/findError', payload: error });
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
            this.props.history.push('/password')
          },
          onOk: () => {
            this.props.history.push('/login')
          }
        })
      }
    })
    .catch(error => {
      this.props.dispatch({ type: 'app/findError', payload: error })
    })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['tag', 'country', 'title'] })
  }

  componentWillUnmount() {
    if (this.state.intervalId !== null) clearInterval(this.state.intervalId);
  }

  confirmValidator = (rule, value, callback) => {
    const { getFieldValue } = this.formRef.current;
    const password = getFieldValue('password')
    if (value && password && value !== password) {
      callback(i18n('validation.two_passwords_not_inconsistent'))
    } else {
      callback()
    }
  }

  render() {
    function checkMobileInfo(rule, value, callback) {
      if (value.areaCode == '') {
        callback(i18n('areacode_not_empty'))
      // } else if (!allowAreaCode.includes(value.areaCode)) {
      //   callback(i18n('areacode_invalid'))
      } else if (value.mobile == '') {
        callback(i18n('mobile_not_empty'))
      } else if (!checkRealMobile(value.mobile)) {
        callback(i18n('mobile_incorrect_format'))
      } else {
        callback()
      }
    }

    function checkAgreement(rule, value, callback) {
      if (!value) {
        callback(i18n('account.please_check_agreement'))
      } else {
        callback()
      }
    }

    const codeValue = this.state.fetchSmsCodeValue ? i18n('account.send_wait_time', {'second': this.state.fetchSmsCodeValue}) : null

    return (
      <LoginContainer changeLang={function () { this.forceUpdate() }.bind(this)}>
        <Form ref={this.formRef} onFinish={this.handleSubmit} className="it-login-form login-register-form">
          <h1 className="login-register-form__title">{i18n('account.directly_register')}</h1>
          <p className="login-register-form__subtitle">{i18n('account.register_hint')}</p>

          <Form.Item
            name="mobileInfo"
            rules={[{ required: true }, { type: 'object' }, { validator: checkMobileInfo }]}
            initialValue={{ areaCode: this.areaCode || '86', mobile: this.mobile || '' }}
          >
            <GlobalMobile
              placeholder={i18n('mobile_number')}
              disabled={this.mobile && this.areaCode ? true : false}
              onBlur={this.handleMobileBlur}
            />
          </Form.Item>

          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, marginRight: 8 }}>
              <Form.Item
                name="code"
                rules={[{ required: true, message: i18n("account.input_the_code") }]}
              >
                <Input
                  className="login-register-form__input"
                  placeholder={i18n("account.input_the_code")}
                />
              </Form.Item>
            </div>
            <div>
              <Button
                className="login-register-form__sms"
                loading={this.state.loading}
                disabled={codeValue ? true : false}
                onClick={this.handleFetchButtonClicked.bind(this)}
              >
                {
                  this.state.loading ?
                    i18n("account.is_fetching_code")
                    :
                    (codeValue || i18n('account.fetch_code'))
                }
              </Button>
            </div>
          </div>

          <Form.Item
            name="email"
            rules={[{ required: true, message: i18n("account.please_input") + i18n("account.email") }, { type: 'email', message: i18n('account.invalid_email') }]}
          >
            <Input className="login-register-form__input" placeholder={i18n('account.email')} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: i18n("account.please_input") + i18n("account.password") }]}
          >
            <Input className="login-register-form__input" type="password" placeholder={i18n('account.password_placeholder')} />
          </Form.Item>

          <Form.Item
            name="confirm"
            rules={[{ required: true, message: i18n("account.please_input") + i18n("account.password") }, { validator: this.confirmValidator }]}
          >
            <Input className="login-register-form__input" type="password" placeholder={i18n('account.confirm_password')}/>
          </Form.Item>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[{ required: true, message: i18n('account.confirm_agreement') }, { type: 'boolean' }, { validator: checkAgreement }]}
            >
              <Checkbox className="it" style={{ color: '#666' }}>{i18n('account.agreement1')}<Link to="/app/agreement" target="_blank" style={{ marginBottom: 24, color: '#339bd2' }}>{i18n('account.agreement2')}</Link></Checkbox>
            </Form.Item>
          </div>

          <Button htmlType="submit" className="login-register-form__submit" loading={this.props.loading}>{i18n('common.next')}</Button>

          <div className="login-register-form__hint">{i18n('account.have_account_already')}<Link to="/login" style={{ color: '#339bd2' }}>{i18n('account.directly_login')}</Link></div>

        </Form>

        <HandleError pathname={encodeURIComponent(this.props.location.pathname + this.props.location.search)} />

      </LoginContainer>
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

export default connect(mapStateToProps)(withRouter(Register));
