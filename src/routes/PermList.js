import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'

function PermList(props) {
  return (
    <LeftRightLayout
      location={props.location}
      title={i18n("permission_management")} />
  )
}

export default PermList
