import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import MyPartner from '../components/MyPartner'

function MyTrader(props) {
  return (
    <LeftRightLayout location={props.location} title={i18n("mytrader")}>
      <MyPartner type="trader" />
    </LeftRightLayout>
  )
}

export default MyTrader