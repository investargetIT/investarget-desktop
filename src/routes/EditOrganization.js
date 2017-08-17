import React from 'react'
import { connect } from 'dva'
import { injectIntl, intlShape } from 'react-intl'
import * as api from '../api'

import { Form, Button } from 'antd'
import MainLayout from '../components/MainLayout';
import PageTitle from '../components/PageTitle'
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
    this.props.history.goBack()
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
          this.props.history.goBack()
        }, (error) => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
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


      for (let i in data) {
        data[i] = { 'value': data[i] }
      }

      console.log(data)
      this.setState({ data })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const id = Number(this.props.params.id)
    return (
      <MainLayout location={this.props.location}>
        <div>
          <PageTitle title="修改机构" />

          <div style={formStyle}>
            <EditOrganizationForm
              wrappedComponentRef={this.handleRef}
              data={this.state.data}
            />
            <div style={actionStyle}>
              <Button size="large" onClick={this.cancel} style={actionBtnStyle}>取消</Button>
              <Button type="primary" size="large" style={actionBtnStyle} onClick={this.handleSubmit}>保存</Button>
            </div>
          </div>

          <OrganizationRemarkList typeId={id} />

        </div>
      </MainLayout>
    )
  }
}

export default connect()(EditOrganization)
