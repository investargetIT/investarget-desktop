import React from 'react'
import { Menu, Layout, Icon } from 'antd'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { FormattedMessage } from 'react-intl'

const { SubMenu } = Menu
const { Sider } = Layout

class SiderMenu extends React.Component {

  state = {
    menu: [
      {
        nameKey: "menu.project_management",
        iconUrl: "heart",
        hasChildren: true,
        subMenu: [
          {
            nameKey: "menu.upload_project",
            uri: null,
            iconUrl: null
          },
          {
            nameKey: "menu.platform_projects",
            uri: null,
            iconUrl: null
          }
        ]
      },
      { nameKey: "menu.institution", iconUrl: "github", uri: "/app/organization/List" },
      { nameKey: "menu.email_manage", iconUrl: "android", uri: null },
      { nameKey: "menu.timeline_manage", iconUrl: "apple", uri: null },
      { nameKey: "menu.user_management", iconUrl: "windows", uri: "/app/investor/list" },
      { nameKey: "menu.dataroom", iconUrl: "ie", uri: null },
      { nameKey: "menu.inbox",
        iconUrl: "chrome",
        subMenu: [
          { nameKey: "menu.reminder", iconUrl: null, uri: null }
        ]
      },
      { nameKey: "menu.user_center",
        iconUrl: "aliwangwang",
        uri: null,
        subMenu: [
          { nameKey: "menu.change_password", iconUrl: null, uri: null },
          { nameKey: "menu.profile", iconUrl: null, uri: null }
        ]
      },
      { nameKey: "menu.log", iconUrl: "dingding", uri: null }
    ]
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

  render() {

    const navTextStyle = this.props.collapsed ? { display: 'none' } : null
    const iconStyle = this.props.collapsed ? { fontSize: 16, marginLeft: 8 } : null

    return (
      <Menu theme={this.props.theme} mode={this.props.mode} selectedKeys={this.props.selectedKeys} onSelect={this.handleSelect.bind(this)} onOpenChange={this.handleOpenChange.bind(this)} style={this.props.style}>
        {
          this.state.menu.map(m => {
            if (m.subMenu && m.subMenu.length > 0) {
              return <SubMenu key={m.nameKey} title={<span><Icon style={iconStyle} type={m.iconUrl} /><span style={navTextStyle}><FormattedMessage id={m.nameKey} /></span></span>}>
                { m.subMenu.map(n => <Menu.Item key={n.nameKey}><Link to={n.uri}><FormattedMessage id={n.nameKey} /></Link></Menu.Item>) }
              </SubMenu>
            } else {
              return (
                <Menu.Item key={m.nameKey}>
                    <Link to={m.uri}>
                      <Icon style={iconStyle} type={m.iconUrl} />
                      <span style={navTextStyle}>
                        <FormattedMessage id={m.nameKey} />
                      </span>
                    </Link>
                </Menu.Item>
              )
            }
          })
        }
      </Menu>
    )
  }

}

function mapStateToProps(state) {
  const { selectedKeys, openKeys } = state.app
  return { selectedKeys, openKeys }
}

export default connect(mapStateToProps)(SiderMenu)
