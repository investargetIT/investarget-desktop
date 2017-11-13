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

const FormItem = Form.Item

const titleStyle = {
  textAlign: 'center',
  lineHeight: 4
}


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
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const smstoken = this.state.smstoken
    if (!smstoken) {
      message.error(i18n('account.require_code'))
      return
    }
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
              this.props.router.push('/login')
            }
          })
        }).catch(error => {
          handleError(error)
        })
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
    return (
      <LeftRightLayout location={this.props.location}>
          <h2 style={titleStyle}>{i18n('account.reset_password')}</h2>
          <Form onSubmit={this.handleSubmit}>
            <Mobile required country={this.props.country} />
            <Code
              loading={this.state.loading}
              value={this.state.fetchSmsCodeValue ? i18n('account.send_wait_time', {'second': this.state.fetchSmsCodeValue}) : null}
              onFetchButtonClicked={this.handleFetchButtonClicked} />
            <Password />
            <Submit loading={this.props.loading} />
          </Form>
      </LeftRightLayout>
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

export default connect(mapStateToProps)(withRouter(Form.create()(ResetPassword)))
