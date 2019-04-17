import React from 'react'
import { withRouter } from 'dva/router'
import * as api from '../api'
import { handleError, i18n } from '../utils/util'

import { Form, Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout';

import OrganizationForm from '../components/OrganizationForm'
import { OrganizationRemarkList } from '../components/RemarkList'

const formStyle = {
  overflow: 'auto',
  maxHeight: '600px',
  margin: '24px 0',
  padding: '24px',
  border: '1px dashed #eee',
  borderRadius: '4px',
}
const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 16px'}


function onFieldsChange(props, changedFiedls) {
  console.log(changedFiedls)
}
function mapPropsToFields(props) {
  return props.data
}

var EditOrganizationForm = Form.create({
  onFieldsChange, mapPropsToFields
})(OrganizationForm)


class EditOrganization extends React.Component {

  constructor(props) {
    super(props)
    this.state ={ data: {} }
  }

  cancel = (e) => {
    this.props.router.goBack()
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form // debug
    }
  }

  handleSubmit = (e) => {
    const id = Number(this.props.params.id)
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        api.editOrg(id, values).then((result) => {
          this.props.router.goBack()
        }, error => {
          handleError(error)
        })
      }
    })
  }

  componentDidMount() {
    const id = Number(this.props.params.id)
    api.getOrgDetail(id).then(result => {
      // 数据转换
      let data = { ...result.data }
      data.currency = data.currency && data.currency.id
      data.industry = data.industry && data.industry.id
      data.orgtransactionphase = data.orgtransactionphase ? data.orgtransactionphase.map(item => item.id) : []
      data.orgtype = data.orgtype && data.orgtype.id
      data.orgstatus = data.orgstatus && data.orgstatus.id
      data.tags = data.tags ? data.tags.map(item => item.id) : [];
      data.orglevel = data.orglevel && data.orglevel.id;
      const textFields = ['description', 'typicalCase', 'partnerOrInvestmentCommiterMember', 'decisionMakingProcess']
      textFields.forEach(item => {
        if (data[item] == null) { data[item] = '' }
      })

      for (let i in data) {
        data[i] = { 'value': data[i] }
      }

      console.log(data)
      this.setState({ data })
    }, error => {
      handleError(error)
    })
  }

  render() {
    const id = Number(this.props.params.id)
    return (
      <LeftRightLayout 
        location={this.props.location}
        title={i18n('organization.edit_org')} 
        action={{ name: i18n('organization.investor_list'), link: '/app/orguser/list?org=' + id }}>
        <div>

          <div style={formStyle}>
            <EditOrganizationForm
              wrappedComponentRef={this.handleRef}
              data={this.state.data}
            />
            <div style={actionStyle}>
              <Button size="large" onClick={this.cancel} style={actionBtnStyle}>{i18n('common.cancel')}</Button>
              <Button type="primary" size="large" style={actionBtnStyle} onClick={this.handleSubmit}>{i18n('common.save')}</Button>
            </div>
          </div>

          <OrganizationRemarkList typeId={id} />

        </div>
      </LeftRightLayout>
    )
  }
}

export default withRouter(EditOrganization)
