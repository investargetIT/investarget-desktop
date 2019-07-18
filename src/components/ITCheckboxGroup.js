import React from 'react'
import styles from './ITCheckboxGroup.css'
import { appendToArray, removeFromArray } from '../utils/util';


const containerStyle = {
  paddingRight: 60,
  position: 'relative',
}
const listStyle = {
  overflow: 'hidden',
  height: 24,
}
const expandListStyle = {
  ...listStyle,
  height: 'auto',
}
const closeStyle = {
  marginLeft: 4,
  padding: 3,
  cursor: 'pointer',
}
const toolStyle = {
  position: 'absolute',
  zIndex: 1,
  right: 0,
  top: 0,
  width: 60,
  height: 20,
  lineHeight: '20px',
  textAlign: 'right',
  cursor: 'pointer',
}
const labelStyle = {

}
const iconStyle = {
  marginLeft: 8,
  marginTop: 7,
  verticalAlign:'top',
}


// 受控组件，不支持非受控模式
class ITCheckboxGroup extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isMultiLine: false,
      expand: false,
    }
  }

  toggleExpand = () => {
    this.setState({ expand: !this.state.expand })
  }

  handleMouseEnter = () => {
    this.setState({ expand: true })
  }

  handleMouseLeave = () => {
    // this.setState({ expand: false })
  }

  handleClear = () => {
    this.onChange([])
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

  handleResize = () => {
    if (this.listEl) {
      let isMultiLine = this.listEl.scrollHeight > 24 // 单行高度
      this.setState({ isMultiLine })
    }
  }

  componentWillReceiveProps(nextProps) {
    // TODO 不知为什么：展开/收起侧边栏，会触发这个钩子函数。
    this.handleResize()
  }

  componentDidMount() {
    // 组件加载完手动触发一次 resize
    this.handleResize()
    // TODO 页面侧边栏的展开/收起时也需要触发 resize
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  render() {
    const { value, onChange, options } = this.props // value 数组类型

    return (
      <div style={containerStyle} onMouseLeave={this.handleMouseLeave}>
        <ul ref={el => {this.listEl = el}} className="clearfix" style={this.state.expand ? expandListStyle : listStyle}>

          <Item label="不限" checked={!value || value.length == 0} onCheck={this.handleClear} closable={false} />

          {options.map(item => {
            const isChecked = value.includes(item.value)
            return (
              <Item
                key={item.value}
                label={item.label}
                checked={isChecked}
                onCheck={this.handleCheck.bind(this, item.value)}
                onUncheck={this.handleUncheck.bind(this, item.value)}
              />
            )
          })}
        </ul>

        {this.state.isMultiLine ? (
          <ToolMore
            expand={this.state.expand}
            onToggle={this.toggleExpand}
            onMouseEnter={this.handleMouseEnter}
          />
        ) : null}
      </div>
    )
  }
}

export default ITCheckboxGroup


function ToolMore(props) {
  const toolStyle = {
    position: 'absolute',
    zIndex: 1,
    right: 0,
    top: 0,
    width: 60,
    height: 20,
    lineHeight: '20px',
    textAlign: 'right',
    cursor: 'pointer',
  }
  const labelStyle = {

  }
  const iconStyle = {
    marginLeft: 8,
    marginTop: 7,
    verticalAlign:'top',
  }
  const { expand } = props
  return (
    <div style={{...toolStyle, ...props.style}} onClick={props.onToggle} onMouseEnter={props.onMouseEnter}>
      <span style={labelStyle}>{expand ? '收起' : '更多' }</span>
      {expand ? (
        <img style={iconStyle} src="/images/arrow-up.png" />
      ) : (
        <img style={iconStyle} src="/images/arrow-down.png" />
      )}
    </div>
  )
}


function Item(props) {
  const itemStyle = {
    float: 'left',
    marginRight: 16,
    marginBottom: 4,
    padding: '0 6px',
    height: 20,
    lineHeight: '20px',
    color: '#656565',
    borderRadius: 4,
    listStyle: 'none',
    cursor: 'pointer',
  }
  const checkedItemStyle = {
    ...itemStyle,
    backgroundColor: '#237ccc',
    color: '#fff',
  }
  const closeStyle = {
    marginLeft: 4,
    padding: 3,
    cursor: 'pointer',
  }

  const canClose = (props.closable !== false)
  const style = props.checked ? checkedItemStyle : itemStyle
  return (
    <li style={{...style, ...props.style}} className={styles['item']}>
      <span onClick={props.onCheck}>{props.label}</span>
      {canClose && props.checked ? (
        <i className="fa fa-times" style={closeStyle} onClick={props.onUncheck}></i>
      ) : null}
    </li>
  )
}

export { ToolMore, Item }
