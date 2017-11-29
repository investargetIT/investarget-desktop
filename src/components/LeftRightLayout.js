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
import { PATH_LIST } from '../path'
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
}
const titleStyle = {
  fontSize: 30,
  lineHeight: '30px',
  color: '#232323',
}
const actionStyle = {
  float: 'right',
  fontSize: 16,
  textDecoration: 'underline',
  color: '#428bca',
}


class LeftRightLayout extends React.Component {

  render () {

    const content = (
      <Content style={this.props.style || { background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        {this.props.children}
      </Content>
    )

    const headStyle = {position:'fixed',zIndex:1,top:0,left:0,width:'100%',height:50}
    const siderStyle = {position:'fixed',zIndex:1,top:70,left:0,bottom:0,backgroundColor: '#1d2a3a'}

    const sideBarAndContent = (
      <Layout style={{height:'100%'}}>

        <Header location={this.props.location} style={headStyle} />

        <Layout style={{marginTop: 50,paddingTop:20,height:'100%'}}>

          <Sider width={240} style={siderStyle} collapsedWidth={50} trigger={null} collapsible collapsed={this.props.collapsed}>
            <SiderMenu collapsed={this.props.collapsed} theme="dark" />
          </Sider>

          <Content className={styles['content']} style={{marginLeft: 240,paddingLeft:20}}>
            <div style={{padding: 30,backgroundColor:'#fff'}}>
              <div style={titleWrapStyle}>
                <h2 style={titleStyle}>
                  { this.props.title }
                </h2>
                { this.props.action ? (
                    <Link style={actionStyle} to={this.props.action.link}>{this.props.action.name}</Link>
                ) : null }
              </div>

              <div style={{ padding: 24, minHeight: 360, background: '#fff', overflow: 'auto', ...this.props.style }}>
                {this.props.children}
              </div>
              <Draggable cancel=".text-area"><div style={style}>
              <InstantMessage />
              </div></Draggable>
            </div>
          </Content>

        </Layout>

      </Layout>
    )

    return (
      <Layout style={{height:'100%'}}>
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
