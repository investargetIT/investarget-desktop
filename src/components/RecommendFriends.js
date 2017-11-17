import React from 'react';
import styles from './RecommendFriends.css';
import { Card, Icon, Tag, Button } from 'antd';
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
  return (

    <div className={styles.container}>
      <h3 className={styles.title}>添加朋友</h3>

        <div className="clearfix" className={styles.content}>
        {
          this.state.friends.map(item => {

            const isSelected = this.state.selected.includes(item.id)
            const userCoverStyle = isSelected ? { display: 'block' } : { display : 'none' }

            const headUrl = item.photourl || '/images/defaultAvatar@2x.png'
            const name = item.username || '默认姓名'
            const title = item.title ? item.title.name : '默认职位'

            return (
              <div key={item.id} className={styles.user} onClick={this.onFriendToggle.bind(this, item.id)}>
                <div>
                  <img className={styles.userHead} src={headUrl} alt="avatar" />
                   <p className={styles.userName}>
                    <span>{name}</span>
                    <span>{title}</span>
                  </p>
                  <p className={styles.tags}>

                  </p>
                </div>
                <div className={styles.userCover} style={userCoverStyle}>
                  <div className={styles.userCoverWrap}>
                    <Icon type="check" className={styles.userCoverIcon} />
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      <div className={styles.actions}>
        <Button className={styles.action} onClick={this.onFriendsSkip}>跳过</Button>
        <Button
          className={styles.action}
          disabled={this.state.selected.length == 0}
          type="primary"
          onClick={this.onFriendsSubmit}
        >完成选择</Button>
      </div>

    </div>

  )
}
}


export default connect()(RecommendFriends)
