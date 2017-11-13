import React from 'react'
import { Menu, Layout, Icon } from 'antd'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { KEY_TO_URI } from '../constants'
import { i18n } from '../utils/util'

const { SubMenu } = Menu
const { Sider } = Layout

class SiderMenu extends React.Component {

  constructor(props) {
    super(props)

    const submenuIds = _.uniq(this.props.menulist.filter(f => f.parentmenu != null).map(f => f.parentmenu))
    this.rootSubmenuKeys = this.props.menulist.filter(f => submenuIds.includes(f.id)).map(f => f.namekey)
  }


  handleSelect({item, key, selectedKeys}) {
    this.props.dispatch({
      type: 'app/menuSelect',
      payload: selectedKeys
    })
  }

  handleOpenChange(openKeys) {
    const latestOpenKey = openKeys.find(key => this.props.openKeys.indexOf(key) === -1);
    var keys = []
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      keys = [...openKeys]
    } else {
      keys = latestOpenKey ? [latestOpenKey] : []
    }
    this.props.dispatch({
      type: 'app/menuOpen',
      payload: keys,
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

    return (
      <Menu
        prefixCls="it-menu"
        theme={this.props.theme}
        mode={"inline"}
        inlineCollapsed={this.props.collapsed}
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
