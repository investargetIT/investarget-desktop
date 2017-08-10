import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { connect } from 'dva'
import { Link } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'

import { Form, Button, Tabs, message } from 'antd'
const TabPane = Tabs.TabPane
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
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
        formData['industries-' + key] = { 'value': value[index].industry }
        formData['industries-image-' + key] = { 'value': value[index].key }
      })
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
      let data = result.data
      data.character = data.character && data.character.id
      data.country = data.country && data.country.id
      data.currency = data.currency && data.currency.id
      data.industries = data.industries
      data.projstatus = data.projstatus && data.projstatus.id
      data.supportUser = data.supportUser && data.supportUser.id
      data.tags = data.tags ? data.tags.map(item => item.id) : []
      data.transactionType = data.transactionType ? data.transactionType.map(item => item.id) : []
      data.takeUser = data.takeUser ? data.takeUser.id : null
      data.makeUser = data.makeUser ? data.makeUser.id : null
      data.service = data.service ? data.service.map(m => m.id) : []
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

  editProject = (formStr) => {
    const form = this[formStr]
    const id = Number(this.props.params.id)
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = toData(values)
        api.editProj(id, params).then(result => {
          message.success('项目已更新')
          this.getProject()
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
          <Button type="primary" size="large" style={actionBtnStyle} onClick={this.editProject.bind(this, form)}>保存</Button>
        </div>
      )
    }

    return (
      <MainLayout location={this.props.location}>
        <PageTitle title="修改项目" />
        <div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <div style={formStyle}>
                <BaseForm wrappedComponentRef={this.handleBaseFormRef} data={data} />
                <FormAction form="baseForm" />
              </div>
            </TabPane>

            <TabPane tab="财务信息" key="2">
              <div style={formStyle}>
                <FinanceForm wrappedComponentRef={this.handleFinanceFormRef} data={data} />
                <FormAction form="financeForm" />
              </div>
            </TabPane>

            <TabPane tab="财务年度" key="6">
              <ProjectYearFinance projId={id} currencyType={this.state.project.currency} />
            </TabPane>

            <TabPane tab="联系方式" key="3">
              <div style={formStyle}>
                <ConnectForm wrappedComponentRef={this.handleConnectFormRef} data={data} />
                <FormAction form="connectForm" />
              </div>
            </TabPane>

            <TabPane tab="项目详情" key="4">
              <div style={formStyle}>
                <DetailForm wrappedComponentRef={this.handleDetailFormRef} data={data} />
                <FormAction form="detailForm" />
              </div>
            </TabPane>

            <TabPane tab="附件上传" key="5">
              <ProjectAttachments projId={id} />
            </TabPane>
          </Tabs>

        </div>
      </MainLayout>
    )
  }
}

export default connect()(EditProject)
