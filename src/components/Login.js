import { Form, Icon, Input, Button, Checkbox } from 'antd'
import fetch from 'dva/fetch'
import { connect } from 'dva'

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
	    rules: [{ required: true, message: 'Please input your username!' }],
	  })(
	    <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />
	  )}
	</FormItem>
	<FormItem>
	  {getFieldDecorator('password', {
	    rules: [{ required: true, message: 'Please input your Password!' }],
	  })(
	    <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
	  )}
	</FormItem>
	<FormItem>
	  {getFieldDecorator('remember', {
	    valuePropName: 'checked',
	    initialValue: true,
	  })(
	    <Checkbox>Remember me</Checkbox>
	  )}
	  <a style={loginFormForgot} href="">Forgot password</a>
	  <Button type="primary" htmlType="submit" style={loginFormButton} loading={this.props.loading}>
	    Log in
	  </Button>
	  Or <a href="">register now!</a>
	</FormItem>
      </Form>
    );
  }
}

function mapStateToProps(state) {
  return { loading: state.loading.models.currentUser }
}

export default connect(mapStateToProps)(Form.create()(Login))
