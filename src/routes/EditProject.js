import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Link } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'

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


function onValuesChange(props, values) {
  console.log('onValuesChange', values)
}
function mapPropsToFields(props) {
  return props.data
}
const BaseForm = Form.create({onValuesChange, mapPropsToFields})(ProjectBaseForm)
const FinanceForm = Form.create({onValuesChange, mapPropsToFields})(ProjectFinanceForm)
const ConnectForm = Form.create({onValuesChange, mapPropsToFields})(ProjectConnectForm)
const DetailForm = Form.create({onValuesChange, mapPropsToFields})(ProjectDetailForm)


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
    } else if (prop == 'indGroup' && data[prop]) {
      formData[prop] = { 'value': data[prop].id }
    } else {
      formData[prop] = { 'value': data[prop] }
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
    this.state = {
      project: {}
    }
  }

  goBack = () => {
    this.props.history.goBack()
  }

  getProject = () => {
    const id = Number(this.props.params.id)
    api.getProjDetail(id).then(result => {
      let data = Object.assign({}, result.data);
      echo(result.data)
      data.character = result.data.character && result.data.character.id
      data.country = result.data.country && result.data.country.id
      data.currency = result.data.currency && result.data.currency.id
      data.industries = result.data.industries
      data.projstatus = result.data.projstatus && result.data.projstatus.id
      data.supportUserName = result.data.supportUser && (window.LANG === 'en' ? result.data.supportUser.usernameE : result.data.supportUser.usernameC);
      data.tags = result.data.tags ? result.data.tags.map(item => item.id) : []
      data.transactionType = result.data.transactionType ? result.data.transactionType.map(item => item.id) : []
      data.takeUser = result.data.takeUser === undefined ? undefined : (result.data.takeUser === null ? null : result.data.takeUser.id);
      data.takeUserName = result.data.takeUser && (window.LANG === 'en' ? result.data.takeUser.usernameE : result.data.takeUser.usernameC);
      data.makeUser = result.data.makeUser === undefined ? undefined : (result.data.makeUser === null ? null : result.data.makeUser.id);
      data.makeUserName = result.data.makeUser && (window.LANG === 'en' ? result.data.makeUser.usernameE : result.data.makeUser.usernameC);
      data.service = result.data.service ? result.data.service.map(m => m.id) : []
      // `value` prop on `textarea` should not be null.
      let textFields = ['p_introducteC', 'p_introducteE', 'targetMarketC', 'targetMarketE', 'productTechnologyC', 'productTechnologyE', 'businessModelC', 'businessModelE', 'brandChannelC', 'brandChannelE', 'managementTeamC', 'managementTeamE', 'BusinesspartnersC', 'BusinesspartnersE', 'useOfProceedC', 'useOfProceedE', 'financingHistoryC', 'financingHistoryE', 'operationalDataC', 'operationalDataE']
      textFields.forEach(field => {
        if (data[field] == null) { data[field] = '' }
      })
      this.setState({
        project: data
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  editProject = (formStr, ifBack) => {
    const form = this[formStr]
    const id = Number(this.props.params.id)
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = toData(values)
        api.editProj(id, params).then(result => {
          this.getProject()
          if(ifBack){
            this.goBack()
          }
          else{
            message.success(i18n('project.message.project_updated'), 2)
          }
          
        }, error => {
         this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
        })
      }
    })
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

  render() {
    const id = Number(this.props.params.id)
    const data = toFormData(this.state.project)
    
    const FormAction = ({form}) => {
      return (
        <div style={actionStyle}>
          <Button type="primary" size="large" style={actionBtnStyle} onClick={this.editProject.bind(this, form, false)}>{i18n('common.save')}</Button>
          <Button size="large" style={actionBtnStyle} onClick={this.editProject.bind(this, form, true)}>{i18n('common.save_back')}</Button>
        </div>
      )
    }

    return (
      <LeftRightLayout location={this.props.location} title={i18n('project.edit_project')}>
        <div>

          <Tabs defaultActiveKey="1">
            <TabPane tab={i18n('project.basics')} key="1">
              <div style={formStyle}>
                <BaseForm wrappedComponentRef={this.handleBaseFormRef} data={data} />
                <FormAction form="baseForm" />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.financials')} key="2">
              <div style={formStyle}>
                <FinanceForm wrappedComponentRef={this.handleFinanceFormRef} data={data} />
                <FormAction form="financeForm" />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.fiscal_year')} key="6">
              <ProjectYearFinance projId={id} currencyType={this.state.project.currency} />
            </TabPane>

            <TabPane tab={i18n('project.contact')} key="3">
              <div style={formStyle}>
                <ConnectForm wrappedComponentRef={this.handleConnectFormRef} data={data} />
                <FormAction form="connectForm" />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.details')} key="4">
              <div style={formStyle}>
                <DetailForm wrappedComponentRef={this.handleDetailFormRef} data={data} />
                <FormAction form="detailForm" />
              </div>
            </TabPane>

            <TabPane tab={i18n('project.attachments')} key="5">
              <ProjectAttachments projId={id} />
            </TabPane>
          </Tabs>

        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(EditProject)
