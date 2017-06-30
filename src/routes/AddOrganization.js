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

const AddOrganizationForm = Form.create()(OrganizationForm)


class AddOrganization extends React.Component {

  constructor(props) {
    super(props)
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  handleSubmit = (e) => {
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        api.addOrg(values).then((result) => {
          this.props.history.goBack()
        }, (error) => {
          console.error(error)
        })
      }
    })
  }


  render() {
    return (
      <MainLayout location={this.props.location}>
        <div>
          <PageTitle title="新增机构" />

          <div style={formStyle}>
            <AddOrganizationForm wrappedComponentRef={this.handleRef} />
          </div>

          <div style={{textAlign: 'center'}}>
            <Button type="primary" size="large" onClick={this.handleSubmit}>发布</Button>
          </div>
        </div>
      </MainLayout>
    )
  }
}

export default AddOrganization
