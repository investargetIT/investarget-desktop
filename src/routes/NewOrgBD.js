import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { browserHistory, withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectTrader } from '../components/ExtraInput';

import SelectOrganization from '../components/SelectOrganization'

class NewOrgBD extends React.Component {

  constructor(props) {
    super(props)

    const userId = getCurrentUser()
    const traderId = (!hasPerm('usersys.as_admin') && hasPerm('usersys.as_trader')) ? userId : null

    this.state = {
      traderId,
      projId: Number(this.props.location.query.projId),
      projTitle: '',
      selectedOrgs: [],
      selectedOrgDetails: [], 
    }
  }

  componentDidMount() {
    api.queryUserGroup({ type: this.props.type || 'trader' })
    .then(data => api.getUser({ groups: data.data.data.map(m => m.id), userstatus: 2, page_size: 1000 }))
    .then(data => this.setState({ data: data.data.data }))
    .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }));

    if (isNaN(this.state.projId)) return;

    api.getProjLangDetail(this.state.projId).then(result => {
      const projTitle = result.data.projtitle
      this.setState({ projTitle })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }

  handleSelectOrg = (selectedOrgs, selectedOrgDetails) => {

    if (selectedOrgs.length > 100) {
      Modal.error({
        title: '无效操作',
        content: '最多选择100家机构',
      })
      return;
    }


    let newOrgDetails = selectedOrgDetails.filter(item => 
      !this.state.selectedOrgs.includes(item.id)
    );

    newOrgDetails = this.state.selectedOrgDetails.concat(newOrgDetails).filter(item => 
      selectedOrgs.includes(item.id)
    );

    this.setState({ selectedOrgs, selectedOrgDetails: newOrgDetails});
  }

  handleNext = () => {
    this.props.history.push({
      pathname: "/app/org/newbd",
      query: {
        ids: this.state.selectedOrgs.join(","),
        projId: this.props.location.query.projId || null
      }
    })
  }

  render() {

    const { location }  = this.props
    const { traderId, selectedOrgs, selectedOrgDetails } = this.state

    return (
      <LeftRightLayout
        location={location}
        title={i18n('menu.bd_management')}
        breadcrumb={' > ' + i18n('menu.organization_bd') + ' > ' + i18n('project.create_org_bd')}
      >
        <div>
          {this.state.projTitle ?
            <h3 style={{lineHeight: 2}}>{i18n('timeline.project_name')} : {this.state.projTitle}</h3>
            : null}

          <div style={{padding: '8px 0'}}>
            <p style={{fontSize: '13px'}}>
              <span style={{fontWeight: 'bold', color: 'black'}}>1. {i18n('timeline.select_institution')}</span>
            </p>
          </div>
  
          <div style={{padding: '16px'}}>
            <SelectOrganization traderId={this.props.bd ? undefined : traderId} value={selectedOrgs} details={selectedOrgDetails} onChange={this.handleSelectOrg} />
          </div>

          <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
            <Button disabled={selectedOrgs.length == 0} type="primary" onClick={this.handleNext}>{i18n('common.next')}</Button>
          </div>
        </div>
          
      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { sortedTrader } = state.app;
  return { sortedTrader };
}
export default connect(mapStateToProps)(withRouter(NewOrgBD));
