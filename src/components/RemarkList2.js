import React from 'react'
import { Input, Button, Popconfirm, Icon } from 'antd'
import { time, i18n, hasPerm, getUserInfo } from '../utils/util'


const addIconStyle = {
  cursor: 'pointer',
  padding: '4px',
  color: '#108ee9',
}
const remarkTitleStyle = {
  lineHeight: 2,
  marginBottom: '8px',
  fontSize:'20px'
}

const buttonStyle={
  marginTop:'16px',
  marginBottom:'50px',
  backgroundColor:'#237CCC',
  height:'30px',
  width:'80px',
  color:'white'
}
const smallBlock={
  width:'40px',
  height:'40px',
  marginRight:'30px',
  float:'left'
}
const imgStyle={
  width:'100%',
  height:'100%'
}
const largeBlock={
  height:'40px',
  backgroundColor:'#ebf0f3',
  overflow:'hidden',
  lineHeight:'40px'
}

const timeStyle={
  fontSize:'14px',
  float:'right',
  marginRight:'18px',
  color:'#656565'
}
const userStyle={
  fontSize:'14px',
  float:'left',
  marginLeft:'16px',
  marginRight:'16px',
  marginBottom:'13px',
  color:'#F4B348'
}

const comStyle={
  marginLeft:'86px',
  fontSize:'14px',
}

const textareaStyle={
  paddingTop:'20px',
  paddingLeft:'20px',
  minHeight:'100px',
}
class RemarkList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      comments: ''
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

  handleEdit(remark, content) {
    let param1 = remark.id;
    if (this.props.type === 'library') {
      param1 = remark;
    }
    this.props.onEdit(param1, content);
  }

  render() {
    const {visible}=this.state
    return (
      <div>
        <h3 style={remarkTitleStyle}>
          {i18n('remark.comments')}
          {this.props.type !== 'library' && <Icon type={visible ? 'minus' : 'plus'} style={addIconStyle} onClick={this.toggleNewComment} />}
        </h3>

        <div style={{display: this.state.visible ? 'block' : 'none'}}>
          <Input.TextArea style={textareaStyle} placeholder={i18n('common.write_comment')} autosize={{maxRows: 6 }} value={this.state.comments} onChange={this.handleChange} />
          <center>
          <button style={buttonStyle} onClick={this.handleSave} disabled={this.state.comments == ''}>{i18n('common.submit')} </button>
          </center>
        </div>

        {this.props.list.map(item => (
          <Remark
            key={item.id}
            comments={item.remark}
            createdtime={item.createdtime}
            lastmodifytime={item.lastmodifytime}
            userid={item.createuser_id || (item.createuser && item.createuser.id) || item.createuser}     //for project remark or user remark or org remark
            timezone={item.timezone}
            onEdit={this.handleEdit.bind(this, item)}
            onDelete={this.props.onDelete.bind(this, item.id)}
            type={this.props.type}
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
      user:this.props.userid,
      userName:'',
      photoURL:'',
    }
    
  }

  componentDidMount() {
    api.getUserInfo(this.state.user).then(result => {
      this.setState({userName:result.data.username,photoURL:result.data.photourl}) 
    }, error => {
      handleError(error)
    }
    )
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
    let lastmodifytime = null;
    if (['user', 'org'].includes(this.props.type)) {
      lastmodifytime = time(this.props.lastmodifytime + this.props.timezone);
    }
    const photourl=this.state.photoURL
    const comments={__html:this.props.comments.replace(/\n/g,'<br>')}
    const currentUser = getUserInfo();
    const isSuperAdmin = currentUser.is_superuser;
    const isOwner = currentUser.id === this.props.userid;
    let hasPermission = false;
    if (this.props.type === 'library') {
      hasPermission = hasPerm('BD.manageProjectBD') || isOwner;
    } else {
      hasPermission = isSuperAdmin || isOwner;
    }
    return ( 
      <div style={{marginBottom:'16px',borderBottom:'1px solid #eee',paddingBottom:'16px'}}>
        <div style={smallBlock}><img style={imgStyle} src={photourl}/></div>
        <div style={largeBlock}>
        <span style={userStyle}>{this.state.userName}</span>
        <div style={timeStyle}>
          {createdtime}&nbsp;&nbsp;
          {['user', 'org', 'library'].includes(this.props.type) ? 
          <Button onClick={this.handleEdit} size="small" style={{ textDecoration:'underline',border:'none',background:'none' }}
            disabled={!hasPermission}
          >
            <Icon type="edit" />
          </Button>
          : null}
          <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.props.onDelete}>
            <Button size="small" style={{ textDecoration:'underline',border:'none',background:'none' }}
              disabled={!hasPermission}
            >
              <Icon type="delete" />
            </Button>
          </Popconfirm>
        </div>
        </div>
        {['user', 'org'].includes(this.props.type) ? 
        <div style={{ marginLeft: 86, marginTop: 10, fontSize: 12, color: '#999' }}>最新编辑时间：{lastmodifytime}</div>
        : null}
        {this.state.isEditing ? (
          <div style={{ marginLeft: 70, marginTop: 10 }}>
            <Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} value={this.state.comments} onChange={this.handleChange} />
            <span>
              <a href="javascript:void(0)" onClick={this.handleSave} disabled={this.state.comments == ''} style={{ marginRight: 4 }}>{i18n('common.save')}</a>
              <a href="javascript:void(0)" onClick={this.handleCancel}>{i18n('common.cancel')}</a>
            </span>
          </div>
        ) : (
          <p style={comStyle} dangerouslySetInnerHTML={comments} />
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
