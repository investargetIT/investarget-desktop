import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { i18n, requestAllData } from '../utils/util'

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
          const { id } = result.data;
          const alias = values.alias ? values.alias.filter(f => !!f) : [];
          return this.updateOrgAlias(id, alias);
        })
        .then(() => {
          this.setState({ loadingAddOrg: false });
          this.props.history.goBack();
        })
        .catch((error) => {
          this.setState({ loadingAddOrg: false });
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      })
  }

  updateOrgAlias = async (orgID, newAlias) => {
    const aliasArr = [...new Set(newAlias)];
    const reqOrgAlias = await requestAllData(api.getOrgAlias, { org: orgID }, 10);
    const { data: originalAlias } = reqOrgAlias.data;
    if (aliasArr.length >= originalAlias.length) {
      // 修改后的别名多了需要新增
      for (let index = 0; index < aliasArr.length; index++) {
        if (index < originalAlias.length) {
          if (aliasArr[index] !== originalAlias[index].alias) {
            await api.deleteOrgAlias(originalAlias[index].id);
            await api.addOrgAlias({ org: orgID, alias: aliasArr[index] });
          }
        } else {
          await api.addOrgAlias({ org: orgID, alias: aliasArr[index] });
        }
      }
    } else {
      // 修改后别名少了需要删除，必须先删除多的，因为无法同名
      for (let index = originalAlias.length - 1; index >= 0; index--) {
        if (index < aliasArr.length) {
          if (aliasArr[index] !== originalAlias[index].alias) {
            await api.deleteOrgAlias(originalAlias[index].id);
            await api.addOrgAlias({ org: orgID, alias: aliasArr[index] });
          }
        } else {
          await api.deleteOrgAlias(originalAlias[index].id);
        }
      }
    }
  }

  handleAliasOnBlur = async e => {
    const { value: alias } = e.target;
    if (!alias) return;
    let allAlias = this.addOrgFormRef.current.getFieldValue('alias');
    allAlias = allAlias.filter(f => !!f);
    if (allAlias && (new Set(allAlias)).size !== allAlias.length) {
      Modal.error({ title: '机构别名不能重复' });
      return;
    }
    const req = await api.getOrg({ search: alias });
    let { data: orgWithSameName } = req.data;
    if (orgWithSameName.length > 0) {
      Modal.warning({
        title: '同名机构已存在',
        content: <p>已存在同名机构<a target="_blank" href={`/app/organization/${orgWithSameName[0].id}`}>{orgWithSameName[0].orgfullname}</a></p>
      });
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
