import { Form, Icon, Input, Button, Checkbox, message } from 'antd'
import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router'
import { i18n, handleError } from '../utils/util'
import LoginContainer from '../components/LoginContainer'
import HandleError from '../components/HandleError'
import FormError from '../utils/FormError'

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
const inputIconStyle = {width:18,height:18,lineHeight:'18x',textAlign:'center',position:'absolute',top:15,right:16, display: 'none'}
const submitStyle = {width:'100%',height:50,fontSize:20,backgroundColor:'rgba(35,126,205,.8)',border:'none',color:'#fff',fontWeight:200,
  fontSize: 16,
  background: '#13356C',
  borderRadius: 6,
  fontWeight: 'normal',
  // height: 43,
};


class Login extends React.Component {

  constructor(props) {
    super(props)

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
    if (!localStorage.getItem('source') && this.props.location.query.source) {
      localStorage.setItem('source', Number(this.props.location.query.source));
    }
  }

  handleSubmit = values => {
    const redirectUrl = this.props.location.query.redirect;
    this.props.dispatch({
      type: 'currentUser/login',
      payload: {
        ...values,
        redirect: redirectUrl && decodeURIComponent(redirectUrl),
      },
    });
  }

  componentDidMount() {
    if (this.props.currentUser || !localStorage.getItem('source')) {
      this.props.dispatch(routerRedux.replace('/'))
    }
  }

  render() {
    return (
      <LoginContainer changeLang={function(){this.forceUpdate()}.bind(this)}>
        <Form className="it-login-form" onFinish={this.handleSubmit}>
          <div style={formStyle}>
            <div style={{ margin: '0 auto' }}>
              <h1 style={formTitleStyle}>{i18n('account.directly_login')}</h1>
              <p style={formSubtitleStyle}>{i18n('account.login_message')}</p>

              <div style={{ position: 'relative', marginBottom: 20, }}>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: i18n('account.account_warning') }]}
                  initialValue={this.username || ''}
                >
                  <Input placeholder={i18n('account.account_warning')} style={formInputStyle} />
                </Form.Item>
                <div style={inputIconStyle}>
                  <img src="/images/sign-in-username.jpg" style={{ verticalAlign: 'top' }} />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: i18n('account.password_warning') }]}
                  initialValue={this.password || ''}
                >
                  <Input placeholder={i18n('account.password_warning')} style={formInputStyle} type="password" />
                </Form.Item>
                <div style={inputIconStyle}>
                  <img src="/images/sign-in-password.jpg" style={{ verticalAlign: 'top' }} />
                </div>
              </div>

              <div style={{ padding: '10px 16px' }}>
                <Form.Item
                  name="remember"
                  valuePropName="checked"
                  initialValue={this.username ? true : false} // 如果是记住账号密码，初始值设为 true
                >
                  <Checkbox className="it" style={{ color: '#666' }}>{i18n('account.auto_login')}</Checkbox>
                </Form.Item>
                <Link style={{ float: 'right', textDecoration: 'underline' }} to="/password">{i18n("account.forget_password")}</Link>
              </div>

              <Button htmlType="submit" style={submitStyle}>{i18n('account.login')}</Button>
              <div style={{ marginTop: 10, padding: 8, textAlign: 'center' }}>
                {i18n('account.dont_have_account_yet')}<Link to="/register1" style={{ textDecoration: 'underline' }}>{i18n('account.directly_register')}</Link>
              </div>
            </div>
          </div>
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
