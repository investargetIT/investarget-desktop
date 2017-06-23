import React from 'react'

const topBarHeight = 38
const rightContainerBackground = 'rgb(243, 243, 243)'

const leftContainerStyle = {
  width: '30%',
  height: '100%',
  background: 'rgb(251, 251, 251)',
  float: 'left',
  borderRight: '1px solid #DDD'
}

const rightContainerStyle = {
  width: '70%',
  height: '100%',
  backgroundColor: rightContainerBackground,
  marginLeft: '30%'
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
  paddingLeft: 10
}

const contactContainerStyle = {
  width: '100%',
  height: '100%',
  overflow: 'auto'
}

const titleContainerStyle = {
  width: '100%',
  height: topBarHeight,
  padding: '0 6px',
  borderBottom: '1px solid #DDD'
}

const messageContainerStyle = {
  width: '100%',
  height: '70%',
  overflow: 'auto',
  borderBottom: '1px solid #DDD'
}

const contentContainerStyle = {
  height: '30%',
  background: 'red'
}

class Chat extends React.Component {
  render () {
    const mainContainerStyle = {
      position: 'fixed',
      right: 0,
      bottom: 0,
      width: 600,
      height: 400,
      boxShadow: '-3px -2px 8px -1px rgba(0, 0, 0, 0.2)',
    }

    return (
      <div style={mainContainerStyle}>
        <div style={leftContainerStyle}>
          <div style={searchContainerStyle}>
            <input style={searchInputStyle} type="text" placeholder="查找联系人或群" />
          </div>
          <div style={contactContainerStyle}>
            <h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1>
            <h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1>
            <h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1>
          </div>
        </div>
        <div style={rightContainerStyle}>
          <div style={titleContainerStyle}>
            <span style={{ fontSize: 14, lineHeight: topBarHeight + 'px' }}>程序亦非猿</span>
          </div>
          <div style={messageContainerStyle}>
            <h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1>
            <h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1>
            <h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1><h1>dsdsd</h1>
          </div>
          <div style={contentContainerStyle}>
            <textarea style={{ width: '100%', height: '100%', padding: 10, border: 0, background: rightContainerBackground }} />
          </div>
        </div>
      </div>
    )
  }
}

export default Chat
