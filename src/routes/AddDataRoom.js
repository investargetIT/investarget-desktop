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
    if (!hasPerm('dataroom.admin_adddataroom') && !hasPerm('dataroom.user_adddataroom')) {
      this.props.dispatch(routerRedux.replace('/403'))
      return
    }
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
      title: '你确定为这些交易师或投资人创建Dataroom吗?',
      onOk() {
        Promise.all(selectedUsers.map(m => {
          const body = {
            proj: parseInt(projectID, 10),
            isPublic: false,
            investor: m.investor,
            trader: m.trader || isLogin().id
          }
          return api.createDataRoom(body)
        }))
        .then(data => react.props.dispatch(routerRedux.replace('/app/dataroom/list')))
        .catch(e => react.props.dispatch({ type: 'app/findError', payload: e }))
      }
    })
  }

  render () {
    return (
      <LeftRightLayout location={this.props.location} title={i18n("create_dataroom")}>
        <div style={{ fontSize: 16, marginBottom: 24 }}>项目名称: {this.state.projectName}</div>
        <SelectInvestorAndTrader onSelect={this.handleCreateDataroom} />
      </LeftRightLayout>
    )
  }

}

export default connect()(AddDataRoom)
