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
  Button, 
} from 'antd';
const InputGroup = Input.Group;
const Option = Select.Option

function SelectBDStatus(props) {
  const { value, onChange, options, ...extraProps } = props;
  return (
    <Select
      size="large"
      value={String(value)}
      onChange={value => onChange(Number(value))}
      {...extraProps}
    >
      {
        options.map(item =>
          <Option key={item.value} value={String(item.value)}>{item.label}</Option>
        )
      }
    </Select>
  );
}
function mapStateToProps(state) {
  const { bdStatus } = state.app;
  const options = bdStatus ? bdStatus.map(item => ({value: item.id, label: item.name})) : []
  return { options };
}
SelectBDStatus = connect(mapStateToProps)(SelectBDStatus);
export { SelectBDStatus };

class SelectInvestorGroup extends React.Component {

  state = {
    options: []
  }

  componentDidMount() {
    api.queryUserGroup({ type: 'investor' })
      .then(result => {
        echo('result', result.data.data);
        const options = result.data.data.map(m => ({ label: m.name, value: m.id }));
        echo(options);
        this.setState({ options });
      });
  }

  render() {
    if (this.state.options.length === 0) return null;
    return (
      <Select 
        size="large" 
        value={this.props.value} 
        style={{ width: 120, height: 32 }} 
        onChange={this.props.onChange}
      >
        { this.state.options.map(m => <Option key={m.value} value={String(m.value)}>{m.label}</Option>) }
      </Select>
    )
  }
}

class ModalModifyOrgBDStatus extends React.Component {

  state = {
    username: '', 
    mobile: '',
    wechat: '', 
    email: '', 
    isimportant: this.props.bd.isimportant||null, 
    status: this.props.bd.bd_status.id, 
    group: '', 
    mobileAreaCode: '86',
  }

  checkInvalid = () => {
    const { username, mobile, wechat, email, status, group } = this.state;
    return ((username.length === 0 || mobile.length === 0 || wechat.length === 0 || email.length === 0 || group.length === 0) && status === 3 && this.props.bd.bduser === null && this.props.bd.bd_status.id !== 3)
           || (wechat.length === 0 && status === 3 && this.props.bd.bduser !== null && this.props.bd.bd_status.id !== 3);
  }
  checkProjectValid = () =>{
    const { username, mobile, email, status, group } = this.state;
    return ((username.length === 0 || mobile.length === 0 || email.length === 0 || group.length === 0) && status === 3 && this.props.bd.bduser === null && this.props.bd.bd_status.id !== 3)
  }

  render() {
    const { visible, currentStatus, status, sendEmail, confirmLoading, onStatusChange, onSendEmailChange, onOk, onCancel } = this.props
    return (
      <Modal
        title={i18n('modify_orgbd_status')}
        visible={visible}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        footer={null}
      >
        <div style={{ width: '60%', margin: '0 auto', marginLeft: 70 }}>
          {this.state.isimportant!=null ?
          <Row>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10 }} >{i18n('org_bd.important')} : </Col>
            <Col span={16}>
              <Switch
                defaultChecked={this.state.isimportant}
                onChange={checked => this.setState({ isimportant: checked })}
              />
            </Col>
          </Row>
          :null}
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('project_bd.status')} : </Col>
            <Col span={16}>
              <SelectBDStatus
                style={{ width: 120 }}
                value={this.state.status}
                onChange={status => this.setState({ status })}
              />
            </Col>
          </Row>
          { !this.props.bd.bduser && this.props.bd.bd_status.id !== 3 && this.state.status === 3 ? <div>
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('account.role')} : </Col>
            <Col span={16}><SelectInvestorGroup value={this.state.group} onChange={value => this.setState({group: value})} /></Col>
          </Row> 
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('account.username')} : </Col>
            <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('account.username')} value={this.state.username} onChange={e => this.setState({ username: e.target.value })} /></Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('account.mobile')} : </Col>
            <Col span={16}>
                <InputGroup compact>
                    <Input style={{ width: '20%', height: 32 }} value={this.state.mobileAreaCode} onChange={e => this.setState({ mobileAreaCode: e.target.value })} />
                    <Input style={{ width: '80%', height: 32 }} placeholder={i18n('account.mobile')} value={this.state.mobile} onChange={e => this.setState({ mobile: e.target.value })} />
                </InputGroup>
            </Col>
          </Row>
          {!this.props.projectBD?
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('user.wechat')} : </Col>
            <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('user.wechat')} value={this.state.wechat} onChange={e => this.setState({ wechat: e.target.value })} /></Col>
          </Row>
          :null}
          <Row style={{ marginTop: 10 }}>
            <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('account.email')} : </Col>
            <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('account.email')} value={this.state.email} onChange={e => this.setState({ email: e.target.value })} /></Col>
          </Row>
          </div>
          : null }

          { /* 有联系人的BD成功时要求填写联系人微信号 */ }
          {this.props.bd.bduser && this.props.bd.bd_status.id !== 3 && this.state.status === 3 &&!this.props.projectBD?
            <Row style={{ marginTop: 10 }}>
              <Col span={8} style={{ textAlign: 'right', paddingRight: 10, lineHeight: '32px' }} >{i18n('user.wechat')} : </Col>
              <Col span={16}><Input style={{ height: 32 }} placeholder={i18n('user.wechat')} value={this.state.wechat} onChange={e => this.setState({ wechat: e.target.value })} /></Col>
            </Row>
            : null}

          <Row style={{ marginTop: 10 }}>
            <Col span={8} />
            <Col span={16}><Button type="primary" onClick={() => onOk(this.state)} disabled={this.props.projectBD? this.checkProjectValid() : this.checkInvalid()}>{i18n('common.confirm')}</Button></Col>
          </Row>
        </div>
        
      </Modal>
    )
  }

}


export default ModalModifyOrgBDStatus
