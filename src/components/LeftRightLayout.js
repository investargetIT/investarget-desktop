import React from 'react';
import { connect } from 'dva';
import styles from './MainLayout.css';
import Header from './Header';
import { Layout, Menu, Breadcrumb, Icon } from 'antd'
import { Link, routerRedux } from 'dva/router'
import { FormattedMessage } from 'react-intl'

const {	SubMenu } = Menu
const { Content, Sider } = Layout

class LeftRightLayout extends React.Component {

  constructor(props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleOpenChange = this.handleOpenChange.bind(this)
  }

  componentDidMount() {
    //if (!this.props.currentUser) {
      //this.props.dispatch(routerRedux.replace('/login'))
    //}
  }

  handleSelect({item, key, selectedKeys}) {
    this.props.dispatch({
      type: 'app/menuSelect',
      payload: selectedKeys
    })
  }

  handleOpenChange(openKeys) {
    this.props.dispatch({
      type: 'app/menuOpen',
      payload: openKeys
    })
  }

  state = {
    collapsed: false,
    mode: 'inline'
  }

  onCollapse = (collapsed) => {
    this.setState({
      collapsed,
      mode: collapsed ? 'vertical': 'inline'
    })
  }

  render () {
    const navTextStyle = this.state.collapsed ? { display: 'none' } : null
    const iconStyle = this.state.collapsed ? { fontSize: 16, marginLeft: 8 } : null
    const content = <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
	      {this.props.children}
	    </Content>

    const sideBarAndContent = <Layout>

      <Sider
        collapsible
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
      >
        <div style={{ height: 32, background: '#333', borderRadius: 6, margin: 16 }} />
        <Menu
          theme="dark"
          mode={this.state.mode}
          selectedKeys={this.props.selectedKeys}
          onSelect={this.handleSelect}
          onOpenChange={this.handleOpenChange}
        >
          <SubMenu key="sub1" title={<span><Icon style={iconStyle} type="heart" /><span style={navTextStyle}><FormattedMessage id="menu.project_management" /></span></span>}>
            <Menu.Item key="/app/products"><Link to="/app/products"><FormattedMessage id="menu.upload_project" /></Link></Menu.Item>
            <Menu.Item key="/app/users"><FormattedMessage id="menu.platform_projects" /></Menu.Item>
          </SubMenu>
          <Menu.Item><span><Icon style={iconStyle} type="github" /><span style={navTextStyle}>menu</span></span></Menu.Item>
          <Menu.Item><span><Icon style={iconStyle} type="android" /><span style={navTextStyle}><FormattedMessage id="menu.email_manage" /></span></span></Menu.Item>
          <Menu.Item><span><Icon style={iconStyle} type="apple" /><span style={navTextStyle}><FormattedMessage id="menu.timeline_manage" /></span></span></Menu.Item>

          <SubMenu key="sub2" title={<span><Icon style={iconStyle} type="windows" /><span style={navTextStyle}><FormattedMessage id="menu.user_management" /></span></span>}>
            <Menu.Item key="/app/investor/list"><Link to="/app/investor/list"><FormattedMessage id="menu.investor" /></Link></Menu.Item>
            <Menu.Item key="6"><FormattedMessage id="menu.supplier" /></Menu.Item>
            <Menu.Item key="7"><FormattedMessage id="menu.transaction" /></Menu.Item>
          </SubMenu>

          <Menu.Item><span><Icon style={iconStyle} type="ie" /><span style={navTextStyle}><FormattedMessage id="menu.dataroom" /></span></span></Menu.Item>
          <SubMenu key="sub3" title={<span><Icon style={iconStyle} type="chrome" /><span style={navTextStyle}><FormattedMessage id="menu.inbox" /></span></span>}>
            <Menu.Item key="12"><FormattedMessage id="menu.reminder" /></Menu.Item>
          </SubMenu>
          <SubMenu title={<span><Icon style={iconStyle} type="aliwangwang" /><span style={navTextStyle}><FormattedMessage id="menu.user_center" /></span></span>}>
            <Menu.Item><FormattedMessage id="menu.change_password" /></Menu.Item>
            <Menu.Item><FormattedMessage id="menu.profile" /></Menu.Item>
          </SubMenu>
          <Menu.Item><span><Icon style={iconStyle} type="dingding" /><span style={navTextStyle}><FormattedMessage id="menu.log" /></span></span></Menu.Item>
        </Menu>
      </Sider>

          <Layout>
            <Layout.Header style={{ background: '#fff', padding: 0 }}><Header mode="light" location={this.props.location} /></Layout.Header>

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
          <Layout.Footer style={{ textAlign: 'center' }}>
                        Ant Design ©2016 Created by Ant UED
                      </Layout.Footer>
      </Layout>

	</Layout>

    return (
      <Layout>


        { this.props.currentUser ? sideBarAndContent : content }

      </Layout>
    );
  }
}

function mapStateToProps(state) {
  const { currentUser } = state
  const { selectedKeys, openKeys } = state.app
  return { currentUser, selectedKeys, openKeys }
}

export default connect(mapStateToProps)(LeftRightLayout)
