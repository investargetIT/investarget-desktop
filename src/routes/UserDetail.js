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
  sleep,
} from '../utils/util';
import PropTypes from 'prop-types';
import { baseUrl } from '../utils/request';
import { Modal as GModal } from '../components/GlobalComponents';
import * as api from '../api';
import { connect } from 'dva';
import { withRouter } from 'dva/router';

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
      username: '',
      userIdWithSameName: null,
      mergingModal: false,
      confirmMergeModal: false,
      mergeUserMessage: '',
      mainUserMobile: '',
      minorUserMobile: '',
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.params.id !== this.props.params.id) {
      this.setState(
        {
          userId: Number(newProps.params.id),
          isShowForm: false,
          isUploading: false,
          username: '',
          mergingModal: false,
          mergeUserMessage: '',
          userIdWithSameName: null,
          hideUserInfo: true,
          mainUserMobile: '',
          minorUserMobile: '',
        },
        () => {
          this.setState({ hideUserInfo: false });
        },
      );
    }
  }

  onMobileUploadComplete(status, records) {
    if(!status) return;
    this.addUserAttachments(records);
  }

  addUserAttachments = files => {
    const requests = files.map(file =>{
      const { bucket, key, filename } = file;
      return api.addUserAttachment({ bucket, key, filename, user: this.state.userId });
    });
    Promise.all(requests)
      .then(() => {
        this.setState({ isUploading: false, hideUserInfo: true }, () => this.setState({ hideUserInfo: false }));
      });
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

  handleGetUsername = (username) => {
    this.setState({ username });
  }

  handleMainUserGetMobile = (mobile) => {
    this.setState({ mainUserMobile: mobile });
  }

  handleMinorUserGetMobile = (mobile) => {
    this.setState({ minorUserMobile: mobile });
  }

  handleSearchUserWithSameNameClick = async () => {
    const resUser = await api.getUser({ usernameC: this.state.username });
    const { count, data } = resUser.data;
    if (count > 1) {
      const userWithSameName = data.filter(f => f.id !== this.state.userId);
      this.setState({ userIdWithSameName: userWithSameName[0].id });
    } else {
      Modal.warning({ title: '未查到同名用户' });
    }
  }

  handleMergeUser = (isMinorToMajor) => {
    let msg = '右边用户的相关信息将合并入左边的用户中';
    this.deleteUserId = this.state.userIdWithSameName;
    this.mergeUserId = this.state.userId;
    this.deleteUserMobile = this.state.minorUserMobile;
    this.mergeUserMobile = this.state.mainUserMobile;
    if (!isMinorToMajor) {
      msg = '左边用户的相关信息将合并入右边的用户中';
      this.deleteUserId = this.state.userId;
      this.mergeUserId = this.state.userIdWithSameName;
      this.deleteUserMobile = this.state.mainUserMobile;
      this.mergeUserMobile = this.state.minorUserMobile;
    }
    // this.confirmModal = Modal.confirm({
    //   title: '是否确定合并用户？',
    //   content: msg,
    //   onOk: () => this.handleConfirmMergeUser(deleteUserId, mergeUserId),
    // });
    this.setState({ confirmMergeModal: true, mergeUserMessage: msg });
  }

  handleConfirmMerge = () => {
    this.handleConfirmMergeUser(this.deleteUserId, this.mergeUserId).catch(handleError);
  }

  handleConfirmMergeUser = async (deleteUserId, mergeUserId) => {
    // this.confirmModal.destroy();
    this.setState({ confirmMergeModal: false, mergingModal: true, mergeUserMessage: '开始合并用户' });
    await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并投资事件' });
    // await this.mergeInvestEvent(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并用户备注' });
    // await this.mergeUserRemark(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并用户附件' });
    // await this.mergeUserAttachment(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并交易师关系' });
    // await this.mergeUserRelation(deleteUserId, mergeUserId);
    // await sleep(1000);

    // // this has to be done first, otherwise there will be an error
    // // when calling next endpoint
    // this.setState({ mergeUserMessage: '正在合并用户Dataroom' });
    // await this.mergeUserDataroom(deleteUserId, mergeUserId);
    // await sleep(1000);

    // // Merge dataroom user first, then dataroom template
    // this.setState({ mergeUserMessage: '正在合并Dataroom模版' });
    // await this.mergeDataroomTemp(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并项目BD' });
    // await this.mergeProjectBd(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并机构BD' });
    // await this.mergeOrgBd(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并会议BD' });
    // await this.mergeMeetingBd(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并用户项目' });
    // await this.mergeUserProject(deleteUserId, mergeUserId);
    // await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并承揽承做' });
    // await this.mergeProjectTrader(deleteUserId, mergeUserId);
    // await sleep(1000);

    await api.addUserRemark({
      user: mergeUserId,
      remark: `被合并的用户手机号为${this.deleteUserMobile}`,
    });

    // this.setState({ mergeUserMessage: '正在删除用户' });
    // await api.deleteUser(deleteUserId);
    // await sleep(1000);

    this.setState({ mergeUserMessage: '合并用户已完成' });
    await sleep(1000);
    if (mergeUserId === this.state.userId) {
      this.setState(
        { mergingModal: false, mergeUserMessage: '', userIdWithSameName: null, hideUserInfo: true },
        () => this.setState({ hideUserInfo: false }),
      );
    } else {
      this.props.router.replace(`/app/user/${mergeUserId}`);
    }
  }

  mergeInvestEvent = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getUserInvestEvent({
      user: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getUserInvestEvent({
      user: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editUserInvestEvent(m.id, { user: mergeUserId })));
  }

  mergeUserRemark = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getUserRemark({
      user: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getUserRemark({
      user: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editUserRemark(m.id, { user: mergeUserId })));
  }

  mergeUserAttachment = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getUserAttachment({
      user: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getUserAttachment({
      user: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editUserAttachment(m.id, { user: mergeUserId })));
  }

  mergeUserRelation = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getUserRelation({
      investoruser: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getUserRelation({
      investoruser: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    for (let index = 0; index < data.length; index++) {
      const m = data[index];
      try {
        await api.editUserRelation([{ ...m, investoruser: mergeUserId, traderuser: m.traderuser.id }]);
      } catch (error) {
        await api.deleteUserRelation([m.id]);
      }
    }
  }

  mergeUserDataroom = async (deleteUserId, mergeUserId) => {
    const resCount = await api.queryUserDataRoom({
      user: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.queryUserDataRoom({
      user: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editUserDataRoom(m.id, { user: mergeUserId })));
  }

  mergeDataroomTemp = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getDataroomTemp({
      user: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getDataroomTemp({
      user: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editDataroomTemp(m.id, { user: mergeUserId })));
  }

  mergeProjectBd = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getProjBDList({
      bduser: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getProjBDList({
      bduser: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editProjBD(m.id, { bduser: mergeUserId })));
  }

  mergeOrgBd = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getOrgBdList({
      bduser: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getOrgBdList({
      bduser: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.modifyOrgBD(m.id, { bduser: mergeUserId })));
  }

  mergeMeetingBd = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getMeetingBdList({
      bduser: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getMeetingBdList({
      bduser: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.modifyMeetingBD(m.id, { bduser: mergeUserId })));
  }

  mergeUserProject = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getProj({
      supportUser: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getProj({
      supportUser: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editProj(m.id, { supportUser: mergeUserId })));
  }

  mergeProjectTrader = async (deleteUserId, mergeUserId) => {
    const resCount = await api.getProjectTraders({
      user: deleteUserId,
    });
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const resData = await api.getProjectTraders({
      user: deleteUserId,
      page_size: count,
    });
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editProjectTrader(m.id, { user: mergeUserId })));
  }

  render() {
    const { userId, isUploading } = this.state;
    return userId && (
      <LeftRightLayout location={this.props.location} title={i18n('menu.user_management')} name={i18n('user.user_detail')}>
        {!this.state.hideUserInfo && <UserRemarkList typeId={userId} />}

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
          <Button style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }} onClick={this.handleSearchUserWithSameNameClick}>查询同名用户</Button>
        </h3>

        <Row gutter={48}>
          <Col span={11}>
            {!this.state.hideUserInfo &&
              <div>
                <UserInfo userId={userId} onGetUsername={this.handleGetUsername} onGetMobile={this.handleMainUserGetMobile} />
                {this.state.userIdWithSameName && <div style={{ marginLeft: 82 }}><TransactionInfo userId={userId} style={{ float: 'none' }} /></div>}
              </div>
            }
          </Col>

          {this.state.userIdWithSameName &&
            <Col span={2} style={{ marginTop: 100 }}>
              <div style={{ marginBottom: 20 }} onClick={() => this.handleMergeUser(false)}><Icon type="double-right" style={{ fontSize: 18, cursor: 'pointer' }} /></div>
              <div onClick={() => this.handleMergeUser(true)}><Icon type="double-left" style={{ fontSize: 18, cursor: 'pointer' }} /></div>
            </Col>
          }

          <Col span={11}>
            { !this.state.userIdWithSameName && <TransactionInfo userId={userId} /> }
            {/* { !this.state.userIdWithSameName && <Button type="primary" size="large" onClick={this.handleSearchUserWithSameNameClick}>查询同名用户</Button>} */}
            { this.state.userIdWithSameName && <UserInfo userId={this.state.userIdWithSameName} onGetMobile={this.handleMinorUserGetMobile} /> }
            { this.state.userIdWithSameName && <div style={{ marginLeft: 82 }}><TransactionInfo userId={this.state.userIdWithSameName} style={{ float: 'none' }} /></div> }
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

        {(this.state.confirmMergeModal || this.state.mergingModal) &&
          <Modal
            title={this.state.confirmMergeModal ? '是否确定合并用户？' : '正在合并用户'}
            visible
            maskClosable={false}
            closable={false}
            footer={[
              <Button key="back" size="large" disabled={this.state.mergingModal} onClick={() => this.setState({ confirmMergeModal: false })}>取消</Button>,
              <Button key="submit" type="primary" size="large" loading={this.state.mergingModal} onClick={this.handleConfirmMerge}>
                {this.state.confirmMergeModal ? '确定' : '合并中'}
              </Button>,
            ]}
          >
            <p>{this.state.mergeUserMessage}</p>
          </Modal>
        }

      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(UserDetail));
