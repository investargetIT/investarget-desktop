import React from 'react';
import { 
  Mobile, 
  Submit,
} from '../components/Form';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { 
  Form, 
  Button, 
} from 'antd';
import { routerRedux } from 'dva/router';
import * as api from '../api';

class Register1 extends React.Component {
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { mobile } = values.mobileInfo;
        api.checkUserExist(mobile)
        .then(result => {
          const url = result.data.result ? '/password' : '/register';
          this.props.dispatch(routerRedux.push(url));
        });
      }
    });
  }

  render () {
    return (
      <div style={{ padding: 200 }}>
      <Form onSubmit={this.handleSubmit}>
      <Mobile country={this.props.country} onBlur={this.handleMobileBlur} required />
      <Button style={{ marginLeft: 250 }} type="primary" htmlType="submit" size="large">下一步</Button>
      </Form>
      </div>
    );
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