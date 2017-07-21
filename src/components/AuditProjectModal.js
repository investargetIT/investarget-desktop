import React from 'react'
import { connect } from 'dva'
import { Modal, Select } from 'antd'
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
      <Select value={String(value)} onChange={this.handleChange} {...extraProps}>
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

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      id: null,
      currentStatus: null,
      status: null,
    }
  }

  setData = (id, status) => {
    this.setState({ visible: true, id, status, currentStatus: status })
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
          <SelectProjectStatus style={{flexGrow: '1'}} status={this.state.currentStatus} value={this.state.status} onChange={this.handleStatusChange} />
        </div>
      </Modal>
    )
  }

}


export default AuditProjectModal
