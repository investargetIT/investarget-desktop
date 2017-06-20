import React from 'react';
import { connect } from 'dva';
import styles from './MainLayout.css';
import Header from './Header';
import { Layout, Breadcrumb } from 'antd'
import { routerRedux } from 'dva/router'
import { FormattedMessage } from 'react-intl'
import SiderMenu from './SiderMenu'

const { Content, Sider } = Layout

class MainLayout extends React.Component {

  render () {

    const content = (
      <Content style={this.props.style || { background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        {this.props.children}
      </Content>
    )

    const sideBarAndContent = (
      <Layout>

        <Sider trigger={null} collapsible collapsed={this.props.collapsed}>
          <SiderMenu mode={this.props.collapsed ? 'vertical': 'inline'} collapsed={this.props.collapsed} theme="light" style={{ height: '100%' }} />
        </Sider>

        <Layout style={{ padding: '0 24px 24px' }}>

          <Breadcrumb style={{ margin: '12px 0' }}>
            <Breadcrumb.Item><FormattedMessage id="header.home" /></Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>

          {content}

        </Layout>

      </Layout>
    )

    return (
      <Layout>

        <Header mode={this.props.currentUser ? "dark" : "light"} location={this.props.location} />

        { this.props.currentUser ? sideBarAndContent : content }

      </Layout>
    )
  }
}

function mapStateToProps(state) {
  const { currentUser } = state
  const { collapsed } = state.app
  return { currentUser, collapsed }
}

export default connect(mapStateToProps)(MainLayout)
