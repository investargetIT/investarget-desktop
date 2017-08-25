import React from 'react'
import { connect } from 'dva'
import md5 from '../utils/md5'

// const mySpeechBubbleColor = 'rgb(162, 229, 99)'
// const mySpeechBubbleColor = 'lightBlue'
const mySpeechBubbleColor = 'rgb(229, 243, 253)'

const defaultMessages = [
  {
    id: 1,
    user: {
      id: 1,
      name: '小游侠',
      photoUrl: '/images/default-avatar.png',
    },
    time: 10,
    channelId: 1,
    type: 'text',
    content: '这是小游侠发送的文本内容'
  },
  {
    id: 2,
    user: {
      id: 2,
      name: '小型',
      photoUrl: '/images/avatar1.png',
    },
    time: 1001,
    channelId: 1,
    type: 'text',
    content: '这是小型发送的文本内容'
  },
  {
    id: 3,
    user: {
      id: 1,
      name: '小游侠',
      photoUrl: '/images/default-avatar.png',
    },
    time: 100002,
    channelId: 1,
    type: 'text',
    content: '这是小游侠再一次发送的文本内容'
  },
  {
    id: 4,
    user: {
      id: 2,
      name: '小型',
      photoUrl: '/images/avatar1.png',
    },
    time: 120333,
    channelId: 1,
    type: 'text',
    content: '这是小型再一次发送的文本内容'
  },
  {
    id: 5,
    user: {
      id: 2,
      name: '小型',
      photoUrl: '/images/avatar1.png',
    },
    time: 1000323,
    channelId: 1,
    type: 'text',
    content: <img style={{ maxWidth: "100%" }} src="/images/avatar1.png" />,
  },
]

const defaultChannels = [
  {
    id: 1,
    imgUrl: '/images/avatar1.png',
    name: '小型',
    latestMessage: {
      content: '这是小型再一次发送的文本内容',
      time: '1:15 PM'
    },
    isRequestAddFriend: false,
    member: [
      {
        id: 1,
        name: '小游侠',
        photoUrl: '...'
      },
      {
        id: 2,
        name: '小懒猪',
        photoUrl: '...'
      }
    ]
  },
  {
    id: 2,
    imgUrl: '/images/avatar3.png',
    name: '小兵',
    latestMessage: {
      content: '请求加您为好友',
      time: '11:38 AM'
    },
    isRequestAddFriend: true,
    member: [
      {
        id: 1,
        name: '小游侠',
        photoUrl: '...'
      },
      {
        id: 3,
        name: '小兵张嘎',
        photoUrl: '...'
      }
    ]
  },
  {
    id: 3,
    imgUrl: '/images/avatar2.png',
    name: '小红',
    latestMessage: {
      content: '这是小红再一次发送的文本内容',
      time: '7/9/17'
    },
    isRequestAddFriend: false,
    member: [
      {
        id: 1,
        name: '小游侠',
        photoUrl: '...'
      },
      {
        id: 4,
        name: '小红',
        photoUrl: '...'
      }
    ]
  },
]

const defaultCurrentUser = {
  id: 1,
  name: '小游侠',
  photoUrl: '/images/default-avatar.png'
}

function UserInfoDetail({ name, photoUrl, onAccept, onReject }) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 20 }}>{name}</div>
      <div style={{ margin: 20 }}><img style={{ width: 76 }} src={photoUrl} /></div>
      <div>
        <button onClick={onAccept} style={{ width: 100, height: 32, marginRight: 10, fontSize: 16 }}>同意</button>
        <button onClick={onReject} style={{ width: 100, height: 32, fontSize: 16 }}>拒绝</button>
      </div>
    </div>
  )
}

function SpeechOfMy(props) {
  return (
    <div style={{ overflow: 'auto' }}>
    <div style={{ float: 'right' }}><img style={{ width: 30, height: 30, borderRadius: 2 }} src={props.avatarUrl} /></div>
    <div className="my-talk-bubble" style={{ float: 'right', maxWidth: '75%', marginRight: 8, position: 'relative', border: `1px solid ${mySpeechBubbleColor}`, borderRadius: 4 }}>
      <div style={{ padding: '6px 10px', background: mySpeechBubbleColor, lineHeight: 1.6, fontSize: 14, color: 'black' }}>{props.children}</div>
    </div>
  </div>
  )
}

