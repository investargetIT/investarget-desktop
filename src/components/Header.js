import React from 'react';
import { Menu, Icon, Modal, Badge, Input, Popover } from 'antd';
import { Link, withRouter } from 'dva/router';
import { connect } from 'dva'
import { SOURCE } from '../api'
import qs from 'qs'
import { i18n } from '../utils/util'
import styles from './Header.css'
import classNames from 'classnames'

const confirm = Modal.confirm

const headerStyle = {
  height: 50,
  borderBottom: 'none',
}
const searchStyle = {
  float: 'left',
  position: 'relative',
  width: 250,
  height: 50,
  borderRight: '1px solid #eee',
}
const searchInputStyle = {
  height: '100%',
  width: '100%',
  border: 'none',
  outline: 'none',
  padding: '18px 20px',
  paddingRight: 40,
}
const searchIconStyle = {
  position: 'absolute',
  right: 8,
  top: 15,
  zIndex: 1,
  fontSize: 20,
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
      borderRadius:50
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
          <img src={photourl} style={imgStyle} />
          <span>{username}</span>
          <span style={caretStyle}></span>
        </div>
        <ul className="dropdown-menu" style={{...dropMenuStyle, display: this.state.visible ? 'block' : 'none'}}>
          <li onClick={this.handleMenuClick.bind(this, 'logout')}>
            <i className="glyphicon glyphicon-log-out"></i> Log Out
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
        const url = location.basename === "/en" ? location.pathname : `/en${location.pathname}`
        const query = qs.stringify(location.query)
        window.location.href = url + (query.length > 0 ? '?' + query : '')
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
    }

  }

  function handleChangeSearch(e) {
    const search = e.target.value
    props.dispatch({ type: 'app/saveSearch', payload: search })
  }

  function handleSearch(e) {
    if (e.keyCode == 13) {
      let search = e.target.value
      props.dispatch({ type: 'app/globalSearch', payload: search })
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
      {location.basename === "/en" ? "中文" : "EN"}
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
    <div style={{backgroundColor:'#fff'}}>
      <div
        onClick={() => {handleMenuClicked({key:'toggle_menu'})}}
        className={classNames(styles['menutoggle'], {[styles['menutoggle-collapsed']]: collapsed})}>
        <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
      </div>
      <div style={searchStyle}>
        <input
          placeholder="搜索一下"
          style={searchInputStyle}
          value={props.search}
          onChange={handleChangeSearch}
          onKeyUp={handleSearch}
        />
        <Icon type="search" style={searchIconStyle}/>
      </div>

      <div style={{height: 50,float: 'right'}} className="clearfix">
        { currentUser ? null : login }
        { currentUser ? null : register }
        { lang }
        { currentUser ? <UserProfile user={currentUser} onMenuClick={handleMenuClicked} /> : null }
        { currentUser ? chat : null }
      </div>

    </div>
  );
}

function mapStateToProps(state) {
  const { currentUser } = state
  const { collapsed, unreadMessageNum, search } = state.app
  return { currentUser, collapsed, unreadMessageNum, search }
}

export default connect(mapStateToProps)(withRouter(Header))
