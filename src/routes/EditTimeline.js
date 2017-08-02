import React from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import * as api from '../api'
import { Form, Button, InputNumber } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import TimelineForm from '../components/TimelineForm'
import TimelineRemarkList from '../components/TimelineRemarkList'


function onValuesChange(props, values) {
  console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const EditTimelineForm = Form.create({ onValuesChange, mapPropsToFields })(TimelineForm)


function toFormData(data) {
  var formData = {}
  for (let prop in data) {
    formData[prop] = { 'value': data[prop] }
  }
  return formData
}


class EditTimeline extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      transactionOptions: [],
    }
  }

  handleSubmit = (e) => {
    this.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { cycle, status, transaction } = values
        const id = this.props.params.id
        const params = {
          timelinedata: { trader: transaction },
          statusdata: { alertCycle: cycle, transationStatus: status },
        }
        api.editTimeline(id, params).then(result => {
          this.props.router.goBack()
        }, error => {
          this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
        })
      }
    })
  }

  handleCancel = () => {
    this.props.history.goBack()
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form
    }
  }

  componentDidMount() {
    const id = Number(this.props.params.id)
    api.getTimelineDetail(id).then(result => {
      const data = result.data
      const investor = data.investor
      const transaction = data.trader
      const status = data.transationStatu.transationStatus.id
      const cycle = data.transationStatu.alertCycle

      api.getUserRelation({ investoruser: investor }).then(result => {
        const data = result.data.data
        const options = data.map(item => {
          return { value: item.traderuser.id, label: item.traderuser.username }
        })
        this.setState({ transactionOptions: options })
        this.setState({
          data: { status, cycle, transaction }
        })
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error,
        })
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })


  }

  render() {
    const id = Number(this.props.params.id)
    const data = toFormData(this.state.data)

    return (
      <MainLayout location={location}>
        <PageTitle title="修改时间轴" />
        <div>
          <EditTimelineForm wrappedComponentRef={this.handleRef} data={data} transactionOptions={this.state.transactionOptions} />
          <div style={{ textAlign: 'center' }}>
            <Button style={{ margin: '0 8px' }} type="primary" size="large" onClick={this.handleSubmit}>提交</Button>
            <Button style={{ margin: '0 8px' }} size="large" onClick={this.handleCancel}>返回</Button>
          </div>
        </div>

        <TimelineRemarkList timelineId={id} />
      </MainLayout>
    )
  }
}

export default connect()(withRouter(EditTimeline))
