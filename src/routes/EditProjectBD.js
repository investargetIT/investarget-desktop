import React from 'react'
import { Form, Button } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { i18n, handleError } from '../utils/util'
import { withRouter } from 'dva/router'
import * as api from '../api'

import ProjectBDForm from '../components/ProjectBDForm'

function onValuesChange(props, values) {
  console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const EditProjectBDForm = Form.create({onValuesChange, mapPropsToFields})(ProjectBDForm)

const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}

function toFormData(data) {
  var formData = {...data}

  for (let prop in formData) {
    let value = formData[prop]
    if (['bd_status', 'location', 'usertitle', 'manager'].includes(prop)) {
      formData[prop] = value.id
    }
  }

  for (let prop in formData) {
    formData[prop] = { value: formData[prop] }
  }
  return formData
}

function toData(formData) {
  return formData
}


class EditProjectBD extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      id: parseInt(this.props.params.id),
      bd: {},
    }
  }

  goBack = () => {
    this.props.router.goBack()
  }

  editProjectBD = () => {
    const { id } = this.state
    this.form.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        api.editProjBD(id, param).then(result => {
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

  componentDidMount() {
    const { id } = this.state
    api.getProjBD(id).then(result => {
      this.setState({ bd: result.data })
    }).catch(error => {
      handleError(error.message)
    })
  }

  render() {
    const data = toFormData(this.state.bd)
    return (
      <MainLayout location={this.props.location}>
        <PageTitle title={i18n('project_bd.edit_project_bd')} />
        <div>
          <EditProjectBDForm wrappedComponentRef={this.handleRef} data={data} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.editProjectBD}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </MainLayout>
    )
  }
}

export default withRouter(EditProjectBD)
