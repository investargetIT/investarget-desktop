import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'


class AddOrgBD extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      projId: Number(this.props.location.query.projId),
      projTitle: '',
      selectedUsers: [], // 数组项的结构 {investor: ##, trader: ##, org: ##}
      data: null,
    }
  }

  handleCreate = () => {
    Modal.confirm({
      title: i18n('timeline.message.confirm_create_title'),
      content: i18n('timeline.message.confirm_create_content'),
      onOk: this.createTimeline,
    })
  }

  createOrgBD = (projId, selectedUsers) => {
    Promise.all(selectedUsers.map(m => {
      const body = {
        'bduser': m.investor,
        'manager': m.trader,
        'org': m.org,
        'proj': projId,
        'bd_status': 1,
      };
      return api.addOrgBD(body);
    }))
      .then(result => {
        Modal.success({
            title: i18n('timeline.message.create_success_title'),
            content: i18n('create_orgbd_success'),
            onOk: () => { this.props.router.replace('/app/org/bd') }
          })
      })
      .catch(error => this.props.dispatch({
        type: 'app/findError',
        payload: error,
      }));
  }

  handleSelectUser = (selectedUsers) => {
    this.createOrgBD(this.state.projId, selectedUsers)
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

  render() {
    const { location }  = this.props

    return (
      <LeftRightLayout location={location} title={i18n('project.create_org_bd')}>
        <div>
          {this.state.projTitle ? 
          <h3 style={{lineHeight: 2}}>{i18n('timeline.project_name')} : {this.state.projTitle}</h3>
          : null}

          { this.state.data ? <SelectInvestorAndTrader onSelect={this.handleSelectUser} options={this.state.data} /> : null }
        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(AddOrgBD))
