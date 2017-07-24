import React from 'react'
import { injectIntl, intlShape } from 'react-intl'

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


class RemarkList extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      showAdd: false,
      showEdit: false,
      editId: null,
      remark: '',
      // loading: false,
    }
  }

  updateRemark = (e) => {
    this.setState({ remark: e.target.value })
  }

  showAddRemark = () => {
    this.setState({ showAdd: true })
  }

  addRemark = () => {
    const remark = this.state.remark
    this.props.addRemark(remark).then(result => {
      this.setState({ showAdd: false, remark: '' })
    }, error => {
      this.setState({ showAdd: false, remark: '' })
      Modal.error({ title: '错误', content: error.message })
    })
  }

  cancelAddRemark = () => {
    this.setState({ showAdd: false, remark: '' })
  }

  showEditRemark = (id) => {
    const list = this.props.list
    const remark = list.filter(item => item.id == id)[0]
    this.setState({ showEdit: true, editId: id, remark: remark.remark })
  }

  editRemark = () => {
    const { editId, remark } = this.state
    this.props.editRemark(editId, remark).then(result => {
      this.setState({ showEdit: false, remark: '', editId: null })
    }, error => {
      this.setState({ showEdit: false, remark: '', editId: null })
      Modal.error({ title: '错误', content: error.message })
    })
  }

  cancelEditRemark = () => {
    this.setState({ showEdit: false, editId: null, remark: '' })
  }

  deleteRemark = (id) => {
    this.props.deleteRemark(id).then(result => {
      //
    }, error => {
      Modal.error({ title: '错误', content: error.message })
    })
  }


  render() {
    const { formatDate, formatTime } = this.props.intl
    return (
      <div>
        <h3 style={remarkTitleStyle}>备注信息<Icon type="plus" style={addIconStyle} onClick={this.showAddRemark} /></h3>
        <div>
          {
            this.props.list.map(item =>
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


function RemarkListReadOnly(props) {
  const { formatDate, formatTime } = props.intl
  return (
    <div>
      <h3 style={remarkTitleStyle}>备注</h3>
      <div>
        {
          props.list.map(item =>
            <div key={item.id} style={remarkStyle}>
              <p style={remarkTimeStyle}>
                { formatDate(item.createdtime) + ' ' + formatTime(item.createdtime) }
              </p>
              <p style={remarkTextStyle}>{item.remark}</p>
            </div>
          )
        }
      </div>
    </div>
  )
}
RemarkListReadOnly.propTypes = {
  intl: intlShape.isRequired,
}
RemarkListReadOnly = injectIntl(RemarkListReadOnly)


export { RemarkListReadOnly }
export default injectIntl(RemarkList)
