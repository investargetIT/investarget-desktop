import React from 'react'
import { Menu, Layout, Icon } from 'antd'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { KEY_TO_URI, KEY_TO_ICON } from '../constants'
import { i18n } from '../utils/util'
import classNames from 'classnames'
import styles from './SiderMenu.css'

const { SubMenu } = Menu
const { Sider } = Layout

const menuStyle = {
  padding: 15,
}
const collapsedMenuStyle = {
  padding: 5,
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

  toggelMenu = () => {
    this.props.dispatch({
      type: 'app/toggleMenu',
      payload: !this.props.collapsed
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

    const menuStyle = {
      padding: this.props.collapsed ? 5 : 10,
      height: '100%',
      overflowY: 'scroll',
    }

    return (
    <div className={styles["sider-menu"]} style={menuStyle}>
      {/* <div
        style={{textAlign: 'center',backgroundColor:'rgba(117, 117, 117, 0.2)',borderRadius:2,marginBottom:10,height:30,lineHeight:'30px',cursor:'pointer'}}
        onClick={this.toggelMenu}
      >
        <Icon
          style={{fontSize:16,verticalAlign:'middle'}}
          type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
        />
      </div> */}
      <Menu
        prefixCls="it-menu"
        theme={this.props.theme}
        mode={"inline"}
        inlineCollapsed={this.props.collapsed}
        inlineIndent={0}
        selectedKeys={this.props.selectedKeys}
        onSelect={this.handleSelect.bind(this)}
        openKeys={this.props.openKeys}
        onOpenChange={this.handleOpenChange.bind(this)}
      >
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
    </div>
    )
  }

}

function mapStateToProps(state) {
  const { selectedKeys, openKeys } = state.app
  const { menulist } = state.currentUser
  return { selectedKeys, openKeys, menulist }
}

export default connect(mapStateToProps)(SiderMenu)
