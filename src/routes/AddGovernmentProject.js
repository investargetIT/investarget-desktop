import React, { useRef } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'
import { Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import ProjectBaseForm from '../components/ProjectBaseForm'

const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}

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


function AddGovernmentProject(props) {

  const addProjectFormRef = useRef(null);

  function goBack() {
    props.history.goBack()
  }

  function addProject() {
    addProjectFormRef.current.validateFields()
      .then(values => {
        // TODO
      })
      .catch(error => {
        props.dispatch({
          type: 'app/findError',
          payload: error
        })
      });
  }
  

  return (
    <LeftRightLayout location={props.location} title="发布政府项目1">
      <div>
        <ProjectBaseForm ref={addProjectFormRef} />
        <div style={actionStyle}>
          <Button size="large" style={actionBtnStyle} onClick={goBack}>{i18n('common.cancel')}</Button>
          <Button type="primary" size="large" style={actionBtnStyle} onClick={addProject}>{i18n('common.submit')}</Button>
        </div>
      </div>
    </LeftRightLayout>
  );

}

export default connect()(withRouter(AddGovernmentProject))
