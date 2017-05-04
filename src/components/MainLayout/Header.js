import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import { connect } from 'dva'

function Header({ dispatch, location }) {

  function handleMenuClicked(param) {
    if (param.key === "/logout") {

      dispatch({ type: 'currentUser/logout' })
    }
  }

  return (
    <Menu
      selectedKeys={[location.pathname]}
      mode="horizontal"
      theme="dark"
      onClick={handleMenuClicked}>

      <Menu.Item key="/">
	<Link to="/"><Icon type="home" />Home</Link>
      </Menu.Item>

      <Menu.Item key="/users">
	<Link to="/users"><Icon type="bars" />Users</Link>
      </Menu.Item>

      <Menu.Item key="/404">
	<Link to="/page-you-dont-know"><Icon type="frown-circle" />404</Link>
      </Menu.Item>

      <Menu.Item key="/products">
	<Link to="/products">Products</Link>
      </Menu.Item>

      <Menu.Item key="/logout">Logout</Menu.Item>

    </Menu>
  );
}

export default connect()(Header)
