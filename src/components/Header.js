import React from 'react';
import { Menu, Icon, Modal } from 'antd';
import { Link } from 'dva/router';
import { connect } from 'dva'
import { FormattedMessage } from 'react-intl'

const confirm = Modal.confirm

function Header({ dispatch, location, currentUser, mode, collapsed }) {

  function handleMenuClicked(param) {

    switch (param.key) {
      case "/logout":
        confirm({
          title: 'Are you sure to logout?',
          onOk() {
            dispatch({ type: 'currentUser/logout' })
          },
        })
        break
      case "lang":
        const url = location.basename === "/en" ? location.pathname : `/en${location.pathname}`
        window.location.href = url
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
      <Link to="/login"><FormattedMessage id="header.login" /></Link>
    </Menu.Item>
  )

  const logout = (
    <Menu.Item key="/logout" style={{float: 'right'}}>
      <FormattedMessage id="header.out" />
    </Menu.Item>
  )

  const register = (
    <Menu.Item key="/register" style={{float: 'right'}}>
      <Link to="/register"><FormattedMessage id="header.sign_up" /></Link>
    </Menu.Item>
  )

  return (
    <Menu
      selectedKeys={[location.pathname]}
      mode="horizontal"
      theme={mode}
      onClick={handleMenuClicked}>

      <Menu.Item key="/">
        <Link to={ currentUser ? "/app" : "/" }><Icon type="home" /><FormattedMessage id="header.home" /></Link>
      </Menu.Item>

      <Menu.Item key="toggle_menu">
        <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
      </Menu.Item>

      <Menu.Item key="lang" style={{float: 'right'}}>{location.basename === "/en" ? "中文" : "EN"}</Menu.Item>

      { currentUser ? logout : login }

      { currentUser ? null : register }

      { currentUser ? <Menu.Item key="chat" style={{ float: 'right' }}>IM</Menu.Item> : null }

    </Menu>
  );
}

function mapStateToProps(state) {
  const { currentUser } = state
  const { collapsed } = state.app
  return { currentUser, collapsed }
}

export default connect(mapStateToProps)(Header)
