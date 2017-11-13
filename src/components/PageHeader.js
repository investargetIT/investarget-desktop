import React from 'react'
import { Link } from 'dva/router'

const style = {
  padding: 15,
  borderBottom: '1px solid #d3d7db',
  borderTop: '1px solid #eee',
  background: '#f7f7f7',
  position: 'relative',
}
const titleStyle = {
  fontSize: 28,
  color: '#1D2939',
  letterSpacing: -0.5,
  margin: 0,
}
const descStyle = {
  fontSize: 13,
  textTransform: 'none',
  color: '#999',
  fontStyle: 'italic',
  verticalAlign: 'middle',
  letterSpacing: 0,
}
const slashStyle = {
  margin: '0 10px 0 5px',
  color: '#ccc',
}
const actionStyle = {
  position: 'absolute',
  top: 23,
  right: 25,
  textDecoration: 'underline',
  color: '#428bca',
}


function PageHeader(props) {
  return (
    <div style={style}>
      <h2 style={titleStyle}>
        { props.title }
        { props.desc ? (
          <span style={descStyle}>
            <i style={slashStyle}>/</i>
            { props.desc }
          </span>
        ) : null }
      </h2>

      { props.action ? (
        <Link style={actionStyle} to={props.action.link}>{props.action.name}</Link>
      ) : null }
    </div>
  )
}

export default PageHeader
