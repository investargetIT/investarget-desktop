import React from 'react'
import { connect } from 'dva'
import MainLayout from '../components/MainLayout';
import AddOrganizationComponent from '../components/AddOrganization'


function AddOrganization({ dispatch, industryOptions}) {

  function goBack() {
    dispatch({
      type: 'addOrganization/goBack'
    })
  }

  return (
    <MainLayout location={location}>
      <AddOrganizationComponent
        industryOptions={industryOptions}
        goBack={goBack}
      />
    </MainLayout>
  )
}


function mapStateToProps(state) {
  const { industries } = state.app
  var industryOptions = []
  var industryOptionsMap = {}
  industries.forEach(item => {
    if (item.id == item.pIndustryId) {
      let industry = {
        value: item.id,
        label: item.industryName,
        children: [],
      }
      industryOptions.push(industry)
      industryOptionsMap[item.id] = industry
    }
  })
  industries.forEach(item => {
    if (item.id != item.pIndustryId) {
      industryOptionsMap[item.pIndustryId].children.push({
        value: item.id,
        label: item.industryName
      })
    }
  })

  return {
    industryOptions
  }
}

export default connect(mapStateToProps)(AddOrganization)
