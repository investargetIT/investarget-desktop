import React from 'react';
import { connect } from 'dva';
import Header from './Header';
import { Layout, Icon } from 'antd'
import SiderMenu from './SiderMenu'
import { Link } from 'dva/router'
import InstantMessage from './InstantMessage'
import HandleError from './HandleError'
import Draggable from 'react-draggable'
import Logo from './Logo'
import styles from './LeftRightLayout.css'


const { Content, Sider } = Layout

const style = {
  position: 'absolute',
  left: (window.innerWidth - 700) / 2,
  top: (window.innerHeight - 500) / 2,
  zIndex: 2,
}



const titleWrapStyle = {
  paddingBottom: 16,
  borderBottom: '1px solid #ccc',
  overflow: 'auto',
}
const titleStyle = {
  fontSize: 30,
  lineHeight: '30px',
  color: '#232323',
  float: 'left',
}
const nameStyle = {
  fontSize: 16,
  lineHeight: '40px',
  color: '#232323',
  float: 'left',
}
const actionStyle = {
  float: 'right',
  fontSize: 16,
  textDecoration: 'underline',
  color: '#428bca',
}


class LeftRightLayoutPure extends React.Component {

  reload() {
    window.location.reload()
  }

  render () {

    const content = (
      <Content style={this.props.style || { background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        {this.props.children}
      </Content>
    )

    const headStyle = {position:'fixed',zIndex:10,top:0,left:0,width:'100%',height:50}
    const siderStyle = {position:'fixed',top:50,left:0,bottom:0,zIndex: 9, backgroundColor: '#1d2a3a', transition: 'none'}

    const sideBarAndContent = (
      <Layout style={{}}>

        <Header location={this.props.location} style={headStyle} changeLang={this.reload.bind(this)} />

        <Layout style={{ marginTop: 50, minHeight: '100vh' }}>

          <Sider
            trigger={null}
            collapsible
            collapsed={this.props.collapsed}
            // width={240}
            // style={siderStyle}
            // collapsedWidth={50}
          >
            <SiderMenu ref="sidemenu" collapsed={this.props.collapsed} theme="dark" />
          </Sider>

          <Content style={{ padding: 20 }}>
            {this.props.children}
          </Content>

        </Layout>

      </Layout>
    )

    return (
      <Layout style={{}}>
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

export default connect(mapStateToProps)(LeftRightLayoutPure)
