import React from 'react'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router';
import { 
  i18n, 
  getGroup, 
  hasPerm, 
  formatMoney, 
  isShowCNY,
  requestAllData,
  getCurrentUser,
  requestAllData2,
  subtracting,
  getUserInfo,
} from '../utils/util';

import { Input, Icon, Table, Button, Pagination, Popconfirm, Modal, Card, Breadcrumb, Progress, Tooltip, Popover } from 'antd'
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { ProjectListFilter } from '../components/Filter'
import { NewProjectListFilter } from '../components/Filter';
import { Search } from '../components/Search';
import AuditProjectModal from '../components/AuditProjectModal'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { ApiError } from '../utils/request';
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';

const statStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};
const statLabelStyle = {
  marginBottom: 10,
  fontSize: 14,
  color: '#989898',
  lineHeight: '22px',
};
const statValueStyle = {
  fontSize: 14,
  color: '#262626',
  lineHeight: '32px',
};
const statValueNumStyle = {
  fontSize: 24,
}


class ProjectList extends React.Component {
  constructor(props) {
    super(props)

    // const { page } = props.location.query;

    const setting = this.readSetting()
    const filters = setting ? setting.filters : NewProjectListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting && setting.page ? setting.page : 1
    const pageSize = setting && setting.pageSize ? setting.pageSize: props.userPageSize;

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
      currentStatus: null,
      status: null,
      sendEmail: false,
      confirmLoading: false,
      sendWechat: false,
      discloseFinance: false,
      unreadOrgBDNumber: 0,
      onGogoingProjects: 0,
      solvedProjectsThisYear: [],

      sort: undefined,
      desc: undefined,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1, search: null }, this.getProject)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getProject)
  }

  handlePageChange = (page, pageSize) => {
    this.setState({ page, pageSize }, this.getProject)
  }

  // 特殊处理
  handleFinancialFilter = (filters) => {
    var data = { ...filters }
    if (data['netIncome_USD_F'] == ProjectListFilter.defaultValue['netIncome_USD_F'] &&
        data['netIncome_USD_T'] == ProjectListFilter.defaultValue['netIncome_USD_T'] )
    {
      delete data['netIncome_USD_F']
      delete data['netIncome_USD_T']
    }
    if (data['grossProfit_F'] == ProjectListFilter.defaultValue['grossProfit_F'] &&
        data['grossProfit_T'] == ProjectListFilter.defaultValue['grossProfit_T'] )
    {
      delete data['grossProfit_F']
      delete data['grossProfit_T']
    }
    const otherGroupIdx = data.indGroup.indexOf(0);
    if (otherGroupIdx > -1) {
      const newIndGroup = [...data.indGroup];
      newIndGroup[otherGroupIdx] = 'none';
      data.indGroup = newIndGroup;
    }
    return data
  }

  getProject = () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { ...this.handleFinancialFilter(filters), search, skip_count: (page-1)*pageSize, max_size: pageSize, sort, desc, iscomproj: 0 }
    this.setState({ loading: true })
    let newList = [];
    api.getProj(params)
      .then(result => {
        const { count: total, data: list } = result.data
        newList = list.map(m => {
          const projTraders = m.projTraders ? m.projTraders.map(m => m.user) : [];
          let userWithPermission = [];
          userWithPermission = userWithPermission.concat(m.PM || []);
          userWithPermission = userWithPermission.concat(m.createuser || []);
          userWithPermission = userWithPermission.concat(projTraders);
          const hasEditPerm = userWithPermission.map(m => m.id).includes(getCurrentUser());
          return { ...m, hasEditPerm };
        })
        this.setState({ total, list: newList, loading: false });
        return this.props.dispatch({ type: 'app/getSource', payload: 'projstatus' });
      })
      .then(allProjstatus => {
        newList = newList.map(m => {
          const projstatus = allProjstatus.find(f => f.id === m.projstatus);
          return { ...m, projstatus };
        });
        if (hasPerm('usersys.as_trader')) {
          this.props.dispatch({ type: 'app/checkProjectProgressFromRedux', payload: newList })
        }
      })
      .catch(error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    this.writeSetting()
  }

  getProjectProgress = record => {
    const filterProject = this.props.projectProgress.filter(f => f.id === record.id);
    if (filterProject.length > 0) {
      return filterProject[0].percentage;
    }
    return 0;
  }

  handleDelete = (id) => {
    this.setState({ loading: true })
    api.deleteProj(id).then(result => {
      this.getProject()
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  // audit project modal

  openAuditProjectModal = (id, status) => {
    this.setState({ visible: true, id, currentStatus: status, status, sendEmail: false, sendWechat: false, discloseFinance: false })
  }

  handleStatusChange = (status) => {
    this.setState({ status })
  }

  handleDiscloseFinanceChange = (discloseFinance) => {
    this.setState({ discloseFinance });
  }

  handleSendEmailChange = (sendEmail) => {
    this.setState({ sendEmail })
  }

  handleSendWechatChange = sendWechat => {
    this.setState({ sendWechat });
  }

  handleConfirmAudit = () => {
    const { id, status, sendEmail, sendWechat, discloseFinance } = this.state
    this.setState({ confirmLoading: true })
    api.editProj(id, { projstatus: status, isSendEmail: sendEmail, financeIsPublic: discloseFinance })
      .then(result => {
        this.setState({ visible: false, confirmLoading: false })
        this.getProject()
        if (sendWechat) {
          api.sendProjPdfToWechatGroup(id);
        }
      })
      .catch(error => {
        this.setState({ visible: false, confirmLoading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error,
        })
      })
  }

  handleCancelAudit = () => {
    this.setState({ visible: false })
  }



  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page };
    localStorage.setItem('ProjectList2', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('ProjectList2')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'country' });

    if (hasPerm('usersys.as_trader')) {
      this.getMyTodoTasks();
      this.getOngoingProjects();
      this.getFinishedProjectThisYear();
    }
    this.getProject()
  }

  getFinishedProjectThisYear = async () => {
    const reqOrgBDResponse = await api.getSource('orgbdres');
    const { data: responseList } = reqOrgBDResponse;
    const finishedResponse = responseList.filter(f => f.name.includes('完成交易'));
    const finishedResponseID = finishedResponse.map(m => m.id);
    
    const startOfThisYear = moment().startOf('year');
    const endOfThisYear = moment().endOf('year');
    const startDate = `${startOfThisYear.format('YYYY-MM-DD')}T00:00:00`;
    const endDate = `${endOfThisYear.format('YYYY-MM-DD')}T23:59:59`;

    const stime = startDate;
    const etime = endDate;
    const stimeM = startDate;
    const etimeM = endDate;
    const page_size = 1000;

    const params1 = { stimeM, etimeM, page_size, response: finishedResponseID };
    const params2 = { stime, etime, page_size, response: finishedResponseID };
    const res = await Promise.all([
      requestAllData(api.getOrgBDProj, params1, 100),
      requestAllData(api.getOrgBDProj, params2, 100),
    ]);

    const allSolvedProj = res.reduce((pre, cur) => pre.concat(cur.data.data.map(m => m.proj)), []);
    const uniqueProj =  _.uniqBy(allSolvedProj, 'id');
    this.setState({ solvedProjectsThisYear: uniqueProj });
  }

  getMyTodoTasks = async () => {
    const reqUnreadOrgBD = await requestAllData(api.getOrgBDProj, {
      isRead: false,
      manager: [getCurrentUser()],
    }, 100);
    const numbers = reqUnreadOrgBD.data.data.reduce((prev, curr) => curr.count + prev, 0);
    this.setState({ unreadOrgBDNumber: numbers });
  }

  getOngoingProjects = async () => {
    const reqProjStatus = await api.getSource('projstatus');
    const { data: statusList } = reqProjStatus;
    const ongoingStatus = statusList.filter(f => ['终审发布', '交易中', 'Published', 'Contacting'].includes(f.name));
    const params = {
      projstatus: ongoingStatus.map(m => m.id),
    }
    if (!hasPerm('proj.admin_manageproj')) {
      params['user'] = getCurrentUser();
    }
    // const reqProj = await requestAllData2(api.getProj, params, 100);
    const reqProj = await api.getProj({ ...params, max_size: 0 });
    this.setState({ onGogoingProjects: reqProj.data.count})
  }
  
  // componentWillReceiveProps(nextProps) {
  //   const { page: nextPage } = nextProps.location.query;
  //   const { page: currentPage } = this.props.location.query;
  //   if (nextPage !== currentPage) {
  //     this.setState({ page: parseInt(nextPage, 10) || 1 }, this.getProject);
  //   }
  // }

  handleDeleteBtnClick(projId) {
    const react = this;
    Modal.confirm({
      title: '删除项目',
      content: '确认删除该项目吗？',
      onOk() {
        window.echo('confirm del');
        react.handleDelete(projId);
      },
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      {
        sort: sorter.column ? sorter.column.key : undefined,
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      },
      this.getProject,
    );
  }

  currentUserHasIndGroup = () => {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    if (!userInfo.indGroup) return false;
    if (!userInfo.indGroup.id) return false;
    return true;
  }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, filters, search, visible, currentStatus, status, sendEmail, confirmLoading, sendWechat, discloseFinance } = this.state
    // window.echo('list', list);
    const buttonStyle={textDecoration:'underline',border:'none',background:'none',width:'110px',textAlign:'left'}
    const newButtonStyle = {
      textDecoration: 'underline',
      border: 'none',
      background: 'none',
      textAlign: 'left',
      padding: 0,
    };
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      {
        key: 'image',
        render: (text, record) => {
          const industry = record.industries && record.industries[0]
          const imgUrl = industry ? industry.url : 'defaultUrl'
          
          function popoverContent() {
            return (
              <div> 
                <div><Link to={`/app/projects/cost/${record.id}?name=${record.projtitle}&projId=${record.id}`}>前往项目成本中心</Link></div>
                <div><Link to={`/app/org/bd?projId=${record.id}`}>查看机构看板详情</Link></div>
                <div><Link to={`/app/orgbd/add?projId=${record.id}`}>名单生成</Link></div>
              </div>
            );
          }

          return hasPerm('usersys.as_trader') ? (
            // <Tooltip title="项目成本中心">
              // <Link to={`/app/projects/cost/${record.id}?name=${record.projtitle}&projId=${record.id}`}>
              <Popover title={null} content={popoverContent()}>
                <img src={imgUrl} style={{ width: '80px', height: '50px' }} />
              </Popover>
              // </Link>
            // </Tooltip>
          ) : <img src={imgUrl} style={{ width: '80px', height: '50px' }} />;
        }
      },
      {
        title: i18n('project.name'),
        key: 'title',
        render: (_, record) => {
          // if (record.action.get) {
            return (
              // <Tooltip title="项目详情">
              <Popover title={null} content={<div><Link to={`/app/projects/${record.id}`}>项目详情</Link></div>}>
                <span className="span-title">
                  <Link to={`/app/projects/${record.id}`}>{record.projtitle}</Link>
                </span>
              {/* // </Tooltip> */}
              </Popover>
            )
          // } else {
          //   this.props.dispatch({
          //     type: 'app/findError',
          //     payload: new ApiError(3000),
          //   });
          // }
        }
      },
      // {
      //   title: i18n('project.country'),
      //   key: 'country',
      //   render: (text, record) => {
      //     if (this.props.country.length === 0) return null;
      //     const country  = this.props.country.filter(f => f.id === record.country)[0];
      //     const countryName = country ? country.country : ''
      //     let imgUrl = country && country.key && country.url
      //     if (country && !imgUrl) {
      //       const parentCountry = this.props.country.filter(f => f.id === country.parent)[0]
      //       if (parentCountry && parentCountry.url) {
      //         imgUrl = parentCountry.url
      //       }
      //     }
      //     return (
      //       <span style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
      //         { imgUrl ? <img src={imgUrl} style={{width: '20px', height: '14px', marginRight: '4px'}} /> : null }
      //         <span>{countryName}</span>
      //       </span>
      //     )
      //   }
      // },
      {
        title: i18n('project.transaction_size'),
        key: 'transactionAmount',
        render: (text, record) => {
          if (isShowCNY(record, this.props.country)) {
            return record.financeAmount ? formatMoney(record.financeAmount, 'CNY') : 'N/A'
          } else {
            return record.financeAmount_USD ? formatMoney(record.financeAmount_USD) : 'N/A'
          }
        }       
      },
      // {
      //   title: i18n('project.current_status'),
      //   key: 'projstatus',
      //   render: (text, record) => {
      //     const status = record.projstatus
      //     const statusName = status ? status.name : ''
      //     return statusName
      //   }
      // },
      {
        // title: i18n('project_bd.created_time'),
        title: '发布时间',
        key: 'publishDate',
        dataIndex: 'publishDate',
        sorter: true,
        render: text => text && <div style={{ minWidth: 100 }}>{text.slice(0, 10)}</div>,
      }
    ];
    if (hasPerm('usersys.as_trader')) {
      columns.push(
        {
          title: '项目进度',
          key: 'progress',
          render: (_, record) => <div style={{ minWidth: 150 }}><Progress percent={this.getProjectProgress(record)} size="small" strokeColor="#339bd2" /></div>,
        });
    }
    columns.push(
      {
        title: i18n('common.operation'),
        key: 'action',
        render: (_, record) => {
          return (
            <div className="orgbd-operation-icon-btn" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexWrap: "wrap", maxWidth: '250px' }}>
                <Link to={'/app/projects/edit/' + record.id}>
                  <Button disabled={!record.hasEditPerm && !hasPerm('proj.admin_manageproj')} type="link">
                    <EditOutlined />
                  </Button>
                </Link>
              </div>
              <div>
                <Button type="link" disabled={!record.hasEditPerm && !hasPerm('proj.admin_manageproj')} onClick={this.handleDeleteBtnClick.bind(this, record.id)}>
                  <DeleteOutlined />
                </Button>
              </div>
            </div>
          )
        },
      },
    );

    return (
      <LeftRightLayoutPure location={location}
      >

        <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
          <Breadcrumb.Item>
            <Link to="/app">首页</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>项目管理</Breadcrumb.Item>
          <Breadcrumb.Item>平台项目</Breadcrumb.Item>
        </Breadcrumb>

        {/* <ProjectListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} /> */}

        <Card style={{ marginBottom: 20 }} bodyStyle={{ height: 104, padding: 0, display: 'flex', alignItems: 'center' }}>
          <div style={statStyle}>
            <div style={statLabelStyle}>我的待办</div>
            <div style={statValueStyle}><span style={statValueNumStyle}>{this.state.unreadOrgBDNumber}</span>个任务</div>
          </div>
          <div style={{ height: 64, width: 1, backgroundColor: '#e6e6e6' }}></div>
          <div style={statStyle}>
            <div style={statLabelStyle}>进行中的项目总数</div>
            <div style={statValueStyle}><span style={statValueNumStyle}>{this.state.onGogoingProjects}</span>个</div>
          </div>
          <div style={{ height: 64, width: 1, backgroundColor: '#e6e6e6' }}></div>
          <div style={statStyle}>
            <div style={statLabelStyle}>当年完成项目数</div>
            <div style={statValueStyle}><span style={statValueNumStyle}>{this.state.solvedProjectsThisYear.length}</span>个</div>
          </div>
        </Card>

        <Card title={i18n('project.platform_projects')}>

          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', marginRight: 20, flex: 1 }}>
              <Search
                style={{ width: 200, marginRight: 20 }}
                placeholder="请输入项目名称"
                onSearch={this.handleSearch}
                onChange={search => this.setState({ search })}
                value={search}
                size="middle"
              />
              <NewProjectListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
            </div>
            {(hasPerm('proj.admin_manageproj') || hasPerm('usersys.as_trader')) &&
              <Button
                type="primary"
                disabled={!hasPerm('proj.admin_manageproj') && !this.currentUserHasIndGroup()}
                icon={<PlusOutlined />}
                onClick={() => this.props.history.push('/app/projects/add')}
              >
                添加新项目
              </Button>
            }
          </div>

          <Table
            columns={columns}
            dataSource={list}
            rowKey={record => record.id}
            loading={loading}
            pagination={false}
            onChange={this.handleTableChange}
          />

          <div style={{ margin: '16px 0' }} className="clearfix">
            <Pagination
              size="large"
              style={{ float: 'right' }}
              total={total}
              current={page}
              pageSize={pageSize}
              onChange={this.handlePageChange}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </Card>

        {/* <AuditProjectModal
          projId={this.state.id}
          visible={visible}
          currentStatus={currentStatus}
          status={status}
          sendEmail={sendEmail}
          confirmLoading={confirmLoading}
          onStatusChange={this.handleStatusChange}
          onSendEmailChange={this.handleSendEmailChange}
          onOk={this.handleConfirmAudit}
          onCancel={this.handleCancelAudit}
          sendWechat={sendWechat}
          onSendWechatChange={this.handleSendWechatChange}
          discloseFinance={discloseFinance}
          onDiscloseFinanceChange={this.handleDiscloseFinanceChange}
        /> */}
        

      </LeftRightLayoutPure>
    )
  }
}

function mapStateToProps(state) {
  const { country, projectProgress } = state.app;
  const userPageSize = state.currentUser ? state.currentUser.page : 10;
  return { country, userPageSize, projectProgress };
}


export default connect(mapStateToProps)(withRouter(ProjectList));
