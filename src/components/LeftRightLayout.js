import React from 'react';
import { connect } from 'dva';
import styles from './MainLayout.css';
import Header from './Header';
import { Layout, Breadcrumb } from 'antd'
import { FormattedMessage } from 'react-intl'
import SiderMenu from './SiderMenu'

const { Content, Sider } = Layout

class LeftRightLayout extends React.Component {

  render () {

    const content = (
      <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        {this.props.children}
      </Content>
    )

    const sideBarAndContent = (
      <Layout>

        <Sider trigger={null} collapsible collapsed={this.props.collapsed}>
          <div style={{ height: 32, background: '#333', borderRadius: 6, margin: 16 }} /> 
          <SiderMenu mode={this.props.collapsed ? 'vertical': 'inline'} collapsed={this.props.collapsed} theme="dark" />
        </Sider>

        <Layout>

          {/*<Layout.Header style={{ background: '#fff', padding: 0 }}>*/}
            <Header mode="light" location={this.props.location} />
          {/*</Layout.Header>*/}

          <Content style={{ margin: '0 16px' }}>

            <Breadcrumb style={{ margin: '12px 0' }}>
              <Breadcrumb.Item><FormattedMessage id="header.home" /></Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>

            <div style={{ padding: 24, background: '#fff', minHeight: 360, overflow: 'auto' }}>
              {this.props.children}
            </div>

          </Content>

          <Layout.Footer style={{ textAlign: 'center' }}>Ant Design ©2016 Created by Ant UED</Layout.Footer>

        </Layout>

      </Layout>
    )

    return <Layout>{ this.props.currentUser ? sideBarAndContent : content }</Layout>
  }

}

function mapStateToProps(state) {
  const { currentUser } = state
  const { collapsed } = state.app
  return { currentUser, collapsed }
}

export default connect(mapStateToProps)(LeftRightLayout)
