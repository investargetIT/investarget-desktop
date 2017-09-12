import React from 'react'

import { Icon, Input, Button, Modal, Popconfirm } from 'antd'
import { handleError, getCurrentUser, time, i18n } from '../utils/util'
import * as api from '../api'


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


class RemarkList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      showAdd: false,
      showEdit: false,
      editId: null,
      remark: '',
    }
  }

  updateRemark = (e) => {
    this.setState({ remark: e.target.value })
  }

  showAddRemark = () => {
    this.setState({ showAdd: true })
  }

  confirmAddRemark = () => {
    const { remark } = this.state
    this.setState({ showAdd: false, remark: '' })
    this.props.addRemark(remark)
  }

  cancelAddRemark = () => {
    this.setState({ showAdd: false, remark: '' })
  }

  showEditRemark = (id) => {
    const { list } = this.props
    const remark = list.filter(item => item.id == id)[0]
    this.setState({ showEdit: true, editId: id, remark: remark.remark })
  }

  confirmEditRemark = () => {
    const { editId, remark } = this.state
    this.setState({ showEdit: false, remark: '', editId: null })
    this.props.editRemark(editId, remark)
  }

  cancelEditRemark = () => {
    this.setState({ showEdit: false, editId: null, remark: '' })
  }

  confirmDeleteRemark = (id) => {
    this.props.deleteRemark(id)
  }

  render() {
    if (this.props.readOnly) {
      return (
        <div>
          <h3 style={remarkTitleStyle}>{i18n('remark.remark')}</h3>
          <div>
            {
              this.props.list.map(item =>
                <div key={item.id} style={remarkStyle}>
                  <p style={remarkTimeStyle}>
                    { time(item.createdtime) }
                  </p>
                  <p style={remarkTextStyle}>{item.remark}</p>
                </div>
              )
            }
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <h3 style={remarkTitleStyle}>{i18n('remark.remark_info')}<Icon type="plus" style={addIconStyle} onClick={this.showAddRemark} /></h3>
          <div>
            {
              this.props.list.map(item =>
                <div key={item.id} style={remarkStyle}>
                  <p style={remarkTimeStyle}>
                    { time(item.createdtime) }
                    {/* TODO// 操作与权限挂钩 */}
                    <a style={remarkActionStyle} onClick={this.showEditRemark.bind(this, item.id)}>{i18n('common.edit')}</a>
                    <Popconfirm title={i18n('remark.remove_remark')} onConfirm={this.confirmDeleteRemark.bind(this, item.id)}>
                      <a style={remarkActionStyle}>{i18n('common.delete')}</a>
                    </Popconfirm>
                  </p>
                  <p style={remarkTextStyle}>{item.remark}</p>
                </div>
              )
            }
          </div>
          <Modal title={i18n('remark.add_remark')} visible={this.state.showAdd} onOk={this.confirmAddRemark} onCancel={this.cancelAddRemark}>
            <Input type="textarea" rows={4} value={this.state.remark} onChange={this.updateRemark} />
          </Modal>
          <Modal title={i18n('remark.edit_remark')} visible={this.state.showEdit} onOk={this.confirmEditRemark} onCancel={this.cancelEditRemark}>
            <Input type="textarea" rows={4} value={this.state.remark} onChange={this.updateRemark} />
          </Modal>
        </div>
      )
    }
  }
}


function sortByTime(list) {
  list.sort((a, b) => {
    a = new Date(a.createdtime)
    b = new Date(b.createdtime)
    return a < b
  })
}

// HOC
function remarkListWithApi(type) {

  const getApi = api.getRemark.bind(null, type)
  const addApi = api.addRemark.bind(null, type)
  const editApi = api.editRemark.bind(null, type)
  const deleteApi = api.deleteRemark.bind(null, type)

  class CommonRemarkList extends React.Component {

    constructor(props) {
      super(props)

      this.state = {
        list: [],
      }
    }

    getRemarkList = () => {
      const param = {
        [type]: this.props.typeId,
      }
      getApi(param).then(result => {
        const list = result.data.data
        sortByTime(list)
        this.setState({ list })
      }, error => {
        handleError(error)
      })
    }

    addRemark = (remark) => {
      const params = { [type]: this.props.typeId, remark }
      addApi(params).then(result => {
        this.getRemarkList()
      }, error => {
        handleError(error)
      })
    }

    editRemark = (editId, remark) => {
      const params = { [type]: this.props.typeId, remark }
      editApi(editId, params).then(result => {
        this.getRemarkList()
      }, error => {
        handleError(error)
      })
    }

    deleteRemark = (id) => {
      deleteApi(id).then(result => {
        this.getRemarkList()
      }, error => {
        handleError(error)
      })
    }

    componentDidMount() {
      this.getRemarkList()
    }

    render() {
      const readOnly = 'readOnly' in this.props
      return (
        <RemarkList
          list={this.state.list}
          readOnly={readOnly}
          addRemark={this.addRemark}
          editRemark={this.editRemark}
          deleteRemark={this.deleteRemark}
        />
      )
    }

  }

  return CommonRemarkList
}


const TimelineRemarkList = remarkListWithApi('timeline')
const OrganizationRemarkList = remarkListWithApi('org')
const UserRemarkList = remarkListWithApi('user')

export {
  TimelineRemarkList,
  OrganizationRemarkList,
  UserRemarkList
}
