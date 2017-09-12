import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { i18n, time } from '../utils/util'
import { Row, Col } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { TimelineRemarkList } from '../components/RemarkList'

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
    this.state = {
      status: '',
      alertCycle: 0,
      createdTime: '',
    }
  }

  componentDidMount() {
    // get timeline
    const id = Number(this.props.params.id)
    api.getTimelineDetail(id).then(result => {
      const data = result.data.transationStatu
      const status = data.transationStatus.name
      const alertCycle = data.alertCycle
      let createdTime = new Date(data.inDate)
      createdTime = time(createdTime)
      this.setState({ status, alertCycle, createdTime })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const id = Number(this.props.params.id)
    const { status, alertCycle, createdTime } = this.state

    return (
      <MainLayout location={this.props.location}>
        <PageTitle title={i18n('timeline.timeline_detail')} />
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Field title={i18n('timeline.status')} value={status} />
            <Field title={i18n('timeline.alert_cycle')} value={alertCycle} />
            <Field title={i18n('timeline.expire_time')} value={createdTime} />
          </div>
        </div>

        <TimelineRemarkList typeId={id} readOnly />
      </MainLayout>
    )
  }
}



export default connect()(TimelineDetail)
