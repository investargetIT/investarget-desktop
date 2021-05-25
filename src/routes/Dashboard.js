import React from 'react';
import { Breadcrumb, Card, Row, Col } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';

export default function Dashboard(props) {
    return (
      <LeftRightLayoutPure location={props.location}>

        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>工作台</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ height: 80, backgroundColor: 'red', marginTop: 20, marginBottom: 30 }}></div>

        <Card title="进行中的项目" extra={<a href="#">全部项目</a>}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>

        <div className="site-card-wrapper" style={{ margin: '20px 0' }}>
          <Row gutter={20}>

            <Col span={16} style={{ height: 300 }}>
              <Card title="项目BD" extra={<a href="#">全部项目</a>}>
                <div style={{ height: 300 }}>Content</div>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="市场消息" style={{ marginBottom: 20 }} extra={<a href="#">查看更多</a>}>
                <div style={{ height: 100 }}>Card content</div>
              </Card>
              <Card title="公司培训文件" extra={<a href="#">全部文件</a>}>
                <div style={{ height: 73 }}>Card content</div>
              </Card>
            </Col>

          </Row>
        </div>

        <Card title="工作日程">
          <div style={{ height: 500 }}>Content</div>
        </Card>

      </LeftRightLayoutPure>
    );
}
