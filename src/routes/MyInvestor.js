import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import MyPartner from '../components/MyPartner'

function MyInvestor(props) {

  const action = {
    link: '/app/user/add?redirect=/app/investor/my',
    name: '新增投资人',
  }

  return (
    <LeftRightLayout location={props.location} title={i18n("myinvestor")} action={action}>
      <MyPartner type="investor" />
    </LeftRightLayout>
  )
}

export default MyInvestor
