import React from 'react'
import Chat from './Chat'
import { isLogin, handleError, requestAllData } from '../utils/util'
import md5 from '../utils/md5'
import * as api from '../api.js'
import { connect } from 'dva'
import Draggable from 'react-draggable'

const style = {
  position: 'absolute',
  left: (window.innerWidth - 700) / 2,
  top: (window.innerHeight - 500) / 2,
  zIndex: 2,
}

class InstantMessage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      messages: null,
      channels: [],
      onReceiveMessage: false,
    }
    
    const currentUser = isLogin()
    this.currentUser = currentUser ? {
      id: currentUser.id,
      name: currentUser.username,
      photoUrl: currentUser.photourl
    } : null

  }

  componentDidMount() {
    this._isMounted = true
    this.conn = new WebIM.connection({
      https: WebIM.config.https,
      url: WebIM.config.xmppURL,
      isAutoLogin: WebIM.config.isAutoLogin,
      isMultiLoginSessions: WebIM.config.isMultiLoginSessions
    });

    const react = this
    this.conn.listen({
    onOpened: function (message) {          //连接成功回调
      // 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
      // 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
      // 则无需调用conn.setPresence();             
    },
    onClosed: function (message) { },         //连接关闭回调
    onTextMessage: function (message) {
      const channel = react.state.channels.filter(f => f.id === parseInt(message.from, 10))[0]
      const user = {
        id: channel.id,
        name: channel.name,
        photoUrl: channel.imgUrl
      }
      react.setState({
        messages: react.state.messages.concat({
          id: message.id,
          user,
          time: Date.now(),
          channelId: parseInt(message.from, 10),
          type: 'text',
          content: message.data          
        }),
        inputValue: '',
        onReceiveMessage: true
      }, react.calculateUnreadMessageNum)
      // react.setState({ onReceiveMessage: true })
    },    //收到文本消息
    onEmojiMessage: function (message) { },   //收到表情消息
    onPictureMessage: function (message) { 
      const channel = react.state.channels.filter(f => f.id === parseInt(message.from, 10))[0]
      const user = {
        id: channel.id,
        name: channel.name,
        photoUrl: channel.imgUrl
      }
      react.setState({
        messages: react.state.messages.concat({
          id: message.id,
          user,
          time: Date.now(),
          channelId: parseInt(message.from, 10),
          type: 'img',
          content: <img style={{ maxWidth: "100%" }} src={message.url} />         
        }),
        inputValue: '',
        onReceiveMessage: true,
      }, react.calculateUnreadMessageNum)
      // react.setState({ onReceiveMessage: true })
    }, //收到图片消息
    onCmdMessage: function (message) { },     //收到命令消息
    onAudioMessage: function (message) { },   //收到音频消息
    onLocationMessage: function (message) { },//收到位置消息
    onFileMessage: function (message) { },    //收到文件消息
    onVideoMessage: function (message) {
      var node = document.getElementById('privateVideo');
      var option = {
        url: message.url,
        headers: {
          'Accept': 'audio/mp4'
        },
        onFileDownloadComplete: function (response) {
          var objectURL = WebIM.utils.parseDownloadResponse.call(conn, response);
          node.src = objectURL;
        },
        onFileDownloadError: function () {
          console.log('File down load error.')
        }
      };
      WebIM.utils.download.call(conn, option);
    },   //收到视频消息
    onPresence: function (message) { },       //处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
    onRoster: function (message) { },         //处理好友申请
    onInviteMessage: function (message) { },  //处理群组邀请
    onOnline: function () { },                  //本机网络连接成功
    onOffline: function () { },                 //本机网络掉线
    onError: function (message) { },          //失败回调
    onBlacklistUpdate: function (list) {       //黑名单变动
      // 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
      console.log(list);
    },
    onReceivedMessage: function (message) { },    //收到消息送达客户端回执
    onDeliveredMessage: function(message) { },  //收到消息送达服务器回执
    onReadMessage: function(message) {},        //收到消息已读回执
    onCreateGroup: function(message) { },        //创建群组成功回执（需调用createGroupNew）
    onMutedMessage: function(message) { }        //如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
    })

    var options = {
      apiUrl: WebIM.config.apiURL,
      user: '' + isLogin().id,
      pwd: md5('' + isLogin().id),
      appKey: WebIM.config.appkey,
      success: function (token) {
        var accessToken = token.access_token;
        localStorage.setItem('easemob_access_token', accessToken)
      }
    };
    this.conn.open(options);

    this.getUserFriendAndMsg()
  }

  componentWillUnmount() {
    this._isMounted = false
    if (this.conn && this.conn.context.stropheConn) {
      this.conn.close();
    }
  }

  handleSendMsg = message => {
    switch (message.type) {
      case 'txt':
        this.sendPrivateText(message)
        break
      case 'img':
        this.sendPrivateImg(message)
        break
    }
  }

  // 单聊发送文本消息
  sendPrivateText =  message => {
    const react = this
    var id = this.conn.getUniqueId();                 // 生成本地消息id
    var msg = new WebIM.message('txt', id);      // 创建文本消息
    msg.set({
      msg: message.content,                  // 消息内容
      to: '' + message.channelId,                          // 接收消息对象（用户id）
      roomType: false,
      success: function (id, serverMsgId) {
        console.log('send private text Success', id, serverMsgId);
        react.setState({
          messages: react.state.messages.concat({ ...message, id: serverMsgId, localID: message.id })
        })
      },
      fail: function (e) {
        console.log("Send private text error");
      }
    });
    msg.body.chatType = 'singleChat';
    this.conn.send(msg.body);
  };

  // 单聊发送图片消息
  sendPrivateImg = message => {
    var id = this.conn.getUniqueId();                   // 生成本地消息id
    var msg = new WebIM.message('img', id);        // 创建图片消息
    var input = message.input;  // 选择图片的input
    var file = WebIM.utils.getFileUrl(input);      // 将图片转化为二进制文件
        var allowType = {
        'jpg': true,
        'gif': true,
        'png': true,
        'bmp': true
    };
    if (file.filetype.toLowerCase() in allowType) {
      var option = {
        apiUrl: WebIM.config.apiURL,
        file: file,
        to: '' + message.channelId,                       // 接收消息对象
        roomType: false,
        chatType: 'singleChat',
        onFileUploadError: function () {      // 消息上传失败
          console.log('onFileUploadError');
        },
        onFileUploadComplete: function () {   // 消息上传成功
          console.log('onFileUploadComplete');
        },
        success: function (id, serverMsgId) {                // 消息发送成功
          console.log('send private image Success', id, serverMsgId);
          react.setState({
            messages: react.state.messages.concat({ ...message, id: serverMsgId, localID: message.id })
          })
        },
        flashUpload: WebIM.flashUpload
      };
      msg.set(option);
      this.conn.send(msg.body);
    }
  };

  getUserFriendAndMsg = () => {
    let friends
    requestAllData(api.getUserFriend, { page_size: 100 }, 100)
    .then(data => {
      const channels = data.data.data.filter(f => 
        f.user && f.friend && (((f.user.id === isLogin().id) && f.isaccept) || (f.friend.id === isLogin().id))
      )
      .map(m => {
        if (m.user.id === isLogin().id) {
          const obj = {}
          obj.id = m.friend.id
          obj.name = m.friend.username
          obj.imgUrl = m.friend.photourl
          obj.isRequestAddFriend = !m.isaccept
          obj.relationID = m.id
          obj.hasIM = m.friend.hasIM;
          return obj
        } else if (m.friend.id === isLogin().id) {
          const obj = {}
          obj.id = m.user.id
          obj.name = m.user.username
          obj.imgUrl = m.user.photourl
          obj.isRequestAddFriend = !m.isaccept
          obj.relationID = m.id
          obj.hasIM = m.user.hasIM;
          return obj
        }
      })
      friends = channels
      return Promise.all(channels.map(m => api.getChatMsg({ to: m.id })))
    })
    .then(data => {
      const allRawMessages = data.map(m => m.data.data).reduce((val, acc) => acc.concat(val), [])
      const messages = this.processMessageFromServer(allRawMessages, friends)
      const channels = friends.map(m => {
        const sortedMessages = messages.filter(f => f.channelId === m.id).sort((a, b) => b.time - a.time)
        const latestMessage = sortedMessages[0]
        const latestReadMessage = sortedMessages.find(f => f.user.id !== isLogin().id)
        return {...m, latestMessage, latestReadMessage}
      })
      if (this._isMounted) {
        this.setState({ messages, channels })
      }
    })
    .catch(error => {
      handleError(error)
    })
  }

  handleNewFriend = (isAccept, channel) => {
    const newData = [...this.state.channels]
    const index = newData.map(m => m.relationID).indexOf(channel.relationID)
    if (index < 0) return
    if (isAccept) {
      newData[index].isRequestAddFriend = false
    } else {
      newData.splice(index, 1)
    }
    api.editUserFriend(channel.relationID, isAccept)
      .then(data => {
        if (isAccept) {
          const userInfo = JSON.parse(localStorage.getItem('user_info'));
          if (data.data.user.id === isLogin().id) {
            newData[index].hasIM = data.data.friend.hasIM;
            userInfo.hasIM = data.data.user.hasIM;
          } else if (data.data.friend.id === isLogin().id) {
            newData[index].hasIM = data.data.user.hasIM;
            userInfo.hasIM = data.data.friend.hasIM;
          }
          localStorage.setItem('user_info', JSON.stringify(userInfo))
        }
        this.setState({ channels: newData })
      });
  }

  handleMessageScrollTop = (channel, conainer) => {
    const div = conainer
    const previousHeight = conainer.scrollHeight
    const oldestMessage = this.state.messages.filter(f => f.channelId === channel.id).sort((a, b) => a.time - b.time)[0]
    api.getChatMsg({ to: channel.id, timestamp: oldestMessage.time })
    .then(data => {
      const historyMessages = this.processMessageFromServer(data.data.data, this.state.channels)
      this.setState(
        { messages: this.state.messages.concat(historyMessages) },
        // keep scroll position after load history records
        () => div.scrollTop = div.scrollHeight - previousHeight
      )
    })
  }

  processMessageFromServer = (messages, friends) => {
    return messages.filter(f => f.payload.bodies[0].type === 'txt').map(m => {
      const id = m.msg_id
      let user = {}, channelId
      const index = friends.map(m => m.id + '').indexOf(m.chatfrom)
      if (index > -1) {
        channelId = friends[index].id
        user.id = friends[index].id
        user.name = friends[index].name
        user.photoUrl = friends[index].imgUrl
      } else {
        channelId = parseInt(m.to, 10)
        user.id = isLogin().id
        user.name = isLogin().username
        user.photoUrl = isLogin().photourl
      }
      const time = parseInt(m.timestamp, 10)
      const type = 'text'
      const content = m.payload.bodies[0].msg
      return { id, user, time, channelId, type, content }
    })
  }

  handleChannelClicked = channel => {
    const newChannels = [...this.state.channels]
    const sortedMessages = this.state.messages.filter(f => f.channelId === channel.id).sort((a, b) => b.time - a.time)
    const latestReadMessage = sortedMessages.find(f => f.user.id !== isLogin().id)
    const index = newChannels.findIndex(f => f.id === channel.id)
    newChannels[index].latestReadMessage = latestReadMessage
    this.setState({ channels: newChannels }, this.calculateUnreadMessageNum)
  }

  calculateUnreadMessageNum = () => {
    const num = this.state.channels.map(m => 
      this.state.messages.filter(
        f => f.channelId === m.id && 
        f.user.id !== this.currentUser.id && 
        (m.latestReadMessage ? f.time > m.latestReadMessage.time : true)
      ).length
    ).reduce((acc, val) => acc + val)
    this.props.dispatch({
      type: 'app/setUnreadMessageNum',
      payload: num
    })
  }

  render() {
    return this.state.messages ? <Draggable cancel=".text-area"><div style={style}>
      <Chat
      user={this.currentUser}
      onSendMsg={this.handleSendMsg}
      channels={this.state.channels}
      messages={this.state.messages}
      onScrollTop={this.handleMessageScrollTop}
      onClickChannel={this.handleChannelClicked}
      onReceiveMessage={this.state.onReceiveMessage}
      onAcceptNewFriend={this.handleNewFriend.bind(this, true)}
      onRejectNewFriend={this.handleNewFriend.bind(this, false)} /></div></Draggable> : null
  }

}

export default connect()(InstantMessage)