function SpeechOfOthers(props) {
  return (
    <div style={{ overflow: 'auto' }}>
      <div style={{ float: 'left' }}><img style={{ width: 30, height: 30, borderRadius: 2 }} src={props.avatarUrl} /></div>
      <div className="other-talk-bubble" style={{ float: 'left', maxWidth: '75%', marginLeft: 8, position: 'relative', border: '1px solid white', borderRadius: 4 }}>
        <div style={{ padding: '6px 10px', background: 'white', lineHeight: 1.6, fontSize: 14, color: 'black' }}>{props.children}</div>
      </div>
    </div>
  )
}

const contactContainerHeight = 64
const contactLeftNameFontSize = 14
const contactAbstractFontSize = 12
const nameAndAbstractGap = 10
const contactAvatarSize = 40 

const contactAvatarContainerStyle = {
  width: contactContainerHeight,
  height: '100%',
  padding: (contactContainerHeight - contactAvatarSize) / 2,
  float: 'left'
}

const contactRightContainerStyle = {
  marginLeft: 48,
  padding: (contactContainerHeight - contactLeftNameFontSize - contactAbstractFontSize - nameAndAbstractGap) / 2 + 'px 0',
  paddingRight: 10,
  height: '100%',
  //background: 'magenta'
}

const contactNameAndDateContainerStyle = {
  lineHeight: contactLeftNameFontSize + 'px',
  height: contactLeftNameFontSize,
  marginBottom: nameAndAbstractGap
}

const contactAbstractStyle = {
  fontSize: contactAbstractFontSize,
  height: contactAbstractFontSize,
  lineHeight: contactAbstractFontSize + 'px',
  overflow: 'hidden',
  color: 'rgb(177, 177, 177)'
}

const contactRightContentStyle = {}

function Contact(props) {
  const contactContainerStyle1 = {
    height: contactContainerHeight,
    borderBottom: '1px solid rgb(239, 239, 239)',
    cursor: 'pointer',
    background: props.isActive ? 'rgb(226, 226, 226)' : 'inherit'
  }
  return (
    <div style={contactContainerStyle1} onClick={evt => props.onClick(props.channel)}>
      <div style={contactAvatarContainerStyle}>
        <img style={{ width: contactAvatarSize, height: contactAvatarSize, borderRadius: 2 }} src={props.imgUrl} />
      </div>
      <div style={contactRightContainerStyle}>
        <div style={contactRightContentStyle}>
          <p style={contactNameAndDateContainerStyle}>
            <span style={{ fontSize: contactLeftNameFontSize, color: 'black' }}>{props.name}</span>
            <span style={{ width: 60, height: '100%', overflow: 'hidden', float: 'right', color: 'rgb(177, 177, 177)', textAlign: 'right' }}>{props.latestMessage ? props.latestMessage.time : ""}</span>
          </p>
          <p style={contactAbstractStyle}>{props.latestMessage ? props.latestMessage.content : ""}</p>
        </div>
      </div>
    </div>
  )
}

const mainContainerHeight = 500
const mainContainerWidth = 700
const topBarHeight = 48
const rightContainerBackground = 'rgb(243, 243, 243)'
const contactPercent = 0.35
const closeIconHeight = 20

const leftContainerStyle = {
  width: contactPercent * 100 + '%',
  height: '100%',
  background: 'rgb(251, 251, 251)',
  float: 'left',
  borderRight: '1px solid #DDD'
}

const rightContainerStyle = {
  width: (1 - contactPercent) * 100 + '%',
  height: '100%',
  backgroundColor: rightContainerBackground,
  marginLeft: contactPercent * 100 + '%'
}

const searchContainerStyle = {
  width: '100%',
  height: topBarHeight,
  padding: 6,
  background: 'rgb(251, 251, 251)'
}

const searchInputStyle = {
  width: '100%',
  height: '100%',
  paddingLeft: 10,
  outline: 0
}

const contactContainerStyle = {
  width: '100%',
  height: (mainContainerHeight- topBarHeight) / mainContainerHeight * 100 + '%',
  overflow: 'auto'
}

