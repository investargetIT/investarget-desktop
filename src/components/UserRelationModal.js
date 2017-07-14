import React from 'react'
import { Modal, Button, Icon } from 'antd'

import * as api from '../api'
import { SelectNumber, RadioTrueOrFalse } from './ExtraInput'


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
    }
  }

  showModal = (id) => {
    const investoruser = id
    if (investoruser) {
      this.getUserRelation()
      this.setState({ show: true, investoruser })
    }
  }

  hideModal = () => {
    this.setState({ show: false })
  }

  deleteRelation = (index) => {
    let param = this.state.data[index]
    param = {
      investoruser: param.investoruser.id,
      relationtype: param.relationtype,
      score: param.score,
      traderuser: param.traderuser.id,
    }
    api.deleteRelation(param).then(result => {
      //
      this.getUserRelation()
    })
  }

  addRelation = () => {
    const { investoruser, traderuser, relationtype } = this.state
    const param = { investoruser, traderuser, relationtype }
    api.addUserRelation(param).then(result => {
      //
      this.getUserRelation()
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
    console.log('>>>', param)
    api.getUserRelation(param).then(result => {
      const data = result.data.data
      this.setState({ data })
    })
  }

  componentDidMount() {
    // group transaction id 2
    api.getUser({ groups: [2] }).then(result => {
      const transactions = result.data.data
      const options = transactions.map(item => ({ value: item.id, label: item.username }))
      this.setState({ options })
    })
  }

  render() {
    return (
      <Modal visible={this.state.show} title="修改交易师" footer={null} onCancel={this.hideModal}>
        <div>
          {
            this.state.data.map((item, index) =>
              <span key={item.traderuser.id}>{item.traderuser.username}<Icon type="close" onClick={this.deleteRelation.bind(this, index)} /></span>
            )
          }
        </div>
        <div>
          选择交易师：<SelectNumber options={this.state.options} value={this.state.traderuser} onChange={this.selectTrasaction} />
          强弱：<RadioTrueOrFalse value={this.state.relationtype} onChange={this.selectRelationType} />
          <Button onClick={this.addRelation}>新增</Button>
        </div>
      </Modal>
    )
  }
}


export default UserRelationModal
