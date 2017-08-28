import React from 'react';
import { connect } from 'dva';
import styles from './MainLayout.css';
import Header from './Header';
import { Layout, Icon } from 'antd'
import SiderMenu from './SiderMenu'
import { Link } from 'dva/router'
import Chat from './Chat'
import HandleError from './HandleError'
import Draggable from 'react-draggable'

const { Content, Sider } = Layout

const style = {
  position: 'absolute',
  left: (window.innerWidth - 700) / 2,
  top: (window.innerHeight - 500) / 2,
  zIndex: 2,
}

class LeftRightLayout extends React.Component {

  render () {

    const content = (
      <Content style={this.props.style || { background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
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

          <Content style={{ margin: '16px' }}>

            <div style={this.props.style || { padding: 24, background: '#fff', minHeight: 360, overflow: 'auto' }}>

              { this.props.title ?
                <div style={{ fontSize: '16px', marginBottom: '24px' }}>
                  <span>{this.props.title}</span>
                  {this.props.action ? <span style={{ float: 'right' }}><Link to={this.props.action.link}><Icon type="plus" />{this.props.action.name}</Link></span> : null}
                </div> : null }

              {this.props.children}

            </div>
            <Draggable cancel=".text-area"><div style={style}>
            <Chat />
            </div></Draggable>

          </Content>

          <Layout.Footer style={{ textAlign: 'center' }}>Ant Design ©2016 Created by Ant UED</Layout.Footer>

        </Layout>

      </Layout>
    )

    return (
      <Layout>
        <HandleError pathname={this.props.location.pathname} />
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

export default connect(mapStateToProps)(LeftRightLayout)
