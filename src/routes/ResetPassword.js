import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router'
import { Form, Button, Input, Row, Col, message, Modal } from 'antd'
import { i18n, handleError } from '../utils/util'
import * as api from '../api'
import { ApiError } from '../utils/request'
import LoginContainer from '../components/LoginContainer'
import GlobalMobile from '../components/GlobalMobile'
import FormError from '../utils/FormError'
import HandleError from '../components/HandleError'
import { LockOutlined, MailOutlined } from '@ant-design/icons';

const formInputStyle = {
  border: 'none', fontSize: 16, fontWeight: 200, color: '#989898', padding: '12px 16px', paddingRight: 40, height: 'auto',
  background: '#F0F0F0',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 14,
  // padding: '5px 20px',
  color: '#555',
};
const inputStyle = {border:'none',fontSize:16,fontWeight:200,height:50,marginBottom:8, 
  background: '#F0F0F0',
  border: '1px solid #ccc',
  borderRadius: 4,
};
const submitStyle = {width:'100%',height:50,fontSize:20,backgroundColor:'rgba(35,126,205,.8)',border:'none',color:'#fff',fontWeight:200,
  fontSize: 16,
  background: '#13356C',
  borderRadius: 6,
  fontWeight: 'normal',
  // height: 43,
  marginTop: 8,
};

class ResetPassword extends React.Component {

  getChildContext() {
    return {
      form: this.props.form
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      smstoken: null,
      fetchSmsCodeValue: null,
      intervalId: null,
      loading: false,
    }
    this.formRef = React.createRef();
    const { state } = this.props.location;
    if (state) {
      const { mobile, areaCode } = state;
      this.mobile = mobile;
      this.areaCode = areaCode;
    }
  }

  handleSubmit = values => {
    const { smstoken } = this.state
    const { mobileInfo, code, password } = values
    const { areaCode, mobile } = mobileInfo

    let param = {
      mobile: mobile,
      mobilecodetoken: smstoken,
      mobilecode: code,
      password: password,
    }
    api.resetPassword(param).then(result => {
      Modal.info({
        title: i18n('account.password_reset_ok'),
        onOk: () => {
          localStorage.removeItem('login_info')
          this.props.history.push('/login')
        }
      })
    }).catch(error => {
      handleError(error)
    })
  }

  timer = () => {
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

  handleFetchButtonClicked = () => {
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
    api.checkUserExist(mobile)
    .then(data => {
      const isExist = data.data.result
      if (!isExist) {
        throw new ApiError(2002)
      }
      return api.sendSmsCode(body)
    })
    .then(data => {
      if (data.data.status !== 'success') {
        throw new Error(data.data.msg)
      }
      message.success(i18n('account.code_sent'))
      this.setState({ smstoken: data.data.smstoken })
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

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] })
  }

  render() {
    const codeValue = this.state.fetchSmsCodeValue ? i18n('account.send_wait_time', {'second': this.state.fetchSmsCodeValue}) : null

    function checkMobileInfo(rule, value, callback) {
      if (value.areaCode == '') {
        callback(i18n('areacode_not_empty'))
      // } else if (!allowAreaCode.includes(value.areaCode)) {
      //   callback(i18n('areacode_invalid'))
      } else if (value.mobile == '') {
        callback(i18n('mobile_not_empty'))
      } else if (!/^\d+$/.test(value.mobile)) {
        callback(i18n('mobile_incorrect_format'))
      } else {
        callback()
      }
    }

    return (
      <LoginContainer changeLang={function(){this.forceUpdate()}.bind(this)}>
        <Form ref={this.formRef} onFinish={this.handleSubmit} className="it-login-form">
          <div className="login-register-form">
            <h1 className="login-register-form__title">{i18n('account.reset_password')}</h1>
            <p className="login-register-form__subtitle">{i18n('account.reset_info')}</p>

            <Form.Item
              name="mobileInfo"
              rules={[{ required: true }, { type: 'object' }, { validator: checkMobileInfo }]}
              initialValue={{ areaCode: this.areaCode || '86', mobile: this.mobile || '' }}
            >
              <GlobalMobile disabled={this.mobile && this.areaCode ? true : false} onBlur={this.handleMobileBlur} />
            </Form.Item>

            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, marginRight: 8 }}>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: i18n("account.input_the_code") }]}
                >
                  <Input
                    className="login-register-form__input"
                    prefix={<MailOutlined style={{ marginRight: 4, color: '#bfbfbf' }} className="site-form-item-icon" />}
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
              name="password"
              rules={[{required: true, message: i18n("account.input_new_password")}]}
            >
              <Input
                className="login-register-form__input"
                prefix={<LockOutlined style={{ marginRight: 4, color: '#bfbfbf' }} className="site-form-item-icon" />}
                placeholder={i18n("account.input_new_password")}
                type="password"
               />
            </Form.Item>

            <Button className="login-register-form__submit" htmlType="submit" loading={this.props.loading}>{i18n("common.submit")}</Button>

            <div className="login-register-form__hint" style={{padding:8,paddingLeft:16, textAlign: 'center'}}>
              {i18n('account.have_account_already')}<Link to="/login" style={{textDecoration:'underline'}}>{i18n('account.directly_login')}</Link>
            </div>

          </div>
        </Form>

        <HandleError pathname={encodeURIComponent(this.props.location.pathname + this.props.location.search)} />
      </LoginContainer>
    )
  }
}

ResetPassword.childContextTypes = {
  form: PropTypes.object
}

function mapStateToProps(state) {
  const { currentUser } = state
  var { country } = state.app
  country = country.filter(item => item.level == 2)

  return {
    currentUser,
    country,
  }
}

export default connect(mapStateToProps)(withRouter(ResetPassword))
