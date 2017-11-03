import React from 'react'
import { Table, Pagination } from 'antd'
import { Link } from 'dva/router'

import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { Search2 } from '../components/Search'
import { hasPerm, i18n, handleError, time } from '../utils/util'
import * as api from '../api'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class ScheduleList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: null,
      total: 0,
      list: [],
      page: 1,
      pageSize: 10,
      loading: false,
    }
  }

  handleSearch = (search) => {
    this.setState({ search }, this.getSchedule)
  }

  handleChangePage = (page) => {
    this.setState({ page }, this.getSchedule)
  }

  handleChangePageSize = (current, pageSize) => {
    this.setState({ page: 1, pageSize }, this.getSchedule)
  }

  getSchedule = () => {
    this.setState({ loading: true })
    const { search, page, pageSize } = this.state
    const param = { search, page_index: page, page_size: pageSize }
    api.getSchedule(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }).catch(error => {
      handleError(error)
      this.setState({ loading: false })
    })
  }

  componentDidMount() {
    this.getSchedule()
  }

  render() {
    const { total, list, loading, page, pageSize, search } = this.state
    const columns = [
      {title: i18n('schedule.schedule_time'), dataIndex: 'scheduledtime', render: (text, record) => {
        return time(text + record.timezone)
      }},
      {title: i18n('schedule.creator'), dataIndex: 'createuser.username'},
      {title: i18n('schedule.project'), dataIndex: 'projtitle', render: (text, record) => {
        return <Link to={'/app/projects/' + record.proj} target="_blank">{text}</Link>
      }},
      {title: i18n('schedule.investor'), dataIndex: 'user.username', render: (text, record) => {
        return record.user ? (
          <Link to={'/app/user/' + record.user.id} target="_blank">{text}</Link>
        ) : null
      }},
      {title: i18n('schedule.title'), dataIndex: 'comments'},
      {title: i18n('schedule.area'), dataIndex: 'country.country'},
      {title: i18n('schedule.address'), dataIndex: 'address'},
    ]

    return (
      <MainLayout location={this.props.location}>
        <PageTitle title={i18n('schedule.schedule_list')} />
        <div style={{ marginBottom: '24px' }}>
          <Search2 style={{ width: 250 }} defaultValue={search} onSearch={this.handleSearch} placeholder={[i18n('schedule.creator_name'), i18n('schedule.creator_mobile')].join(' / ')} />
        </div>
        <Table
          style={tableStyle}
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false} />
        <Pagination
          style={paginationStyle}
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handleChangePage}
          showSizeChanger
          onShowSizeChange={this.handleChangePageSize}
          showQuickJumper />
      </MainLayout>
    )
  }
}

export default ScheduleList
