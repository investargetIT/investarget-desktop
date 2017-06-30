import React from 'react'
import { Link } from 'dva/router'
import { Icon } from 'antd'
const styles = {
  title: {
    fontSize: '16px',
    marginBottom: '24px',
  },
  right: {
    float: 'right',
  }
}

function PageTitle(props) {
  return(
    <div style={styles.title}>
      <span>{props.title}</span>
      {
        (props.actionLink && props.actionTitle) ? (
          <span style={styles.right}>
            <Link to={props.actionLink}>
              <Icon type="plus" />{props.actionTitle}
            </Link>
          </span>
        ) : null
      }
    </div>
  )
}

export default PageTitle
