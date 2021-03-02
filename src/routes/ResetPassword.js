import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import fetch from 'dva/fetch'
import { routerRedux, Link, withRouter } from 'dva/router'
import { Form, Radio, Button, Select, Input, Row, Col, Checkbox, message, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { Mobile, Code, Password, Submit } from '../components/Form'
import { i18n, handleError } from '../utils/util'
import * as api from '../api'
import { ApiError } from '../utils/request'
import LoginContainer from '../components/LoginContainer'
import GlobalMobile from '../components/GlobalMobile'
import FormError from '../utils/FormError'
import HandleError from '../components/HandleError'

const FormItem = Form.Item

const titleStyle = {
  textAlign: 'center',
  lineHeight: 4
}
const formStyle = {width:418,padding:20,background:'white',zIndex:1,color:'#666', 
  border: '1px solid rgba(0, 0, 0, .2)',
  borderRadius: 6,
  boxShadow: '0 5px 15px rgba(0, 0, 0, .5)',
};
const formTitleStyle = {fontSize:30,fontWeight:400,textAlign:'center',color:'#666'}
const formSubtitleStyle = {fontSize:14,color: '#666',padding:'12px 16px', marginBottom: 30, textAlign: 'center'}
const formInputStyle = {
  border: 'none', fontSize: 16, fontWeight: 200, color: '#989898', padding: '12px 16px', paddingRight: 40, height: 'auto',
  background: '#F0F0F0',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 14,
  // padding: '5px 20px',
  color: '#555',
};
const codeButtonStyle = {width:'100%',height:'50px',border:'none',backgroundColor:'#fff',textAlign:'left',fontSize:16,color:'#656565'}
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

    const { state } = this.props.location;
    if (state) {
      const { mobile, areaCode } = state;
      this.mobile = mobile;
      this.areaCode = areaCode;
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const smstoken = this.state.smstoken

    this.props.form.validateFields((err, values) => {
      if(!err) {
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
              this.props.router.push('/login')
            }
          })
        }).catch(error => {
          handleError(error)
        })
      } else {
        // 按字段顺序处理错误，只处理第一个错误
        let fields = ['mobileInfo', 'smstoken', 'code', 'password']
        for (let i = 0, len = fields.length; i < len; i++) {
          let field = fields[i]
          if (field == 'smstoken') {
            let smstoken = localStorage.getItem('smstoken')
            if (!smstoken) {
              Modal.error({ title: i18n('account.require_code') })
              return
            }
          }
          let errField = err[field]
          if (errField) {
            let error = errField.errors[0]
            handleError(new FormError(error.message))
            return
          }
        }
      }
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
        <Form onSubmit={this.handleSubmit} className="it-login-form">
          <div style={formStyle}>
            <h1 style={formTitleStyle}>{i18n('account.reset_password')}</h1>
            <p style={formSubtitleStyle}>{i18n('account.reset_info')}</p>

            <div style={inputStyle}>
              {/* {getFieldDecorator('mobileInfo', {
                rules: [{ required: true }, { type: 'object' }, { validator: checkMobileInfo }],
                initialValue: { areaCode: this.areaCode || '86', mobile: this.mobile || '' },
              })(
                <GlobalMobile inputStyle={{ background: '#F0F0F0' }} disabled={this.mobile&&this.areaCode?true:false} onBlur={this.handleMobileBlur} />
              )} */}
              <Form.Item
                name="mobileInfo"
                rules={[{ required: true }, { type: 'object' }, { validator: checkMobileInfo }]}
                initialValue={{ areaCode: this.areaCode || '86', mobile: this.mobile || '' }}
              >
                <GlobalMobile inputStyle={{ background: '#F0F0F0' }} disabled={this.mobile&&this.areaCode?true:false} onBlur={this.handleMobileBlur} />
              </Form.Item>
            </div>

            <div style={{marginBottom: 8}}>
              <Row gutter={8}>
                <Col span={12}>
                  {/* {getFieldDecorator("code", {
                    rules: [{
                      required: true, message: i18n("account.input_the_code"),
                    }],
                  })(<Input style={formInputStyle} placeholder={i18n("account.input_the_code")} />)} */}
                  <Form.Item
                    name="code"
                    rules={[{required: true, message: i18n("account.input_the_code")}]}
                  >
                    <Input style={formInputStyle} placeholder={i18n("account.input_the_code")} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Button
                    loading={this.state.loading}
                    disabled={codeValue ? true : false}
                    onClick={this.handleFetchButtonClicked.bind(this)}
                    size="large"
                    style={codeButtonStyle}
                  >
                    {this.state.loading
                      ? i18n("account.is_fetching_code")
                      : (codeValue ? <span style={{color:'#237ccc'}}>{codeValue}</span>
                                   : (<span>
                                        <span style={{textDecoration:'underline'}}>{i18n("account.fetch_code")}</span>
                                        &nbsp;<span style={{color:'#237ccc'}}>(60s)</span>
                                    </span>)
                      )
                    }
                  </Button>
                </Col>
              </Row>
            </div>

            {/* {getFieldDecorator('password', { rules: [{required: true, message: i18n("account.input_new_password")}] })(
              <Input style={formInputStyle} placeholder={i18n("account.input_new_password")} type="password" />
            )} */}
            <Form.Item
              name="password"
              rules={[{required: true, message: i18n("account.input_new_password")}]}
            >
              <Input style={formInputStyle} placeholder={i18n("account.input_new_password")} type="password" />
            </Form.Item>

            <Button htmlType="submit" style={submitStyle} loading={this.props.loading}>{i18n("common.submit")}</Button>

            <div style={{padding:8,paddingLeft:16, textAlign: 'center'}}>
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
