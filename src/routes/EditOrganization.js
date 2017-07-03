import React from 'react'
import { injectIntl, intlShape } from 'react-intl'
import * as api from '../api'

import { Form, Button } from 'antd'
import MainLayout from '../components/MainLayout';
import PageTitle from '../components/PageTitle'
import OrganizationForm from '../components/OrganizationForm'

const formStyle = {
  overflow: 'auto',
  maxHeight: '600px',
  margin: '24px 0',
  padding: '24px',
  border: '1px dashed #eee',
  borderRadius: '4px',
}

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
    const id = this.props.params.id
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        api.editOrg(id, values).then((result) => {
          this.props.history.goBack()
        }, (error) => {
          console.error(error)
        })
      }
    })
  }

  componentDidMount() {
    const id = this.props.params.id
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
      console.error(error)
    })
  }

  render() {
    return (
      <MainLayout location={this.props.location}>
        <div>
          <PageTitle title="修改机构" />

          <div style={formStyle}>
            <EditOrganizationForm
              wrappedComponentRef={this.handleRef}
              data={this.state.data}
            />
          </div>

          <div style={{textAlign: 'center'}}>
            <Button size="large" onClick={this.cancel} style={{margin: '0 16px'}}>取消</Button>
            <Button type="primary" size="large" style={{margin: '0 16px'}} onClick={this.handleSubmit}>保存</Button>
          </div>
        </div>
      </MainLayout>
    )
  }
}

export default EditOrganization
