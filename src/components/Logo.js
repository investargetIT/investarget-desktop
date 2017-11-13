import React from 'react'
import { Icon } from 'antd'
import { Link } from 'dva/router'
import { i18n, getCurrentUser } from '../utils/util'


const logoStyle = {
  padding: 10,
  background: '#fff',
  borderRight: '1px solid #eee',
}
const logoImgStyle = {
  height: 30,
  padding: '4px 8px',
  verticalAlign: 'top',
}


function Logo() {

  const source = parseInt(localStorage.getItem('source'), 10)
  const currentUser = getCurrentUser()

  return (
    <div style={logoStyle}>
      <Link to={ currentUser ? "/app" : "/" }>
        {source === 2 ?
          <img style={logoImgStyle} src="/images/autospace.png" />
          : null }
        {source === 1 ?
          <img style={{ ...logoImgStyle, background: '#10458F' }} src="/images/investarget.png" />
          : null }
        {!source ?
          <div><Icon type="home" />{i18n('common.home')}</div>
          : null }
      </Link>
    </div>
  )
}

export default Logo
