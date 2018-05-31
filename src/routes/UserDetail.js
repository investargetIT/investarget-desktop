import React from 'react'
import { 
  Row, 
  Col, 
  Tabs,
  Icon,
  Modal,
  Form,
  DatePicker,
  Input,
  Button,
} from 'antd';
import { 
  BasicFormItem,
} from '../components/Form';
import { SelectProjectLibrary } from '../components/ExtraInput';
import LeftRightLayout from '../components/LeftRightLayout'
import UserInfo from '../components/UserInfo'
import TransactionInfo from '../components/TransactionInfo'
import { UserRemarkList } from '../components/RemarkList'
import { i18n } from '../utils/util'
import PropTypes from 'prop-types';

const TabPane = Tabs.TabPane
const FormItem = Form.Item;

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
}
const detailStyle={
  marginTop:'64px',
  marginBottom:'24px'
}

const Field = (props) => {
  return (
    <Row style={rowStyle}>
      <Col span={6}>{props.title}</Col>
      <Col span={18}>{props.value}</Col>
    </Row>
  )
}

class UserInvestEventForm extends React.Component {
  
  getChildContext() {
    return {
      form: this.props.form
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.addEvent(values);
      }
    });
  }

  addEvent = async values => {
    const com_id = isNaN(values.investTarget) ? undefined : parseInt(values.investTarget);
    let comshortname = isNaN(values.investTarget) ? values.investTarget: undefined;
    const investDate = values.investDate.format('YYYY-MM-DDT00:00:00');

    if (com_id !== undefined && comshortname === undefined) {
      const result = await api.getLibProj({ com_id });
      comshortname = result.data.data[0].com_name;
    }
    const body = { 
      user: this.props.user,
      com_id,
      comshortname,
      investDate,
    };
    return api.addUserInvestEvent(body)
      .then(result => {
        this.props.onAdd();
      });
  }

  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>

        <BasicFormItem label="投资项目" name="investTarget" required>
          <SelectProjectLibrary allowCreate formName="userform" />
        </BasicFormItem>

        <BasicFormItem label="投资时间" name="investDate" valueType="object" required>
          <DatePicker format="YYYY-MM-DD" />
        </BasicFormItem>

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >确定</Button>

        </FormItem>

      </Form>
    );
  }
}

UserInvestEventForm.childContextTypes = {
  form: PropTypes.object
};

UserInvestEventForm = Form.create()(UserInvestEventForm);

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: Number(this.props.params.id),
      isShowForm: false,
      hideUserInfo: false,
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState(
      { userId: null }, 
      () => this.setState({ userId: Number( newProps.params.id )}), 
    );
  }

  render() {
    const { userId } = this.state;
    return userId && (
      <LeftRightLayout location={this.props.location} title={i18n('menu.user_management')} name={i18n('user.user_detail')}>
        <UserRemarkList typeId={userId} />

        <h3 style={detailStyle}>{i18n('user.detail')}:          
          <Icon 
            type="plus" 
            style={{ cursor: 'pointer', padding: '4px', color: '#108ee9'}} 
            onClick={() => this.setState({ isShowForm: true })} 
          />
        </h3>

        <Row gutter={48}>
          <Col span={12}>
            { this.state.hideUserInfo ? null : <UserInfo userId={userId} /> }
          </Col>
          <Col span={12}>
            <TransactionInfo userId={userId} />
          </Col>
        </Row>

        {this.state.isShowForm ?
          <Modal
            title="添加投资事件"
            visible={true}
            footer={null}
            onCancel={() => this.setState({ isShowForm: false })}
          >
           <UserInvestEventForm user={userId} onAdd={() => this.setState({ isShowForm: false, hideUserInfo: true }, () => this.setState({ hideUserInfo: false}))} /> 
          </Modal>
          : null}

      </LeftRightLayout>
    )
  }
}

export default UserDetail
