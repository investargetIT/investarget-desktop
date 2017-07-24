import React from 'react'
import { Row, Col } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import TimelineRemarkList from '../components/TimelineRemarkList'

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
  fontSize: '13px',
  margin: 0,
}

const Field = (props) => {
  return (
    <Row style={rowStyle} gutter={24}>
      <Col span={6}>
        <div style={{textAlign: 'left'}}>{props.title}</div>
      </Col>
      <Col span={18}>
        <div>{props.value}</div>
      </Col>
    </Row>
  )
}

class TimelineDetail extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // get timeline
  }

  render() {
    const id = Number(this.props.params.id)
    return (
      <MainLayout location={location}>
        <PageTitle title="查看时间轴" />
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Field title="当前状态" value="" />
            <Field title="提醒周期" value="" />
            <Field title="创建日期" value="" />
          </div>
        </div>

        <TimelineRemarkList timelineId={id} readOnly />
      </MainLayout>
    )
  }
}



export default TimelineDetail
