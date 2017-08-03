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
      traderuser: null,
      relationtype: false,
      data: [],
      options: [],
    }
  }

  showModal = (id, username) => {
    this.setState({ show: true })
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
    const { investoruser } = this.props
    const { traderuser, relationtype } = this.state
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
    const param = { investoruser: this.props.investoruser }
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
    this.getUserRelation()
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

    const { investorUsername } = this.props
    const { show, data, options, traderuser, relationtype } = this.state

    const button = React.cloneElement(React.Children.only(this.props.children), {
      onClick: this.showModal,
    })

    return (
      <span>
        { button }
        <Modal visible={show} title="修改交易师" footer={null} onCancel={this.hideModal}>
          <h3 style={{marginBottom: '16px'}}>{investorUsername}的交易师：</h3>
          <div style={{marginBottom: '8px'}}>
            {
              data.length > 0 ? data.map((item, index) =>
                <p key={item.id}>
                  <span style={{ color: item.relationtype ? 'red' : 'rgba(0,0,0,.65)' }}>{item.traderuser.username}</span>
                  <Popconfirm title="删除关联交易师" onConfirm={this.deleteRelation.bind(this, item.id)}>
                    <Icon type="close" style={deleteIconStyle} />
                  </Popconfirm>
                </p>
              ) : (
                <p style={{ color: '#999' }}>暂时没有交易师</p>
              )
            }
          </div>
          <div>
            选择交易师：<SelectNumber options={options} value={traderuser} onChange={this.selectTrasaction} style={{width: '80px', marginRight: '8px'}} />
            强弱：<RadioTrueOrFalse value={relationtype} onChange={this.selectRelationType} />
            <Button onClick={this.addRelation}>新增</Button>
          </div>
        </Modal>
      </span>
    )
  }
}


export default connect()(UserRelationModal)
