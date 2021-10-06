import React, { useState, useEffect } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Breadcrumb, Card, Tabs, Form, Input, Button, Radio } from 'antd';
import { Link } from 'dva/router';
import { InfoCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

function PersonalInfo(props) {

  const [form] = Form.useForm();
  const [requiredMark, setRequiredMarkType] = useState('optional');

  const onRequiredTypeChange = ({ requiredMarkValue }) => {
    setRequiredMarkType(requiredMarkValue);
  };

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
            <Form
              form={form}
              layout="vertical"
              initialValues={{ requiredMarkValue: requiredMark }}
              onValuesChange={onRequiredTypeChange}
              requiredMark={requiredMark}
            >
              <Form.Item label="Required Mark" name="requiredMarkValue">
                <Radio.Group>
                  <Radio.Button value="optional">Optional</Radio.Button>
                  <Radio.Button value>Required</Radio.Button>
                  <Radio.Button value={false}>Hidden</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Field A" required tooltip="This is a required field">
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                label="Field B"
                tooltip={{ title: 'Tooltip with customize icon', icon: <InfoCircleOutlined /> }}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Submit</Button>
              </Form.Item>
            </Form>
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
