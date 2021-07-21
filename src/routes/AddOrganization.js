import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { i18n } from '../utils/util'

import { Form, Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout';

import OrganizationForm from '../components/OrganizationForm'

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

// const AddOrganizationForm = Form.create()(OrganizationForm)


class AddOrganization extends React.Component {

  constructor(props) {
    super(props)

    this.addOrgFormRef = React.createRef();
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  goBack = () => {
    this.props.history.goBack()
  }

  handleSubmit = () => {
    this.addUserFormRef.current.validateFields()
      .then(values => {
        api.addOrg(values).then((result) => {
          this.props.history.goBack()
        }, (error) => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      })
  }


  render() {
    return (
      <LeftRightLayout location={this.props.location} title={i18n('organization.new_org')}>
        <div>

          <div style={formStyle}>
            <OrganizationForm wrappedComponentRef={this.handleRef} ref={this.addOrgFormRef} />
          </div>

          <div style={actionStyle}>
            <Button style={actionBtnStyle} size="large" onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button style={actionBtnStyle} type="primary" size="large" onClick={this.handleSubmit}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(AddOrganization)
