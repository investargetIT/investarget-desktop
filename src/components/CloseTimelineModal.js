import React from 'react'
import { Modal, Input } from 'antd'
import { i18n, showError } from '../utils/util'
import * as api from '../api'

const titleStyle = { marginBottom: '4px' }


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
      this.setState({ visible: false, id: null, reason: '' })
    }, error => {
      this.setState({ visible: false, id: null, reason: '' })
      showError(error.message)
    })
  }

  handleCancel = () => {
    this.setState({ visible: false, id: null, reason: '' })
  }

  render() {

    const { visible, reason } = this.state

    return (
      <Modal title="关闭时间轴" visible={visible} onOk={this.handleConfirm} onCancel={this.handleCancel}>
        <h3 style={titleStyle}>结束理由：</h3>
        <div>
          <Input value={reason} onChange={this.handleReasonChange} />
        </div>
      </Modal>
    )
  }
}


export default CloseTimelineModal
