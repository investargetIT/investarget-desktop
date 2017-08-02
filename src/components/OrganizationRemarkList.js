import React from 'react'
import { connect } from 'dva'
import * as api from '../api'

import RemarkList, {RemarkListReadOnly} from './RemarkList'


function getCurrentUser() {
  const userStr = localStorage.getItem('user_info')
  const user = userStr ? JSON.parse(userStr) : null
  return user && user.id
}
const userId = getCurrentUser()


class OrganizationRemarkList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      list: [],
    }
  }

  getRemarkList = () => {
    const param = {
      org: this.props.orgId,
      createuser: userId,
    }
    api.getOrgRemark(param).then(result => {
      const list = result.data.data
      list.sort((a, b) => {
        a = new Date(a.createdtime)
        b = new Date(b.createdtime)
        return a < b
      })
      this.setState({ list })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  addRemark = (remark) => {
    const data = {
      org: this.props.orgId,
      remark: remark,
    }
    return api.addOrgRemark(data).then(result => {
      this.getRemarkList()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  editRemark = (id, remark) => {
    const data = {
      org: this.props.orgId,
      remark: remark,
    }
    return api.editOrgRemark(id, data).then(result => {
      this.getRemarkList()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  deleteRemark = (id) => {
    return api.deleteOrgRemark(id).then(result => {
      this.getRemarkList()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    this.getRemarkList()
  }

  render() {
    const readOnly = 'readOnly' in this.props
    return readOnly ? (
      <RemarkListReadOnly list={this.state.list} />
    ) : (
      <RemarkList list={this.state.list} addRemark={this.addRemark} editRemark={this.editRemark} deleteRemark={this.deleteRemark} />
    )
  }
}

export default connect()(OrganizationRemarkList)
