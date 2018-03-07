import React from 'react'
import { Table, Pagination } from 'antd'
import { Link } from 'dva/router'

import LeftRightLayout from '../components/LeftRightLayout'

import { Search2 } from '../components/Search'
import { 
  hasPerm, 
  i18n, 
  handleError, 
  time,
  getUserInfo,
} from '../utils/util';
import * as api from '../api'
import { PAGE_SIZE_OPTIONS } from '../constants';

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
      pageSize: getUserInfo().page || 10,
      loading: false,
      sort:undefined,
      desc:undefined,
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
    const { search, page, pageSize, sort, desc } = this.state
    const param = { search, page_index: page, page_size: pageSize, sort, desc }
    api.getSchedule(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }).catch(error => {
      handleError(error)
      this.setState({ loading: false })
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getSchedule
    );
  }

  componentDidMount() {
    this.getSchedule()
  }

  render() {
    const { total, list, loading, page, pageSize, search } = this.state
    const columns = [
      {title: i18n('schedule.schedule_time'), dataIndex: 'scheduledtime', render: (text, record) => {
        return time(text + record.timezone)
      },key:'scheduledtime', sorter:true},
      {title: i18n('schedule.creator'), dataIndex: 'createuser.username', key:'createuser', sorter:true},
      {title: i18n('schedule.project'), dataIndex: 'projtitle', render: (text, record) => {
        return record.proj ? <Link to={'/app/projects/' + record.proj.id} >{text}</Link> :{text}
      }, key:'projtitle', sorter:true},
      {title: i18n('schedule.investor'), dataIndex: 'user.username', render: (text, record) => {
        return record.user ? (
          <Link to={'/app/user/' + record.user.id} target="_blank">{text}</Link>
        ) : null
      },key:'user', sorter:true},
      {title: i18n('schedule.title'), dataIndex: 'comments', key:'comments', sorter:true},
      {title: i18n('user.country'), dataIndex: 'country.country', key:'country', sorter:true}, 
      {title: i18n('schedule.area'), dataIndex: 'location.name', key:'location', sorter:true},
      {title: i18n('schedule.address'), dataIndex: 'address', key:'address', sorter:true},
    ]

    return (
      <LeftRightLayout location={this.props.location} title={i18n('schedule.schedule_list')}>
        <div style={{ marginBottom: '24px' }} className="clearfix">
          <Search2 style={{ width: 250,float:'right' }} defaultValue={search} onSearch={this.handleSearch} placeholder={[i18n('schedule.creator_name'), i18n('schedule.creator_mobile')].join(' / ')} />
        </div>
        <Table
          onChange={this.handleTableChange}
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
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />

      </LeftRightLayout>
    )
  }
}

export default ScheduleList
