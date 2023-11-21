import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Link } from 'dva/router'
import * as api from '../api'
import { i18n, requestAllData, convertCommentFilesToAttachments, getURLParamValue } from '../utils/util'

import { Form, Button, Tabs, message } from 'antd'
const TabPane = Tabs.TabPane
import LeftRightLayout from '../components/LeftRightLayout'

import {
  ProjectBaseForm,
  ProjectFinanceForm,
  ProjectConnectForm,
  ProjectDetailForm,
} from '../components/ProjectForm'
import ProjectAttachments from '../components/ProjectAttachments'
import ProjectYearFinance from '../components/ProjectYearFinance'
import lodash from 'lodash';


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


// function onValuesChange(props, values) {
//   console.log('onValuesChange', values)
// }
// function mapPropsToFields(props) {
//   return props.data
// }
// const BaseForm = Form.create({onValuesChange, mapPropsToFields})(ProjectBaseForm)
// const FinanceForm = Form.create({onValuesChange, mapPropsToFields})(ProjectFinanceForm)
// const ConnectForm = Form.create({onValuesChange, mapPropsToFields})(ProjectConnectForm)
// const DetailForm = Form.create({onValuesChange, mapPropsToFields})(ProjectDetailForm)


function toFormData(data) {
  var formData = {}

  for (let prop in data) {
    if (prop == 'industries') {
      // 转换形式 industries: [{}, {}] 为 industriesKeys: [1,2] industries-1: {}  industries-image-1: {} ...
      let value = data['industries']
      let keys = _.range(1, 1 + value.length)
      formData['industriesKeys'] = { 'value': keys }
      keys.forEach((key, index) => {
        formData['industries-' + key] = { 'value': value[index].industry.id }
        formData['industries-image-' + key] = { 'value': value[index].key }
      })
    // } else if (prop == 'indGroup' && data[prop]) {
    //   formData[prop] = { 'value': data[prop].id }
    } else if (prop === 'projTraders' && data[prop]) {
      const { projTraders } = data;
      const takeUser = projTraders.filter(f => f.type === 0);
      const makeUser = projTraders.filter(f => f.type === 1);
      formData.takeUser = { value: takeUser.map(m => m.user.id.toString()) };
      formData.makeUser = { value: makeUser.map(m => m.user.id.toString()) };
      formData.takeUserName = { value: takeUser.map(m => m.user.usernameC).join('、') };
      formData.makeUserName = { value: makeUser.map(m => m.user.usernameC).join('、') };
    } else if (prop === 'lastProject' && data[prop]) {
      formData.lastProject = { value: data.lastProject.id };
    } else {
      formData[prop] = { 'value': data[prop] }
    }
  }

  return formData
}

