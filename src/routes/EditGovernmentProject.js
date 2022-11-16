import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva'
import { Link } from 'dva/router'
import * as api from '../api'
import { i18n, requestAllData, convertCommentFilesToAttachments, getURLParamValue, handleError, findAllParentArea } from '../utils/util'

import { Form, Button, Tabs, message } from 'antd'
const TabPane = Tabs.TabPane
import LeftRightLayout from '../components/LeftRightLayout'

import {
  ProjectBaseForm,
  ProjectFinanceForm,
  ProjectConnectForm,
  GovernmentProjectDetailForm,
} from '../components/GovernmentProjectForm';
import ProjectAttachments from '../components/ProjectAttachments'
import ProjectYearFinance from '../components/ProjectYearFinance'
import lodash from 'lodash';
import GovernmentProjectBaseForm from '../components/GovernmentProjectBaseForm';


const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}
const formStyle = {
  // overflow: 'auto',
  // maxHeight: '400px',
  marginBottom: '24px',
  padding: '24px',
  border: '1px dashed #eee',
  borderRadius: '4px',
}

function toFormDataNew(data) {
  var formData = {}

  for (let prop in data) {
    if (prop == 'industries' && data[prop]) {
      // 转换形式 industries: [{}, {}] 为 industriesKeys: [1,2] industries-1: {}  industries-image-1: {} ...
      const value = data['industries'];
      const keys = _.range(1, 1 + value.length);
      formData['industriesKeys'] = keys;
      keys.forEach((key, index) => {
        formData['industries-' + key] = value[index].industry;
        formData['industries-image-' + key] = value[index].key;
      })
    } else if (prop == 'historycases') {
      if (data[prop]) {
        formData.historycases = data.historycases.map(m => m.proj);
      } else {
        formData.historycases = [];
      }
    } else if (prop == 'traders' && data[prop]) {
      for (let index = 0; index < 7; index++) {
        if ([4, 5].includes(index)) {
          formData['trader-' + index] = data[prop].filter(f => f.type == index).map(m => m.trader.id.toString());
        } else {
          const govTrader = data[prop].find(f => f.type == index);
          if (govTrader) {
            formData['trader-' + index] = govTrader.trader.id.toString();
          }
        }
      }
    } else if (prop == 'location' && data[prop]) {
      formData.location = data[prop].map(m => m.id);
    } else {
      formData[prop] = data[prop];
    }
  }

  return formData
}

function toData(formData) {
  var data = {}

  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && !/industries-image-.*/.test(prop) && 'industriesKeys' !== prop) {
      data[prop] = formData[prop]
    }
    if (prop === 'makeUser' && formData[prop]) {
      const value = formData.makeUser;
      data.makeUser = value.map(m => parseInt(m, 10));
    }
    if (prop === 'takeUser' && formData[prop]) {
      const value = formData.takeUser;
      data.takeUser = value.map(m => parseInt(m, 10));
    }
    if (prop === 'industriesKeys' && formData[prop]) {
      data['industries'] = formData['industriesKeys'].map(key => {
        return {
          industry: formData['industries-' + key],
          bucket: 'image',
          key: formData['industries-image-' + key],
        }
      })
    }
    if (prop === 'location' && formData[prop].length > 0) {
      data.location = formData.location[formData.location.length - 1]
    }
  }

  return data;
}


