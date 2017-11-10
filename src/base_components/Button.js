import { Button as _Button } from 'antd'
import classNames from 'classnames'


// icon, loading, shape 属性暂未适配

function Button(props) {

  const {
    prefixCls='it-btn',
    type='default',
    size,
    ghost,
    children,
    className,
    ...extraProps
  } = props

  const sizeMap = {
    'large': 'lg',
    'small': 'sm',
    'xs': 'xs',
  }

  const classes = classNames(
    'btn',
    {
      [`btn-${type}`]: !ghost,
      [`btn-${type}-alt`]: ghost,
      [`it-btn-ghost`]: ghost,
      [`btn-${sizeMap[size]}`]: size,
    },
    className
  )

  return (
    <_Button
      prefixCls={prefixCls}
      className={classes}>{children}</_Button>
  )
}

function ButtonGroup(props) {

  const {
    prefixCls = 'it-btn-group',
    children,
    className,
    ...extraPros,
  } = props

  const classes = classNames(
    'btn-group',
    className,
  )

  return (
    <_Button.Group
      prefixCls={prefixCls}
      className={classes}
    >
      {children}
    </_Button.Group>
  )
}

Button.Group = ButtonGroup

export default Button
