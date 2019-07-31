import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import MyPartner from '../components/MyPartner'

function MyTrader(props) {
  return (
    <LeftRightLayout
      location={props.location}
      title={i18n("user.mytrader")}
      action={{ name: i18n("user.add_trader"), link: "/app/trader/add" }}>
      <MyPartner type="trader" location={props.location} />
    </LeftRightLayout>
  )
}

export default MyTrader