function EditGovernmentProject(props) {
  
  const govproj = Number(props.match.params.id);
  const activeKeyFromUrl = getURLParamValue(props, 'activeKey');
  
  const [project, setProject] = useState({});
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [activeKey, setActiveKey] = useState(activeKeyFromUrl || '1');
  const [projInfo, setProjInfo] = useState([]);

  const editProjectBaseFormRef = useRef(null);
  const editProjectConnectFormRef = useRef(null);
  const editProjectDetailsFormRef = useRef(null);

  useEffect(() => {
    getProject();
    getGovernmentProjectInfo();
  }, []);

  useEffect(() => {
    setFormValue();
  }, [project]);

  useEffect(() => {
    const formValue = {};
    projInfo.forEach(element => {
      formValue[element.type] = {};
      formValue[element.type]['info'] = element.info;
      formValue[element.type]['fileList'] = element.attachments ? element.attachments.map((m, i) => (
        {
          uid: i,
          id: m.id,
          name: m.filename,
          url: m.url,
        }
      )) : [];
    });
    editProjectDetailsFormRef.current.setFieldsValue(formValue);
  }, [projInfo]);

  function goBack() {
    props.history.goBack();
  }

  function getProject() {
    const id = Number(props.match.params.id)
    let project = {};
    api.getGovernmentProjectDetails(id)
      .then(result => {
        project = result.data;
        project = { ...project, industries: project.industrys };
        return props.dispatch({ type: 'app/getSource', payload: 'projstatus' });
      })
      .then(allStatus => {
        let projstatus = null;
        if (project.status) {
          projstatus = allStatus.find(f => f.id == project.status);
        }
        project = { ...project, projstatus };
        
        return props.dispatch({ type: 'app/getSource', payload: 'country' });
      })
      .then(allCountries => {
        let location = [];
        if (project.location) {
          location = allCountries.find(f => f.id == project.location);
          location = findAllParentArea(location, allCountries);
        }
        project = { ...project, location };
        setProject(project);
      })
      .catch(handleError);
  }

  async function editProject(ifBack) {
    const id = Number(props.match.params.id);
    try {
      const baseFormValues = await editProjectBaseFormRef.current.validateFields();
      const baseFormParams = toData(baseFormValues);
      try {
        const connectFormValues = await editProjectConnectFormRef.current.validateFields();
        const connectFormParams = toData(connectFormValues);
        await editGovernmentProjTrader(connectFormParams);
        try {
          const detailsFormValues = await editProjectDetailsFormRef.current.validateFields();
          await saveGovernmentProjInfo(detailsFormValues);
          const body = {
            ...baseFormParams,
            ...connectFormParams,
          };
          setLoadingEdit(true);
          api.editGovernmentProject(id, body).then(() => {
            setLoadingEdit(false);
            getProject();
            if (ifBack) {
              goBack();
            }
            else {
              message.success(i18n('project.message.project_updated'), 2)
            }
          }, error => {
            setLoadingEdit(false);
            props.dispatch({
              type: 'app/findError',
              payload: error
            })
          })
        } catch (error) {
          message.error('项目详情内容有误，请检查', 2);
        }
      } catch (error) {
        message.error('联系方式内容有误，请检查', 2);
      }
    } catch (error) {
      message.error('基本信息内容有误，请检查', 2);
    }
  }

  async function editGovernmentProjTrader(formData) {
    const { traders } = project;
    if (traders && traders.length > 0) {
      await Promise.all(traders.map(m => api.deleteGovernmentProjectTrader(m.id)));
    }
    let arr = [];
    for (const key in formData) {
      if (Object.hasOwnProperty.call(formData, key)) {
        const element = formData[key];
        if (key.startsWith('trader') && element) {
          const type = parseInt(key.split('-')[1]);
          if (typeof element == 'object') {
            arr = arr.concat(element.map(m => ({ type, trader: parseInt(m) })));
          } else {
            arr = arr.concat({ type, trader: parseInt(element) });
          }
        }        
      }
    }
    return await Promise.all(arr.map(m => api.addGovernmentProjectTrader({ ...m, govproj })));
  }

  async function saveGovernmentProjInfo(formData) {
    const arr = [];
    for (const key in formData) {
      if (Object.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        const { info, fileList } = value;
        const filterProjInfo = projInfo.filter(f => f.type === parseInt(key));
        if (filterProjInfo.length > 0) {
          arr.push({ id: filterProjInfo[0].id, info, fileList });
        } else {
          arr.push({ type: parseInt(key), info, fileList });
        }
      }
    }
    return await Promise.all(arr.map(m => {
      if (m.id) {
        return editGovernmentProjectInfoAndAtta(m.id, m.info, m.fileList);
      }
      return addGovernmentProjectInfoAndAtta(m.type, me.info, m.fileList);
    }));
  }

  async function editGovernmentProjectInfoAndAtta(id, info, fileList) {
    await api.editGovernmentProjectInfo(id, { info });
    // 附件的逻辑是没有 id 的是新上传的附件需要新增，原来有 id 的现在却没了说明被用户删除了需要删除
    const originalAtta = projInfo.find(f => f.id == id);
    if (originalAtta.attachments) {
      const newFileListIds = fileList.filter(f => f.id).map(m => m.id);
      const originalAttaIds = originalAtta.attachments.map(m => m.id);
      const toDelete = originalAttaIds.filter(f => newFileListIds.indexOf(f) == -1);
      await Promise.all(toDelete.map(m => api.deleteGovernmentProjectInfoAttachment(m)));
    }
    const toAdd = fileList.filter(f => !f.id);
    await Promise.all(toAdd.map(m => {
      const { filename, bucket, key, realfilekey } = m;
      return api.addGovernmentProjectInfoAttachment({ govprojinfo: id, filename, bucket, key, realfilekey });
    }));
  }

  async function addGovernmentProjectInfoAndAtta(type, info, fileList) {
    const reqInfo = await api.addGovernmentProjectInfo({ govproj, type, info });
    const { id: govprojinfo } = reqInfo.data;
    await Promise.all(fileList.map(m => {
      const { filename, bucket, key, realfilekey } = m;
      return api.addGovernmentProjectInfoAttachment({ govprojinfo, filename, bucket, key, realfilekey });
    }))
  }

  async function getGovernmentProjectInfo() {
    const id = Number(props.match.params.id)
    const req = await api.getGovernmentProjectInfo({ govproj: id });
    const { data: projInfo } = req.data;
    setProjInfo(projInfo);

    const newProjInfo = projInfo.slice();
    for (let index = 0; index < newProjInfo.length; index++) {
      const element = newProjInfo[index];
      if (element.attachments) {
        for (let index = 0; index < element.attachments.length; index++) {
          const atta = element.attachments[index];
          const reqDownload = await api.downloadUrl(atta.bucket, atta.realfilekey);
          atta.url = reqDownload.data;
        }
      }
    }
    setProjInfo(newProjInfo);
  }

  async function setFormValue() {
    const newFormData = toFormDataNew(project);
    editProjectBaseFormRef.current.setFieldsValue(newFormData);
    editProjectConnectFormRef.current.setFieldsValue(newFormData);
  }

  async function handeBaseFormValuesChange(changedValue) {
  }

  const FormAction = ({ form, loadingEdit }) => {
    return (
      <div style={actionStyle}>
        <Button type="primary" size="large" loading={loadingEdit} style={actionBtnStyle} onClick={editProject.bind(this, false)}>{i18n('common.save')}</Button>
        <Button size="large" loading={loadingEdit} style={actionBtnStyle} onClick={editProject.bind(this, true)}>{i18n('common.save_back')}</Button>
      </div>
    )
  }

  return (
    <LeftRightLayout location={props.location} title={i18n('project.edit_project')}>
      <div>

        <Tabs onChange={activeKey => setActiveKey(activeKey)} activeKey={activeKey}>
          <TabPane tab={i18n('project.basics')} key="1" forceRender>
            <div style={formStyle}>
              <GovernmentProjectBaseForm ref={editProjectBaseFormRef} onValuesChange={handeBaseFormValuesChange} />
              <FormAction form="baseForm" loadingEdit={loadingEdit} />
            </div>
          </TabPane>

          <TabPane tab={i18n('project.contact')} key="3" forceRender>
            <div style={formStyle}>
              <ProjectConnectForm ref={editProjectConnectFormRef} />
              <FormAction form="connectForm" />
            </div>
          </TabPane>

          <TabPane tab={i18n('project.details')} key="4" forceRender>
            <div style={formStyle}>
              <GovernmentProjectDetailForm ref={editProjectDetailsFormRef} />
              <FormAction form="detailForm" />
            </div>
          </TabPane>

        </Tabs>

      </div>
    </LeftRightLayout>
  );
}

export default connect()(EditGovernmentProject);