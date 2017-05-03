import React from 'react';
import styles from './MainLayout.css';
import Header from './Header';
import { Layout, Menu, Breadcrumb, Icon } from 'antd'
import { Link, routerRedux } from 'dva/router'
import { connect } from 'dva'

const {	SubMenu } = Menu
const { Content, Sider } = Layout

class MainLayout extends React.Component {

  componentDidMount() {
    if (!this.props.currentUser) {
      this.props.dispatch(routerRedux.replace('/login')) 
    }
  }

  render () {
    return (
      <Layout>

	<Header location={this.props.location} />

	<Layout>

	  <Sider width={200} style={{ background: '#fff' }}>
	    <Menu
	      mode="inline"
	      defaultSelectedKeys={['1']}
	      defaultOpenKeys={['sub1']}
	      style={{ height: '100%' }}
	    >
	      <SubMenu key="sub1" title={<span><Icon type="user" />项目管理</span>}>
		<Menu.Item key="1">发布项目</Menu.Item>
		<Menu.Item key="2">平台项目</Menu.Item>
	      </SubMenu>
	      <Menu.Item><span><Icon type="user" />机构管理</span></Menu.Item>
	      <Menu.Item><span><Icon type="user" />邮件管理</span></Menu.Item>
	      <Menu.Item><span><Icon type="user" />时间轴管理</span></Menu.Item>

	      <SubMenu key="sub2" title={<span><Icon type="laptop" />会员管理</span>}>
		<Menu.Item key="5"><Link to="/users">投资人</Link></Menu.Item>
		<Menu.Item key="6">项目方</Menu.Item>
		<Menu.Item key="7">交易师</Menu.Item>
	      </SubMenu>

	      <Menu.Item><span><Icon type="user" />Data Room</span></Menu.Item>
	      <SubMenu key="sub3" title={<span><Icon type="notification" />消息中心</span>}>
		<Menu.Item key="12">提醒消息</Menu.Item>
	      </SubMenu>
	      <SubMenu title={<span><Icon type="user" />个人中心</span>}>
		<Menu.Item>修改密码</Menu.Item>
		<Menu.Item>个人信息</Menu.Item>
	      </SubMenu>
	      <Menu.Item><span><Icon type="user" />日志查询</span></Menu.Item>
	    </Menu>
	  </Sider>

	  <Layout style={{ padding: '0 24px 24px' }}>
	    <Breadcrumb style={{ margin: '12px 0' }}>
	      <Breadcrumb.Item>Home</Breadcrumb.Item>
	      <Breadcrumb.Item>List</Breadcrumb.Item>
	      <Breadcrumb.Item>App</Breadcrumb.Item>
	    </Breadcrumb>
	    <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
	      {this.props.children}
	    </Content>
	  </Layout>

	</Layout>

      </Layout>
    );
  }
}

function mapStateToProps(state) {
  const { currentUser } = state
  return { currentUser }
}

export default connect(mapStateToProps)(MainLayout)
