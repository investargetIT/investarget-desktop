import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import { connect } from 'dva'
import { FormattedMessage } from 'react-intl'

function Header({ dispatch, location, currentUser }) {

  function handleMenuClicked(param) {

    switch (param.key) {
      case "/logout":
	dispatch({ type: 'currentUser/logout' })
	break
      case "lang":
	const url = location.basename === "/en" ? location.pathname : `/en${location.pathname}`
	window.location.href = url
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
      theme={ currentUser ? "dark" : "light" }
      onClick={handleMenuClicked}>

      <Menu.Item key="/">
        <Link to={ currentUser ? "/app" : "/" }><Icon type="home" /><FormattedMessage id="header.home" /></Link>
      </Menu.Item>

      <Menu.Item key="lang" style={{float: 'right'}}>{location.basename === "/en" ? "中文" : "EN"}</Menu.Item>

      { currentUser ? logout : login }

      { currentUser ? null : register }

    </Menu>
  );
}

function mapStateToProps(state) {
  const { currentUser } = state
  return { currentUser }
}

export default connect(mapStateToProps)(Header)
