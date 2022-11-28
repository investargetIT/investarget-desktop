import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { i18n } from '../utils/util'

import { Form, Button, Modal } from 'antd'
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

    this.state = {
      loadingAddOrg: false,
    };

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
    this.addOrgFormRef.current.validateFields()
      .then(values => {
        this.setState({ loadingAddOrg: true });
        if (values.country) {
          values.country = values.country[values.country.length - 1];
        }
        if (!values.orgfullname) {
          values.orgfullname = values.orgnameC;
        }
        api.addOrg(values).then((result) => {
          this.setState({ loadingAddOrg: false });
          this.props.history.goBack()
        }, (error) => {
          this.setState({ loadingAddOrg: false });
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      })
  }

  handleAliasOnBlur = () => {
    const alias = this.addOrgFormRef.current.getFieldValue('alias');
    if (alias && (new Set(alias)).size !== alias.length) {
      Modal.error({ title: '机构别名不能重复' });
    }
  }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title={i18n('organization.new_org')}>
        <div>

          <div style={formStyle}>
            <OrganizationForm
              wrappedComponentRef={this.handleRef}
              ref={this.addOrgFormRef}
              aliasOnBlur={this.handleAliasOnBlur} />
          </div>

          <div style={actionStyle}>
            <Button style={actionBtnStyle} size="large" onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button style={actionBtnStyle} type="primary" loading={this.state.loadingAddOrg} size="large" onClick={this.handleSubmit}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(AddOrganization)