function toFormDataNew(data) {
  var formData = {}

  for (let prop in data) {
    if (prop == 'industries') {
      // 转换形式 industries: [{}, {}] 为 industriesKeys: [1,2] industries-1: {}  industries-image-1: {} ...
      let value = data['industries'];
      let keys = _.range(1, 1 + value.length);
      formData['industriesKeys'] = keys;
      keys.forEach((key, index) => {
        formData['industries-' + key] = value[index].industry.id;
        formData['industries-image-' + key] = value[index].key;
      })
    } else if (prop === 'projTraders' && data[prop]) {
      const { projTraders } = data;
      const takeUser = projTraders.filter(f => f.type === 0);
      let makeUser = projTraders.filter(f => f.type !== 0);
      makeUser = lodash.uniqBy(makeUser, 'id');
      formData.takeUser = takeUser.map(m => m.user.id.toString());
      formData.makeUser = makeUser.map(m => m.user.id.toString());
      formData.takeUserName = takeUser.map(m => m.user.usernameC).join('、');
      formData.makeUserName = makeUser.map(m => m.user.usernameC).join('、');
    } else if (prop === 'lastProject' && data[prop]) {
      formData.lastProject = data.lastProject.id;
    } else if (prop === 'PM' && data[prop]) {
      formData.PM = data[prop].id.toString();
      formData.PMName = data[prop].usernameC;
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
  }

  if ('industriesKeys' in formData) {
    data['industries'] = formData['industriesKeys'].map(key => {
      return {
        industry: formData['industries-' + key],
        bucket: 'image',
        key: formData['industries-image-' + key],
      }
    })
  }

  return data
}


class EditProject extends React.Component {
  constructor(props) {
    super(props)
    
    const activeKey = getURLParamValue(props, 'activeKey');
    this.state = {
      project: {},
      loadingEdit: false,
      refreshAttachmentTab: true,
      activeKey: activeKey || '1',
    }

    this.editProjectBaseFormRef = React.createRef();
    this.editProjectFinanceFormRef = React.createRef();
    this.editProjectConnectFormRef = React.createRef();
    this.editProjectDetailsFormRef = React.createRef();
  }

  goBack = () => {
    this.props.history.goBack()
  }

  getProject = () => {
    const id = Number(this.props.match.params.id)
    api.getProjDetail(id).then(result => {
      let data = Object.assign({}, result.data);
      delete data.makeUser
      delete data.takeUser 
      echo(result.data)
      data.character = result.data.character && result.data.character.id
      data.country = result.data.country && result.data.country.id
      data.currency = result.data.currency && result.data.currency.id
      data.sponsor = result.data.sponsor && result.data.sponsor.id
      data.industries = result.data.industries
      data.projstatus = result.data.projstatus && result.data.projstatus.id
      data.supportUserName = result.data.supportUser && (window.LANG === 'en' ? result.data.supportUser.usernameE : result.data.supportUser.usernameC);
      data.tags = result.data.tags ? result.data.tags.map(item => item.id) : []
      data.transactionType = result.data.transactionType ? result.data.transactionType.map(item => item.id) : []
      // data.takeUser = result.data.takeUser === undefined ? undefined : (result.data.takeUser === null ? null : result.data.takeUser.id);
      // data.takeUserName = result.data.takeUser && (window.LANG === 'en' ? result.data.takeUser.usernameE : result.data.takeUser.usernameC);
      // data.makeUser = result.data.makeUser === undefined ? undefined : (result.data.makeUser === null ? null : result.data.makeUser.id);
      // data.makeUserName = result.data.makeUser && (window.LANG === 'en' ? result.data.makeUser.usernameE : result.data.makeUser.usernameC);
      data.service = result.data.service ? result.data.service.map(m => m.id) : []
      // `value` prop on `textarea` should not be null.
      let textFields = ['p_introducteC', 'p_introducteE', 'targetMarketC', 'targetMarketE', 'productTechnologyC', 'productTechnologyE', 'businessModelC', 'businessModelE', 'brandChannelC', 'brandChannelE', 'managementTeamC', 'managementTeamE', 'BusinesspartnersC', 'BusinesspartnersE', 'useOfProceedC', 'useOfProceedE', 'financingHistoryC', 'financingHistoryE', 'operationalDataC', 'operationalDataE']
      textFields.forEach(field => {
        if (data[field] == null) { data[field] = '' }
      })
      this.setState({
        project: data
      }, this.setFormValue);
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  editProject = async (formStr, ifBack) => {
    const react = this;
    const id = Number(this.props.match.params.id);
    try {
      const baseFormValues = await react.editProjectBaseFormRef.current.validateFields();
      const baseFormParams = toData(baseFormValues);
      try {
        const financeFormValues = await react.editProjectFinanceFormRef.current.validateFields();
        const financeFormParams = toData(financeFormValues);
        try {
          const connectFormValues = await react.editProjectConnectFormRef.current.validateFields();
          const connectFormParams = toData(connectFormValues);
          try {
            const detailsFormValues = await react.editProjectDetailsFormRef.current.validateFields();
            const detailFormParams = toData(detailsFormValues);
            const params = {
              ...baseFormParams,
              ...financeFormParams,
              ...connectFormParams,
              ...detailFormParams,
            };
            this.setState({ loadingEdit: true });
            api.editProj(id, params).then(result => {
              this.setState({ loadingEdit: false });
              this.getProject()
              if (baseFormParams.sendWechat) {
                api.sendProjPdfToWechatGroup(id);
              }
              if (baseFormParams.projectBD) {
                convertCommentFilesToAttachments(id, baseFormValues.projectBD).then(() => {
                  this.setState({ refreshAttachmentTab: false }, () => this.setState({ refreshAttachmentTab: true }));
                });
              }
              if (ifBack) {
                this.goBack()
              }
              else {
                message.success(i18n('project.message.project_updated'), 2)
              }
            }, error => {
              this.setState({ loadingEdit: false });
              this.props.dispatch({
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
        message.error('财务信息内容有误，请检查', 2);
      }
    } catch (error) {
      message.error('基本信息内容有误，请检查', 2);
    }
    
    // baseForm.validateFieldsAndScroll((err, values) => {
    //   if (!err) {
    //     const baseFormParams = toData(values);
    //     const financeForm = react.financeForm;
    //     financeForm.validateFieldsAndScroll((err1, values1) => {
    //       if (!err1) {
    //         const financeFormParams = toData(values1);
    //         const connectForm = react.connectForm;
    //         connectForm.validateFieldsAndScroll((err2, values2) => {
    //           if (!err2) {
    //             const connectFormParams = toData(values2);
    //             const detailForm = react.detailForm;
    //             detailForm.validateFieldsAndScroll((err3, values3) => {
    //               if (!err3) {
    //                 const detailFormParams = toData(values3);
    //                 const params = {
    //                   ...baseFormParams,
    //                   ...financeFormParams,
    //                   ...connectFormParams,
    //                   ...detailFormParams,
    //                 };
    //                 api.editProj(id, params).then(result => {
    //                   this.getProject()
    //                   if (ifBack) {
    //                     this.goBack()
    //                   }
    //                   else {
    //                     message.success(i18n('project.message.project_updated'), 2)
    //                   }
    //                 }, error => {
    //                   this.props.dispatch({
    //                     type: 'app/findError',
    //                     payload: error
    //                   })
    //                 })
    //               } else {
    //                 message.error('项目详情内容有误，请检查', 2);
    //               }
    //             })
    //           } else {
    //             message.error('联系方式内容有误，请检查', 2);
    //           }
    //         })
    //       } else {
    //         message.error('财务信息内容有误，请检查', 2);
    //       }
    //     })
    //   } else {
    //     message.error('基本信息内容有误，请检查', 2);
    //   }
    // })
  }

  handleBaseFormRef = (inst) => {
    if (inst) {
      this.baseForm = inst.props.form
    }
  }
  handleFinanceFormRef = (inst) => {
    if (inst) {
      this.financeForm = inst.props.form
    }
  }
  handleConnectFormRef = (inst) => {
    if (inst) {
      this.connectForm = inst.props.form
    }
  }
  handleDetailFormRef = (inst) => {
    if (inst) {
      this.detailForm = inst.props.form
    }
  }

  componentDidMount() {
    this.getProject()
  }

  setFormValue = async () => {
    const newFormData = toFormDataNew(this.state.project);
    const { projectBD, sponsor, takeUser } = newFormData;
    // 如果存在对应线索项目，并且项目发起人和开发团队有一个为空
    if (projectBD) {
      if (!sponsor || !takeUser || (takeUser && takeUser.length === 0)) {
        const reqProjBD = await api.getProjBD(projectBD);
        if (!takeUser || (takeUser && takeUser.length === 0)) {
          let allManagers = [];
          if (reqProjBD.data.manager) {
            allManagers = reqProjBD.data.manager.filter(f => f.type === 3).map(m => m.manager.id.toString());
          }
          newFormData.takeUser = allManagers;
        }
        if (!sponsor && reqProjBD.data.contractors) {
          newFormData.sponsor = reqProjBD.data.contractors.id;
        }
      }
    }
    this.editProjectBaseFormRef.current.setFieldsValue(newFormData);
    this.editProjectFinanceFormRef.current.setFieldsValue(newFormData);
    this.editProjectConnectFormRef.current.setFieldsValue(newFormData);
    this.editProjectDetailsFormRef.current.setFieldsValue(newFormData);
  }

  handeBaseFormValuesChange = async (changedValue) => {
    if ('projectBD' in changedValue) {
      if (changedValue.projectBD) {
        const reqProjBD = await api.getProjBD(changedValue.projectBD);

        let allManagers = [];
        if (reqProjBD.data.manager) {
          allManagers = reqProjBD.data.manager.filter(f => f.type === 3).map(m => m.manager.id.toString());
        }
        const newTakeUser = allManagers;
        let newSponsor = null;
        if (reqProjBD.data.contractors) {
          newSponsor = reqProjBD.data.contractors.id;
        }
        this.editProjectConnectFormRef.current.setFieldsValue({ takeUser: newTakeUser, sponsor: newSponsor });
      } else {
        this.editProjectBaseFormRef.current.setFieldsValue({ projectBD: null });
        this.editProjectConnectFormRef.current.setFieldsValue({ takeUser: [], sponsor: null});
      }
    }
  }

  render() {
    if (Object.keys(this.state.project).length === 0 && this.state.project.constructor === Object) {
      return <LeftRightLayout location={this.props.location} title={i18n('project.edit_project')} />;
    }
    const id = Number(this.props.match.params.id)
    const data = toFormData(this.state.project)
    
    const FormAction = ({ form, loadingEdit }) => {
      return (
        <div style={actionStyle}>
          <Button type="primary" size="large" loading={loadingEdit} style={actionBtnStyle} onClick={this.editProject.bind(this, form, false)}>{i18n('common.save')}</Button>
          <Button size="large" loading={loadingEdit} style={actionBtnStyle} onClick={this.editProject.bind(this, form, true)}>{i18n('common.save_back')}</Button>
        </div>
      )
    }

    return (
      <LeftRightLayout location={this.props.location} title={i18n('project.edit_project')}>
        <div>

          <Tabs onChange={activeKey => this.setState({ activeKey })} activeKey={this.state.activeKey}>
            <TabPane tab={i18n('project.basics')} key="1" forceRender>
              <div style={formStyle}>
                <ProjectBaseForm ref={this.editProjectBaseFormRef} onValuesChange={this.handeBaseFormValuesChange}/>
                <FormAction form="baseForm" loadingEdit={this.state.loadingEdit} />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.financials')} key="2" forceRender>
              <div style={formStyle}>
                <ProjectFinanceForm ref={this.editProjectFinanceFormRef} />
                <FormAction form="financeForm" />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.fiscal_year')} key="6">
              <ProjectYearFinance projId={id} currencyType={this.state.project.currency} />
            </TabPane>

            <TabPane tab={i18n('project.contact')} key="3" forceRender>
              <div style={formStyle}>
                <ProjectConnectForm ref={this.editProjectConnectFormRef} />
                <FormAction form="connectForm" />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.details')} key="4" forceRender>
              <div style={formStyle}>
                <ProjectDetailForm ref={this.editProjectDetailsFormRef} />
                <FormAction form="detailForm" />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.attachments')} key="5">
              {this.state.refreshAttachmentTab && <ProjectAttachments projId={id} />}
            </TabPane>
          </Tabs>

        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(EditProject)
