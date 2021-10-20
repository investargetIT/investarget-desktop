import React, { useState, useEffect } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Breadcrumb, Card, Tabs, Form, Input, Button, DatePicker, Upload, message } from 'antd';
import { Link } from 'dva/router';
import { CloudUploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getUserInfo } from '../utils/util';
import * as api from '../api';
import { routerRedux } from 'dva/router';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

function PersonalInfo(props) {

  const userInfo = getUserInfo();
  window.echo('user info', userInfo);
  const [form] = Form.useForm();

  const uploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  function handleValuesChange(values) {
    window.echo('values change', values);
  }

  function callback(key) {
    console.log(key);
  }

  const onFinish = values => {
    console.log('Received values of form:', values);
  };

  function handlePersonalInfoFormOnFinish(values) {
    window.echo('finish for', values);
    let { bornTime } = values;
    if (bornTime) {
      bornTime = bornTime.format('YYYY-MM-DD');
    }
    const params = { ...values, bornTime };
    window.echo('params', params);

    api.editUser([props.currentUser.id], params).then(data => {
      // const tags = data.data[0].tags
      // const card = data.data[0].cardKey
      // const page = data.data[0].page;
      const userInfo = { ...props.currentUser, ...params };
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      this.props.dispatch({
        type: 'currentUser/save',
        userInfo
      })
      message.success(i18n('personal_info.message.update_success'))

      let url = '/app';
      if (!getUserInfo().is_superuser && hasPerm('usersys.as_investor')) {
        url = '/app/dataroom/project/list';
      }
      props.dispatch(routerRedux.replace(url));

    }, error => {
      props.dispatch({
        type: 'app/findError',
        payload: error
      });
    });
  }

  function  getInitialValuesFromCurrentUser() {

  }

	return (
    <LeftRightLayoutPure location={props.location}>
      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/app/personal-center">用户中心</Link>
        </Breadcrumb.Item>
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
                  <Input placeholder="请输入学历" />
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
                  <Button type="primary" htmlType="submit">更新基本信息</Button>
                </Form.Item>
              </Form>
              <div>
                <Upload {...uploadProps}>
                  <Button icon={<CloudUploadOutlined />}>上传图片</Button>
                </Upload>
              </div>
            </div>
          </TabPane>
          <TabPane tab="工作经历" key="2">
          <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>工作经历</div>
            <Form
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
            </Form>

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
