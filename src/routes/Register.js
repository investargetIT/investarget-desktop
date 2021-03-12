import React from 'react'
import { Form, Radio, Button, Input, Modal } from 'antd'
import { connect } from 'dva'
import { withRouter, Link, Redirect } from 'dva/router'
import PropTypes from 'prop-types'
import { i18n } from '../utils/util'
import { SelectExistOrganization, SelectTitle, SelectTag } from '../components/ExtraInput'
import LoginContainer from '../components/LoginContainer'
import HandleError from '../components/HandleError'

const RadioGroup = Radio.Group
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

  handleSubmit = values => {
    this.props.dispatch({
      type: 'currentUser/register',
      payload: values, 
    });
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['tag', 'country', 'title'] })
  }

  componentWillUnmount() {
    if (this.state.intervalId !== null) clearInterval(this.state.intervalId);
  }

  render() {
    if (!this.props.currentUser) {
      return <Redirect to="/register1" />;
    }

    const foreigner = (localStorage.getItem('APP_PREFERRED_LANG') || 'cn') !== 'cn';
    return (
      <LoginContainer changeLang={function () { this.forceUpdate() }.bind(this)}>
        <Form ref={this.formRef} onFinish={this.handleSubmit} className="login-register-form it-login-form">

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

          <div className="login-register-form__container">
            <label className="login-register-form__container__label">{foreigner ? "Organization" : "机构"}：</label>
            <Form.Item
              name="organization"
              rules={[{ required: true, message: i18n("account.please_select") + i18n("account.org") }]}
            >
              <SelectExistOrganization className="login-register-form__select" />
              {/* <SelectExistOrganization allowCreate style={selectContentStyle} containerStyle={selectContentContainerStyle} /> */}
            </Form.Item>
          </div>

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

          <Button htmlType="submit" className="login-register-form__submit" loading={this.props.loading}>{i18n('common.submit')}</Button>

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
