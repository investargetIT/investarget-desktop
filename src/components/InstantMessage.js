import React from 'react'
import Chat from './Chat'
import { isLogin } from '../utils/util'
import md5 from '../utils/md5'
import * as api from '../api.js'

class InstantMessage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      messages: [
        {
          id: 1,
          user: {
            id: 1,
            name: '小游侠',
            photoUrl: '/images/default-avatar.png',
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
            name: '小型',
            photoUrl: '/images/avatar1.png',
          },
          time: '2017-07-10 17:50:48',
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
          time: '2017-07-10 17:50:58',
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
          time: '2017-07-10 17:51:08',
          channelId: 1,
          type: 'text',
          content: '这是小型再一次发送的文本内容'
        },
      ],
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
          time: '2017-07-10 17:58:08',
          channelId: parseInt(message.from, 10),
          type: 'text',
          content: message.data          
        }),
        inputValue: ''
      })
      react.setState({ onReceiveMessage: true })
    },    //收到文本消息
    onEmojiMessage: function (message) { },   //收到表情消息
    onPictureMessage: function (message) { }, //收到图片消息
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
      appKey: WebIM.config.appkey
    };
    this.conn.open(options);

    this.getUserFriend()
  }

  componentWillUnmount() {
    this.conn.close();
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

  getUserFriend = () => {
    api.getUserFriend()
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
          return obj
        } else if (m.friend.id === isLogin().id) {
          const obj = {}
          obj.id = m.user.id
          obj.name = m.user.username
          obj.imgUrl = m.user.photourl
          obj.isRequestAddFriend = !m.isaccept
          obj.relationID = m.id
          return obj
        }
      })
      this.setState({ channels })
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
    this.setState({ channels: newData })
    api.editUserFriend(channel.relationID, isAccept)
  }

  render() {
    return <Chat
      user={this.currentUser}
      onSendMsg={this.sendPrivateText}
      channels={this.state.channels}
      messages={this.state.messages} 
      onReceiveMessage={this.state.onReceiveMessage} 
      onAcceptNewFriend={this.handleNewFriend.bind(this, true)} 
      onRejectNewFriend={this.handleNewFriend.bind(this, false)} />
  }

}

export default InstantMessage