import React from 'react'

import { Row, Col } from 'antd'


const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
  fontSize: '13px',
}

const Field = (props) => {
  return (
    <Row style={rowStyle} gutter={24}>
      <Col span={6}>
        <div style={{textAlign: 'right'}}>{props.title}</div>
      </Col>
      <Col span={18}>
        <div>{props.value}</div>
      </Col>
    </Row>
  )
}



class TransactionInfo extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    // this.props.data
    return (
      <div>
        <Field title="姓名" value="" />
        <Field title="公司" value="" />
        <Field title="职位" value="" />
        <Field title="标签" value="" />
        <Field title="国家" value="" />
        <Field title="手机号码" value="" />
        <Field title="邮箱" value="" />
        <Field title="分数" value="" />
      </div>
    )
  }
}

export default TransactionInfo
