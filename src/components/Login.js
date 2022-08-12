import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router'
import { i18n, handleError, getURLParamValue } from '../utils/util'
import LoginContainer from '../components/LoginContainer'
import HandleError from '../components/HandleError'
import { feishuRedirectUri } from '../utils/request';
import { SwapOutlined } from '@ant-design/icons';

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


class Login extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      errorMsg: null,
      isBindingFeishu: false,
      feishuUsername: '',
      feishu_union_id: undefined,
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
    // Test 应用的 app_id 和 app_secret
    // const app_id = 'cli_a298cb5f4c78d00b';
    // const app_secret = 'M7TVsEt2i06Yx3pNQTHj4e7EAzTudqE1';
   
    // 多维资本应用的 app_id 和 app_secret
    const app_id = 'cli_a24cf239bf239013';
    const app_secret = 'Cz8osyGyWqPj9V9Xc6LWJhEUb0bfWVs1';

    // call endpoint to get app_access_token
    const reqAppAccessToken = await api.getAppAccessToken({ app_id, app_secret });
    const { data: { app_access_token } } = reqAppAccessToken;
    const reqFeishuUserIdentity = await api.getUserIdentity({
      Authorization: app_access_token,
      code: feishuCode,
    });
    const { feishu, investarget } = reqFeishuUserIdentity.data;
    if (feishu.code === 0 && investarget) {
      // 飞书授权成功并且已经绑定了多维海拓账号
      // TODO: redirect feature
      this.props.dispatch({
        type: 'currentUser/loginWithFeishu',
        payload: {
          data: investarget,
        },
      })
    } else if (feishu.code === 0 && !investarget) {
      // 飞书授权成功但是未绑定多维海拓账号
      const { name, union_id } = feishu.data;
      this.setState({ isBindingFeishu: true, feishuUsername: name, feishu_union_id: union_id });
    } else {
      // 飞书授权失败
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
        union_id: this.state.feishu_union_id,
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
        console.error(e.toString());
      })
    }
  }

  handleFeishuLoginBtnClicked() {
    // const app_id = 'cli_a298cb5f4c78d00b'; // Test 应用的 app_id
    const app_id = 'cli_a24cf239bf239013'; // 多维资本应用的 app_id
    const redirect_url = feishuRedirectUri;
    // const redirect_url = 'http://localhost:8000/login';
    const auth_url = `https://open.feishu.cn/open-apis/authen/v1/index?app_id=${app_id}&redirect_uri=${encodeURIComponent(redirect_url)}&state=RANDOMSTATE`;
    window.location.href = auth_url;
  }

  render() {
    return (
      <LoginContainer changeLang={function(){this.forceUpdate()}.bind(this)}>
        <Form className="it-login-form login-register-form" onFinish={this.handleSubmit}>
          
          {!this.state.isBindingFeishu ? (
            <h1 style={formTitleStyle}>{i18n('account.directly_login')}</h1>
          ) : (
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img style={{ width: 48 }} src="/images/investarget_new_logo.png" />
              <SwapOutlined style={{ color: '#989898', fontSize: 24, margin: '0 16px' }}/>
              <img style={{ width: 64 }} src="/images/feishu.svg" />
            </div>
          )}

          <p style={formSubtitleStyle}>{this.state.isBindingFeishu ? i18n('account.bind_feishu_account', { username: this.state.feishuUsername }) : i18n('account.login_message')}</p>
          
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

          {!this.state.isBindingFeishu && (
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
          )}

          <Button block style={this.state.isBindingFeishu ? { marginBottom: 16 } : undefined} type="primary" size="large" htmlType="submit" loading={this.props.loading}>{this.state.isBindingFeishu ? i18n('account.login_and_bind') : i18n('account.login')}</Button>

          {!this.state.isBindingFeishu && (
            <div>
              <div style={{ textAlign: 'center' }}>or</div>
              <div>
                <Button block size="large" onClick={this.handleFeishuLoginBtnClicked} icon={<img src="/images/feishu.svg" style={{ height: 30 }} />}>{i18n('account.login_with_feishu')}</Button>
              </div>
              <div className="login-register-form__hint">{i18n('account.dont_have_account_yet')}<Link to="/register1" style={{ color: '#339bd2' }}>{i18n('account.directly_register')}</Link></div>
            </div>
          )}
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
