import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import PropTypes from 'prop-types';
import {
  Form,
  Button,
} from 'antd';
import { routerRedux } from 'dva/router';
import * as api from '../api';
import LoginContainer from '../components/LoginContainer'
import GlobalMobile from '../components/GlobalMobile'
import { i18n, handleError } from '../utils/util'
import FormError from '../utils/FormError'
import HandleError from '../components/HandleError'

const inputStyle = {
  border: 'none', fontSize: 16, fontWeight: 200, height: 50, marginBottom: 8,
  background: '#F0F0F0',
  border: '1px solid #ccc',
  borderRadius: 4,
};


class Register1 extends React.Component {

  constructor(props) {
    super(props);
    if (!localStorage.getItem('source')) {
      localStorage.setItem('source', Number(this.props.location.query.source));
    }
  }

  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = values => {
    const { mobile, areaCode } = values.mobileInfo;
    api.checkUserExist(mobile)
      .then(result => {
        const pathname = result.data.result ? '/password' : '/register';
        const state = { mobile, areaCode }
        this.props.dispatch(routerRedux.push({ pathname, state }));
      });
  }

  render () {
    function check(rule, value, callback) {
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
      <LoginContainer changeLang={function () { this.forceUpdate() }.bind(this)}>
        <Form onFinish={this.handleSubmit} className="it-login-form login-register-form">
          <h1 className="login-register-form__title">{i18n("account.register")}</h1>
          <p className="login-register-form__subtitle">{i18n("account.input_phone_number")}</p>
          <div style={inputStyle}>
            <Form.Item
              name="mobileInfo"
              rules={[{ required: true }, { type: 'object' }, { validator: check }]}
              initialValue={{ areaCode: '86', mobile: '' }}
            >
              <GlobalMobile inputStyle={{ background: '#F0F0F0' }} />
            </Form.Item>
          </div>
          <Button className="login-register-form__submit" type="primary" htmlType="submit">{i18n('common.next')}</Button>
          <div className="login-register-form__hint">{i18n('account.have_account_already')}<Link to="/login" style={{ textDecoration: 'underline' }}>{i18n('account.directly_login')}</Link></div>
        </Form>
        <HandleError pathname={encodeURIComponent(this.props.location.pathname + this.props.location.search)} />
      </LoginContainer>
    )
  }
}

function mapStateToProps(state) {
  const { country } = state.app;
  return { country };
}
Register1.childContextTypes = {
  form: PropTypes.object
}
export default connect(mapStateToProps)(Register1);
