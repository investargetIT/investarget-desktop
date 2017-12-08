import React from 'react'

import { Row, Col, Tabs } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import UserInfo from '../components/UserInfo'
import TransactionInfo from '../components/TransactionInfo'
import { UserRemarkList } from '../components/RemarkList'
import { i18n } from '../utils/util'

const TabPane = Tabs.TabPane

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
}
const detailStyle={
  marginTop:'64px',
  marginBottom:'24px'
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
      <LeftRightLayout location={this.props.location} title={i18n('menu.user_management')} name={i18n('user.user_detail')}>
        <UserRemarkList typeId={userId} />
        <h3 style={detailStyle}>{i18n('user.detail')}:</h3>
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
