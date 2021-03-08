import React from 'react'
import { Form, Radio, Button, Select, Input, Row, Col, Checkbox, message, Modal } from 'antd'
import { getOrg, sendSmsCode, checkUserExist } from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import PropTypes from 'prop-types'
import { Submit, Agreement, Role, Mobile, Code, Org, Email, FullName, Password, ConfirmPassword, Position, Tags } from '../components/Form'
import { ApiError } from '../utils/request'
import { i18n, handleError } from '../utils/util'
import { BasicFormItem } from '../components/Form'
import { SelectExistOrganization, SelectTitle, SelectTag } from '../components/ExtraInput'
import LoginContainer from '../components/LoginContainer'
import GlobalMobile from '../components/GlobalMobile'
import FormError from '../utils/FormError'
import HandleError from '../components/HandleError'

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
const radioStyle = {
  fontSize: 16,
  lineHeight: '24px',
  color: '#262626',
};
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

    this.props.form.validateFieldsAndScroll((err, values) => {
      const smstoken = localStorage.getItem('smstoken')
      if(!err) {
        const { mobileInfo, ...otherValues } = values
        const { areaCode: prefix, mobile } = mobileInfo
        this.props.dispatch({
          type: 'currentUser/register',
          payload: { prefix, mobile, ...otherValues, smstoken }
        })
      } else {
        // 按字段顺序处理错误，只处理第一个错误
        let fields = ['type', 'mobileInfo', 'smstoken', 'code', 'email', 'username', 'organization', 'title', 'tags', 'password', 'confirm', 'agreement']
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
      callback('请阅读并接受声明')
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
    const { getFieldValue } = this.formRef;
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

  componentWillUnmount() {
    if (this.state.intervalId !== null) clearInterval(this.state.intervalId);
  }

  render() {
    const foreigner = (localStorage.getItem('APP_PREFERRED_LANG') || 'cn') !== 'cn';
    const { getFieldValue } = this.formRef;


    const containerStyle = {
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
    }
    const wrapperStyle = {
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

    function checkAgreement(rule, value, callback) {
      if (!value) {
        callback(i18n('account.please_check_agreement'))
      } else {
        callback()
      }
    }

    function confirmValidator(rule, value, callback) {
      const password = getFieldValue('password')
      if (value && password && value !== password) {
        callback(i18n('validation.two_passwords_not_inconsistent'))
      } else {
        callback()
      }
    }

    const formStyle = {
      width: 418, padding: 20, background: 'white', zIndex: 1, color: '#666',
      border: '1px solid rgba(0, 0, 0, .2)',
      borderRadius: 6,
      boxShadow: '0 5px 15px rgba(0, 0, 0, .5)',
    };
    const formInputStyle = {
      border: 'none', fontSize: 14, padding: '12px 16px', paddingRight: 40, height: 50,
      background: '#F0F0F0',
      border: '1px solid #ccc',
      borderRadius: 4,
      fontSize: 14,
      color: '#555'
    };
    const selectWrapStyle = {
      display: 'flex', alignItems: 'center', backgroundColor: '#fff', marginBottom: 8, borderRadius: 4, height: 50,
      border: 'none', fontSize: 16, height: 50, marginBottom: 8,
      background: '#F0F0F0',
      border: '1px solid #ccc',
      borderRadius: 4,
    };
    const selectLabelStyle = {flexShrink: 0,fontSize: 16,width: 110, textAlign:"center" ,height: 50,lineHeight: '50px',borderRight: '1px solid #cfcfcf',color:'#656565'}
    const selectContentStyle = {height:50,lineHeight:'50px',color:'#636e7b',fontSize:14,border:'none',backgroundColor: 'inherit'}
    const selectContentContainerStyle = {flexGrow:1,height:50}

    const wrapStyle = {
      display: 'flex',
      alignItems: 'center',
    };
    const labelStyle = {
      width: 48,
      flexShrink: 0,
      fontSize: 16,
      color: '#656565',
    };
    const inputStyle = {border:'none',fontSize:14,color:'#636e7b',padding:'12px 16px',height:'100%',paddingLeft:0,backgroundColor: '#F0F0F0'}

    const submitStyle = {
      width: '100%', height: 50, fontSize: 20, backgroundColor: 'rgba(35,126,205,.8)', border: 'none', color: '#fff', fontWeight: 200,
      fontSize: 16,
      background: '#13356C',
      borderRadius: 6,
      fontWeight: 'normal',
    };


    const codeValue = this.state.fetchSmsCodeValue ? i18n('account.send_wait_time', {'second': this.state.fetchSmsCodeValue}) : null

    return (
      <LoginContainer bodyWrapStyle={{ height: 1000 }} changeLang={function () { this.forceUpdate() }.bind(this)}>
        <Form ref={this.formRef} onSubmit={this.handleSubmit} className="login-register-form it-login-form">

          <h1 className="login-register-form__title">{i18n('account.directly_register')}</h1>
          <p className="login-register-form__subtitle">{i18n('account.register_hint_info')}</p>

          <div className="login-register-form__container">
            <label className="login-register-form__container__label">{i18n("account.name")}：</label>
            <Form.Item
              name="username"
              rules={[{ required: true, message: i18n("account.please_input") + i18n("account.name") }]}
            >
              <Input className="login-register-form__input" placeholder={i18n('account.please_type_name')}/>
            </Form.Item>
          </div>

          <div className="login-register-form__container">
            <label className="login-register-form__container__label">{i18n('account.role')}：</label>
            <Form.Item
              name="type"
              rules={[{ required: true, message: i18n('account.select_role') }]}
            >
              <RadioGroup>
                <Radio style={radioStyle} value={foreigner ? 14 : 'investor'}>{i18n('account.investor')}</Radio>
                {!foreigner && <Radio style={radioStyle} value={'trader'}>{i18n('account.trader')}</Radio>}
              </RadioGroup>
            </Form.Item>
          </div>

          {/* <div style={selectWrapStyle}>
            <label style={{ ...selectLabelStyle, width: foreigner ? 110 : 80 }} className="mb0">{foreigner ? "Organization" : "机 构"}</label>
            <Form.Item
              name="organization"
              rules={[{ required: true, message: i18n("account.please_select") + i18n("account.org") }]}
            >
              <SelectExistOrganization allowCreate style={selectContentStyle} containerStyle={selectContentContainerStyle} />
            </Form.Item>
          </div> */}

          <div className="login-register-form__container">
            <label className="login-register-form__container__label">{foreigner ? "Position" : "职位"}：</label>
            <Form.Item
              name="title"
              rules={[{ required: true, message: i18n("account.please_select") + i18n("account.position") }]}
            >
              <SelectTitle className="login-register-form__select" showSearch placeholder={i18n('account.please_select_title')}/>
            </Form.Item>
          </div>

          <div className="login-register-form__container">
            <label className="login-register-form__container__label">{foreigner ? "Tags" : "标签"}：</label>
            <Form.Item
              name="tags"
              rules={[{ required: true, message: i18n("account.please_select") + i18n("account.tag") }, { type: 'array' }]}
            >
              <SelectTag className="login-register-form__select" placeholder={i18n('account.please_choose_tags')} mode="multiple" showArrow />
            </Form.Item>
          </div>

          <Button htmlType="submit" style={submitStyle} loading={this.props.loading}>{i18n('common.submit')}</Button>

          <div style={{ padding: '8px 16px', textAlign: 'center' }}>
            {i18n('account.have_account_already')}<Link to="/login" style={{ textDecoration: 'underline' }}>{i18n('account.directly_login')}</Link>
          </div>

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
