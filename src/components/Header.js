import React from 'react';
import { Menu, Icon, Modal, Badge, Input, Popover, Alert } from 'antd';
import { Link, routerRedux } from 'dva/router';
import { connect } from 'dva'
import { SOURCE } from '../api'
import qs from 'qs'
import { i18n, changeLang, hasPerm, isLogin } from '../utils/util'
import styles from './Header.css'
import classNames from 'classnames'
import SiteSearch from './SiteSearch'
import Logo from './Logo'
import RetryImg from './RetryImg';

const confirm = Modal.confirm

const headerStyle = {
  height: 50,
  borderBottom: 'none',
}


class UserProfile extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  handleClick = () => {
    this.setState({ visible: !this.state.visible })
  }

  handleMenuClick = (key) => {
    this.props.onMenuClick({ key: key })
  }

  render() {
    const imgStyle = {
      verticalAlign:'center',
      marginRight:5,
      width:26,
      height:26,
    }
    const caretStyle = {
      display: 'inline-block',
      width: 0,
      height: 0,
      marginLeft: 2,
      verticalAlign: 'middle',
      borderTop: '4px solid',
      borderRight: '4px solid transparent',
      borderLeft: '4px solid transparent',
      marginLeft: 5,
    }
    const dropMenuStyle = {
      display: 'block',
      backgroundColor: '#1d2939',
      minWith: 200,
      border: 0,
      marginTop: 0,
      marginRight: -1,
      borderRadius: '2px 0 2px 2px',
      boxShadow: '3px 3px 0 rgba(12,12,12,0.05)',
      padding: 5,
      right: 0,
      left: 'auto',
    }

    const photourl = this.props.user && this.props.user.photourl
    const username = this.props.user && this.props.user.username

    return (
      <div className={styles['nav-item']} style={{position: 'relative'}} onClick={this.handleClick}>
        <div style={{paddingLeft:10,paddingRight:10,userSelect:'none'}}>
          <RetryImg src={photourl} style={imgStyle} />
          <span>{username}</span>
          <span style={caretStyle}></span>
        </div>
        <ul className="dropdown-menu" style={{ ...dropMenuStyle, display: this.state.visible ? 'block' : 'none' }}>
          {hasPerm('usersys.as_trader') &&
            <li onClick={this.handleMenuClick.bind(this, 'email')}>
              <i className="glyphicon glyphicon-envelope" style={{ fontSize: 11, marginRight: 5 }}></i>
              企业邮箱
            </li>
          }
          {(isLogin().is_superuser || (hasPerm('usersys.as_trader') && !hasPerm('dataroom.onlydataroom'))) &&
            <li onClick={this.handleMenuClick.bind(this, 'personal_center')}>
              <i className="glyphicon glyphicon-user" style={{ fontSize: 11, marginRight: 5 }}></i>
              个人中心
            </li>
          }
          {(isLogin().is_superuser || (hasPerm('usersys.as_trader') && !hasPerm('dataroom.onlydataroom'))) &&
            <li onClick={this.handleMenuClick.bind(this, 'basic_settings')}>
              <i className="glyphicon glyphicon-wrench" style={{ fontSize: 11, marginRight: 5 }}></i>
              基本设置
            </li>
          }
          <li onClick={this.handleMenuClick.bind(this, 'logout')}>
            <i className="glyphicon glyphicon-log-out" style={{ fontSize: 11, marginRight: 5 }}></i>
            {i18n('account.logout')}
          </li>
        </ul>
      </div>
    )
  }
}



function Header(props) {

  const { dispatch, location, currentUser, mode, collapsed, unreadMessageNum } = props

  function handleMenuClicked(param) {

    switch (param.key) {
      case "logout":
        confirm({
          title: i18n('logout_confirm'),
          onOk() {
            dispatch({ type: 'currentUser/logout' })
          },
        })
        break
      case "lang":
        changeLang(window.LANG === 'en' ? 'cn' : 'en').then(lang => {
          props.changeLang && props.changeLang();
        })
        break
      case "toggle_menu":
        dispatch({
          type: 'app/toggleMenu',
          payload: !collapsed
        })
        break
      case "chat":
        dispatch({
          type: 'app/toggleChat',
          payload: true
        })
        break
      case 'email':
        window.open('http://mail.investarget.com', '_blank', 'noopener');
        break;
      case 'personal_center':
        dispatch(routerRedux.push('/app/personal-center'));
        break;
      case 'basic_settings':
        dispatch(routerRedux.push('/app/personal-info'));
        break;
    }

  }

  const login = (
    <div className={styles["nav-item"]}>
      <Link to="/login">{i18n('account.login')}</Link>
    </div>
  )

  const register = (
    <div className={styles["nav-item"]}>
      <Link to="/register">{i18n('account.register')}</Link>
    </div>
  )

  const lang = (
    <div className={styles["nav-item"]} onClick={()=>{handleMenuClicked({key:'lang'})}}>
      {window.LANG === "en" ? "中文" : "EN"}
    </div>
  )

  const chat = (
    <div className={styles["nav-item"]} onClick={()=>{handleMenuClicked({key:'chat'})}}>
      <Badge count={unreadMessageNum}>
        <i className="glyphicon glyphicon-comment" style={{fontSize:16}} />
      </Badge>
    </div>
  )

  const source = parseInt(localStorage.getItem('source'), 10)

  return (
    <div style={{backgroundColor:'#fff', ...props.style}}>

      <Logo style={{float: 'left'}} />

      <SiteSearch />

      <div style={{height: 50,float: 'right'}} className="clearfix">
        { currentUser ? null : login }
        { currentUser ? null : register }
        {/* { lang } */}
        { currentUser ? <UserProfile user={currentUser} onMenuClick={handleMenuClicked} /> : null }
        {/* { currentUser ? chat : null } */}
      </div>
      { props.tooNarrow ? 
      <Alert style={{ marginTop: 50 }} message="窗口宽度过窄，为保证使用体验，请调整窗口宽度" banner closable />
      : null }
    </div>
  );
}

function mapStateToProps(state) {
  const { currentUser } = state
  const { collapsed, unreadMessageNum, tooNarrow } = state.app
  return { currentUser, collapsed, unreadMessageNum, tooNarrow }
}

export default connect(mapStateToProps)(Header)
