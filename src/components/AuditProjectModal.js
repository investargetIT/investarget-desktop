import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import { Modal, Select, Checkbox } from 'antd'
const Option = Select.Option



class SelectProjectStatus extends React.Component {
  constructor(props) {
    super(props)
  }

  handleChange = (value) => {
    this.props.onChange(Number(value))
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['projstatus'] })
  }

  render() {
    const {options, children, dispatch, status, value, onChange, ...extraProps} = this.props
    let _options = []

    if (status < 4) {
      _options = options.filter(item => item.value <= status + 1)
    } else {
      _options = options
    }

    return (
      <Select size="large" value={String(value)} onChange={this.handleChange} {...extraProps}>
        {
          _options.map(item =>
            <Option key={item.value} value={String(item.value)}>{item.label}</Option>
          )
        }
      </Select>
    )
  }
}

SelectProjectStatus = connect(function(state) {
  const { projstatus } = state.app
  const options = projstatus ? projstatus.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})(SelectProjectStatus)



class AuditProjectModal extends React.Component {

  handleSendEmailChange = (e) => {
    this.props.onSendEmailChange(e.target.checked)
  }

  handleSendWechatChange = e => {
    this.props.onSendWechatChange(e.target.checked);
  }

  render() {
    const { visible, currentStatus, status, sendEmail, confirmLoading, onStatusChange, onSendEmailChange, onOk, onCancel, sendWechat } = this.props

    return (
      <Modal title={i18n('project.modify_project_status')} visible={visible} onOk={onOk} onCancel={onCancel} confirmLoading={confirmLoading}>
        <div style={{width: '60%', display: 'flex', alignItems: 'center', margin: '0 auto'}}>
          <span style={{marginRight: '8px'}}>{i18n('project.project_status')} : </span>
          <SelectProjectStatus style={{flexGrow: '1'}} status={currentStatus} value={status} onChange={onStatusChange} />
        </div>
        {
          status === 4 ? 
          <div style={{ marginTop: 20, marginLeft: 170 }}>
            <div>
              <Checkbox checked={sendEmail} onChange={this.handleSendEmailChange}>{i18n('project.is_send_email')}</Checkbox>
            </div> 
            <div style={{ marginTop: 6 }}>
              <Checkbox checked={sendWechat} onChange={this.handleSendWechatChange}>是否分享到微信群？</Checkbox>
            </div>
          </div> 
          : null
        }
      </Modal>
    )
  }

}


export default AuditProjectModal
