import React from 'react';
import styles from './RecommendFriends.css';
import { Icon, Tag, Button } from 'antd';
import * as api from '../api';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class RecommendFriends extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      selected: [],
    }
    this.onFriendsSubmit = this.onFriendsSubmit.bind(this);
    this.onFriendsSkip = this.onFriendsSkip.bind(this);
  }

  componentDidMount() {
    const params = {
      // org: 39, // 机构: 多维海拓
      groups: [2], // 用户组：交易师
    }
    api.getUser(params)
    .then(result => this.setState({ friends: result.data.data }));
  }

  onFriendToggle(id) {
    var selectedFriends = this.state.selected.slice()
    var index = selectedFriends.indexOf(id)
    if(index > -1) {
      selectedFriends.splice(index, 1)
    } else {
      selectedFriends.push(id)
    }
    this.setState({ selected: selectedFriends });
  }

  onFriendsSubmit() {
    api.addUserFriend(this.state.selected)
    .then(result => this.props.dispatch(routerRedux.push('/recommend-projects')))
    .catch(err => this.props.dispatch(routerRedux.push('/recommend-projects')))
  }

  onFriendsSkip() {
    this.props.dispatch(routerRedux.push('/recommend-projects'));
  }

  render () {
    const props = this.props;

    const btnStyle = {position:'relative',width: 120,height: 42,lineHeight: '42px',textAlign: 'center',fontSize: 20,backgroundColor: '#047bd1',color: '#fff',border: 'none',borderRadius: 4}
    const arrowStyle = {position: 'absolute',top: '50%',marginTop: -41,cursor: 'pointer'}


    return (

      <div style={{backgroundColor:'#fff'}}>
        <div style={{margin:'0 auto',width:1180,height:120,padding:'0 178px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:36}}>点击添加朋友</span>
          <span>
            <Button style={{...btnStyle,marginRight:10}} onClick={this.onFriendsSkip}>跳过</Button>
            <Button style={btnStyle} onClick={this.onFriendsSubmit}>完成选择</Button>
          </span>
        </div>

        <div style={{width:1180,height:636,padding:'0 178px',margin:'0 auto',backgroundColor:'#f2f2f2',position:'relative'}}>
          {this.state.friends.length > 0 ? (
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:73}}>
              {this.state.friends.slice(0,3).map(item => {
                const isSelected = this.state.selected.includes(item.id)
                return (
                  <Card key={item.id} {...item} />
                )
              })}
            </div>
          ):null}
          {this.state.friends.length > 3 ? (
            <div style={{display:'flex',justifyContent:'space-between'}}>
              {this.state.friends.slice(3,6).map(item => {
                const isSelected = this.state.selected.includes(item.id)
                return (
                  <Card key={item.id} {...item} />
                )
              })}
            </div>
          ):null}

          <img src="/images/arrow-left.jpg" style={{...arrowStyle, left: 50}} />
          <img src="/images/arrow-right.jpg" style={{...arrowStyle, right: 50}} />
        </div>
        <div style={{height:100}}></div>
      </div>
    )
  }
}


export default connect()(RecommendFriends)


function Card(props) {
  return (
    <div className={styles["card"]} style={{width:240,height:280,backgroundColor:'#fff',cursor:'pointer'}}>
      <div style={{height:216,backgroundSize:'cover',backgroundImage:`url(${props.photourl})`}}></div>
      <div style={{height:64,textAlign:'center'}}>
        <h3 style={{marginTop:5,color:'#232323',fontSize:20,lineHeight: 1.5}}>{props.username}</h3>
        <p style={{color:'#989898',fontSize:16,lineHeight: 1.5}}>{props.title ? props.title.name : '暂无'}</p>
      </div>
    </div>
  )
}
