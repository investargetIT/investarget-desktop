import React from 'react'
import { 
  Menu, 
  Layout, 
  Alert, 
  Modal, 
} from 'antd';
import { connect } from 'dva'
import { Link } from 'dva/router'
import { KEY_TO_URI, KEY_TO_ICON } from '../constants'
import { i18n } from '../utils/util'
import classNames from 'classnames'
import styles from './SiderMenu.css'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu
const { Sider } = Layout

const menuStyle = {
  padding: 15,
}
const collapsedMenuStyle = {
  padding: 5,
}
const menuToggleIconStyle = {
  fontSize: 16,
  verticalAlign:'middle',
  color: '#8f939e',
}

class SiderMenu extends React.Component {

  constructor(props) {
    super(props)

    const submenuIds = _.uniq(this.props.menulist.filter(f => f.parentmenu != null).map(f => f.parentmenu))
    this.rootSubmenuKeys = this.props.menulist.filter(f => submenuIds.includes(f.id)).map(f => f.namekey)
    this.state = {
      showCollapseIcon: true, 
    }
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

  componentDidMount() {
    window.addEventListener("resize", this.checkPageWidth);
    this.checkPageWidth();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.checkPageWidth);
  }

  checkPageWidth = () => {
    const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (w < 960) {
      this.props.dispatch({
        type: 'app/toggleMenu',
        payload: true
      });
      this.props.dispatch({
        type: 'app/showOrHideTooNarrowWarning',
        payload: true
      });
      this.setState({ showCollapseIcon: false }); 
    } else if (w < 1200) {
      this.props.dispatch({
        type: 'app/toggleMenu',
        payload: true
      });
      this.props.dispatch({
        type: 'app/showOrHideTooNarrowWarning',
        payload: false 
      }); 
      this.setState({ showCollapseIcon: false });
    } else {
      this.props.dispatch({
        type: 'app/showOrHideTooNarrowWarning',
        payload: false  
      }); 
      this.setState({ showCollapseIcon: true });
    }
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
      iconStyle['marginLeft'] = 7
      iconStyle['marginRight'] = 0
    }

    const menuStyle = {
      height: '100%',
    }
    return (
    <div className={styles["sider-menu"]} style={menuStyle}>

      { this.state.showCollapseIcon ? (
      <div
        style={{textAlign: 'center',backgroundColor:'rgba(117, 117, 117, 0.2)',borderRadius:4,marginBottom:4,height:30,lineHeight:'30px',cursor:'pointer'}}
        onClick={this.toggelMenu}
      >
            {
              this.props.collapsed ?
                <MenuUnfoldOutlined style={menuToggleIconStyle} />
                :
                <MenuFoldOutlined style={menuToggleIconStyle} />
            }
      </div>
      ) : null }
  
      <Menu
        theme={this.props.theme}
        mode="inline"
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
                  icon={KEY_TO_ICON[m.namekey]}
                  title={i18n(`menu.${m.namekey}`)}
                  // title={(
                  //   <span style={{display: 'block'}}>
                  //     <span style={{...iconStyle, marginLeft: this.props.collapsed ? 7 : 0}} className={classNames('icon', KEY_TO_ICON[m.namekey])}></span>
                  //     <span style={navTextStyle} className="title">{i18n(`menu.${m.namekey}`)}</span>
                  //   </span>)}
                >
                  {
                    subMenu.map(n => (
                      <Menu.Item key={n.namekey}>
                        <Link to={KEY_TO_URI[n.namekey]}>
                          {/* <i className="fa fa-caret-right"></i> */}
                          {i18n(`menu.${n.namekey}`)}
                        </Link>
                      </Menu.Item>)
                    )
                  }
                </SubMenu>
              )
            } else {
              return (
                <Menu.Item key={m.namekey} icon={KEY_TO_ICON[m.namekey]}>
                  <Link to={KEY_TO_URI[m.namekey]}>
                    {/* <span style={iconStyle} className={classNames('icon', KEY_TO_ICON[m.namekey])}></span> */}
                    {/* <span style={navTextStyle} className="title"> */}
                      {i18n(`menu.${m.namekey}`)}
                    {/* </span> */}
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
  const { selectedKeys, openKeys } = state.app;
  const { menulist: originalMenuList } = state.currentUser;
  // 排除客户端不需要的菜单
  const newMenuList = originalMenuList.filter(f => {
    const hasSubMenu = originalMenuList.filter(f1 => f1.parentmenu === f.id).length > 0;
    const inClient = Object.keys(KEY_TO_URI).includes(f.namekey);
    if (!f.parentmenu && !hasSubMenu && !inClient) {
      return false;
    }
    if (f.parentmenu && !inClient) {
      return false;
    }
    return true;
  });
  return {
    selectedKeys,
    openKeys,
    menulist: newMenuList,
  };
}

export default connect(mapStateToProps)(SiderMenu)
