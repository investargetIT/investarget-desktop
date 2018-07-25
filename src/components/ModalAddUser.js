import React from 'react';
import { 
  Modal, 
  Form,
} from 'antd';
import SimpleUserForm from './SimpleUserForm';
import * as api from '../api';
import { 
  handleError,
  isLogin,
} from '../utils/util';

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
        this.addUserAndRelation(values)
          .then(this.props.onCancel)
          .catch(handleError) // 可能会添加一个已经存在的投资人所以要捕获这个错误
          .finally(() => this.setState({ isLoading: false }));
      }
    })
  }

  addUserAndRelation = async values => {
    values.userstatus = 1; // 默认待审核
    values.registersource = 3; // 标记注册来源
    values.org = this.props.org.id;
    const user = await api.addUser(values);
    const investoruserid = user.data.id;
    const body = {
      relationtype: true,
      investoruser: investoruserid,
      traderuser: isLogin().id
    };
    await api.addUserRelation(body);
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
