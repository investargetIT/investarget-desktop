import React from 'react'

import { Row, Col, Tabs } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import UserInfo from '../components/UserInfo'
import TransactionInfo from '../components/TransactionInfo'

const TabPane = Tabs.TabPane

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
}

const Field = (props) => {
  return (
    <Row style={rowStyle}>
      <Col span={6}>{props.title}</Col>
      <Col span={18}>{props.value}</Col>
    </Row>
  )
}


class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const userId = Number(this.props.params.id)
    return (
      <LeftRightLayout location={location} title="用户详情">
        <Row gutter={48}>
          <Col span={12}>
            <UserInfo userId={userId} />
          </Col>
          <Col span={12}>            
            <TransactionInfo userId={userId} />
          </Col>
        </Row>
      </LeftRightLayout>
    )
  }
}

export default UserDetail
