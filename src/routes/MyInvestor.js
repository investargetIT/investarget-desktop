import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import MyPartner from '../components/MyPartner'

function MyInvestor(props) {

  const action = {
    link: `/app/user/add?redirect=${encodeURIComponent(props.location.pathname)}`,
    name: i18n('user.create_investor'),
  }

  return (
    <LeftRightLayout location={props.location} title={i18n("user.myinvestor")} action={action}>
      <MyPartner type="investor" location={props.location} />
    </LeftRightLayout>
  )
}

export default MyInvestor
