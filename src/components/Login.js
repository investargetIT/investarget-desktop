import { Form, Icon, Input, Button, Checkbox } from 'antd'
import fetch from 'dva/fetch'
import { connect } from 'dva'
import { routerRedux, Link } from 'dva/router'
import { i18n } from '../utils/util'
import MainLayout from './MainLayout'

const FormItem = Form.Item;

const loginContainerStyle = {
  maxWidth: '400px',
  margin: '200px auto'
}

const loginTitleStyle = {
  textAlign: 'center',
  lineHeight: 4
}

const loginFormForgot = {
  float: 'right'
}

const loginFormButton = {
  width: '100%'
}

class Login extends React.Component {

  componentDidMount() {
    if (this.props.currentUser) {
      this.props.dispatch(routerRedux.replace('/'))
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
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <MainLayout location={this.props.location}>
      <div style={loginContainerStyle}>
	<h2 style={loginTitleStyle}>{i18n("account.login")}</h2>
      <Form onSubmit={this.handleSubmit}>
	<FormItem>
	  {getFieldDecorator('username', {
	    rules: [{ required: true, message: i18n('account.account_warning') }],
	  })(
	    <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder={i18n("account.account")} />
	  )}
	</FormItem>
	<FormItem>
	  {getFieldDecorator('password', {
	    rules: [{ required: true, message: i18n('account.password_warning') }],
	  })(
	    <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder={i18n("account.password")} />
	  )}
	</FormItem>
	<FormItem>
	  {getFieldDecorator('remember', {
	    valuePropName: 'checked',
	    initialValue: true,
	  })(
	    <Checkbox>{i18n("account.remember_user")}</Checkbox>
	  )}
	  <a style={loginFormForgot} href="">{i18n("account.forget_password")}</a>
	  <Button type="primary" htmlType="submit" style={loginFormButton} loading={this.props.loading}>
	    {i18n("account.login")}
	  </Button>
	  Or <Link to="/register">{i18n("account.register")}</Link>
	</FormItem>
      </Form>
    </div>
  </MainLayout>
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
