import React from 'react'
import { injectIntl, intlShape } from 'react-intl'
import * as api from '../api'

import { Icon, Input, Button, Modal, Popconfirm } from 'antd'


const addIconStyle = {
  cursor: 'pointer',
  padding: '4px',
  color: '#108ee9',
}
const remarkTitleStyle = {
  lineHeight: 2,
  marginBottom: '8px',
  borderBottom: '1px solid #eee',
}
const remarkStyle = {
  margin: '8px 0',
}
const remarkTimeStyle = {
  fontSize: '12px',
}
const remarkActionStyle = {
  marginLeft: '8px',
}
const remarkTextStyle = {
  fontSize: '13px',
  paddingLeft: '16px',
}


function getCurrentUser() {
  const userStr = localStorage.getItem('user_info')
  const user = userStr ? JSON.parse(userStr) : null
  return user && user.id
}
const userId = getCurrentUser()


class OrganizationRemarkList extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      list: [],
      showAdd: false,
      showEdit: false,
      editId: null,
      remark: '',
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
    })
  }

  updateRemark = (e) => {
    this.setState({ remark: e.target.value })
  }

  showAddRemark = () => {
    this.setState({ showAdd: true })
  }

  addRemark = () => {
    const data = {
      org: this.props.orgId,
      remark: this.state.remark,
    }
    api.addOrgRemark(data).then(result => {
      this.setState({ showAdd: false, remark: '' })
      this.getRemarkList()
    }, error => {
      console.error(error)
      this.setState({ showAdd: false, remark: '' })
    })
  }

  cancelAddRemark = () => {
    this.setState({ showAdd: false, remark: '' })
  }

  showEditRemark = (id) => {
    const remark = this.state.list.filter(item => item.id == id)[0]
    this.setState({ showEdit: true, editId: id, remark: remark.remark })
  }

  editRemark = () => {
    const data = {
      org: this.props.orgId,
      remark: this.state.remark,
    }
    api.editOrgRemark(this.state.editId, data).then(result => {
      this.setState({ showEdit: false, remark: '', editId: null })
      this.getRemarkList()
    }, error => {
      this.setState({ showEdit: false, remark: '', editId: null })
    })
  }

  cancelEditRemark = () => {
    this.setState({ showEdit: false, editId: null, remark: '' })
  }

  deleteRemark = (id) => {
    api.deleteOrgRemark(id).then(result => {
      this.getRemarkList()
    }, error => {
      console.error(error)
    })
  }

  componentDidMount() {
    this.getRemarkList()
  }

  render() {
    const { formatDate, formatTime } = this.props.intl
    return (
      <div>
        <h3 style={remarkTitleStyle}>备注信息<Icon type="plus" style={addIconStyle} onClick={this.showAddRemark} /></h3>
        <div>
          {
            this.state.list.map(item =>
              <div key={item.id} style={remarkStyle}>
                <p style={remarkTimeStyle}>
                  { formatDate(item.createdtime) + ' ' + formatTime(item.createdtime) }
                  {/* TODO// 操作与权限挂钩 */}
                  <a style={remarkActionStyle} onClick={this.showEditRemark.bind(this, item.id)}>编辑</a>
                  <Popconfirm title="删除备注" onConfirm={this.deleteRemark.bind(this, item.id)}>
                    <a style={remarkActionStyle}>删除</a>
                  </Popconfirm>
                </p>
                <p style={remarkTextStyle}>{item.remark}</p>
              </div>
            )
          }
        </div>
        <Modal title="新增备注" visible={this.state.showAdd} onOk={this.addRemark} onCancel={this.cancelAddRemark}>
          <Input type="textarea" rows={4} value={this.state.remark} onChange={this.updateRemark} />
        </Modal>
        <Modal title="修改备注" visible={this.state.showEdit} onOk={this.editRemark} onCancel={this.cancelEditRemark}>
          <Input type="textarea" rows={4} value={this.state.remark} onChange={this.updateRemark} />
        </Modal>
      </div>
    )
  }
}

export default injectIntl(OrganizationRemarkList)
