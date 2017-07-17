import React from 'react'
import { Modal } from 'antd'
import { SelectProjectStatus } from './ExtraInput'


class AuditProjectModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      id: null,
      status: null,
    }
  }

  setData = (id, status) => {
    this.setState({ visible: true, id, status })
  }

  handleOk = () => {
    const { id, status } = this.state
    api.editProj(id, { projstatus: status }).then(result => {
      this.props.afterAudit()
      this.setState({ visible: false, id: null, status: null })
    }, error => {
      this.setState({ visible: false, id: null, status: null })
      Modal.error({ title: '错误', content: error.message })
    })
  }

  handleCancel = () => {
    this.setState({ visible: false, id: null, status: null })
  }

  handleStatusChange = (status) => {
    this.setState({ status })
  }

  render() {
    return (
      <Modal title="修改项目状态" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <div style={{width: '60%', display: 'flex', alignItems: 'center', margin: '0 auto'}}>
          <span style={{marginRight: '8px'}}>项目状态：</span>
          <SelectProjectStatus style={{flexGrow: '1'}} value={this.state.status} onChange={this.handleStatusChange} />
        </div>
      </Modal>
    )
  }

}


export default AuditProjectModal
