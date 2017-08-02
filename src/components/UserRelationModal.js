import React from 'react'
import { connect } from 'dva'
import { Modal, Button, Icon, Popconfirm } from 'antd'

import * as api from '../api'
import { SelectNumber, RadioTrueOrFalse } from './ExtraInput'


const deleteIconStyle = {
  marginLeft: '8px',
  padding: '4px',
  cursor: 'pointer',
}


class UserRelationModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      show: false,
      investoruser: null,
      traderuser: null,
      relationtype: false,
      data: [],
      options: [],
      investorUsername: '',
    }
  }

  showModal = (id, username) => {
    const investoruser = id
    if (investoruser) {
      this.setState({ show: true, investoruser, investorUsername: username }, this.getUserRelation)
    }
  }

  hideModal = () => {
    this.setState({ show: false })
  }

  deleteRelation = (id) => {
    api.deleteUserRelation(id).then(result => {
      //
      this.getUserRelation()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  addRelation = () => {
    const { investoruser, traderuser, relationtype } = this.state
    const param = { investoruser, traderuser, relationtype }
    api.addUserRelation(param).then(result => {
      //
      this.getUserRelation()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  selectTrasaction = (value) => {
    this.setState({ traderuser: value })
  }

  selectRelationType = (value) => {
    this.setState({ relationtype: value })
  }

  getUserRelation = () => {
    const param = { investoruser: this.state.investoruser }
    api.getUserRelation(param).then(result => {
      const data = result.data.data
      this.setState({ data })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    // group transaction id 2
    api.getUser({ groups: [2] }).then(result => {
      const transactions = result.data.data
      const options = transactions.map(item => ({ value: item.id, label: item.username }))
      this.setState({ options })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    return (
      <Modal visible={this.state.show} title="修改交易师" footer={null} onCancel={this.hideModal}>
        <h3 style={{marginBottom: '16px'}}>{this.state.investorUsername}的交易师：</h3>
        <div style={{marginBottom: '8px'}}>
          {
            this.state.data.map((item, index) =>
              <p key={item.id}>
                <span style={{ color: item.relationtype ? 'red' : 'rgba(0,0,0,.65)' }}>{item.traderuser.username}</span>
                <Popconfirm title="删除关联交易师" onConfirm={this.deleteRelation.bind(this, item.id)}>
                  <Icon type="close" style={deleteIconStyle} />
                </Popconfirm>
              </p>
            )
          }
        </div>
        <div>
          选择交易师：<SelectNumber options={this.state.options} value={this.state.traderuser} onChange={this.selectTrasaction} style={{width: '80px', marginRight: '8px'}} />
          强弱：<RadioTrueOrFalse value={this.state.relationtype} onChange={this.selectRelationType} />
          <Button onClick={this.addRelation}>新增</Button>
        </div>
      </Modal>
    )
  }
}


export default connect()(UserRelationModal)
