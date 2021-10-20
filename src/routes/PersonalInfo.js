import React, { useState, useEffect } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Breadcrumb, Card, Tabs, Form, Input, Button, DatePicker, Upload, message } from 'antd';
import { Link } from 'dva/router';
import { CloudUploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getUserInfo, i18n } from '../utils/util';
import * as api from '../api';
import { routerRedux } from 'dva/router';
import { SelectEducation } from '../components/ExtraInput';
import moment from 'moment';
import { baseUrl } from '../utils/request';
import { UploadFile } from '../components/Upload';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

function PersonalInfo(props) {

  const userInfo = getUserInfo();
  const [form] = Form.useForm();

  const [loadingUpdateUserInfo, setLoadingUpdateUserInfo] = useState(false);

  const uploadProps = {
    name: 'file',
    action: userInfo.photoKey ? baseUrl + "/service/qiniucoverupload?bucket=image&key=" + userInfo.photoKey : baseUrl + "/service/qiniubigupload?bucket=image",
    showUploadList: { showRemoveIcon: false },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        onUploaded(info.file.response.result);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  function onUploaded(result) {
    const { key } = result;
    api.editUser([props.currentUser.id], { photoBucket: 'image', photoKey: key }).then(data => {
      const photoKey = data.data[0].photoKey;
      const photourl = data.data[0].photourl;
      const photoBucket = data.data[0].photoBucket;
      const userInfo = { ...props.currentUser, photoKey, photourl, photoBucket };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      props.dispatch({
        type: 'currentUser/save',
        userInfo,
      });
    }, error => {
      props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    });
  }

  function handleValuesChange(values) {
    console.log('values change', values);
  }

  function callback(key) {
    console.log(key);
  }

  const onFinish = values => {
    console.log('Received values of form:', values);
  };

  function handlePersonalInfoFormOnFinish(values) {
    let { bornTime } = values;
    if (bornTime) {
      bornTime = bornTime.format('YYYY-MM-DDT00:00:00');
    }
    const params = { ...values, bornTime };
    setLoadingUpdateUserInfo(true);
    api.editUser([props.currentUser.id], params).then(data => {
      setLoadingUpdateUserInfo(false);
      const username = data.data[0].username;
      const bornTime = data.data[0].bornTime;
      const school = data.data[0].school;
      const education = data.data[0].education;
      const specialty = data.data[0].specialty;
      const specialtyhobby = data.data[0].specialtyhobby;
      const remark = data.data[0].remark;
      const userInfo = { ...props.currentUser, username, bornTime, school, education, specialty, specialtyhobby, remark };
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      props.dispatch({
        type: 'currentUser/save',
        userInfo,
      })
      message.success(i18n('personal_info.message.update_success'))

      let url = '/app';
      if (!getUserInfo().is_superuser && hasPerm('usersys.as_investor')) {
        url = '/app/dataroom/project/list';
      }
      props.dispatch(routerRedux.replace(url));

    }, error => {
      setLoadingUpdateUserInfo(false);
      props.dispatch({
        type: 'app/findError',
        payload: error
      });
    });
  }

  function handleUploaded(response) {
    // this.setState({ avatarUrl: response.url })
    // editUser([this.props.currentUser.id], { photoBucket: 'image', photoKey: response.key }).then(data => {
    //   const photoKey = data.data[0].photoKey
    //   const photourl = data.data[0].photourl
    //   const photoBucket = data.data[0].photoBucket
    //   const userInfo = { ...this.props.currentUser, photoKey, photourl, photoBucket }
    //   localStorage.setItem('user_info', JSON.stringify(userInfo))
    //   this.props.dispatch({
    //     type: 'currentUser/save',
    //     userInfo
    //   })
    // }, error => {
    //   this.props.dispatch({
    //     type: 'app/findError',
    //     payload: error
    //   })
    // })
  }

  function  getInitialValuesFromCurrentUser() {
    const { username, bornTime: bornTimeStr, school, education, specialty, specialtyhobby, remark } = userInfo;
    const bornTime = moment(bornTimeStr);
    return { username, bornTime, school, education, specialty, specialtyhobby, remark };
  }

  function handleFinishUploadResume(key) {
    api.editUser([props.currentUser.id], { resumeBucket: 'file', resumeKey: key }).then(data => {
      const resumeKey = data.data[0].resumeKey;
      const resumeurl = data.data[0].resumeurl;
      const resumeBucket = data.data[0].resumeBucket;
      const userInfo = { ...props.currentUser, resumeKey, resumeurl, resumeBucket };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      props.dispatch({
        type: 'currentUser/save',
        userInfo,
      });
    }, error => {
      props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    });
  }

	return (
    <LeftRightLayoutPure location={props.location}>
      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>用户中心</Breadcrumb.Item>
        <Breadcrumb.Item>个人设置</Breadcrumb.Item>
      </Breadcrumb>

      <Card bodyStyle={{ padding: '20px 0' }}>
        <Tabs className="tabs-personal-info" defaultActiveKey="1" onChange={callback} tabPosition="left" tabBarStyle={{ width: 240 }}>
          <TabPane tab="基本设置" key="1">
            <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>基本设置</div>
            <div style={{ display: 'flex' }}>
              <Form
                style={{ width: 320, marginRight: 80 }}
                form={form}
                layout="vertical"
                initialValues={{}}
                onValuesChange={handleValuesChange}
                onFinish={handlePersonalInfoFormOnFinish}
                initialValues={getInitialValuesFromCurrentUser()}
              >
                <Form.Item label="姓名" name="username">
                  <Input placeholder="请输入姓名" />
                </Form.Item>
                <Form.Item label="出生日期" name="bornTime">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="毕业学校" name="school">
                  <Input placeholder="请输入毕业学校" />
                </Form.Item>
                <Form.Item label="学历" name="education">
                  <SelectEducation size="middle" placeholder="请选择学历" />
                </Form.Item>
                <Form.Item label="专业" name="specialty">
                  <Input placeholder="请输入专业" />
                </Form.Item>
                <Form.Item label="特长爱好" name="specialtyhobby">
                  <TextArea placeholder="请输入特长爱好" rows={4} />
                </Form.Item>
                <Form.Item label="其他" name="remark">
                  <TextArea placeholder="请输入" rows={4} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loadingUpdateUserInfo}>更新基本信息</Button>
                </Form.Item>
              </Form>
              <Upload {...uploadProps}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div>头像</div>
                  {props.currentUser.photourl && <img src={props.currentUser.photourl} alt="avatar" style={{ marginTop: 8, marginBottom: 20, width: 152, height: 152, borderRadius: '50%' }} />}
                  <div style={{ textAlign: 'center' }}><Button icon={<CloudUploadOutlined />}>上传图片</Button></div>
                </div>
              </Upload>
            </div>
          </TabPane>
          <TabPane tab="工作经历" key="2">
          <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>工作经历</div>
            <UploadFile name="上传简历" onChange={handleFinishUploadResume} />
            {/* <Form
              name="dynamic_form_item"
              layout="vertical"
              style={{ width: 320, marginRight: 80 }}
              onFinish={onFinish}
            >
              <Form.List
                name="names"
                initialValue={[{ fieldKey: 0, isListField: true, key: 0, name: 0 }]}
              >
                {(fields, { add, remove }, { errors }) => {
                  return (
                    <div>
                      {fields.map((field, index) => (
                        <Form.Item
                          key={field.key}
                        >
                          <Form.Item label="起止时间" name="duration">
                            <RangePicker style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="工作单位" name="company">
                            <Input placeholder="请输入工作单位" />
                          </Form.Item>
                          <Form.Item label="职位" name="title">
                            <Input placeholder="请输入职位" />
                          </Form.Item>
                          <Form.Item label="主要职责" name="responsibility">
                            <TextArea placeholder="请输入主要职责" rows={4} />
                          </Form.Item>
                          <Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Button
                                type="link"
                                onClick={add}
                                icon={<PlusOutlined />}
                              >
                                新增记录
                              </Button>
                              {fields.length > 1 &&
                                <Button
                                  type="link"
                                  onClick={() => remove(field.name)}
                                  icon={<DeleteOutlined />}
                                >
                                  删除
                                </Button>
                              }
                            </div>
                          </Form.Item>
                        </Form.Item>
                      ))}
                    </div>
                  );
                }}
              </Form.List>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存 
                </Button>
              </Form.Item>
            </Form> */}

          </TabPane>
        </Tabs>
      </Card>
    </LeftRightLayoutPure>
  )
}

function mapStateToProps(state) {
  const { currentUser } = state;
  return { currentUser };
}
export default connect(mapStateToProps)(PersonalInfo);
