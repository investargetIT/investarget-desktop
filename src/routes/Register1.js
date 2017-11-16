import React from 'react';
import { 
  Mobile, 
  Submit,
} from '../components/Form';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Form } from 'antd';

class Register1 extends React.Component {
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  render () {
    return (
      <div style={{ padding: 200 }}>
      <Form>
      <Mobile country={this.props.country} onBlur={this.handleMobileBlur} required />
      <Submit />
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