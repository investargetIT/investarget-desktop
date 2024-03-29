import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n, convertCommentFilesToAttachments } from '../utils/util'


import { Form, Button, message } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import ProjectBaseForm from '../components/ProjectBaseForm'


const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


// function onValuesChange(props, values) {
//   console.log(values)
// }
// const AddProjectForm = Form.create({onValuesChange})(ProjectBaseForm)


function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && !/industries-image-.*/.test(prop) && prop !== 'industriesKeys' && prop !== 'isAgreed') {
      data[prop] = formData[prop]
    }
  }
  data['industries'] = formData['industriesKeys'].map(key => {
    return {
      industry: formData['industries-' + key],
      bucket: 'image',
      key: formData['industries-image-' + key],
    }
  })
  return data
}


class AddProject extends React.Component {

  constructor(props) {
    super(props)

    this.addProjectFormRef = React.createRef();
  }

  goBack = () => {
    this.props.history.goBack()
  }

  addProject = () => {
    this.addProjectFormRef.current.validateFields()
      .then(values => {
        let param = toData(values)
        api.createProj(param).then(result => {
          this.goBack();
          const { projectBD } = param;
          if (projectBD) {
            const { id: projectID } = result.data;
            convertCommentFilesToAttachments(projectID, projectBD);
          }
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      })
  }

  // handleRef = (inst) => {
  //   if (inst) {
  //     this.form = inst.props.form
  //   }
  // }

  render() {
    return(
      <LeftRightLayout location={this.props.location} title={i18n('project.upload_project')}>
        <div>
          <ProjectBaseForm ref={this.addProjectFormRef} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.addProject}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }

}

export default connect()(withRouter(AddProject))
