import React from 'react'
import { Input, Button, Popconfirm, Icon } from 'antd'
import { time } from '../utils/util'


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


class RemarkList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      comments: '',
    }
  }

  toggleNewComment = () => {
    this.setState({ visible: !this.state.visible })
  }

  handleChange = (e) => {
    this.setState({ comments: e.target.value })
  }

  handleSave = () => {
    this.props.onAdd(this.state.comments)
    this.setState({ comments: '' })
  }

  render() {
    return (
      <div>
        <h3 style={remarkTitleStyle}>备注信息<Icon type="plus" style={addIconStyle} onClick={this.toggleNewComment} /></h3>

        <div style={{display: this.state.visible ? 'block' : 'none'}}>
          <p style={{lineHeight:2,fontSize:13}}>
            <span style={{marginRight:8}}>新备注</span>
            <span>
              <a href="javascript:void(0)" onClick={this.handleSave} disabled={this.state.comments == ''}>提交</a>
            </span>
          </p>
          <Input.TextArea value={this.state.comments} onChange={this.handleChange} />
        </div>

        {this.props.list.map(item => (
          <Remark
            key={item.id}
            comments={item.remark}
            createdtime={item.createdtime}
            timezone={item.timezone}
            onEdit={this.props.onEdit.bind(this, item.id)}
            onDelete={this.props.onDelete.bind(this, item.id)}
          />
        ))}
      </div>
    )
  }
}


class Remark extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isEditing: false,
      comments: '',
    }
  }

  handleEdit = () => {
    this.setState({ isEditing: true, comments: this.props.comments })
  }

  handleChange = (e) => {
    this.setState({ comments: e.target.value })
  }

  handleSave = () => {
    this.props.onEdit(this.state.comments)
    this.setState({ isEditing: false, comments: '' })
  }

  handleCancel = () => {
    this.setState({ isEditing: false, comments: '' })
  }

  render() {
    const createdtime = time(this.props.createdtime + this.props.timezone)
    return (
      <div style={{marginBottom:8}}>
        <p style={{fontSize:13,lineHeight:2}}>
          <span style={{marginRight:8}}>{createdtime}</span>
          {this.state.isEditing ? (
            <span>
              <a href="javascript:void(0)" onClick={this.handleSave} disabled={this.state.comments == ''} style={{marginRight:4}}>保存</a>
              <a href="javascript:void(0)" onClick={this.handleCancel}>取消</a>
            </span>
          ) : (
            <span>
              <a href="javascript:void(0)" onClick={this.handleEdit} style={{marginRight:4}}>编辑</a>
              <Popconfirm title="确定删除吗？" onConfirm={this.props.onDelete}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            </span>
          )}
        </p>
        {this.state.isEditing ? (
          <Input.TextArea value={this.state.comments} onChange={this.handleChange} />
        ) : (
          <p>{this.props.comments}</p>
        )}
      </div>
    )
  }
}

export default RemarkList
