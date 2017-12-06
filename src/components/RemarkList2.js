import React from 'react'
import { Input, Button, Popconfirm, Icon } from 'antd'
import { time, i18n } from '../utils/util'


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

const buttonStyle={
  margin:'5px',
  backgroundColor:'#237CCC',
  height:'30px',
  width:'70px',
  color:'white'
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
        <h3 style={remarkTitleStyle}>{i18n('remark.comments')}<Icon type="plus" style={addIconStyle} onClick={this.toggleNewComment} /></h3>

        <div style={{display: this.state.visible ? 'block' : 'none'}}>
          <Input.TextArea placeholder={i18n('common.write_comment')} autosize={{ minRows: 2, maxRows: 6 }} value={this.state.comments} onChange={this.handleChange} />
          <center>
          <button style={buttonStyle} onClick={this.handleSave} disabled={this.state.comments == ''}>{i18n('common.submit')} </button>
          </center>
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
      <div style={{marginBottom:8,borderBottom:'1px solid #eee'}}>
        <div style={smallBlock}></div>
        <p style={{fontSize:13,lineHeight:2}}>
          <span style={{marginRight:8}}>{createdtime}</span>
        </p>
        {this.state.isEditing ? (
          <Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} value={this.state.comments} onChange={this.handleChange} />
        ) : (
          <p>{this.props.comments}</p>
        )}
      </div>    
      // <div style={{marginBottom:8}}>
      //   <p style={{fontSize:13,lineHeight:2}}>
      //     <span style={{marginRight:8}}>{createdtime}</span>
      //     {this.state.isEditing ? (
      //       <span>
      //         <a href="javascript:void(0)" onClick={this.handleSave} disabled={this.state.comments == ''} style={{marginRight:4}}>{i18n('common.save')}</a>
      //         <a href="javascript:void(0)" onClick={this.handleCancel}>{i18n('common.cancel')}</a>
      //       </span>
      //     ) : (
      //       <span>
      //         <a href="javascript:void(0)" onClick={this.handleEdit} style={{marginRight:4}}>{i18n('common.edit')}</a>
      //         <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.props.onDelete}>
      //           <a href="javascript:void(0)">{i18n('common.delete')}</a>
      //         </Popconfirm>
      //       </span>
      //     )}
      //   </p>
      //   {this.state.isEditing ? (
      //     <Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} value={this.state.comments} onChange={this.handleChange} />
      //   ) : (
      //     <p>{this.props.comments}</p>
      //   )}
      // </div>

    )
  }
}

export default RemarkList
