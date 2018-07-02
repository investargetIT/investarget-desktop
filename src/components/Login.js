import { Form, Icon, Input, Button, Checkbox, message } from 'antd'
import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router'
import { i18n, handleError } from '../utils/util'
import LoginContainer from '../components/LoginContainer'
import HandleError from '../components/HandleError'
import FormError from '../utils/FormError'

const formStyle = {width:418,height:360,padding:'0 19px',background:'rgba(47,48,49,.8)',position:'absolute',top:196,right:20,zIndex:1,color:'#fff'}
const formTitleStyle = {padding:'24px 0 18px',fontSize:22,fontWeight:400,textAlign:'center',color:'#fff',borderBottom:'2px solid #fff'}
const formSubtitleStyle = {fontSize:16,padding:'12px 16px',fontWeight:200}
const formInputStyle = {border:'none',fontSize:16,fontWeight:200,color:'#989898',padding:'12px 16px',paddingRight:40,height:'auto'}
const inputIconStyle = {width:18,height:18,lineHeight:'18x',textAlign:'center',position:'absolute',top:15,right:16}
const submitStyle = {width:'100%',height:50,fontSize:20,backgroundColor:'rgba(35,126,205,.8)',border:'none',color:'#fff',fontWeight:200}


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
    if (!localStorage.getItem('source')) {
      localStorage.setItem('source', Number(this.props.location.query.source));
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        const redirectUrl = this.props.location.query.redirect
        this.props.dispatch({
          type: 'currentUser/login',
          payload: { ...values,
            redirect: redirectUrl && decodeURIComponent(redirectUrl)
          }
        })
      } else {
        // 按字段顺序处理错误，只处理第一个错误
        let fields = ['username', 'password']
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
    })
  }

  componentDidMount() {
    if (this.props.currentUser) {
      this.props.dispatch(routerRedux.replace('/'))
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <LoginContainer changeLang={function(){this.forceUpdate()}.bind(this)}>
        <Form onSubmit={this.handleSubmit} className="it-login-form">
          <div style={formStyle}>
            <h1 style={formTitleStyle}>{i18n('account.directly_login')}</h1>
            <p style={formSubtitleStyle}>{i18n('account.login_message')}</p>

            <div style={{position:'relative', marginBottom:8}}>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: i18n('account.account_warning') }],
                initialValue: this.username || '',
              })(
                <Input placeholder={i18n('account.account_warning')} style={formInputStyle} />
              )}
              <div style={inputIconStyle}>
                <img src="/images/sign-in-username.jpg" style={{verticalAlign:'top'}} />
              </div>
            </div>

            <div style={{position:'relative'}}>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: i18n('account.password_warning') }],
                initialValue: this.password || '',
              })(
                <Input placeholder={i18n('account.password_warning')} style={formInputStyle} type="password" />
              )}
              <div style={inputIconStyle}>
                <img src="/images/sign-in-password.jpg" style={{verticalAlign:'top'}} />
              </div>
            </div>

            <div style={{padding:'8px 16px'}}>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: this.username ? true : false, // 如果是记住账号密码，初始值设为 true
              })(
                <Checkbox className="it" style={{color:'#fff'}}>{i18n('account.auto_login')}</Checkbox>
              )}
              <Link style={{float:'right',textDecoration:'underline'}} to="/password">{i18n("account.forget_password")}</Link>
            </div>

            <Button htmlType="submit" style={submitStyle}>{i18n('account.login')}</Button>
            <div style={{padding:8}}>
              {i18n('account.dont_have_account_yet')}<Link to="/register1" style={{textDecoration:'underline'}}>{i18n('account.directly_register')}</Link>
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

export default connect(mapStateToProps)(Form.create()(Login))
