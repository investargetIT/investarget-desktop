import React from 'react'
import { Menu, Layout, Icon } from 'antd'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { FormattedMessage } from 'react-intl'

const { SubMenu } = Menu
const { Sider } = Layout

class SiderMenu extends React.Component {

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

  render() {

    const navTextStyle = this.props.collapsed ? { display: 'none' } : null
    const iconStyle = this.props.collapsed ? { fontSize: 16, marginLeft: 8 } : null

    return (
      <Menu theme={this.props.theme} mode={this.props.mode} selectedKeys={this.props.selectedKeys} onSelect={this.handleSelect.bind(this)} onOpenChange={this.handleOpenChange.bind(this)} style={this.props.style}>

        <SubMenu key="sub1" title={<span><Icon style={iconStyle} type="heart" /><span style={navTextStyle}><FormattedMessage id="menu.project_management" /></span></span>}>
          <Menu.Item key="/app/products"><FormattedMessage id="menu.upload_project" /></Menu.Item>
          <Menu.Item key="/app/users"><FormattedMessage id="menu.platform_projects" /></Menu.Item>
        </SubMenu>

        <Menu.Item>
          <span>
            <Link to="/app/organization/list">
              <Icon style={iconStyle} type="github" />
              <span style={navTextStyle}>
                <FormattedMessage id="menu.institution" />
              </span>
            </Link>
          </span>
        </Menu.Item>

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
    )
  }
}

function mapStateToProps(state) {
  const { selectedKeys, openKeys } = state.app
  return { selectedKeys, openKeys }
}

export default connect(mapStateToProps)(SiderMenu)
