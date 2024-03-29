import React from 'react'
import { 
  Row, 
  Col, 
  Tabs,
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
  hasPerm,
  getCurrentUser,
  requestAllData,
  customRequest,
} from '../utils/util';
import PropTypes from 'prop-types';
import { Modal as GModal } from '../components/GlobalComponents';
import * as api from '../api';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import {
  PlusOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';

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
 
  investEventFormRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      loadingAddEvent: false,
    };
  }

  handleSubmit = values => {
    this.setState({ loadingAddEvent: true });
    this.addEvent(values).catch(handleError).finally(() => this.setState({ loadingAddEvent: false }));
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

    const requestEvents = await requestAllData(api.getLibEvent, { com_id }, 100);
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

  handleTargetChange = () => this.investEventFormRef.current.setFieldsValue({ investDate: null });
 
  handleInvestFormValuesChange = (changedValue, allValues) => {
  }

  render() {

    const investarget = this.investEventFormRef.current && this.investEventFormRef.current.getFieldValue('investTarget');
    return (
      <Form ref={this.investEventFormRef} onFinish={this.handleSubmit} onValuesChange={this.handleInvestFormValuesChange}>

        <BasicFormItem label="投资项目" name="investTarget" required valueType="number">
          <SelectProjectLibrary />
        </BasicFormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const investarget = getFieldValue('investTarget');
            if (investarget !== undefined) {
              return (
                <BasicFormItem label="投资时间" name="investDate" valueType="object" required>
                  <SelectOrAddDate com_id={investarget} />
                </BasicFormItem>
              );
            }
          }}
        </FormItem>

        {/* { investarget !== undefined ?
        <BasicFormItem label="投资时间" name="investDate" valueType="object" required>
          <SelectOrAddDate com_id={investarget} />
        </BasicFormItem>
        : null } */}

        <FormItem style={{ marginLeft: 120 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={this.state.loadingAddEvent}
            // disabled={hasErrors(this.investEventFormRef.current && this.investEventFormRef.current.getFieldsError())}
          >确定</Button>
        </FormItem>

      </Form>
    );
  }
}

// UserInvestEventForm.childContextTypes = {
//   form: PropTypes.object
// };

// UserInvestEventForm = Form.create()(UserInvestEventForm);