const titleContainerStyle = {
  width: '100%',
  height: topBarHeight,
  padding: '0 20px',
  borderBottom: '1px solid #DDD'
}

const messageContainerStyle = {
  width: '100%',
  height: '60%',
  padding: '12px 20px',
  overflow: 'auto',
  borderBottom: '1px solid #DDD'
}

const contentContainerStyle = {
  height: (1 - topBarHeight / mainContainerHeight - 0.6) * 100 + '%'
}

class Chat extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      inputValue: '',
      channel: (props.channels && props.channels[0]) || defaultChannels[0],
      messages: [],
      channels: [
        {
          id: 1,
          imgUrl: '/images/avatar1.png',
          name: '小型',
          latestMessage: {
            content: '这是小型再一次发送的文本内容',
            time: '1:15 PM'
          },
          member: [
            {
              id: 1,
              name: '小游侠',
              photoUrl: '...'
            },
            {
              id: 2,
              name: '小懒猪',
              photoUrl: '...'
            }
          ]
        },
        {
          id: 2,
          imgUrl: '/images/avatar3.png',
          name: '小兵',
          latestMessage: {
            content: '这是小兵小小兵再一次发送的文本内容',
            time: '11:38 AM'
          },
          member: [
            {
              id: 1,
              name: '小游侠',
              photoUrl: '...'
            },
            {
              id: 3,
              name: '小兵张嘎',
              photoUrl: '...'
            }
          ]
        },
        {
          id: 3,
          imgUrl: '/images/avatar2.png',
          name: '小红',
          latestMessage: {
            content: '这是小红再一次发送的文本内容',
            time: '7/9/17'
          },
          member: [
            {
              id: 1,
              name: '小游侠',
              photoUrl: '...'
            },
            {
              id: 4,
              name: '小红',
              photoUrl: '...'
            }
          ]
        },
      ],
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleChannelClicked = this.handleChannelClicked.bind(this)
    this.handleCloseChatDialog = this.handleCloseChatDialog.bind(this)
  }


  componentDidUpdate(prevProps, prevState) {
    if (prevProps.onReceiveMessage || this.shouldScrollBottom) {
      this.refs.inputTextContent.scrollTop = this.refs.inputTextContent.scrollHeight
      this.shouldScrollBottom = false
    }
  }

  handleInputChange(evt) {
    this.setState({ inputValue: evt.target.value.replace(/\n/, "") })
  }

  handleKeyPress(evt) {
    const value = evt.target.value
    const keyCode = evt.keyCode || evt.which
    if (value.trim() !== "" && keyCode === 13) {
      const message = {
        id: Date.now() + '',
        user: this.props.user || defaultCurrentUser,
        time: Date.now(),
        channelId: this.state.channel.id,
        type: 'txt',
        content: value
      }
      this.shouldScrollBottom = true
      this.setState({
        messages: this.state.messages.concat(message),
        inputValue: ''
      })
      this.props.onSendMsg && this.props.onSendMsg(message)
    }
  }

  handleChannelClicked(channel) {
    this.shouldScrollBottom = !channel.isRequestAddFriend
    this.setState({ channel: channel })
  }

  handleCloseChatDialog() {
    this.props.dispatch({
      type: 'app/toggleChat',
      payload: false
    })
  }

  handleInputFileChange = () => {
    console.log('dasdad', this.imgupload.files)
    this.handleFiles(this.imgupload.files)
  }

  handleFiles = files => {
    const preview = []
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var imageType = /^image\//;

      if (!imageType.test(file.type)) {
        continue;
      }

      var reader = new FileReader();
      reader.onload = e => {
        const id = Date.now() + ''
        const message = {
          id,
          user: this.props.user || defaultCurrentUser,
          time: Date.now(),
          channelId: this.state.channel.id,
          type: 'img',
          content: <img id={id} style={{ maxWidth: "100%" }} src={e.target.result} />,
          file: file,
          input: this.imgupload,
        }
        this.shouldScrollBottom = true
        this.setState({
          messages: this.state.messages.concat(message),
          inputValue: ''
        })
        this.props.onSendMsg && this.props.onSendMsg(message)
      }
      reader.readAsDataURL(file);
    }

  }

  handleScrollMessage = () => {
    if (this.refs.inputTextContent.scrollTop <= 0 && this.props.onScrollTop) {
      this.props.onScrollTop(this.state.channel)
    }
  }

  render () {
    const propMsg = this.props.messages || defaultMessages
    const messages = [...propMsg]
    this.state.messages.map(m => {
      if (!propMsg.map(m => m.localID).includes(m.id)) {
        messages.push(m)
      }
    }) // TODO: sort messages by time
    const channels = this.props.channels || defaultChannels
    const currentUserID = (this.props.user && this.props.user.id) || defaultCurrentUser.id

    const mainContainerStyle = {
      position: 'fixed',
      left: (window.innerWidth - mainContainerWidth) / 2,
      top: (window.innerHeight - mainContainerHeight) / 2,
      width: mainContainerWidth,
      height: mainContainerHeight,
      boxShadow: '0 0 1em rgba(0, 0, 0, 0.2)',
      zIndex: 99,
      display: this.props.showChat ? 'block' : 'none',
    }

    const contactJSX = channels.map(m =>
      <Contact
        key={m.id}
        isActive={this.state.channel.id === m.id}
        channel={m}
        imgUrl={m.imgUrl}
        name={m.name}
        latestMessage={m.latestMessage}
        onClick={this.handleChannelClicked} />
    )

    const messagesJSX = messages.filter(f => f.channelId === this.state.channel.id)
    .sort((a, b) => a.time - b.time).map(m =>
      <li key={m.id} style={{ marginTop: 20 }}>
        {m.user.id === currentUserID ?
          <SpeechOfMy avatarUrl={m.user.photoUrl}>{m.content}</SpeechOfMy>
          : <SpeechOfOthers avatarUrl={m.user.photoUrl}>{m.content}</SpeechOfOthers>}
      </li>
    )

    return (
      <div style={mainContainerStyle}>

        <input
          type="file"
          ref={input => this.imgupload = input}
          style={{ display: 'none' }}
          onChange={this.handleInputFileChange} />

        <img onClick={this.handleCloseChatDialog} style={{ cursor: 'pointer', width: closeIconHeight, position:'absolute', right: -closeIconHeight/2, top: -closeIconHeight/2 }} src="/images/ic_close.png" />
        
        <div style={leftContainerStyle}>

          <div style={searchContainerStyle}>
            <input style={searchInputStyle} type="text" placeholder="查找联系人或群" />
          </div>

          <div style={contactContainerStyle}>{contactJSX}</div>

        </div>

        { this.state.channel.isRequestAddFriend ? 
          <div style={rightContainerStyle}>
            <UserInfoDetail
              name={this.state.channel.name}
              photoUrl={this.state.channel.imgUrl} 
              onAccept={this.props.onAcceptNewFriend && this.props.onAcceptNewFriend.bind(this, this.state.channel)} 
              onReject={this.props.onRejectNewFriend && this.props.onRejectNewFriend.bind(this, this.state.channel)} />
          </div> :  
          <div style={rightContainerStyle}>
            <div style={titleContainerStyle}>
              <span style={{ fontSize: 16, lineHeight: topBarHeight + 'px', color: 'black' }}>{this.state.channel.name}</span>
            </div>
            <div ref="inputTextContent" style={messageContainerStyle} onScroll={this.handleScrollMessage}>
              <ul>{messagesJSX}</ul>
            </div>
            <div style={{ height: 44, padding: '10px 18px' }}>
              <img
                onClick={() => this.imgupload.click()}
                style={{ cursor: 'pointer', width: 24, height: 24 }} src="/images/ic_image.svg" />
            </div>
            <textarea
              onChange={this.handleInputChange}
              onKeyPress={this.handleKeyPress}
              value={this.state.inputValue}
              style={{ width: '100%', height: (1 - topBarHeight / mainContainerHeight - 0.6 - 56 / mainContainerHeight) * 100 + '%', padding: '0 20px', border: 0, background: rightContainerBackground, outline: 0, fontSize: 14, color: 'black', resize: 'none' }} />
            <div style={{ height: 12 }} />
          </div> }
        
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { showChat } = state.app
  return { showChat }
}

export default connect(mapStateToProps)(Chat)
