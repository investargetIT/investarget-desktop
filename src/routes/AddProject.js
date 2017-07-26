import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'


import { Form, Button, message } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import ProjectBaseForm from '../components/ProjectBaseForm'


const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


function onValuesChange(props, values) {
  console.log(values)
}
const AddProjectForm = Form.create({onValuesChange})(ProjectBaseForm)


function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && prop !== 'industriesKeys' && prop !== 'isAgreed') {
      data[prop] = formData[prop]
    }
  }
  data['industries'] = formData['industriesKeys'].map(key => formData['industries-' + key])
  return data
}


class AddProject extends React.Component {

  constructor(props) {
    super(props)
  }

  goBack = () => {
    this.props.router.goBack()
  }

  addProject = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        api.createProj(param).then(result => {
          this.props.router.replace('/app/projects/published')
        })
      } else {
        message.error(err.message)
      }
    })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  render() {
    return(
      <MainLayout location={this.props.location}>
        <PageTitle title="新增项目" actionTitle="新增 Market Place" actionLink="/app/marketplace/add" />
        <div>
          <AddProjectForm wrappedComponentRef={this.handleRef} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>取消</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.addProject}>提交</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

}

export default withRouter(AddProject)
