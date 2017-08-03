import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser, hasPerm } from '../utils/util'
import { Button, Modal } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
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
      title: '确认',
      content: '你确定为这些交易师或投资人创建时间轴吗？',
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
        title: '提示',
        content: '创建时间轴成功',
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
      <MainLayout location={location}>
        <PageTitle title="创建时间轴" />
        <div>
          <h3 style={{lineHeight: 2}}>项目名称：{this.state.projTitle}</h3>

          <SelectInvestorAndTrader onSelect={this.handleSelectUser} />
        </div>
      </MainLayout>
    )
  }
}

export default connect()(withRouter(AddTimeline))
