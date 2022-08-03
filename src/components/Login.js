import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router'
import { i18n, handleError, getURLParamValue } from '../utils/util'
import LoginContainer from '../components/LoginContainer'
import HandleError from '../components/HandleError'
import FormError from '../utils/FormError'

const formStyle = {
  width: 480,
  padding: '30px 60px',
  background: 'white',
  zIndex: 1,
  color: '#666', 
  borderRadius: 8,
  boxShadow: '0 0 12px 0 rgba(0, 0, 0, 0.1)',
};
const formTitleStyle = {
  marginBottom: 12,
  fontSize: 30,
  fontWeight: 'normal',
  textAlign: 'center',
  color: '#262626',
  lineHeight: '42px',
};
const formSubtitleStyle = {
  fontSize: 14,
  lineHeight: '22px',
  color: '#989898',
  marginBottom: 40,
  textAlign: 'center',
};
const formInputStyle = {
  fontSize: 16,
  fontWeight: 200,
  color: '#989898',
  height: 40,
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  fontSize: 16,
  color: '#555',
};
const inputIconStyle = {
  width: 18,
  height: 18,
  lineHeight: '18x',
  textAlign: 'center',
  position: 'absolute',
  top: 15,
  right: 16,
  display: 'none',
};
const submitStyle = {
  width: '100%',
  height: 40,
  fontSize: 20,
  backgroundColor: '#13356c',
  border: 'none',
  color: '#fff',
  fontWeight: 200,
  fontSize: 16,
  background: '#13356C',
  borderRadius: 4,
  fontWeight: 'normal',
};


class Login extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      errorMsg: null,
    };

    let loginInfo = localStorage.getItem('login_info')
    if (loginInfo) {
      try {
        loginInfo = JSON.parse(loginInfo)
        this.username = loginInfo.username
        this.password = loginInfo.password
      } catch(e) {
        console.error(e.message)
      }
    }
    if (!localStorage.getItem('source') && getURLParamValue(props, 'source')) {
      localStorage.setItem('source', Number(getURLParamValue(props, 'source')));
    }

    this.feishuCode = getURLParamValue(props, 'code');
  }

  async feishuLogin(feishuCode) {
    const app_id = 'cli_a298cb5f4c78d00b';
    const app_secret = 'M7TVsEt2i06Yx3pNQTHj4e7EAzTudqE1';

    // call endpoint to get app_access_token
    const reqAppAccessToken = await api.getAppAccessToken({ app_id, app_secret });
    const { data: { app_access_token } } = reqAppAccessToken;
    const reqFeishuUserIdentity = await api.getUserIdentity({
      Authorization: app_access_token,
      code: feishuCode,
    });
    const { feishu, investarget } = reqFeishuUserIdentity.data;
    if (feishu.code === 0 && investarget) {
      // TODO: redirect feature
      this.props.dispatch({
        type: 'currentUser/loginWithFeishu',
        payload: {
          data: investarget,
        },
      })
    } else {
      this.setState({
        errorMsg: '登录失败',
      })
    }
  }

  handleSubmit = values => {
    const { search } = this.props.location;
    const params = new URLSearchParams(search);
    const redirectUrl = params.get('redirect');
    this.props.dispatch({
      type: 'currentUser/login',
      payload: {
        ...values,
        redirect: redirectUrl && decodeURIComponent(redirectUrl),
      },
    }).catch(error => {
      if (error.code === 2002 || error.code === 2001) {
        this.setState({ errorMsg: error.message });
      }
    });
  }

  componentDidMount() {
    if (this.props.currentUser || !localStorage.getItem('source')) {
      this.props.dispatch(routerRedux.replace('/'))
    }

    if (this.feishuCode) {
      this.feishuLogin(this.feishuCode).catch(e => {
        this.setState({ errorMsg: e.message });
      })
    }
  }

  handleFeishuLoginBtnClicked() {
    const app_id = 'cli_a298cb5f4c78d00b';
    const redirect_url = 'http://localhost:8000/login';
    const auth_url = `https://open.feishu.cn/open-apis/authen/v1/index?app_id=${app_id}&redirect_uri=${encodeURIComponent(redirect_url)}&state=RANDOMSTATE`;
    window.location.href = auth_url;
  }

  render() {
    return (
      <LoginContainer changeLang={function(){this.forceUpdate()}.bind(this)}>
        <Form className="it-login-form login-register-form" onFinish={this.handleSubmit}>
          <h1 style={formTitleStyle}>{i18n('account.directly_login')}</h1>
          <p style={formSubtitleStyle}>{i18n('account.login_message')}</p>

          {this.state.errorMsg &&
            <Alert
              style={{ marginBottom: 20 }}
              message={this.state.errorMsg}
              type="error"
              showIcon
            />
          }

          <Form.Item
            name="username"
            rules={[{ required: true, message: i18n('account.account_warning') }]}
            initialValue={this.username || ''}
          >
            <Input
              allowClear
              className="login-register-form__input"
              prefix={<UserOutlined style={{ marginRight: 4, color: '#bfbfbf' }} className="site-form-item-icon" />}
              placeholder={i18n('account.account_warning')}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => (
              <Form.Item
                name="password"
                rules={[{ required: true, message: i18n('account.password_warning') }]}
                initialValue={this.password || ''}
              >
                <Input.Password
                  className="login-register-form__input"
                  prefix={<LockOutlined style={{ marginRight: 4, color: '#bfbfbf' }} className="site-form-item-icon" />}
                  placeholder={i18n('account.password_warning')}
                  visibilityToggle={getFieldValue('password') ? true : false}
                />
              </Form.Item>
            )}
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Form.Item
              name="remember"
              valuePropName="checked"
              initialValue={this.username ? true : false} // 如果是记住账号密码，初始值设为 true
            >
              <Checkbox>{i18n('account.auto_login')}</Checkbox>
            </Form.Item>
            <Link style={{ marginBottom: 20, fontSize: 14, color: '#339bd2' }} to="/password">{i18n("account.forget_password")}</Link>
          </div>

          <Button block type="primary" size="large" htmlType="submit" loading={this.props.loading}>{i18n('account.login')}</Button>
          <div style={{ textAlign: 'center' }}>or</div>
          <div>
            <Button block size="large" onClick={this.handleFeishuLoginBtnClicked}><img src="/images/feishu-logo.svg" style={{ height: 30 }} /></Button>
          </div>
          
          <div className="login-register-form__hint">{i18n('account.dont_have_account_yet')}<Link to="/register1" style={{ color: '#339bd2' }}>{i18n('account.directly_register')}</Link></div>

        </Form>
        <HandleError pathname={encodeURIComponent(this.props.location.pathname + this.props.location.search)} />
      </LoginContainer>
    );
  }
}

function mapStateToProps(state) {
  const { currentUser } = state
  return {
    loading: state.loading.models.currentUser,
    currentUser
  }
}

export default connect(mapStateToProps)(Login);
