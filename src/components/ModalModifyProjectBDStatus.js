import React from 'react'
import { connect } from 'dva'
import { 
  i18n, 
} from '../utils/util';
import { 
  Modal, 
  Select, 
  Form,
} from 'antd';
import SimpleUserForm from './SimpleUserForm';
import ContactForm from './ContactForm';

function mapPropsToFields(props) {
  return props.data;
}
const FormItem = Form.Item;
const EditUserForm = Form.create({ mapPropsToFields })(SimpleUserForm);
const EditContactForm = Form.create({ mapPropsToFields })(ContactForm);

const Option = Select.Option
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

function SelectBDStatus(props) {
  const { value, onChange, options, ...extraProps } = props;
  return (
    <Select
      size="large"
      value={String(value)}
      onChange={value => onChange(Number(value))}
      {...extraProps}
    >
      {
        options.map(item =>
          <Option key={item.value} value={String(item.value)}>{item.label}</Option>
        )
      }
    </Select>
  );
}
function mapStateToProps(state) {
  const { bdStatus } = state.app;
  const options = bdStatus ? bdStatus.map(item => ({value: item.id, label: item.name})) : []
  return { options };
}
SelectBDStatus = connect(mapStateToProps)(SelectBDStatus);
export { SelectBDStatus };

function toFormData (bd) {
  var formData = {
    usernameC: bd.username,
    email: bd.useremail,
    title: bd.usertitle && bd.usertitle.id,
  };
  if (bd.usermobile) {
    if (bd.usermobile.includes('-')) {
      formData.mobile = bd.usermobile.split('-')[1];
      if (bd.usermobile.split('-')[0] !== '') {
        formData.mobileAreaCode = bd.usermobile.split('-')[0];
      }
    } else {
      formData.mobile = bd.usermobile;
    }
  }
  for (let prop in formData) {
    formData[prop] = { value: formData[prop] };
  }
  return formData;
}

function toContactFormData(bd) {
  var formData = {
    username: bd.username,
    email: bd.useremail,
    usertitle: bd.usertitle && bd.usertitle.id,
  };
  if (bd.usermobile) {
    if (bd.usermobile.includes('-')) {
      formData.mobile = bd.usermobile.split('-')[1];
      if (bd.usermobile.split('-')[0] !== '') {
        formData.mobileAreaCode = bd.usermobile.split('-')[0];
      }
    } else {
      formData.mobile = bd.usermobile;
    }
  }
  for (let prop in formData) {
    formData[prop] = { value: formData[prop] };
  }
  return formData;
}

class ModalModifyProjectBDStatus extends React.Component {

  state = {
    status: this.props.bd.bd_status.id,
    confirmLoading: false,
  }

  handleRef = (inst) => {
    if (inst) {
      this.addForm = inst.props.form
    }
  }

  handleContactFormRef = (inst) => {
    if (inst) {
      this.contactForm = inst.props.form
    }
  }

  handleConfirmBtnClicked = () => {
    const { status } = this.state;
    if (this.addForm) {
      this.addForm.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          this.props.onOk({ ...values, status });
        }
      });
    } else {
      this.setState({ confirmLoading: true });
      this.props.onOk({ status });
    }
  }

  render() {
    const { visible, onCancel } = this.props;
    return (
      <Modal
        title={i18n('modify_bd_status')}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleConfirmBtnClicked}
      >

        <FormItem {...formItemLayout} label="状态">
          <SelectBDStatus
            style={{ width: 160 }}
            value={this.state.status}
            onChange={status => this.setState({ status })}
          />
        </FormItem>

        {!this.props.bd.bduser && this.props.bd.bd_status.id !== 3 && this.state.status === 3 ?
          <EditUserForm
            wrappedComponentRef={this.handleRef}
            data={toFormData(this.props.bd)}
          />
        : null}
        {/* 项目BD状态改为已见面或已联系(对应id为6,7)时需要填写联系人信息, 详细需求见bugClose#340 */}
        {![6, 7].includes(this.props.bd.bd_status.id) && [6, 7].includes(this.state.status) &&
        <EditContactForm
          wrappedComponentRef={this.handleContactFormRef}
          data={toContactFormData(this.props.bd)}
        />
        }

      </Modal>
    )
  }

}


export default ModalModifyProjectBDStatus
