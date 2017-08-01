import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, showError, hasPerm, getCurrentUser } from '../utils/util'

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
      }
    }
    this.setState({ loading: true })
    api.getTimeline(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
    this.writeSetting()
  }

  deleteTimeline = (id) => {
    api.deleteTimeline(id).then(result => {
      this.getTimeline()
    }, error => {
      showError(error.message)
    })
  }

  closeTimeline = (id) => {
    this.closeTimelineModal.closeTimeline(id)
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

  componentDidMount() {
    this.getTimeline()
  }

  render() {

    const { location } = this.props

    const columns = [
      { title: '项目', key: 'proj', dataIndex: 'proj.projtitle' },
      { title: '投资人', key: 'investor', dataIndex: 'investor.username' },
      { title: '投资人所属机构', key: 'org', dataIndex: 'investor.org.orgname' },
      { title: '交易师', key: 'trader', dataIndex: 'trader.username' },
      { title: '剩余天数', key: 'remainingAlertDay', render: (text, record) => {
        let day = Number(record.transationStatu.remainingAlertDay)
        day = day > 0 ? Math.ceil(day) : 0
        return day
      } },
      { title: '当前状态', key: 'transactionStatus', dataIndex: 'transationStatu.transationStatus.name' },
      { title: '最新备注', key: 'remark', dataIndex: 'latestremark.remark' },
      { title: '操作', key: 'action', render: (text, record) => (
          <span>
            <Button size="small" onClick={this.closeTimeline.bind(this, record.id)} disabled={!record.action.change || record.isClose}>关闭</Button>
            &nbsp;
            <Link to={'/app/timeline/' + record.id}>
              <Button size="small" disabled={!record.action.get}>{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to={'/app/timeline/edit/' + record.id}>
              <Button size="small" disabled={!record.action.change || record.isClose}>{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.deleteTimeline.bind(null, record.id)}>
              <Button type="danger" size="small" disabled={!record.action.delete}>{i18n("delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title="时间轴列表" />
          <div>
            <TimelineFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
            <div style={{ marginBottom: '24px' }}>
              <Search2 style={{ width: 200 }} defaultValue={search} onSearch={this.handleSearch} placeholder="项目、投资人、交易师" />
            </div>
            <Table style={tableStyle} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
            <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
          </div>
        </div>

        <CloseTimelineModal ref={ inst => this.closeTimelineModal = inst} afterClose={this.getTimeline} />
      </MainLayout>
    )
  }
}

export default TimelineList


