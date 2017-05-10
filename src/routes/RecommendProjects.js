import React from 'react'
import { connect } from 'dva'
import RecommendProjectsComponent from '../components/RecommendProjects/RecommendProjects'

function RecommendProjects({ dispatch, projects, selectedProjects }) {

  function onProjectToggle(project) {
    dispatch({
      type: 'recommendProjects/toggleProject',
      payload: project
    })
  }

  function onProjectsSkip() {
    dispatch({
      type: 'recommendProjects/skipProjects',
    })
  }

  function onProjectsSubmit() {
    dispatch({
      type: 'recommendProjects/addProjects'
    })
  }

  return (
      <RecommendProjectsComponent
        projects={projects}
        selectedProjects={selectedProjects}
        onProjectToggle={onProjectToggle}
        onProjectsSkip={onProjectsSkip}
        onProjectsSubmit={onProjectsSubmit}
      />
  )
}

function mapStateToProps(state) {
  const { projects, selectedProjects } = state.recommendProjects
  return { projects, selectedProjects }
}

export default connect(mapStateToProps)(RecommendProjects)
