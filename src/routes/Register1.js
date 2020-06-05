import React from 'react';
import {
  Mobile,
  Submit,
} from '../components/Form';
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


const formStyle = {
  width: 418, padding: 20, background: 'white', zIndex: 1, color: '#666',
  border: '1px solid rgba(0, 0, 0, .2)',
  borderRadius: 6,
  boxShadow: '0 5px 15px rgba(0, 0, 0, .5)',
}
const formTitleStyle = { padding: '24px 0 18px', fontSize: 30, fontWeight: 400, textAlign: 'center', color: '#666', borderBottom: '1px solid #fff' }
const formSubtitleStyle = { fontSize: 14, color: '#666', padding: '12px 16px', marginBottom: 30, textAlign: 'center' }

const submitStyle = {
  marginTop: 8, width: '100%', height: 50, fontSize: 20, backgroundColor: 'rgba(35,126,205,.8)', border: 'none', color: '#fff', fontWeight: 200,
  fontSize: 16,
  background: '#13356C',
  borderRadius: 6,
  fontWeight: 'normal',
  marginTop: 8,
}
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

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { mobile, areaCode } = values.mobileInfo;
        api.checkUserExist(mobile)
        .then(result => {
          const pathname = result.data.result ? '/password' : '/register';
          const state = { mobile, areaCode }
          this.props.dispatch(routerRedux.push({ pathname, state }));
        });
      } else {
        console.log(err)
        let fields = ['mobileInfo']
        for (let i = 0, len = fields.length; i < len; i++) {
          let field = fields[i]
          let errField = err[field]
          if (errField) {
            let error = errField.errors[0]
            handleError(new FormError(error.message))
            return
          }
        }
      }
    });
  }

  render () {
    const { getFieldDecorator } = this.props.form;

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
        <div style={formStyle}>
          <Form onSubmit={this.handleSubmit} className="it-login-form">
            <h1 style={formTitleStyle}>{i18n("account.register")}</h1>
            <p style={formSubtitleStyle}>{i18n("account.input_phone_number")}</p>

            <div style={inputStyle}>
              {getFieldDecorator('mobileInfo', {
                rules: [{ required: true }, { type: 'object' }, { validator: check }],
                initialValue: { areaCode: '86', mobile: '' },
              })(
                <GlobalMobile inputStyle={{ background: '#F0F0F0' }} />
              )}
            </div>

            <Button style={submitStyle} type="primary" htmlType="submit">{i18n('common.next')}</Button>

            <div style={{ padding: 8, textAlign: 'center' }}>
              {i18n('account.have_account_already')}<Link to="/login" style={{ textDecoration: 'underline' }}>{i18n('account.directly_login')}</Link>
            </div>
          </Form>
        </div>
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
export default connect(mapStateToProps)(Form.create()(Register1));
