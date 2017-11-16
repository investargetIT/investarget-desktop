import React from 'react';
import { Menu, Icon, Modal, Badge, Input, Popover } from 'antd';
import { Link } from 'dva/router';
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

function UserProfile(props) {
  return (
    <div style={{borderLeft:'1px solid #eee',float:'left'}}>
      <div style={{padding:'12px 10px'}}>
        <img src="http://themetrace.com/demo/bracket/images/photos/loggeduser.png" style={{verticalAlign:'center',marginRight:5,width:26,borderRadius:50}} />
        <span>John Doe</span>
        <span style={caretStyle}></span>
      </div>
      <ul className="dropdown-menu pull-right">
        <li>
          <i className="glyphicon glyphicon-log-out"></i> Log Out
        </li>
      </ul>
    </div>
  )
}



function Header({ dispatch, location, currentUser, mode, collapsed, unreadMessageNum }) {

  function handleMenuClicked(param) {
    console.log('@@', param)

    switch (param.key) {
      case "/logout":
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

  const login = (
    <Menu.Item key="/login" style={{float: 'right'}}>
      <Link to="/login">{i18n('account.login')}</Link>
    </Menu.Item>
  )

  const logout = (
    <Menu.Item key="/logout" style={{float: 'right'}}>
      {i18n('account.logout')}
    </Menu.Item>
  )

  const register = (
    <Menu.Item key="/register" style={{float: 'right'}}>
      <Link to="/register">{i18n('account.register')}</Link>
    </Menu.Item>
  )

  const source = parseInt(localStorage.getItem('source'), 10)

  return (
    <div>
      <div
        onClick={() => {handleMenuClicked({key:'toggle_menu'})}}
        className={classNames(styles['menutoggle'], {[styles['menutoggle-collapsed']]: collapsed})}>
        <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
      </div>
      <div style={searchStyle}>
        <input style={searchInputStyle} placeholder="搜索一下" />
        <Icon type="search" style={searchIconStyle}/>
      </div>

      <div style={{height: 50,float: 'right'}} className="clearfix">
        <UserProfile />
      </div>
      <Menu
        style={headerStyle}
        selectedKeys={[location.pathname]}
        mode="horizontal"
        theme={mode}
        onClick={handleMenuClicked}>


        <Menu.Item key="lang" style={{float: 'right'}}>{location.basename === "/en" ? "中文" : "EN"}</Menu.Item>

        { currentUser ? logout : login }

        { currentUser ? null : register }

        { currentUser ? <Menu.Item key="chat" style={{ float: 'right' }}><Badge count={unreadMessageNum}>{i18n("msg")}</Badge></Menu.Item> : null }

      </Menu>
    </div>
  );
}

function mapStateToProps(state) {
  const { currentUser } = state
  const { collapsed, unreadMessageNum } = state.app
  return { currentUser, collapsed, unreadMessageNum }
}

export default connect(mapStateToProps)(Header)
