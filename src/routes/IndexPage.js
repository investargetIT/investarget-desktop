import React from 'react'
import { connect } from 'dva'
import MainLayout from '../components/MainLayout'
import { Card, Col } from 'antd'

function IndexPage({ location }) {
  return (
    <MainLayout location={location} style={{}}>
      <Col span={16}>
        <Card title="Card title 1" bordered={false} style={{ margin: '10px 0 0 10px' }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
          <p>Catdd dsfdff</p>
        </Card>
        <Card title="Card title 2" bordered={false} style={{ margin: '10px 0 0 10px' }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card title="Card title 3" bordered={false} style={{ margin: '10px 0 0 10px' }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Card title 4" bordered={false} style={{ margin: '10px 0 0 10px' }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card title="Card title 5" bordered={false} style={{ margin: '10px 0 0 10px' }}>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card title="Card title 6" bordered={false} style={{ margin: '10px 0 0 10px' }}>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
      </Col>

    </MainLayout>
  )
}

export default connect()(IndexPage)
