import React from 'react'
import { connect } from 'dva';
import { withRouter } from 'dva/router'
import * as api from '../api'
import { handleError, i18n, findAllParentArea, requestAllData } from '../utils/util'

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



class EditOrganization extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {},
      loadingEditOrg: false,
    }
    this.editOrgFormRef = React.createRef();
  }

  cancel = (e) => {
    this.props.router.goBack()
  }

  handleSubmit = () => {
    this.editOrgFormRef.current.validateFields()
      .then(values => {
        this.setState({ loadingEditOrg: true });
        const id = Number(this.props.match.params.id)
        if (values.country) {
          values.country = values.country[values.country.length - 1];
        }
        api.editOrg(id, values)
          .then((result) => {
            const { id } = result.data;
            const alias = values.alias ? values.alias.filter(f => !!f) : [];
            return this.updateOrgAlias(id, alias);
          })
          .then(() => {
            this.setState({ loadingEditOrg: false });
            this.props.history.goBack();
          })
          .catch(error => {
            this.setState({ loadingEditOrg: false });
            handleError(error)
          });
      });
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

  getOrgAlias = async orgID => {
    const req = await requestAllData(api.getOrgAlias, { org: orgID }, 10);
    const orgAlias = req.data.data.map(m => m.alias);
    this.editOrgFormRef.current.setFieldsValue({ alias: orgAlias });
  }

  componentDidMount() {
    const id = Number(this.props.match.params.id)
    let data = null;
    api.getOrgDetail(id).then(result => {
      // 数据转换
      data = { ...result.data };
      this.getOrgAlias(data.id);
      return this.props.dispatch({ type: 'app/getSource', payload: 'country' });
    }).then(allCountries => {
      let country = [];
      if (data.country) {
        country = findAllParentArea(data.country, allCountries);
      }
      data = { ...data, country };
      data.country = data.country ? data.country.map(m => m.id) : [];
      data.currency = data.currency && data.currency.id
      data.industry = data.industry && data.industry.id
      data.orgtransactionphase = data.orgtransactionphase ? data.orgtransactionphase.map(item => item.id) : []
      data.orgtype = data.orgtype && data.orgtype.id
      data.orgstatus = data.orgstatus && data.orgstatus.id
      data.tags = data.tags ? data.tags.map(item => item.id) : [];
      const textFields = ['description', 'typicalCase', 'partnerOrInvestmentCommiterMember', 'decisionMakingProcess']
      textFields.forEach(item => {
        if (data[item] == null) { data[item] = '' }
      })
      this.setState({ data })
      this.editOrgFormRef.current.setFieldsValue(data);
    }, error => {
      handleError(error)
    })
  }

  render() {
    const id = Number(this.props.match.params.id)
    return (
      <LeftRightLayout 
        location={this.props.location}
        title={i18n('organization.edit_org')} 
        action={{ name: i18n('organization.investor_list'), link: '/app/orguser/list?org=' + id }}>
        <div>

          <div style={formStyle}>
            <OrganizationForm
              ref={this.editOrgFormRef}
              wrappedComponentRef={this.handleRef}
              data={this.state.data}
            />
            <div style={actionStyle}>
              <Button size="large" onClick={this.cancel} style={actionBtnStyle}>{i18n('common.cancel')}</Button>
              <Button type="primary" size="large" loading={this.state.loadingEditOrg} style={actionBtnStyle} onClick={this.handleSubmit}>{i18n('common.save')}</Button>
            </div>
          </div>

          <OrganizationRemarkList typeId={id} />

        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(EditOrganization));
