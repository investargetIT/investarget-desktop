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
  Upload,
} from 'antd';
import { 
  BasicFormItem,
} from '../components/Form';
import { 
  SelectProjectLibrary,
  SelectOrAddDate,
} from '../components/ExtraInput';
import LeftRightLayout from '../components/LeftRightLayout'
import UserInfo from '../components/UserInfo'
import TransactionInfo from '../components/TransactionInfo'
import { UserRemarkList } from '../components/RemarkList'
import { 
  i18n,
  handleError,
} from '../utils/util';
import PropTypes from 'prop-types';
import { baseUrl } from '../utils/request';
import { Modal as GModal } from '../components/GlobalComponents';

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
        this.addEvent(values).catch(handleError);
      }
    });
  }

  addEvent = async values => {
    const com_id = isNaN(values.investTarget) ? undefined : parseInt(values.investTarget);
    let comshortname = isNaN(values.investTarget) ? values.investTarget: undefined;
    const investDate = values.investDate.format('YYYY-MM-DDT00:00:00');

    let industrytype, Pindustrytype;
    if (com_id !== undefined && comshortname === undefined) {
      const result = await api.getLibProjSimple({ com_id });
      const { com_name, com_cat_name, com_sub_cat_name } = result.data.data[0];
      comshortname = com_name;
      industrytype = com_sub_cat_name;
      Pindustrytype = com_cat_name; 
    }

    const requestEvents = await api.getLibEvent({ com_id, page_size: 100 });
    const event = requestEvents.data.data.filter(f => f.date === values.investDate.format('YYYY-MM-DD'))[0];

    const body = { 
      user: this.props.user,
      com_id,
      comshortname,
      investDate,
      round: event && event.round,
      industrytype,
      Pindustrytype,
    };
    return api.addUserInvestEvent(body)
      .then(result => {
        this.props.onAdd();
      });
  }

  handleTargetChange = () => this.props.form.setFieldsValue({ investDate: null });
  
  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;
    const investarget = this.props.form.getFieldValue('investTarget');
    return (
      <Form onSubmit={this.handleSubmit}>

        <BasicFormItem label="投资项目" name="investTarget" required valueType="number" onChange={this.handleTargetChange}>
          <SelectProjectLibrary />
        </BasicFormItem>

        { investarget !== undefined ?
        <BasicFormItem label="投资时间" name="investDate" valueType="object" required>
          <SelectOrAddDate com_id={investarget} />
        </BasicFormItem>
        : null }

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
      isUploading: false,
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState(
      { userId: null }, 
      () => this.setState({ userId: Number( newProps.params.id )}), 
    );
  }

  onMobileUploadComplete(status, record) {
    if(!status) return;
    this.addUserAttachment(record);
  }

  handleMobileUploadBtnClicked() {
    GModal.MobileUploader.upload && GModal.MobileUploader.upload(this.onMobileUploadComplete.bind(this));
  }

  handleFileChange = ({ file }) => {
    this.setState({ isUploading: true });
    if (file.status === 'done') {
      this.handleFileUploadDone(file)
    } 
  }

  handleFileUploadDone = file => {
    file.bucket = 'file'
    file.key = file.response.result.key
    file.url = file.response.result.url
    file.realfilekey = file.response.result.realfilekey;
    file.filename = file.name;
    this.addUserAttachment(file);
  }

  addUserAttachment = file => {
    const { bucket, key, filename } = file;
    api.addUserAttachment({ bucket, key, filename, user: this.state.userId })
      .then(result => {
        this.setState({ isUploading: false, hideUserInfo: true }, () => this.setState({ hideUserInfo: false }));
      })
  }

  render() {
    const { userId, isUploading } = this.state;
    return userId && (
      <LeftRightLayout location={this.props.location} title={i18n('menu.user_management')} name={i18n('user.user_detail')}>
        <UserRemarkList typeId={userId} />

        <h3 style={detailStyle}>{i18n('user.detail')}:          
          <Icon 
            type="plus" 
            style={{ cursor: 'pointer', padding: '4px', color: '#108ee9'}} 
            onClick={() => this.setState({ isShowForm: true })} 
          />
          
          <Upload
            action={baseUrl + '/service/qiniubigupload?bucket=file'}
            // accept={fileExtensions.join(',')}
            onChange={this.handleFileChange}
            // onRemove={this.handleFileRemoveConfirm}
            showUploadList={false}
          >
            <Button loading={isUploading} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传附件</Button>
          </Upload>

          <Button loading={isUploading} onClick={this.handleMobileUploadBtnClicked.bind(this)} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>手机上传附件</Button>

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
