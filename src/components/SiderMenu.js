import React from 'react'
import { Menu, Layout, Icon } from 'antd'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { KEY_TO_URI } from '../constants'
import { i18n } from '../utils/util'

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
    const navTextStyle = {}
    var iconStyle = {
      display: 'inline-block',
      width: 20,
      height: 21,
      marginRight: 10,
      textAlign: 'center',
      verticalAlign: 'top',
    }
    if (this.props.collapsed) {
      iconStyle['marginRight'] = 0
    }

    const siderStyle = {
      padding: '5px 15px',
    }
    const collapsedSiderWidth = {
      padding: '5px',
    }

    return (
      <Menu
        style={this.props.collapsed ? collapsedSiderWidth : siderStyle}
        prefixCls="it-menu"
        theme={this.props.theme}
        mode={this.props.collapsed ? "vertical" : "inline"}
        inlineIndent={0}
        selectedKeys={this.props.selectedKeys}
        onSelect={this.handleSelect.bind(this)}
        openKeys={this.props.openKeys}
        onOpenChange={this.handleOpenChange.bind(this)}>

        {
          this.props.menulist.filter(f => !f.parentmenu).map(m => {
            const subMenu = this.props.menulist.filter(f => f.parentmenu === m.id)
            if (subMenu.length > 0) {
              return (
                <SubMenu
                  key={m.namekey}
                  title={(
                    <span>
                      <img style={iconStyle} src={m.icon_normal} />
                      <span style={navTextStyle}>{i18n(`menu.${m.namekey}`)}</span>
                    </span>)}
                >
                  { subMenu.map(n => (
                    <Menu.Item key={n.namekey}>
                      <Link to={KEY_TO_URI[n.namekey]}>
                        <i className="fa fa-caret-right"></i>
                        {i18n(`menu.${n.namekey}`)}
                      </Link>
                    </Menu.Item>)
                  )}
                </SubMenu>
              )
            } else {
              return (
                <Menu.Item key={m.namekey}>
                  <Link to={KEY_TO_URI[m.namekey]}>
                    <img style={iconStyle} src={m.icon_normal} />
                    <span style={navTextStyle}>
                      {i18n(`menu.${m.namekey}`)}
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
  const { menulist } = state.currentUser
  return { selectedKeys, openKeys, menulist }
}

export default connect(mapStateToProps)(SiderMenu)
