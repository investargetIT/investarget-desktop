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
import * as api from '../api';
import { handleError } from '../utils/util';

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
  // color: '#428bca',
}


class LeftRightLayout extends React.Component {

  componentDidMount() {
    api.checkToken().catch(handleError);
  }

  reload() {
    window.location.reload()
  }

  render () {

    const content = (
      <Content style={this.props.style || { background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        {this.props.children}
      </Content>
    )

    const headStyle = {position:'fixed',zIndex:11,top:0,left:0,width:'100%',height:50}
    const siderStyle = {position:'fixed',top:50,left:0,bottom:0,zIndex: 9, backgroundColor: '#1d2a3a', transition: 'none'}

    const sideBarAndContent = (
      <Layout style={{}}>

        {!this.props.hideHeader && <Header location={this.props.location} style={headStyle} changeLang={this.reload.bind(this)} />}

        <Layout style={{ marginTop: 50, minHeight: 'calc(100vh - 50px)' }}>
          {!this.props.hideSider && (
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
          )}

          <Content className={styles['content']} style={{ paddingLeft: 20, paddingTop: 20 }}>
            <div style={this.props.style || {padding: 30,backgroundColor:'#fff'}}>
              <div style={titleWrapStyle}>
                           
                <h2 style={titleStyle}>
                  { this.props.title }
                </h2>
                {this.props.name ?(<span><h2 style={titleStyle}>&nbsp;/&nbsp;</h2>
                <div style={nameStyle}>
                  {this.props.name}
                </div></span>):null
                }
                {this.props.breadcrumb ?
                  <div style={nameStyle}>{this.props.breadcrumb}</div>
                  : null}
                
                { this.props.action ? (
                    <Link style={{ ...actionStyle, ...this.props.action.style }} to={this.props.action.link} disabled={this.props.action.disabled}>{this.props.action.name}</Link>
                ) : null }
                { this.props.right ? (
                  <div style={{float:'right'}}>{this.props.right}</div>
                ) : null }
              </div>

              <div style={{ padding: 0, minHeight: 360, background: '#fff', overflow: 'hidden', marginTop: 20, ...this.props.innerStyle }}>
                {this.props.children}
              </div>
              <Draggable cancel=".text-area"><div style={style}>
              {/* <InstantMessage /> */}
              </div></Draggable>
            </div>
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

export default connect(mapStateToProps)(LeftRightLayout)
