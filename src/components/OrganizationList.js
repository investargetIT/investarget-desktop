import React from 'react'
import { Icon } from 'antd'
import TabCheckbox from './TabCheckbox'
import { OrganizationListFilter } from '../components/Filter'
import { Link } from 'dva/router'


const styles = {
  title: {
    fontSize: '16px',
    marginBottom: '24px',
  },
  right: {
    float: 'right',
  }
}

function OrganizationList({ filter, filterOnChange }) {



  return (
    <div>
      <div style={styles.title}>
        <span>机构列表</span>
        <span style={styles.right}>
          <Link to="/app/organization/add">
            <Icon type="plus" />新增机构
          </Link>
        </span>
      </div>
      <OrganizationListFilter value={filter} onChange={filterOnChange} />
    </div>
  )
}

export default OrganizationList
