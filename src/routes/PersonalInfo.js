import React, { useState, useEffect } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Breadcrumb, Card, Tabs } from 'antd';
import { Link } from 'dva/router';

const { TabPane } = Tabs;

function PersonalInfo(props) {

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
            Content of Tab Pane 1
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
