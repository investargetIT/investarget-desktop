import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n, hasPerm } from '../utils/util'
import MyPartner from '../components/MyPartner'

function MyInvestor(props) {

  const action = {
    link: hasPerm('usersys.admin_adduser') || hasPerm('usersys.user_adduser') ? `/app/user/add?redirect=${encodeURIComponent(props.location.pathname)}` : null,
    name: i18n('user.create_investor'),
    style: !hasPerm('usersys.admin_adduser') && !hasPerm('usersys.user_adduser') ? { color: 'gray' } : null,
  }

  return (
    <LeftRightLayout location={props.location} title={i18n("user.myinvestor")} action={action}>
      <MyPartner type="investor" location={props.location} />
    </LeftRightLayout>
  )
}

export default MyInvestor
