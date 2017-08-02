import React from 'react'
import { connect } from 'dva'
import { Modal, Input, Button } from 'antd'
import { i18n } from '../utils/util'
import * as api from '../api'

const titleStyle = { marginBottom: '4px' }
const starStyle = {
  display: 'inline-block',
  marginRight: '4px',
  fontFamily: 'SimSun',
  lineHeight: 1,
  fontSize: '12px',
  color: '#f04134',
}


class CloseTimelineModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      id: null,
      reason: '',
    }
  }

  closeTimeline = (id) => {
    this.setState({ visible: true, id })
  }

  handleReasonChange = (e) => {
    this.setState({ reason: e.target.value })
  }

  handleConfirm = () => {
    const { id, reason } = this.state
    api.closeTimeline(id, reason).then(result => {
      // 结束理由，添加一条备注
      const data = { timeline: id, remark: reason }
      api.addTimelineRemark(data).then(result => {
        this.setState({ visible: false, id: null, reason: '' })
        this.props.afterClose()
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }, error => {
      this.setState({ visible: false, id: null, reason: '' })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleCancel = () => {
    this.setState({ visible: false, id: null, reason: '' })
  }

  render() {

    const { visible, reason } = this.state

    return (
      <Modal
        title="关闭时间轴"
        visible={visible}
        onOk={this.handleConfirm}
        onCancel={this.handleCancel}
        footer={[
          <Button key="cancel" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button key="confirm" size="large" type="primary" disabled={reason == ''} onClick={this.handleConfirm}>确定</Button>,
        ]}
      >
        <h3 style={titleStyle}><span style={starStyle}>*</span>结束理由：</h3>
        <div>
          <Input value={reason} onChange={this.handleReasonChange} />
        </div>
      </Modal>
    )
  }
}


export default connect()(CloseTimelineModal)
