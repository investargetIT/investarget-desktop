import React from 'react'
import { Form, Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

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
      formData[prop] = value && value.id
    }
  }

  // 如果 bduser 有值，则删除 username, usertitle, usermobile
  if (formData['bduser']) {
    delete formData['username']
    delete formData['usertitle']
    delete formData['usermobile']
  } else if (formData['usermobile']) {
    const mobileArr = formData['usermobile'].split('-');
    if (mobileArr.length > 1) {
    formData.mobileAreaCode = mobileArr[0];
    formData.mobile = mobileArr.slice(1).join('-'); 
    } else {
      formData.mobileAreaCode = '86';
      formData.mobile = formData['usermobile'];  
    }
  } 
  
  if (formData['country']) {
    formData.country = { value: formData['country'] };
  }

  for (let prop in formData) {
    formData[prop] = { value: formData[prop] }
  }
  return formData
}

function toData(formData) {
  if (!('bduser' in formData)) {
    formData['bduser'] = null
    formData['usermobile'] = (formData.mobileAreaCode && formData.mobile) ? formData.mobileAreaCode + '-' + formData.mobile : formData.mobile;
  }
  if (!['中国', 'China'].includes(formData.country.label)) {
    formData['location'] = null;
  }
  formData.country = formData.country.value;
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
          handleError(error)
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
      handleError(error)
    })
  }

  render() {
    const data = toFormData(this.state.bd)
    return (
      <LeftRightLayout location={this.props.location} title={i18n('project_bd.edit_project_bd')}>
        <div>
          <EditProjectBDForm wrappedComponentRef={this.handleRef} data={data} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.editProjectBD}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}

export default withRouter(EditProjectBD)
