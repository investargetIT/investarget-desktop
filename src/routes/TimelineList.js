import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, showError } from '../utils/util'

import { Input, Icon, Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { TimelineFilter } from '../components/Filter'
import CloseTimelineModal from '../components/CloseTimelineModal'
import { Search } from '../components/Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class TimelineList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: { isClose: false }, // 默认值
      search: null,
      _params: { isClose: false },
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleFiltersChange = (filters) => {
    this.setState({ filters })
  }

  handleFilt = () => {
    let { _params, filters } = this.state
    _params = { ..._params, ...filters }
    this.setState({ _params, page: 1 }, this.getTimeline)
  }

  handleReset = () => {
    this.setState({ filters: {}, page: 1, _params: {} }, this.getTimeline)
  }

  handleSearchChange = (search) => {
    this.setState({ search })
  }

  handleSearch = () => {
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.getTimeline)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getTimeline)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getTimeline)
  }

  getTimeline = () => {
    const { _params, page, pageSize } = this.state
    const params = { ..._params, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getTimeline(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
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
            <Button size="small" onClick={this.closeTimeline.bind(this, record.id)} disabled={record.isClose}>关闭</Button>
            &nbsp;
            <Link to={'/app/timeline/' + record.id}>
              <Button size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to={'/app/timeline/edit/' + record.id}>
              <Button size="small" disabled={record.isClose}>{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.deleteTimeline.bind(null, record.id)}>
              <Button type="danger" size="small">{i18n("delete")}</Button>
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
            <TimelineFilter value={filters} onChange={this.handleFiltersChange} onSearch={this.handleFilt} onReset={this.handleReset} />
            <Search value={search} onChange={this.handleSearchChange} onSearch={this.handleSearch} placeholder="按项目、投资人、交易师搜索" />
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


