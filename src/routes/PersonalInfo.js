import React, { useState, useEffect } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Breadcrumb } from 'antd';
import { Link } from 'dva/router';

function PersonalInfo(props) {
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
    </LeftRightLayoutPure>
  )
}

export default connect()(PersonalInfo);
