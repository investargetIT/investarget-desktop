import React from 'react'
import { Icon } from 'antd'
import { Link } from 'dva/router'
import { i18n, getCurrentUser } from '../utils/util'


const logoStyle = {
  height: 48,
  background: '#fff',
  borderRight: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
}
const logoImgStyle = {
  verticalAlign: 'top',
  height: '80%',
}


function Logo(props) {

  const source = parseInt(localStorage.getItem('source'), 10)
  const currentUser = getCurrentUser()

  return (
    <div style={{...logoStyle, ...props.style}}>
      {/* <Link to={ currentUser ? "/app" : "/" }> */}
        {source === 6 ?
          <img style={logoImgStyle} src="/images/rejutec_logo.jpeg" />
          : null }
        {source === 5 ?
          <img style={logoImgStyle} src="/images/logo_hongyun.jpg" />
          : null }
        {source === 4 ?
          <img style={logoImgStyle} src="/images/logo_delova_biotech.png" />
          : null }
        {source === 3 ?
          <img style={logoImgStyle} src="/images/aura_logo.png" />
          : null }
        {source === 2 ?
          <img style={logoImgStyle} src="/images/autospace.png" />
          : null }
        {source === 1 ?
          <img style={logoImgStyle} src="/images/investarget_new_new_logo.png" />
          : null }
        {!source ?
          <div><Icon type="home" />{i18n('common.home')}</div>
          : null }
      {/* </Link> */}
    </div>
  )
}

export default Logo
