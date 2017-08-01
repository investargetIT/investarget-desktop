import React from 'react'
import * as api from '../api'
import { withRouter } from 'dva/router'
import { getCurrentUser } from '../utils/util'
import { Button } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import SelectOrganization from '../components/SelectOrganization'
import SelectUser from '../components/SelectUser'
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
    const { projId, selectedUsers } = this.state
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
      this.props.router.replace('/app/timeline/list')
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
    })
  }

  render() {
    const { projTitle, current, selectedOrgs, selectedUsers } = this.state
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
                  { current == 1 ? <SelectUser selectedOrgs={selectedOrgs} value={selectedUsers} onChange={this.handleSelectUser} /> : null }
                </div>

                { current == 0 ? (
                  <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
                    <Button disabled={selectedOrgs.length == 0} type="primary" onClick={this.handleNext}>下一步</Button>
                  </div>
                ) : null }

                { current == 1 ? (
                  <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
                    <Button onClick={ this.handleBack}>返回</Button>
                    <Button disabled={selectedUsers.length == 0} type="primary" onClick={this.handleCreate}>创建</Button>
                  </div>
                ) : null }
              </div>
            ) : null
          }

          {
            hasPerm('usersys.as_trader') ? (
              <div>
                <div style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                  <p style={{fontSize: '13px'}}>选择用户</p>
                </div>
                <div style={{padding: '16px'}}>
                  <SelectInvestor traderId={userId} value={selectedUsers} onChange={this.handleSelectUser} />
                </div>
                <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
                  <Button disabled={selectedUsers.length == 0} type="primary" onClick={this.handleCreate}>创建</Button>
                </div>
              </div>
            ) : null
          }

        </div>
      </MainLayout>
    )
  }
}

export default withRouter(AddTimeline)
