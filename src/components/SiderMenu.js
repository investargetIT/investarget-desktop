import React from 'react'
import { Menu, Layout, Icon } from 'antd'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { KEY_TO_URI } from '../constants'
import { i18n } from '../utils/util'
import classNames from 'classnames'

const { SubMenu } = Menu
const { Sider } = Layout

const KEY_TO_ICON = {
  'dashboard': 'fa fa-home',
  'project_library': 'glyphicon glyphicon-book',
  'project_management': 'glyphicon glyphicon-list',
  'bd_management': 'glyphicon glyphicon-lock',
  'email_management': 'fa fa-envelope-o',
  'schedule_management': 'fa fa-calendar',
  'user_management': 'fa fa-group',
  'myinvestor': 'fa fa-user',
  'mytrader': 'fa fa-user-plus',
  'timeline_management': 'fa fa-tasks',
  'dataroom_management': 'fa fa-folder',
  'inbox_management': 'glyphicon glyphicon-envelope',
  'user_center': 'fa fa-cogs',
  'permission_management': 'fa fa-sitemap',
  'log': 'fa fa-search',
}


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
    const navTextStyle = {
      verticalAlign: 'middle',
    }
    var iconStyle = {
      fontSize: 16,
      verticalAlign: 'middle',
      marginRight: 10,
      width: 16,
      textAlign: 'center',
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
                    <span style={{display: 'block'}}>
                      <span style={iconStyle} className={classNames('icon', KEY_TO_ICON[m.namekey])}></span>
                      <span style={navTextStyle} className="title">{i18n(`menu.${m.namekey}`)}</span>
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
                    <span style={iconStyle} className={classNames('icon', KEY_TO_ICON[m.namekey])}></span>
                    <span style={navTextStyle} className="title">
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
