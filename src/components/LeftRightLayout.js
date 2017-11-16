import React from 'react';
import { connect } from 'dva';
import Header from './Header';
import { Layout, Icon } from 'antd'
import SiderMenu from './SiderMenu'
import { Link } from 'dva/router'
import Chat from './Chat'
import HandleError from './HandleError'
import Draggable from 'react-draggable'
import Logo from './Logo'
import { PATH_LIST } from '../path'


const { Content, Sider } = Layout

const style = {
  position: 'absolute',
  left: (window.innerWidth - 700) / 2,
  top: (window.innerHeight - 500) / 2,
  zIndex: 2,
}
const siderStyle = {
  backgroundColor: '#1d2a3a',
}
const menuStyle = {
  padding: 15,
}
const collapsedMenuStyle = {
  padding: 5,
}

const titleWrapStyle = {
  padding: '15px 20px',
  borderBottom: '1px solid #d3d7db',
  borderTop: '1px solid #eee',
  background: '#f7f7f7',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}
const titleStyle = {
  fontSize: 28,
  color: '#1D2939',
  letterSpacing: -0.5,
  margin: 0,
}
const actionStyle = {
  fontSize: 16,
  textDecoration: 'underline',
  color: '#428bca',
}

function Navigation({ path }) {

  var paths = []
  var p = PATH_LIST.filter(item => {
    if (item.realpath instanceof RegExp) {
      return item.realpath.test(path)
    } else {
      return item.realpath == path
    }
  })[0]

  while(p) {
    paths.unshift(p)
    p = PATH_LIST.filter(item => item.key == p.parent)[0]
  }

  var len = paths.length
  return (
    <div>
      {
        paths.map((item, index) => {
          return (index == len - 1) ? (
            <span>{item.name}</span>
          ) : (
            <span>
              <Link key={item.key} to={item.path}>{item.name}</Link>&nbsp;/&nbsp;
            </span>
          )
        })
      }
    </div>
  )
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

        <Sider width={240} style={siderStyle} collapsedWidth={50} trigger={null} collapsible collapsed={this.props.collapsed}>
          { this.props.collapsed ? <div style={{height:50,backgroundColor:'#fff'}}></div> : <Logo /> }
          <div style={this.props.collapsed ? collapsedMenuStyle : menuStyle}>
            <SiderMenu collapsed={this.props.collapsed} theme="dark" />
          </div>
        </Sider>

        <Layout style={{backgroundColor: '#e4e7ea'}}>
          <Header mode="light" location={this.props.location} />

          <div style={titleWrapStyle}>
            <h2 style={titleStyle}>
              { this.props.title }
            </h2>
            <Navigation path={this.props.location.pathname} />
          </div>

          <Content style={{ padding: 20 }}>
            { this.props.action ? (
              <div style={{textAlign:'right',backgroundColor:'#fff',padding:'8px 24px'}}>
                <Link style={actionStyle} to={this.props.action.link}>{this.props.action.name}</Link>
              </div>
            ) : null }

            <div style={this.props.style || { padding: 24, background: '#fff', minHeight: 360, overflow: 'auto' }}>
              {this.props.children}
            </div>
            <Draggable cancel=".text-area"><div style={style}>
            <Chat />
            </div></Draggable>

          </Content>

        </Layout>

      </Layout>
    )

    return (
      <Layout>
        <HandleError pathname={encodeURIComponent(this.props.location.pathname + this.props.location.search)} />
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
