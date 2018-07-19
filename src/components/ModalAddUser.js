import React from 'react';
import { 
  Modal, 
  Form,
} from 'antd';
import SimpleUserForm from './SimpleUserForm';
import * as api from '../api';
import { handleError } from '../utils/util';

const AddUserForm = Form.create()(SimpleUserForm);

class ModalAddUser extends React.Component {

  state = {
    isLoading: false,
  }

  handleRef = (inst) => {
    if (inst) {
      this.addForm = inst.props.form
    }
  }

  handleSubmitBtnClicked = () => {
    this.addForm.validateFields((err, values) => {
      if (!err) {
        this.setState({ isLoading: true });
        values.userstatus = 1; // 默认待审核
        values.registersource = 3; // 标记注册来源
        values.org = this.props.org.id;
        api.addUser(values)
          .then(this.props.onCancel)
          .catch(handleError)
          .finally(() => this.setState({ isLoading: false }));
      }
    })
  }

  render() {
    return (
      <Modal
        title={`为 ${this.props.org.orgname} 添加投资人`}
        visible={true}
        onCancel={this.props.onCancel}
        confirmLoading={this.state.isLoading}
        onOk={this.handleSubmitBtnClicked}
      >
        <AddUserForm wrappedComponentRef={this.handleRef} />
      </Modal>
    );
  }

}

export default ModalAddUser;
