import React from 'react'
import * as api from '../api'

import RemarkList, {RemarkListReadOnly} from './RemarkList'


function getCurrentUser() {
  const userStr = localStorage.getItem('user_info')
  const user = userStr ? JSON.parse(userStr) : null
  return user && user.id
}
const userId = getCurrentUser()


class TimelineRemarkList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      list: [],
    }
  }

  getRemarkList = () => {
    const param = {
      timeline: this.props.timelineId,
      createuser: userId,
    }
    api.getTimelineRemark(param).then(result => {
      const list = result.data.data
      list.sort((a, b) => {
        a = new Date(a.createdtime)
        b = new Date(b.createdtime)
        return a < b
      })
      this.setState({ list })
    })
  }

  addRemark = (remark) => {
    const data = {
      timeline: this.props.timelineId,
      remark: remark,
    }
    return api.addTimelineRemark(data).then(result => {
      this.getRemarkList()
    })
  }

  editRemark = (id, remark) => {
    const data = {
      timeline: this.props.timelineId,
      remark: remark,
    }
    return api.editTimelineRemark(id, data).then(result => {
      this.getRemarkList()
    })
  }

  deleteRemark = (id) => {
    return api.deleteTimelineRemark(id).then(result => {
      this.getRemarkList()
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

export default TimelineRemarkList
