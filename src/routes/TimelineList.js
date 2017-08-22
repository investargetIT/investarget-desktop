import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, hasPerm, getCurrentUser } from '../utils/util'

import { Input, Icon, Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { TimelineFilter } from '../components/Filter'
import CloseTimelineModal from '../components/CloseTimelineModal'
import { Search2 } from '../components/Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class TimelineList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : TimelineFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

    this.state = {
      filters,
      search,
      page,
      pageSize,
      total: 0,
      list: [],
      loading: false,
      visible: false,
      id: null,
      reason: '',
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getTimeline)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getTimeline)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getTimeline)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getTimeline)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getTimeline)
  }

  getTimeline = () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize }
    // 用户查看自己的时间轴，管理员查看全部时间轴
    if (!hasPerm('usersys.as_admin')) {
      let userId = getCurrentUser()
      if (hasPerm('usersys.as_investor')) {
        params['investor'] = userId
      } else if (hasPerm('usersys.as_trader')) {
        params['trader'] = userId
      } else {
        return
      }
    }
    this.setState({ loading: true })
    api.getTimeline(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })

      const ids = list.map(item => item.id)
      this.getLatestRemark(ids)
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }

  deleteTimeline = (id) => {
    api.deleteTimeline(id).then(result => {
      this.getTimeline()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  showOpenTimelineModal = (id) => {
    Modal.confirm({
      title: i18n('timeline.open_timeline'),
      onOk: () => {
        api.openTimeline(id).then(result => {
          this.getTimeline()
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error,
          })
        })
      },
    })
  }
  // 关闭时间轴

  showCloseTimelineModal = (id) => {
    this.setState({ visible: true, id, reason: '' })
  }

  handleReasonChange = (reason) => {
    this.setState({ reason })
  }

  handleCancelClose = () => {
    this.setState({ visible: false })
  }

  handleConfirmClose = () => {
    const { id, reason } = this.state
    api.closeTimeline(id, reason).then(result => {
      this.setState({ visible: false })
      // refresh
      this.getTimeline()
      // 结束理由，添加一条备注
      const data = { timeline: id, remark: reason }
      api.addTimelineRemark(data).then(result => {
        //
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error,
        })
      })
    }, error => {
      this.setState({ visible: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }


  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('TimelineList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('TimelineList')
    return data ? JSON.parse(data) : null
  }

  getLatestRemark = (timelineIds) => {
    const userId = getCurrentUser()

    const q = timelineIds.map(id => {
      const params = { timeline: id, createuser: userId }
      return api.getTimelineRemark(params).then(result => {
        const { count, data } = result.data
        return count > 0 ? data[0] : ''
      })
    })

    Promise.all(q).then(remarks => {
      const list = this.state.list.map((item, index) => {
        return { ...item, latestremark: remarks[index] }
      })
      this.setState({ list })
    })
  }

  componentDidMount() {
    this.getTimeline()
  }

  render() {

    const { location } = this.props

    const columns = [
      { title: i18n('timeline.project_name'), key: 'proj', dataIndex: 'proj.projtitle' },
      { title: i18n('timeline.investor'), key: 'investor', dataIndex: 'investor.username' },
      { title: i18n('timeline.institution'), key: 'org', dataIndex: 'investor.org.orgname' },
      { title: i18n('timeline.trader'), key: 'trader', dataIndex: 'trader.username' },
      { title: i18n('timeline.remaining_day'), key: 'remainingAlertDay', render: (text, record) => {
        let day = Number(record.transationStatu.remainingAlertDay)
        day = day > 0 ? Math.ceil(day) : 0
        return day
      } },
      { title: i18n('timeline.transaction_status'), key: 'transactionStatus', dataIndex: 'transationStatu.transationStatus.name' },
      { title: i18n('timeline.latest_remark'), key: 'remark', dataIndex: 'latestremark.remark' },
      { title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <span>
            {
              record.isClose ? (
                <Button size="small" onClick={this.showOpenTimelineModal.bind(this, record.id)} disabled={!record.action.change}>{i18n('common.open')}</Button>
              ) : (
                <Button size="small" onClick={this.showCloseTimelineModal.bind(this, record.id)} disabled={!record.action.change}>{i18n('common.close')}</Button>
              )
            }
            &nbsp;
            <Link to={'/app/timeline/' + record.id}>
              <Button size="small" disabled={!record.action.get}>{i18n("common.view")}</Button>
            </Link>
            &nbsp;
            <Link to={'/app/timeline/edit/' + record.id}>
              <Button size="small" disabled={!record.action.change || record.isClose}>{i18n("common.edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.deleteTimeline.bind(null, record.id)}>
              <Button type="danger" size="small" disabled={!record.action.delete}>{i18n("common.delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]

    const { filters, search, total, list, loading, page, pageSize, visible, id, reason } = this.state

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title={i18n('timeline.timeline_list')} />
          <div>
            <TimelineFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
            <div style={{ marginBottom: '24px' }}>
              <Search2 style={{ width: 250 }} defaultValue={search} onSearch={this.handleSearch} placeholder={[i18n('timeline.project_name'), i18n('timeline.investor'), i18n('timeline.trader')].join(' / ')} />
            </div>
            <Table style={tableStyle} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
            <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
          </div>
        </div>

        <CloseTimelineModal visible={visible} id={id} reason={reason} onChange={this.handleReasonChange} onOk={this.handleConfirmClose} onCancel={this.handleCancelClose} />
      </MainLayout>
    )
  }
}

export default connect()(TimelineList)


