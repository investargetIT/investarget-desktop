import React from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Breadcrumb, Row, Col, Card } from 'antd';

function PersonalCenter(props) {
  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>用户中心</Breadcrumb.Item>
        <Breadcrumb.Item>个人中心</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 280, marginRight: 20 }}>
          <Card bodyStyle={{ padding: '40px 60px' }}>
            <div style={{ textAlign: 'center' }}>
              <img style={{ width: 100, height: 100, borderRadius: '50%' }} src="/images/avatar1.png" />
            </div>
            <div style={{ marginTop: 12, fontSize: 20, textAlign: 'center', lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>Vincent Chen</div>
            <div style={{ marginTop: 20, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>职位：</span>高级投资经理</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门：</span>战略投资</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门主管：</span>Eric Shen</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>直属上级：</span>Amy Zhao</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>入职日期：</span>2020.10.01</div>
          </Card>
        </div>
        <div style={{ flex: 1 }}>
          <Card>cc</Card>
        </div>
      </div>

    </LeftRightLayoutPure>
  );
}



export default connect()(PersonalCenter);
