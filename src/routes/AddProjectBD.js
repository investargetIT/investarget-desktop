import React from 'react'
import { Form, Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { i18n, handleError, getCurrentUser, hasPerm } from '../utils/util'
import * as api from '../api'
import { withRouter } from 'dva/router'
import FormError from '../utils/FormError';

import ProjectBDForm from '../components/ProjectBDForm'

function onValuesChange(props, values) {
  console.log(values)
}
const AddProjectBDForm = Form.create({onValuesChange})(ProjectBDForm)

function toData(formData) {
  if (!('bduser' in formData)) {
    formData['bduser'] = null
    formData['useremail'] = formData.email
    formData['usermobile'] = (formData.mobileAreaCode && formData.mobile) ? `+${formData.mobileAreaCode}-${formData.mobile}` : formData.mobile;
  }
  if (!['中国', 'China'].includes(formData.country.label)) {
    formData['location'] = null;
  }
  formData.country = formData.country.value;
  if (!hasPerm('BD.manageProjectBD')) {
    // formData.manager = getCurrentUser();
    formData.contractors = getCurrentUser();
  }
  return formData
}



const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


class AddProjectBD extends React.Component {

  constructor(props) {
    super(props)
    console.log(props)
  }

  goBack = () => {
    this.props.router.goBack()
  }

  handleSubmitBtnClicked = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        this.addProjBD(values).then(this.props.router.goBack).catch(handleError);
      }
    });
  }

  addProjBD = async (values) => {
    const param = toData(values);
    const { com_name } = param;
    const getProjBD = await api.getProjBDList({ search: com_name });
    if (getProjBD.data.count > 0) {
      throw new FormError('已存在项目名称相同的BD任务，无法创建');
    }
    await api.addProjBD(param);
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  render() {
    const state = this.props.location.state
    const comName = state ? state.com_name : ''
    return (
      <LeftRightLayout location={this.props.location} title={i18n('project_bd.add_project_bd')}>
        <div>
          <AddProjectBDForm isAdd comName={comName} wrappedComponentRef={this.handleRef} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.handleSubmitBtnClicked}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}

export default withRouter(AddProjectBD)
