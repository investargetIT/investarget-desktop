import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'

function AccessDenied(props) {
  return <LeftRightLayout location={props.location}>
    <h1>You are not allowed to access this page!</h1>
  </LeftRightLayout>
}

export default AccessDenied
