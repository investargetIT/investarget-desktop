import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'


class AddTimeline extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      projId: Number(this.props.location.query.projId),
      projTitle: '',
      selectedUsers: [], // 数组项的结构 {investor: ##, trader: ##}
    }
  }

  handleCreate = () => {
    Modal.confirm({
      title: i18n('timeline.message.confirm_create_title'),
      content: i18n('timeline.message.confirm_create_content'),
      onOk: this.createTimeline,
    })
  }

  createTimeline = (projId, selectedUsers) => {
    Promise.all(
      selectedUsers.map(item => {
        const params = {
          timelinedata: {
            'proj': projId,
            'investor': item.investor,
            'trader': item.trader,
          }
        }
        return api.addTimeline(params)
      })
    ).then(results => {
      Modal.success({
        title: i18n('timeline.message.create_success_title'),
        content: i18n('timeline.message.create_success_content'),
        onOk: () => { this.props.router.replace('/app/timeline/list') }
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }

  handleSelectUser = (selectedUsers) => {
    this.createTimeline(this.state.projId, selectedUsers)
  }

  componentDidMount() {
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
      <LeftRightLayout location={location} title={i18n('timeline.create_timeline')}>
        <div>
          <h3 style={{lineHeight: 2}}>{i18n('timeline.project_name')} : {this.state.projTitle}</h3>

          <SelectInvestorAndTrader onSelect={this.handleSelectUser} />
        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(AddTimeline))
