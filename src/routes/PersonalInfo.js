import React, { useState, useEffect } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Breadcrumb, Card, Tabs, Form, Input, Button, DatePicker } from 'antd';
import { Link } from 'dva/router';
import { InfoCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

function PersonalInfo(props) {

  const [form] = Form.useForm();

  function handleValuesChange(values) {
    window.echo('values change', values);
  }

  function callback(key) {
    console.log(key);
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
              >
                <Form.Item label="姓名" name="username">
                  <Input placeholder="请输入姓名" />
                </Form.Item>
                <Form.Item label="出生日期" name="birthday">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="毕业学校" name="education">
                  <Input placeholder="请输入毕业学校" />
                </Form.Item>
                <Form.Item label="学历" name="degree">
                  <Input placeholder="请输入学历" />
                </Form.Item>
                <Form.Item label="专业" name="major">
                  <Input placeholder="请输入专业" />
                </Form.Item>
                <Form.Item label="特长爱好" name="hobby">
                  <TextArea placeholder="请输入特长爱好" rows={4} />
                </Form.Item>
                <Form.Item label="其他" name="others">
                  <TextArea placeholder="请输入" rows={4} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary">更新基本信息</Button>
                </Form.Item>
              </Form>
              <div>Right</div>
            </div>
          </TabPane>
          <TabPane tab="工作经历" key="2">
            Content of Tab Pane 2
          </TabPane>
        </Tabs>
      </Card>
    </LeftRightLayoutPure>
  )
}

export default connect()(PersonalInfo);
