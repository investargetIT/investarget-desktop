import React from 'react'
import { connect } from 'dva'
import { 
  i18n, 
  checkMobile,
} from '../utils/util';
import { 
  Modal, 
  Select, 
  Checkbox, 
  Input, 
  Row, 
  Col, 
  Switch, 
  Button,
  Form,
} from 'antd';
import SimpleUserForm from './SimpleUserForm';

const AddUserForm = Form.create()(SimpleUserForm);

class ModalAddUser extends React.Component {

  state = {
    // username: !this.props.bd.bduser&&this.props.projectBD&&this.props.bd.username ||'', 
    // mobile: !this.props.bd.bduser&&this.props.projectBD&&this.props.bd.usermobile ? this.props.bd.usermobile.replace(/^\d{2}-/,''):'',
    // wechat: '', 
    // email: !this.props.bd.bduser&&this.props.projectBD&&this.props.bd.useremail ||'', 
    // isimportant: this.props.bd.isimportant||null, 
    // status: this.props.bd.bd_status.id, 
    // group: '', 
    // mobileAreaCode: '86',
  }

  handleRef = (inst) => {
    if (inst) {
      this.addForm = inst.props.form
    }
  }

  handleSubmitBtnClicked = () => {
    this.addForm.validateFields((err, values) => {
      if (!err) {
        echo('values', values);
        // let param = toData(values)
        // api.addSchedule(param).then(result => {
        //   this.hideAddModal()
        //   this.getEvents()
        // }).catch(error => {
        //   this.hideEditModal()
        //   handleError(error)
        // })
      }
    })
  }
  render() {
    const { visible, currentStatus, status, sendEmail, confirmLoading, onStatusChange, onSendEmailChange, onOk, onCancel } = this.props
    return (
      <Modal
        title={`为 ${this.props.org.orgname} 添加投资人`}
        visible={true}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        onOk={this.handleSubmitBtnClicked}
      >
       <AddUserForm
         wrappedComponentRef={this.handleRef} 
       /> 
      </Modal>
    )
  }

}


export default ModalAddUser
