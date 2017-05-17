import React from 'react';
import { connect } from 'dva';
import styles from './MainLayout.css';
import Header from './Header';
import { Layout, Menu, Breadcrumb, Icon } from 'antd'
import { Link, routerRedux } from 'dva/router'
import { FormattedMessage } from 'react-intl'

const {	SubMenu } = Menu
const { Content, Sider } = Layout

class MainLayout extends React.Component {

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

  render () {
    const content = <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
	      {this.props.children}
	    </Content>

    const sideBarAndContent = <Layout>

	  <Sider width={200} style={{ background: '#fff' }}>
	    <Menu
        mode="inline"
        selectedKeys={this.props.selectedKeys}
        onSelect={this.handleSelect}
        openKeys={this.props.openKeys}
        onOpenChange={this.handleOpenChange}
        style={{ height: '100%' }}
	    >
	      <SubMenu key="sub1" title={<span><Icon type="user" /><FormattedMessage id="menu.project_management" /></span>}>
          <Menu.Item key="/app/products"><Link to="/app/products"><FormattedMessage id="menu.upload_project" /></Link></Menu.Item>
          <Menu.Item key="/app/users"><FormattedMessage id="menu.platform_projects" /></Menu.Item>
	      </SubMenu>
	      <Menu.Item><span><Icon type="user" /><FormattedMessage id="menu.institution" /></span></Menu.Item>
	      <Menu.Item><span><Icon type="user" /><FormattedMessage id="menu.email_manage" /></span></Menu.Item>
	      <Menu.Item><span><Icon type="user" /><FormattedMessage id="menu.timeline_manage" /></span></Menu.Item>

	      <SubMenu key="sub2" title={<span><Icon type="laptop" /><FormattedMessage id="menu.user_management" /></span>}>
          <Menu.Item key="/app/investor/list"><Link to="/app/investor/list"><FormattedMessage id="menu.investor" /></Link></Menu.Item>
          <Menu.Item key="6"><FormattedMessage id="menu.supplier" /></Menu.Item>
          <Menu.Item key="7"><FormattedMessage id="menu.transaction" /></Menu.Item>
	      </SubMenu>

	      <Menu.Item><span><Icon type="user" /><FormattedMessage id="menu.dataroom" /></span></Menu.Item>
	      <SubMenu key="sub3" title={<span><Icon type="notification" /><FormattedMessage id="menu.inbox" /></span>}>
          <Menu.Item key="12"><FormattedMessage id="menu.reminder" /></Menu.Item>
	      </SubMenu>
	      <SubMenu title={<span><Icon type="user" /><FormattedMessage id="menu.user_center" /></span>}>
          <Menu.Item><FormattedMessage id="menu.change_password" /></Menu.Item>
          <Menu.Item><FormattedMessage id="menu.profile" /></Menu.Item>
	      </SubMenu>
	      <Menu.Item><span><Icon type="user" /><FormattedMessage id="menu.log" /></span></Menu.Item>
	    </Menu>
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

    return (
      <Layout>

	<Header mode={this.props.currentUser ? "dark" : "light"} location={this.props.location} />

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

export default connect(mapStateToProps)(MainLayout)
