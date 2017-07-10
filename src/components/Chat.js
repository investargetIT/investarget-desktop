import React from 'react'

const mySpeechBubbleColor = 'rgb(162, 229, 99)'
//const mySpeechBubbleColor = 'lightBlue'


function SpeechOfMy(props) {
  return (
    <div style={{ overflow: 'auto' }}>
    <div style={{ float: 'right' }}><img style={{ width: 30, height: 30, borderRadius: 2 }} src="/images/default-avatar.png" /></div>
    <div className="my-talk-bubble" style={{ float: 'right', maxWidth: '75%', marginRight: 8, position: 'relative', border: `1px solid ${mySpeechBubbleColor}`, borderRadius: 4 }}>
      <div style={{ padding: '6px 10px', background: mySpeechBubbleColor, lineHeight: 1.6, fontSize: 14, color: 'black' }}>{props.children}</div>
    </div>
  </div>
  )
}

function SpeechOfOthers(props) {
  return (
    <div style={{ overflow: 'auto' }}>
      <div style={{ float: 'left' }}><img style={{ width: 30, height: 30, borderRadius: 2 }} src="/images/default-avatar.png" /></div>
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

const contactContainerStyle1 = {
  height: contactContainerHeight,
  //background: 'blue',
  borderBottom: '1px solid rgb(239, 239, 239)'
}

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
  return (
    <div style={contactContainerStyle1}>
      <div style={contactAvatarContainerStyle}>
        <img style={{ width: contactAvatarSize, height: contactAvatarSize, borderRadius: 2 }} src="/images/default-avatar.png" />
      </div>
      <div style={contactRightContainerStyle}>
        <div style={contactRightContentStyle}>
          <p style={contactNameAndDateContainerStyle}>
            <span style={{ fontSize: contactLeftNameFontSize, color: 'black' }}>特工</span>
            <span style={{ float: 'right', color: 'rgb(177, 177, 177)' }}>10:45 AM</span>
          </p>
          <p style={contactAbstractStyle}>一点击就显示已停止工作</p>
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

const mainContainerStyle = {
  position: 'fixed',
  right: 0,
  bottom: 0,
  width: mainContainerWidth,
  height: mainContainerHeight,
  boxShadow: '-3px -2px 8px -1px rgba(0, 0, 0, 0.2)',
}

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
  height: '40%',
  background: 'red'
}

class Chat extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      inputValue: '',
      messages: [
        {
          id: 1,
          user: {
            id: 1,
            name: '小游侠',
            photoUrl: '...',
          },
          time: '2017-07-10 17:50:38',
          channelId: 1,
          type: 'text',
          content: '这是小游侠发送的文本内容'
        },
        {
          id: 2,
          user: {
            id: 2,
            name: '小懒猪',
            photoUrl: '...',
          },
          time: '2017-07-10 17:50:48',
          channelId: 1,
          type: 'text',
          content: '这是小懒猪发送的文本内容'
        },
        {
          id: 3,
          user: {
            id: 1,
            name: '小游侠',
            photoUrl: '...',
          },
          time: '2017-07-10 17:50:58',
          channelId: 1,
          type: 'text',
          content: '这是小游侠再一次发送的文本内容'
        },
        {
          id: 4,
          user: {
            id: 2,
            name: '小懒猪',
            photoUrl: '...',
          },
          time: '2017-07-10 17:51:08',
          channelId: 1,
          type: 'text',
          content: '这是小懒猪再一次发送的文本内容'
        },
      ]
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleInputChange(evt) {
    if (evt.target.value.trim() !== "") {
      this.setState({ inputValue: evt.target.value })
    }
  }

  handleKeyPress(evt) {
    const value = evt.target.value
    const keyCode = evt.keyCode || evt.which
    if (keyCode === 13) {
      const existKey = this.state.messages.map(m => m.id)
      this.setState({
        messages: this.state.messages.concat({
          id: Math.max(...existKey) + 1,
          user: {
            id: 1,
            name: '小游侠',
            photoUrl: '...'
          },
          time: '2017-07-10 17:58:08',
          channelId: 1,
          type: 'text',
          content: value          
        }),
        inputValue: ''
      })
    }
  }

  render () {

    const messagesJSX = this.state.messages.filter(f => f.channelId === 1).map(m =>
      <li key={m.id} style={{ marginTop: 20 }}>
        {m.user.id === 1 ? <SpeechOfMy>{m.content}</SpeechOfMy> : <SpeechOfOthers>{m.content}</SpeechOfOthers>}
      </li>
    )

    return (
      <div style={mainContainerStyle}>
        <div style={leftContainerStyle}>
          <div style={searchContainerStyle}>
            <input style={searchInputStyle} type="text" placeholder="查找联系人或群" />
          </div>
          <div style={contactContainerStyle}>
            <Contact /><Contact /><Contact /><Contact /><Contact />
            <Contact /><Contact /><Contact /><Contact /><Contact />
            <Contact /><Contact /><Contact /><Contact /><Contact />
            <Contact /><Contact /><Contact /><Contact /><Contact />
          </div>
        </div>
        <div style={rightContainerStyle}>
          <div style={titleContainerStyle}>
            <span style={{ fontSize: 16, lineHeight: topBarHeight + 'px', color: 'black' }}>程序亦非猿</span>
          </div>
          <div style={messageContainerStyle}>
            <ul>
              {messagesJSX}
            </ul>
          </div>
          <div style={contentContainerStyle}>
            <textarea
              onChange={this.handleInputChange}
              onKeyPress={this.handleKeyPress}
              value={this.state.inputValue}
              style={{ width: '100%', height: '100%', padding: 10, border: 0, background: rightContainerBackground, outline: 0, fontSize: 14, color: 'black' }} />
          </div>
        </div>
      </div>
    )
  }
}

export default Chat
