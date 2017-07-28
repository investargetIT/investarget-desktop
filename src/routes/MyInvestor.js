import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import MyPartner from '../components/MyPartner'

function MyInvestor(props) {
  return (
    <LeftRightLayout location={props.location} title={i18n("myinvestor")}>
      <MyPartner type="investor" />
    </LeftRightLayout>
  )
}

export default MyInvestor