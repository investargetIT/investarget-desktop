import React from 'react'
import { connect } from 'dva'
import MainLayout from '../components/MainLayout'
import OrganizationListComponent from '../components/OrganizationList'



function OrganizationList({ dispatch, industryOptions, selectedIndustries, filter }) {

  function filterOnChange(type, value) {
    dispatch({
      type: 'organizationList/filterOnChange',
      payload: {
        type,
        value
      }
    })
  }

  return (
    <MainLayout location={location}>
      <OrganizationListComponent
        filterOnChange={filterOnChange}
        filter={filter}
      />
    </MainLayout>
  )

}


function mapStateToProps(state) {

  const { isOversea, currency, transactionPhases, industries, tags, organizationTypes } = state.organizationList

  const filter = { isOversea, currency, transactionPhases, industries, tags, organizationTypes }

  return {
    filter,
  }
}

export default connect(mapStateToProps)(OrganizationList)
