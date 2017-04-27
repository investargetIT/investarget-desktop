import { Form, Icon, Input, Button, Checkbox } from 'antd'
import fetch from 'dva/fetch'

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
	console.log('Received values of form: ', values);
	const param = Object.assign({}, values, {
	  datasource: 1
	})
	fetch('http://192.168.1.201:8000/user/login/', {
	  method: "POST",
	  body: JSON.stringify(param),
	  headers: {
	    "Content-Type": "application/json",
	    "clienttype": "3"
	  },
	}).then(function(response) {
	  return response.json()
	}) 
	  .then(function(json) {
	    console.log(json)
	  })
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} style={loginFormStyle}>
	<FormItem>
	  {getFieldDecorator('account', {
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
	  <Button type="primary" htmlType="submit" style={loginFormButton}>
	    Log in
	  </Button>
	  Or <a href="">register now!</a>
	</FormItem>
      </Form>
    );
  }
}


export default Form.create()(Login)
