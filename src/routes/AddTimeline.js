import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser } from '../utils/util'
import { Button, Modal } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import SelectOrganization from '../components/SelectOrganization'
import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'
import SelectInvestor from '../components/SelectInvestor'



class AddTimeline extends React.Component {

  constructor(props) {
    super(props)
    const projId = Number(this.props.location.query.projId)
    this.state = {
      projId: projId,
      projTitle: '',
      current: 0,
      selectedOrgs: [],
      selectedUsers: [], // 数组项的结构 {investor: ##, trader: ##}
      loading: false,
    }
  }

  handleBack = () => {
    this.setState({
      current: 0,
      selectedUsers: [],
    })
  }

  handleNext = () => {
    this.setState({ current: 1 })
  }

  handleCreate = () => {
    Modal.confirm({
      title: '确认',
      content: '你确定为这些交易师或投资人创建时间轴吗？',
      onOk: this.createTimeline,
    })
  }

  createTimeline = () => {
    const { projId, selectedUsers } = this.state
    this.setState({ loading: true })
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
      this.setState({ loading: false }, () => {
        Modal.success({
          title: '提示',
          content: '创建时间轴成功',
          onOk: () => { this.props.router.replace('/app/timeline/list') }
        })
      })
    }, error => {
      this.setState({ loading: false }, () => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error,
        })
      })
    })
  }

  handleSelectOrg = (selectedOrgs) => {
    this.setState({ selectedOrgs })
  }

  handleSelectUser = (selectedUsers) => {
    this.setState({ selectedUsers })
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
    const { projTitle, current, selectedOrgs, selectedUsers, loading } = this.state
    const userId = getCurrentUser()

    return (
      <MainLayout location={location}>
        <PageTitle title="创建时间轴" />
        <div>
          <h3 style={{lineHeight: 2}}>项目名称：{projTitle}</h3>

          {
            hasPerm('usersys.as_admin') ? (
              <div>
                <div style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                  <p style={{fontSize: '13px'}}>
                    { current == 0 ? <span>1. 选择机构</span> : null }
                    { current == 1 ? <span>2. 选择用户</span> : null }
                  </p>
                </div>

                <div style={{padding: '16px'}}>
                  { current == 0 ? <SelectOrganization value={selectedOrgs} onChange={this.handleSelectOrg} /> : null }
                  { current == 1 ? <SelectInvestorAndTrader selectedOrgs={selectedOrgs} value={selectedUsers} onChange={this.handleSelectUser} /> : null }
                </div>

                { current == 0 ? (
                  <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
                    <Button disabled={selectedOrgs.length == 0} type="primary" onClick={this.handleNext}>下一步</Button>
                  </div>
                ) : null }

                { current == 1 ? (
                  <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
                    <Button onClick={ this.handleBack}>返回</Button>
                    <Button disabled={selectedUsers.length == 0} loading={loading} type="primary" onClick={this.handleCreate}>创建</Button>
                  </div>
                ) : null }
              </div>
            ) : null
          }

          {
            (!hasPerm('usersys.as_admin') && hasPerm('usersys.as_trader')) ? (
              <div>
                <div style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                  <p style={{fontSize: '13px'}}>选择用户</p>
                </div>
                <div style={{padding: '16px'}}>
                  <SelectInvestor traderId={userId} value={selectedUsers} onChange={this.handleSelectUser} />
                </div>
                <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
                  <Button disabled={selectedUsers.length == 0} loading={loading} type="primary" onClick={this.handleCreate}>创建</Button>
                </div>
              </div>
            ) : null
          }

        </div>
      </MainLayout>
    )
  }
}

export default connect()(withRouter(AddTimeline))
