import React, { useRef, useEffect } from 'react';
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'
import { Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import GovernmentProjectBaseForm from '../components/GovernmentProjectBaseForm';

const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}

function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && !/industries-image-.*/.test(prop) && prop !== 'industriesKeys' && prop !== 'isAgreed' && prop !== 'location') {
      data[prop] = formData[prop]
    }
  }
  data['industrys'] = formData['industriesKeys'].map(key => {
    return {
      industry: formData['industries-' + key],
      bucket: 'image',
      key: formData['industries-image-' + key],
    }
  })
  data.location = formData.location[formData.location.length - 1]
  return data
}


function AddGovernmentProject(props) {

  const addGovernmentProjectFormRef = useRef(null);

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'goverInfoType' });
  }, []);

  function goBack() {
    props.history.goBack()
  }

  function addProject() {
    addGovernmentProjectFormRef.current.validateFields()
      .then(values => {
        const body = toData(values);
        return api.addGovernmentProject(body);
      })
      .then(res => {
        const { id: govproj } = res.data;
        return Promise.all(props.goverInfoType.map(m => api.addGovernmentProjectInfo({ govproj, type: m.id, info: '' })));
      })
      .then(() => {
        goBack();
      })
      .catch(error => {
        props.dispatch({
          type: 'app/findError',
          payload: error,
        });
      });
  }
  

  return (
    <LeftRightLayout location={props.location} title="发布政府项目">
      <div>
        <GovernmentProjectBaseForm ref={addGovernmentProjectFormRef} />
        <div style={actionStyle}>
          <Button size="large" style={actionBtnStyle} onClick={goBack}>{i18n('common.cancel')}</Button>
          <Button type="primary" size="large" style={actionBtnStyle} onClick={addProject}>{i18n('common.submit')}</Button>
        </div>
      </div>
    </LeftRightLayout>
  );

}

function mapStateToProps(state) {
  const { goverInfoType } = state.app;
  return { goverInfoType }
}

export default connect(mapStateToProps)(withRouter(AddGovernmentProject))