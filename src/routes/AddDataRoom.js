import React from 'react'
import { connect } from 'dva'
import { Modal } from 'antd'
import { routerRedux } from 'dva/router'
import * as api from '../api'
import { hasPerm, i18n, isLogin } from '../utils/util'
import LeftRightLayout from '../components/LeftRightLayout'
import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'

const confirm = Modal.confirm

class AddDataRoom extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      projectName: null,
    }
  }

  componentDidMount() {
    // if (!hasPerm('dataroom.admin_adddataroom') && !hasPerm('dataroom.user_adddataroom')) {
    //   this.props.dispatch(routerRedux.replace('/403'))
    //   return
    // }
    const projectID = this.props.location.query.projectID
    if (projectID) {
      api.getProjLangDetail(projectID)
        .then(data => this.setState({ projectName: data.data.projtitle }))
        .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
    }
  }

  handleCreateDataroom = selectedUsers => {
    const projectID = this.props.location.query.projectID
    const react = this
    confirm({
      title: i18n('dataroom.message.confirm_create_dataroom'),
      onOk() {
        Promise.all(selectedUsers.map(m => {
          const body = { proj: projectID }
          return api.createDataRoom(body).then(result => {
            const { id } = result.data
            const param1 = { dataroom: id, user: m.investor, trader: m.trader };
            return api.addUserDataRoom(param1);
          })
        }))
        .then(data => react.props.dispatch(routerRedux.replace('/app/dataroom/project/list')))
        .catch(e => react.props.dispatch({ type: 'app/findError', payload: e }))
      }
    })
  }

  render () {
    return (
      <LeftRightLayout location={this.props.location} title={i18n("dataroom.create_dataroom")}>
        <div style={{ fontSize: 16, marginBottom: 24 }}>{i18n('dataroom.project_name')}: {this.state.projectName}</div>
        <SelectInvestorAndTrader onSelect={this.handleCreateDataroom} />
      </LeftRightLayout>
    )
  }

}

export default connect()(AddDataRoom)
