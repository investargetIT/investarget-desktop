import React from 'react'
import MainLayout from '../components/MainLayout'

function AccessDenied(props) {
  return <MainLayout location={props.location}>
    <h1>You are not allowed to access this page!</h1>
  </MainLayout>
}

export default AccessDenied