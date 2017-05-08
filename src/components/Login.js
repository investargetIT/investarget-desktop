import { Form, Icon, Input, Button, Checkbox } from 'antd'
import fetch from 'dva/fetch'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { injectIntl } from 'react-intl'
import { t } from '../utils/util'

const FormItem = Form.Item;

const loginFormStyle = {
  maxWidth: '300px'
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
	console.log('Received values of form: ', values)

	this.props.dispatch({
	  type: 'currentUser/login',
	  payload: values
	})
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} style={loginFormStyle}>
	<FormItem>
	  {getFieldDecorator('username', {
	    rules: [{ required: true, message: t(this, 'login.account_warning') }],
	  })(
	    <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder={t(this, "login.account")} />
	  )}
	</FormItem>
	<FormItem>
	  {getFieldDecorator('password', {
	    rules: [{ required: true, message: t(this, 'login.password_warning') }],
	  })(
	    <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder={t(this, "login.password")} />
	  )}
	</FormItem>
	<FormItem>
	  {getFieldDecorator('remember', {
	    valuePropName: 'checked',
	    initialValue: true,
	  })(
	    <Checkbox>{t(this, "login.Remember_User")}</Checkbox>
	  )}
	  <a style={loginFormForgot} href="">{t(this, "login.forget_password")}</a>
	  <Button type="primary" htmlType="submit" style={loginFormButton} loading={this.props.loading}>
	    {t(this, "header.login")}
	  </Button>
	  Or <a href="">{t(this, "login.register")}</a>
	</FormItem>
      </Form>
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

export default connect(mapStateToProps)(Form.create()(injectIntl(Login)))
