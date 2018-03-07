import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { 
  i18n, 
  hasPerm, 
  getCurrentUser,
  getUserInfo,
} from '../utils/util';

import { Input, Icon, Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { TimelineFilter } from '../components/Filter'
import CloseTimelineModal from '../components/CloseTimelineModal'
import { Search2 } from '../components/Search'
import { PAGE_SIZE_OPTIONS } from '../constants';

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
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      visible: false,
      id: null,
      reason: '',
      desc: undefined,
      sort: undefined,
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
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort, desc }
    this.setState({ loading: true })
    api.getTimeline(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })

      const ids = list.map(item => item.id)
      const investorIds = list.map(item => item.investor.id)

      Promise.all([this.getInvestorOrganization(investorIds), this.getLatestRemark(ids)])
        .then(data => {
          const orgs = data[0]
          const remarks = data[1]
          const list = this.state.list.map((item, index) => {
            return { ...item, org: orgs[index], latestremark: remarks[index] }
          })
          this.setState({ list })
        })
        .catch(error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error,
          })
        })

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

  getInvestorOrganization = (investorIds) => {

    const q = investorIds.map(id => {
      return api.getUserInfo(id).then(result => {
        const user = result.data
        return user.org
      })
    })

    return Promise.all(q)
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

    return Promise.all(q)
  }

  componentDidMount() {
    this.getTimeline()
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getTimeline
    );
  };

  render() {

    const { location } = this.props
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      { 
        title: i18n('timeline.project_name'), 
        key: 'proj', 
        render: (text, record) => <Link to={'/app/projects/' + record.proj.id}>{ record.proj.projtitle }</Link>, 
        sorter: true, 
      },
      { 
        title: i18n('timeline.investor'), 
        key: 'investor', 
        dataIndex: 'investor.username', 
        sorter: true, 
      },
      {
        title: i18n('timeline.institution'),
        key: 'org',
        render: (text, record) => {
          if (record.org) {
            let { id, orgname } = record.org
            return <Link to={'/app/organization/' + id}>{orgname}</Link>
          }
        }, 
        // sorter: true, 
      },
      { 
        title: i18n('timeline.trader'), 
        key: 'trader', 
        dataIndex: 'trader.username', 
        sorter: true, 
      },
      { 
        title: i18n('timeline.remaining_day'), 
        key: 'remainingAlertDay', 
        render: (text, record) => {
          let day = Number(record.transationStatu.remainingAlertDay)
          day = day > 0 ? Math.ceil(day) : 0
          return day
        },
      },
      { 
        title: i18n('timeline.transaction_status'), 
        key: 'transationStatu', 
        dataIndex: 'transationStatu.transationStatus.name', 
        // sorter: true, 
      },
      { title: i18n('timeline.latest_remark'), key: 'remark', dataIndex: 'latestremark.remark' },
      { title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <span className="span-operation" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',flexWrap:'wrap',maxWidth:'100px'}}>
            {
              record.isClose ? (
                <Button style={buttonStyle} size="small" onClick={this.showOpenTimelineModal.bind(this, record.id)} disabled={!record.action.change}>{i18n('common.open')}</Button>
              ) : (
                <Button style={buttonStyle} size="small" onClick={this.showCloseTimelineModal.bind(this, record.id)} disabled={!record.action.change}>{i18n('common.close')}</Button>
              )
            }

            <Link to={'/app/timeline/' + record.id}>
              <Button style={buttonStyle} size="small" disabled={!record.action.get}>{i18n("common.view")}</Button>
            </Link>

            <Link to={'/app/timeline/edit/' + record.id}>
              <Button style={buttonStyle} size="small" disabled={!record.action.change || record.isClose}>{i18n("common.edit")}</Button>
            </Link>
            </div>
            <div>
            <Popconfirm title={i18n("message.confirm_delete")} onConfirm={this.deleteTimeline.bind(null, record.id)}>
              <a type="danger" size="small" disabled={!record.action.delete}><img style={imgStyle} src="/images/delete.png" /></a>
            </Popconfirm>
            </div>
          </span>
        )
      },
    ]

    const { filters, search, total, list, loading, page, pageSize, visible, id, reason } = this.state

    return (
      <LeftRightLayout location={location} title={i18n('menu.timeline_management')}>
        <div>
          <div>
            <TimelineFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
            <div style={{ marginBottom: '24px'}} className="clearfix">
              <Search2 style={{ width: 250,float:'right' }} defaultValue={search} onSearch={this.handleSearch} placeholder={[i18n('timeline.project_name'), i18n('timeline.investor'), i18n('timeline.trader')].join(' / ')} />
            </div>

            <Table
              onChange={this.handleTableChange}
              style={tableStyle}
              columns={columns} 
              dataSource={list} 
              rowKey={record=>record.id} 
              loading={loading} 
              pagination={false} 
            />

            <Pagination 
              style={paginationStyle} 
              total={total} 
              current={page} 
              pageSize={pageSize} 
              onChange={this.handlePageChange} 
              showSizeChanger 
              onShowSizeChange={this.handlePageSizeChange} 
              showQuickJumper
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />

          </div>
        </div>

        <CloseTimelineModal visible={visible} id={id} reason={reason} onChange={this.handleReasonChange} onOk={this.handleConfirmClose} onCancel={this.handleCancelClose} />
      </LeftRightLayout>
    )
  }
}

export default connect()(TimelineList)


