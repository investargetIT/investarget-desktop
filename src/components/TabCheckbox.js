import React from 'react'
import { Checkbox } from 'antd'
import { i18n, appendToArray, removeFromArray } from '../utils/util'
import { Item, ToolMore } from './ITCheckboxGroup'
import _ from 'lodash'



const containerStyle = {
  paddingRight: 60,
  position: 'relative',
}
const tabsStyle = {
  overflow: 'hidden',
}
const tabStyle = {
  marginRight: '16px',
  padding: '8px 6px 18px',
  display: 'block',
  float: 'left',
  lineHeight: '14px',
  // color: '#4a535e',
  cursor: 'pointer',
}
const activeTabStyle = {
  ...tabStyle,
  color: '#428BCA',
  backgroundColor: '#ebf0f3',
}


class TabCheckbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isMultiLine: false, // 一级菜单是否是多行
      expand: false, // 一级菜单是否展开
      activeTab: null, // 选中的一级菜单项
      toolExpand: false,
    }
  }

  handleClearTab = () => {
    this.setState({ activeTab: null })
  }

  toggleToolExpand = () => {
    if (this.state.toolExpand) {
      this.setState({
        toolExpand: false,
        expand: false,
      })
    } else {
      this.setState({
        activeTab: null, // 点击更多的时候，清除 activeTab
        toolExpand: true,
        expand: true,
      })
    }
  }

  handleSelectTab = (tab, index) => {
    this.setState({ activeTab: tab, toolExpand: false })
    this.setExpand(index)
  }

  setExpand = (index) => {
    const itemEl = this['item-' + index]
    // 指定菜单项不在第一行，展开菜单，否则，收起菜单至一行
    if (itemEl.offsetTop > 0) {
      this.setState({ expand: true })
    } else {
      this.setState({ expand: false })
    }
  }

  getSubOptions = (tabId) => {
    const { options } = this.props
    const item = options.filter(item => item.value == tabId)[0]
    return item && item.children ? item.children : []
  }

  handleChange = (v) => {
    const { value, onChange } = this.props
    const { activeTab } = this.state
    const subOptions = this.getSubOptions(activeTab)
    const allSubValue = subOptions.map(item => item.value)
    const newValue = appendToArray(removeFromArray(value, allSubValue), v)
    if (onChange) {
      onChange(newValue)
    }
  }

  handleResize = () => {
    if (this.listEl) {
      // 重新确定一级菜单项的行数
      let isMultiLine = this.listEl.scrollHeight > 40
      this.setState({ isMultiLine })

      // 重新确定一级菜单是否应该展开
      const tabs = this.props.options.map(item => item.value)
      const index = tabs.indexOf(this.state.activeTab)
      if (index > -1) {
        this.setExpand(index)
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.handleResize()
  }

  componentDidMount() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  render() {
    const { options, value } = this.props
    const { isMultiLine, expand, toolExpand, activeTab } = this.state

    const subOptions = this.getSubOptions(activeTab)
    const subValue = subOptions.map(item => item.value).filter(item => value.includes(item))

    return (
      <div>
        <div style={containerStyle} ref={el => this.containerEl = el}>

          <ul
            ref={el => this.listEl = el}
            style={{...tabsStyle, height: expand ? 'auto' : 40}}
            className="clearfix"
          >
            <Item label="不限" checked={activeTab == null} onCheck={this.handleClearTab} closable={false} style={{marginTop:5}} />
            {
              options.map((item, index) => {
                const isActive = item.value == activeTab
                const subOptions = this.getSubOptions(item.value)
                const checkedSubOptions = subOptions.map(item => item.value).filter(v => value.includes(v))
                const checkedNum = checkedSubOptions.length
                return (
                  <li
                    key={item.value}
                    onClick={this.handleSelectTab.bind(this, item.value, index)}
                    style={isActive ? activeTabStyle : tabStyle}
                    ref={el => this['item-' + index] = el}
                  >
                    {item.label}
                    {checkedNum > 0 ? `(${checkedNum})` : null}
                  </li>
                )})
            }
          </ul>

          {isMultiLine ? (
            <ToolMore style={{top:5}} expand={toolExpand} onToggle={this.toggleToolExpand} />
          ) : null}
        </div>
        {subOptions.length > 0 ? (
          <CheckboxGroup options={subOptions} value={subValue} onChange={this.handleChange} />
        ) : null}
      </div>
    )
  }
}

export default TabCheckbox



class CheckboxGroup extends React.Component {

  toggleCheckAll = () => {
    const { options, value } = this.props
    const all = options.map(item => item.value)
    const isAllChecked = _.isEqual(all, value)
    if (isAllChecked) {
      this.onChange([])
    } else {
      this.onChange(all)
    }
  }

  handleCheck = (v) => {
    const { value } = this.props
    const newValue = appendToArray(value, v)
    this.onChange(newValue)
  }

  handleUncheck = (v) => {
    const { value } = this.props
    const newValue = removeFromArray(value, v)
    this.onChange(newValue)
  }

  onChange = (value) => {
    const { onChange } = this.props
    if (onChange) {
      onChange(value)
    }
  }

  render() {
    const { options, value } = this.props
    const allValue = options.map(item => item.value)
    const isAllChecked = _.isEqual(allValue, value)

    const listStyle = {
      padding: '12px 0 8px 0',
      backgroundColor: '#ebf0f3',
      width: '100%',
    }

    return (
      <ul style={{...listStyle, ...this.props.containerStyle}} className="clearfix">
        <Item
          label={i18n('common.select_all')}
          checked={isAllChecked}
          onCheck={this.toggleCheckAll}
          closable={false}
        />
        {
          options.map(item => {
            const isChecked = value.includes(item.value) // 多选，数组
            return (
              <Item
                key={item.value}
                label={item.label}
                checked={isChecked}
                onCheck={this.handleCheck.bind(this, item.value)}
                onUncheck={this.handleUncheck.bind(this, item.value)}
              />
            )
          })
        }
      </ul>
    )
  }
}
