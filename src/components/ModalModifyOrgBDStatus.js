import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import { Modal, Select, Checkbox } from 'antd'
const Option = Select.Option

const options1 = [
  {
    label: '未BD',
    value: 1
  },
  {
    label: 'BD中',
    value: 2
  },
  {
    label: 'BD成功',
    value: 3
  },
  {
    label: '暂不BD',
    value: 4
  }
]


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
          options1.map(item =>
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



class ModalModifyOrgBDStatus extends React.Component {

  handleSendEmailChange = (e) => {
    this.props.onSendEmailChange(e.target.checked)
  }

  render() {
    const { visible, currentStatus, status, sendEmail, confirmLoading, onStatusChange, onSendEmailChange, onOk, onCancel } = this.props

    return (
      <Modal title={i18n('modify_orgbd_status')} visible={visible} onOk={onOk} onCancel={onCancel} confirmLoading={confirmLoading}>
        <div style={{width: '60%', display: 'flex', alignItems: 'center', margin: '0 auto'}}>
          <span style={{marginRight: '8px'}}>{i18n('project_bd.status')} : </span>
          <SelectProjectStatus style={{flexGrow: '1'}} status={currentStatus} value={status} onChange={onStatusChange} />
        </div>
      </Modal>
    )
  }

}


export default ModalModifyOrgBDStatus
