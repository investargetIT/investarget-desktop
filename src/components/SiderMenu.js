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
    const navTextStyle = this.props.collapsed ? { display: 'none' } : { verticalAlign: 'middle' }
    const iconImgStyle = this.props.collapsed ? { width: 20, height: 20,  margin: '11px 6px' } : { width: 16, height: 16, marginRight: 8, verticalAlign: 'middle' }

    return (
      <Menu
        prefixCls="it-menu"
        theme={this.props.theme}
        mode={this.props.mode}
        inlineCollapsed={true}
        inlineIndent={0}
        selectedKeys={this.props.selectedKeys}
        onSelect={this.handleSelect.bind(this)}
        openKeys={this.props.openKeys}
        onOpenChange={this.handleOpenChange.bind(this)} style={this.props.style}>

        {
          this.props.menulist.filter(f => !f.parentmenu).map(m => {
            const subMenu = this.props.menulist.filter(f => f.parentmenu === m.id)
            if (subMenu.length > 0) {
              return <SubMenu key={m.namekey} title={<span><img style={iconImgStyle} src={m.icon_normal} /><span style={navTextStyle}>{i18n(`menu.${m.namekey}`)}</span></span>}>
                { subMenu.map(n => (
                  <Menu.Item key={n.namekey}>
                    <Link to={KEY_TO_URI[n.namekey]}>
                      <i className="fa fa-caret-right"></i>
                      {i18n(`menu.${n.namekey}`)}
                    </Link>
                  </Menu.Item>)
                )}
              </SubMenu>
            } else {
              return (
                <Menu.Item key={m.namekey}>
                  <Link to={KEY_TO_URI[m.namekey]}>
                    <img style={iconImgStyle} src={m.icon_normal} />
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
