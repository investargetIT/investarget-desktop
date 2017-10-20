import React from 'react'
import { Form, Button } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { i18n, handleError } from '../utils/util'
import * as api from '../api'
import { withRouter } from 'dva/router'

import ProjectBDForm from '../components/ProjectBDForm'

function onValuesChange(props, values) {
  console.log(values)
}
const AddProjectBDForm = Form.create({onValuesChange})(ProjectBDForm)

function toData(formData) {
  return formData
}



const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


class AddProjectBD extends React.Component {

  constructor(props) {
    super(props)
  }

  goBack = () => {
    this.props.router.goBack()
  }

  addProjectBD = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        api.addProjBD(param).then(result => {
          this.props.router.goBack()
        }).catch(error => {
          handleError(error.message)
        })
      }
    })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  render() {
    return (
      <MainLayout location={this.props.location}>
        <PageTitle title={i18n('project_bd.add_project_bd')} />
        <div>
          <AddProjectBDForm isAdd wrappedComponentRef={this.handleRef} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.addProjectBD}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </MainLayout>
    )
  }
}

export default withRouter(AddProjectBD)
