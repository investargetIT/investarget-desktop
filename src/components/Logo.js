import React from 'react'
import { Icon } from 'antd'
import { Link } from 'dva/router'
import { i18n, getCurrentUser } from '../utils/util'


const logoStyle = {
  height: 50,
  background: '#fff',
  borderRight: '1px solid #eee',
}
const logoImgStyle = {
  verticalAlign: 'top',
  height: '100%',
}


function Logo(props) {

  const source = parseInt(localStorage.getItem('source'), 10)
  const currentUser = getCurrentUser()

  return (
    <div style={{...logoStyle, ...props.style}}>
      <Link to={ currentUser ? "/app" : "/" }>
        {source === 2 ?
          <img style={{...logoImgStyle, padding: 10}} src="/images/autospace.png" />
          : null }
        {source === 1 ?
          <img style={logoImgStyle} src="/images/logo.png" />
          : null }
        {!source ?
          <div><Icon type="home" />{i18n('common.home')}</div>
          : null }
      </Link>
    </div>
  )
}

export default Logo
