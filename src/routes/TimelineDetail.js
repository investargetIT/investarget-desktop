import React from 'react'
import { injectIntl, intlShape } from 'react-intl'
import * as api from '../api'
import { showError } from '../utils/util'
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

  static propTypes = {
    intl: intlShape.isRequired,
  }

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
    const { formatDate, formatTime } = this.props.intl
    api.getTimelineDetail(id).then(result => {
      const data = result.data.transationStatu
      const status = data.transationStatus.name
      const alertCycle = data.alertCycle
      let createdTime = new Date(data.inDate)
      createdTime = formatDate(createdTime) + ' ' + formatTime(createdTime)
      this.setState({ status, alertCycle, createdTime })
    }, error => {
      showError(error.message)
    })
  }

  render() {
    const id = Number(this.props.params.id)
    const { status, alertCycle, createdTime } = this.state

    return (
      <MainLayout location={location}>
        <PageTitle title="查看时间轴" />
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Field title="当前状态" value={status} />
            <Field title="提醒周期" value={alertCycle} />
            <Field title="创建日期" value={createdTime} />
          </div>
        </div>

        <TimelineRemarkList timelineId={id} readOnly />
      </MainLayout>
    )
  }
}



export default injectIntl(TimelineDetail)
