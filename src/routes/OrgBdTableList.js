import React from 'react'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router';
import { 
  i18n, 
  hasPerm, 
  getCurrentUser,
  getUserInfo,
} from '../utils/util';

import { Input, Icon, Button, Popconfirm, Modal, Table, Pagination, Popover } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import qs from 'qs';
import { TimelineFilter } from '../components/Filter'
import CloseTimelineModal from '../components/CloseTimelineModal'
import { Search } from '../components/Search'
import { PAGE_SIZE_OPTIONS } from '../constants';

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class TimelineList extends React.Component {

  constructor(props) {
    super(props)

    const { proj, investor, trader } = props.location.query;

    let filters, search, page;
    if (proj && investor && trader) {
      filters = { investor, proj, trader, isClose: null };
    } else {
      const setting = this.readSetting();
      filters = setting ? setting.filters : TimelineFilter.defaultValue;
      search = setting ? setting.search : null;
      page = setting ? setting.page : 1;
    }


    this.state = {
      filters,
      search,
      page,
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
    this.setState({ filters, page: 1, search: null }, this.getTimeline)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getTimeline)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getOrgBdList);
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getOrgBdList)
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

      if (this.props.location.query.proj === undefined) {
        this.writeSetting()
      }
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
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
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getOrgBdList();
  }

  getOrgBdList = async () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { page_index: page, page_size: pageSize };
    this.setState({ loading: true });
    const res = await api.getOrgBdList(params);
    window.echo('req', res);
    const { data: list, count: total } = res.data;
    this.setState({ list, total, loading: false });
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

  isAbleToModifyStatus = record => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if ([this.state.makeUser, this.state.takeUser, record.manager.id, record.createuser.id].includes(currentUserID)) {
      return true;
    }
    return false;
  }

  handleModifyStatusBtnClicked(bd) {
    this.setState({ 
        visible: true, 
        currentBD: bd,
    });
  }

  handleOpenModal = bd => {
    this.setState({ commentVisible: true, currentBD: bd, comments: bd.BDComments || [] });
  }

  render() {

    const { location } = this.props
    // const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      { 
        title: i18n('timeline.project_name'), 
        key: 'proj', 
        render: (text, record) => <Link to={'/app/projects/' + record.proj.id}>{ record.proj.projtitle }</Link>, 
        // sorter: true, 
      },
      { 
        title: i18n('timeline.investor'), 
        key: 'username', 
        dataIndex: 'username', 
        // sorter: true, 
      },
      {
        title: i18n('user.position'),
        key: 'position',
        dataIndex: 'usertitle.name'
        // sorter: true, 
      },
      { 
        title: i18n('org_bd.manager'), 
        key: 'manager', 
        dataIndex: 'manager.username', 
        // sorter: true, 
      },
      { 
        title: i18n('org_bd.status'), 
        key: 'response',
        dataIndex: 'response',
        render: text => text && this.props.orgbdres.length > 0 && this.props.orgbdres.filter(f => f.id === text)[0].name,
      },
      {
        title: "最新备注",
        key: 'bd_latest_info',
        render: (text, record) => {
          let latestComment = record.BDComments && record.BDComments.length && record.BDComments[record.BDComments.length-1].comments || null;
          return latestComment ?
            <Popover placement="leftTop" title="最新备注" content={<p style={{maxWidth: 400}}>{latestComment}</p>}>
              <div style={{color: "#428bca"}}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment }
              </div>
            </Popover>
            : "暂无";
        },
      },
      {
        title: i18n('org_bd.operation'),
        key: 'operation',
        render: (text, record) => {
          return this.isAbleToModifyStatus(record) ?
            <span>
              <button style={{ ...buttonStyle, marginRight: 4 }} size="small" onClick={this.handleModifyStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</button>
              <a style={{ ...buttonStyle, marginRight: 4 }} href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record)}>{i18n('remark.comment')}</a>
            </span>
            : null;
        },
      },
    ]

    const { filters, search, total, list, loading, page, pageSize, visible, id, reason } = this.state

    return (
      <LeftRightLayout location={location} title={i18n('menu.timeline_management')}>
        <div>
          <div>
            {/* <TimelineFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} /> */}

            <div style={{ marginBottom: 24, textAlign: 'right' }} className="clearfix">
              <Search
                style={{ width: 250 }}
                placeholder={[i18n('timeline.project_name'), i18n('timeline.investor'), i18n('timeline.trader')].join(' / ')}
                onSearch={this.handleSearch}
                onChange={search => this.setState({ search })}
                value={search}
              />
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
function mapStateToProps(state) {
  const { orgbdres } = state.app;
  return { orgbdres };
}
export default connect(mapStateToProps)(withRouter(TimelineList));