function hasErrors(fieldsError) {
  if (!fieldsError) return true;
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: Number(this.props.match.params.id),
      isShowForm: false,
      hideUserInfo: false,
      isUploading: false,
      username: '',
      userIdWithSameName: null,
      allUserWithSameName: [],
      mergingModal: false,
      confirmMergeModal: false,
      mergeUserMessage: '',
      mainUserMobile: '',
      minorUserMobile: '',
      mainUserWeChat: '',
      minorUserWeChat: '',

      userRelation: [],
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.match.params.id !== this.props.match.params.id) {
      this.setState(
        {
          userId: Number(newProps.match.params.id),
          isShowForm: false,
          isUploading: false,
          username: '',
          mergingModal: false,
          mergeUserMessage: '',
          userIdWithSameName: null,
          hideUserInfo: true,
          mainUserMobile: '',
          minorUserMobile: '',
          mainUserWeChat: '',
          minorUserWeChat: '',
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

  // handleMobileUploadBtnClicked() {
  //   GModal.MobileUploader.upload && GModal.MobileUploader.upload(this.onMobileUploadComplete.bind(this));
  // }

  handleEditUserBtnClicked() {
    this.props.history.push(`/app/user/edit/${this.state.userId}`);
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

  handleMainUserGetWeChat = (wechat) => {
    this.setState({ mainUserWeChat: wechat });
  }

  handleMinorUserGetWeChat = (wechat) => {
    this.setState({ minorUserWeChat: wechat });
  }

  handleMinorUserGetMobile = (mobile) => {
    this.setState({ minorUserMobile: mobile });
  }

  handleSearchUserWithSameNameClick = async () => {
    const resUser = await api.getUser({ usernameC: this.state.username });
    const { count, data } = resUser.data;
    if (count > 1) {
      const userWithSameName = data.filter(f => f.id !== this.state.userId);
      this.setState({ userIdWithSameName: userWithSameName[0].id, allUserWithSameName: userWithSameName });
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
    this.deleteUserWeChat = this.state.minorUserWeChat;
    this.mergeUserWeChat = this.state.mainUserWeChat;
    if (!isMinorToMajor) {
      msg = '左边用户的相关信息将合并入右边的用户中';
      this.deleteUserId = this.state.userId;
      this.mergeUserId = this.state.userIdWithSameName;
      this.deleteUserMobile = this.state.mainUserMobile;
      this.mergeUserMobile = this.state.minorUserMobile;
      this.deleteUserWeChat = this.state.mainUserWeChat;
      this.mergeUserWeChat = this.state.minorUserWeChat;
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

    this.setState({ mergeUserMessage: '正在合并投资事件' });
    await this.mergeInvestEvent(deleteUserId, mergeUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并用户备注' });
    await this.mergeUserRemark(deleteUserId, mergeUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并用户附件' });
    await this.mergeUserAttachment(deleteUserId, mergeUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并交易师关系' });
    await this.mergeUserRelation(deleteUserId, mergeUserId);
    await sleep(1000);

    // this has to be done first, otherwise there will be an error
    // when calling next endpoint
    this.setState({ mergeUserMessage: '正在合并用户Dataroom' });
    await this.mergeUserDataroom(deleteUserId, mergeUserId);
    await sleep(1000);

    // Merge dataroom user first, then dataroom template
    this.setState({ mergeUserMessage: '正在合并Dataroom模版' });
    await this.mergeDataroomTemp(deleteUserId, mergeUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并项目BD' });
    await this.mergeProjectBd(deleteUserId, mergeUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并机构看板' });
    await this.mergeOrgBd(deleteUserId, mergeUserId);
    await sleep(1000);

    // this.setState({ mergeUserMessage: '正在合并会议BD' });
    // await this.mergeMeetingBd(deleteUserId, mergeUserId);
    // await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并用户项目' });
    await this.mergeUserProject(deleteUserId, mergeUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并承揽承做' });
    await this.mergeProjectTrader(deleteUserId, mergeUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '正在合并用户微信' });
    await this.mergeWeChat(deleteUserId, mergeUserId);
    await sleep(1000);

    await api.addUserRemark({
      user: mergeUserId,
      remark: `被合并的用户手机号为${this.deleteUserMobile}`,
    });

    this.setState({ mergeUserMessage: '正在删除用户' });
    await api.deleteUser(deleteUserId);
    await sleep(1000);

    this.setState({ mergeUserMessage: '合并用户已完成' });
    await sleep(1000);
    if (mergeUserId === this.state.userId) {
      this.setState(
        { mergingModal: false, mergeUserMessage: '', userIdWithSameName: null, hideUserInfo: true },
        () => this.setState({ hideUserInfo: false }),
      );
    } else {
      this.props.history.replace(`/app/user/${mergeUserId}`);
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
    const params1 = { bduser: deleteUserId };
    if (!hasPerm('BD.manageOrgBD')) {
      params1.manager = getCurrentUser();
    }
    const resCount = await api.getOrgBdList(params1);
    const { count } = resCount.data;
    if (count === 0) {
      return;
    }
    const params2 = {
      bduser: deleteUserId,
      page_size: count,
    };
    if (!hasPerm('BD.manageOrgBD')) {
      params2.manager = getCurrentUser();
    }
    const resData = await api.getOrgBdList(params2);
    const { data } = resData.data;
    // await Promise.all(data.map(m => api.modifyOrgBD(m.id, { bduser: mergeUserId })));
    for (let index = 0; index < data.length; index++) {
      const m = data[index];
      try {
        await api.modifyOrgBD(m.id, { bduser: mergeUserId });
      } catch (error) {
        await api.deleteOrgBD(m.id);
      }
    }
  }

  // mergeMeetingBd = async (deleteUserId, mergeUserId) => {
  //   const resCount = await api.getMeetingBdList({
  //     bduser: deleteUserId,
  //   });
  //   const { count } = resCount.data;
  //   if (count === 0) {
  //     return;
  //   }
  //   const resData = await api.getMeetingBdList({
  //     bduser: deleteUserId,
  //     page_size: count,
  //   });
  //   const { data } = resData.data;
  //   await Promise.all(data.map(m => api.modifyMeetingBD(m.id, { bduser: mergeUserId })));
  // }

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

  mergeWeChat = async (deleteUserId, mergeUserId) => {
    if (!this.mergeUserWeChat && !this.deleteUserWeChat) return;
    if (this.mergeUserWeChat && !this.deleteUserWeChat) return;
    if (!this.mergeUserWeChat && this.deleteUserWeChat) {
      await api.editUser([mergeUserId], { wechat: this.deleteUserWeChat });
    }
    if (this.mergeUserWeChat && this.deleteUserWeChat) {
      await api.addUserRemark({
        user: mergeUserId,
        remark: `被合并的用户微信为${this.deleteUserWeChat}`,
      });
    }
  }

  handleGetUserRelation = list => {
    this.setState({ userRelation: list });
  }

  isTrader = () => {
    const traderList = this.state.userRelation.map(m => m.traderuser && m.traderuser.id);
    return traderList.includes(getCurrentUser());
  }

  handleReloadSameNameUser = userID => {
    this.setState({ userIdWithSameName: null }, () => this.setState({ userIdWithSameName: userID }));
  }

  render() {
    const { userId, isUploading } = this.state;
    return userId && (
      <LeftRightLayout location={this.props.location} title={i18n('menu.Full_usermanager')} name={i18n('user.user_detail')}>
        {!this.state.hideUserInfo && <UserRemarkList typeId={userId} />}

        <h3 style={detailStyle}>{i18n('user.detail')}:          
          <PlusOutlined
            style={{ cursor: 'pointer', padding: '4px', color: '#108ee9'}} 
            onClick={() => this.setState({ isShowForm: true })} 
          />
          
          <Upload
            customRequest={customRequest}
            data={{ bucket: 'file' }}
            // accept={fileExtensions.join(',')}
            onChange={this.handleFileChange}
            // onRemove={this.handleFileRemoveConfirm}
            showUploadList={false}
          >
            <Button loading={isUploading} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传附件</Button>
          </Upload>

          {/* <Button loading={isUploading} onClick={this.handleMobileUploadBtnClicked.bind(this)} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>手机上传附件</Button> */}
          {hasPerm('usersys.admin_manageuser') && hasPerm('usersys.as_trader') && <Button style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }} onClick={this.handleSearchUserWithSameNameClick}>查询同名用户</Button>}
          {(hasPerm('usersys.admin_manageuser') || this.isTrader()) && <Button onClick={this.handleEditUserBtnClicked.bind(this)} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>编辑用户信息</Button>}
        </h3>

        <Row gutter={48}>
          <Col span={11}>
            {!this.state.hideUserInfo &&
              <div>
                <UserInfo userId={userId} onGetUsername={this.handleGetUsername} onGetMobile={this.handleMainUserGetMobile} onGetWeChat={this.handleMainUserGetWeChat} />
                {this.state.userIdWithSameName && <div style={{ marginLeft: 82 }}><TransactionInfo userId={userId} style={{ float: 'none' }} /></div>}
              </div>
            }
          </Col>

          {this.state.userIdWithSameName &&
            <Col span={2} style={{ marginTop: 100 }}>
              <div style={{ marginBottom: 20 }}>
                <Button onClick={() => this.handleMergeUser(false)} type="link">
                  <DoubleRightOutlined style={{ fontSize: 18 }} />
                </Button>
              </div>
              <div>
                <Button onClick={() => this.handleMergeUser(true)} type="link">
                  <DoubleLeftOutlined style={{ fontSize: 18 }} />
                </Button>
              </div>
            </Col>
          }

          <Col span={11}>
            { !this.state.userIdWithSameName && <TransactionInfo userId={userId} onGetUserRelations={this.handleGetUserRelation} /> }
            {/* { !this.state.userIdWithSameName && <Button type="primary" size="large" onClick={this.handleSearchUserWithSameNameClick}>查询同名用户</Button>} */}
            { this.state.userIdWithSameName && <UserInfo userWithSameName={this.state.allUserWithSameName} userId={this.state.userIdWithSameName} onGetMobile={this.handleMinorUserGetMobile} onGetWeChat={this.handleMinorUserGetWeChat} reloadSameNameUser={this.handleReloadSameNameUser} /> }
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
