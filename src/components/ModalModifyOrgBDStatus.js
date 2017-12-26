import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import { 
  Modal, 
  Select, 
  Checkbox, 
  Input, 
  Row, 
  Col, 
  Switch, 
} from 'antd';

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

  state = {
    username: '', 
    mobile: '',
    isimportant: this.props.bd.isimportant, 
    status: this.props.bd.bd_status.id, 
  }

  render() {
    const { visible, currentStatus, status, sendEmail, confirmLoading, onStatusChange, onSendEmailChange, onOk, onCancel } = this.props
    return (
      <Modal
        title={i18n('modify_orgbd_status')}
        visible={visible}
        onOk={() => onOk(this.state)}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
      >
        <div style={{ width: '60%', margin: '0 auto', marginLeft: 70 }}>
          <Row>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10 }} >{i18n('org_bd.important')} : </Col>
            <Col span={16}>
              <Switch
                defaultChecked={this.state.isimportant}
                onChange={checked => this.setState({ isimportant: checked })}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('project_bd.status')} : </Col>
            <Col span={16}>
              <SelectProjectStatus
                style={{ width: 100 }}
                value={this.state.status}
                onChange={status => this.setState({ status })}
              />
            </Col>
          </Row>
          { this.props.bd && !this.props.bd.bduser && status === 3 ? <div>
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('account.username')} : </Col>
            <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('account.username')} value={this.state.username} onChange={e => this.setState({ username: e.target.value })} /></Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('account.mobile')} : </Col>
            <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('account.mobile')} value={this.state.username} onChange={e => this.setState({ username: e.target.value })} /></Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('user.wechat')} : </Col>
            <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('user.wechat')} value={this.state.username} onChange={e => this.setState({ username: e.target.value })} /></Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('account.email')} : </Col>
            <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('account.email')} value={this.state.username} onChange={e => this.setState({ username: e.target.value })} /></Col>
          </Row>
          </div>
          : null }
        </div>
      </Modal>
    )
  }

}


export default ModalModifyOrgBDStatus
