import React from 'react'

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


class EditTimeline extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      transactionOptions: [],
    }
  }

  handleSubmit = (e) => {

  }

  handleCancel = () => {
    this.props.history.goBack()
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  componentDidMount() {
    // TODO
  }

  render() {
    const id = Number(this.props.params.id)
    return (
      <MainLayout location={location}>
        <PageTitle title="修改时间轴" />
        <div>
          <EditTimelineForm wrappedComponentRef={this.handleRef} data={this.state.data} transactionOptions={this.state.transactionOptions} />
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" size="large" onClick={this.handleSubmit}>提交</Button>
            <Button size="large" onClick={this.handleCancel}>返回</Button>
          </div>
        </div>

        <TimelineRemarkList timelineId={id} />
      </MainLayout>
    )
  }
}

export default EditTimeline
