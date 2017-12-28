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


const formStyle = {width:418,height:280,padding:'0 19px',background:'rgba(47,48,49,.8)',position:'absolute',top:196,right:20,zIndex:1,color:'#fff'}
const formTitleStyle = {padding:'24px 0 18px',fontSize:22,fontWeight:400,textAlign:'center',color:'#fff',borderBottom:'1px solid #fff'}
const formSubtitleStyle = {fontSize:16,padding:'12px 16px',fontWeight:200}

const submitStyle = {marginTop: 8,width:'100%',height:50,fontSize:20,backgroundColor:'rgba(35,126,205,.8)',border:'none',color:'#fff',fontWeight:200}



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
      <LoginContainer>
        <div style={formStyle}>
          <Form onSubmit={this.handleSubmit} className="it-login-form">
            <h1 style={formTitleStyle}>手机注册</h1>
            <p style={formSubtitleStyle}>输入正确的手机号码！</p>

              {getFieldDecorator('mobileInfo', {
                rules: [{ required: true }, { type: 'object' }, { validator: check }],
                initialValue: { areaCode: '86', mobile: '' },
              })(
                <GlobalMobile />
              )}

            <Button style={submitStyle} type="primary" htmlType="submit">下一步</Button>

            <div style={{padding:8}}>
              已有账号？<Link to="/login" style={{textDecoration:'underline'}}>立即登录</Link>
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
