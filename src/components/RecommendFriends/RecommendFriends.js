import React from 'react';
import styles from './RecommendFriends.css';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Card, Icon, Tag, Button } from 'antd'


function RecommendFriends(props) {

  return (

    <div className={styles.container}>
      <h3 className={styles.title}>添加朋友</h3>

      <div className="clearfix" className={styles.content}>
        {
          props.friends.map(item => {

            const isSelected = props.selectedFriends.includes(item.id)
            const userCoverStyle = isSelected ? { display: 'block' } : { display : 'none' }

            return (
              <div key={item.id} className={styles.user} onClick={()=>{props.onFriendToggle(item.id)}}>
                <div>
                  <img className={styles.userHead} src={item.headimg || '/images/defaultAvatar@2x.png'} alt="avatar" />
                  <p className={styles.userName}>
                    <span>{item.name || '默认姓名'}</span>
                    <span>{item.title || '默认职位'}</span>
                  </p>
                  <p className={styles.tags}>
                    {/* 标签 */}
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
        <Button className={styles.action} onClick={props.onFriendsSkip}>跳过</Button>
        <Button
          className={styles.action}
          disabled={props.selectedFriends.length == 0}
          type="primary"
          onClick={props.onFriendsSubmit}
        >完成选择</Button>
      </div>

    </div>

  )
}


export default injectIntl(RecommendFriends);
