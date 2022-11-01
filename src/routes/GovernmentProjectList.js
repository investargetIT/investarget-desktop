import React from 'react'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router';
import { 
  i18n, 
  hasPerm, 
  formatMoney, 
  isShowCNY,
  getUserInfo,
} from '../utils/util';

import { Input, Icon, Table, Button, Pagination, Popconfirm, Modal, Card, Breadcrumb, Progress, Tooltip, Popover, Tag } from 'antd'
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { NewProjectListFilter } from '../components/Filter';
import { Search } from '../components/Search';
import { PAGE_SIZE_OPTIONS } from '../constants';
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons';
import _ from 'lodash';

class GovernmentProjectList extends React.Component {
  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : NewProjectListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting && setting.page ? setting.page : 1
    const pageSize = setting && setting.pageSize ? setting.pageSize: props.userPageSize;

    this.state = {
      filters,
      search,
      page,
      pageSize: props.userPageSize || 10,
      total: 0,
      list: [],
      loading: false,

      id: null,
      status: null,

      sort: undefined,
      desc: undefined,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getGovernmentProject)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1, search: null }, this.getGovernmentProject)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getGovernmentProject)
  }

  handlePageChange = (page, pageSize) => {
    this.setState({ page, pageSize }, this.getGovernmentProject)
  }

  getGovernmentProject = () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { search, skip_count: (page - 1) * pageSize, max_size: pageSize, sort, desc }
    this.setState({ loading: true })
    let newList = [];
    api.getGovernmentProject(params)
      .then(result => {
        const { count: total, data: list } = result.data;
        newList = list.slice();
        this.setState({ total, list: newList, loading: false });
        return this.props.dispatch({ type: 'app/getSource', payload: 'projstatus' });
      })
      .then(allProjstatus => {
        newList = newList.map(m => {
          const projstatus = allProjstatus.find(f => f.id === m.projstatus);
          return { ...m, projstatus };
        });

        this.setState({ list: newList });
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

  handleDelete = (id) => {
    this.setState({ loading: true })
    api.deleteGovernmentProject(id).then(() => {
      this.getGovernmentProject();
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize };
    localStorage.setItem('ProjectList2', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('ProjectList2')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'country' });
    this.props.dispatch({ type: 'app/getSource', payload: 'tag' });
    this.getGovernmentProject();
  }

  handleDeleteBtnClick(projId) {
    const react = this;
    Modal.confirm({
      title: '删除项目',
      content: '确认删除该项目吗？',
      onOk() {
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
      this.getGovernmentProject,
    );
  }

  currentUserHasIndGroup = () => {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    if (!userInfo.indGroup) return false;
    if (!userInfo.indGroup.id) return false;
    return true;
  }

  getTagNameByID = tagID => {
    const tag = this.props.tag.find(f => f.id === tagID);
    if (!tag) return null;
    return tag.name;
  }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, filters, search } = this.state
    const columns = [
      {
        title: i18n('project.name'),
        key: 'title',
        render: (_, record) => {
          return (
            <Tooltip title="项目详情">
              <span className="span-title">
                <Link to={`/app/projects/${record.id}`}>{record.realname}</Link>
              </span>
            </Tooltip>
          );
        }
      },
      {
        title: '标签',
        key: 'tags',
        render: (_, record) => {
          return (
            <div>
              {record.tags && record.tags.map(m => this.getTagNameByID(m))
                .filter(f => f != null)
                .map((m, i) => <Tag key={i} style={{ color: 'rgba(0, 0, 0, .45)', marginBottom: 4 }}>{m}</Tag>)}
            </div>
          );
        }
      },
      {
        title: '发布时间',
        key: 'createdtime',
        dataIndex: 'createdtime',
        // sorter: true,
        render: text => text && <div style={{ minWidth: 100 }}>{text.slice(0, 10)}</div>,
      }
    ];
    columns.push(
      {
        title: i18n('common.operation'),
        key: 'action',
        render: (_, record) => {
          return (
            <div className="orgbd-operation-icon-btn" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexWrap: "wrap", maxWidth: '250px' }}>
                <Link to={'/app/government-projects/edit/' + record.id}>
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
          <Breadcrumb.Item>政府项目</Breadcrumb.Item>
        </Breadcrumb>

        <Card title="政府项目列表">

          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', marginRight: 20, flex: 1 }}>
              {/* <Search
                style={{ width: 200, marginRight: 20 }}
                placeholder="请输入项目名称"
                onSearch={this.handleSearch}
                onChange={search => this.setState({ search })}
                value={search}
                size="middle"
              /> */}
            </div>
            {(hasPerm('proj.admin_manageproj') || hasPerm('usersys.as_trader')) &&
              <Button
                type="primary"
                // disabled={!hasPerm('proj.admin_manageproj') && !this.currentUserHasIndGroup()}
                icon={<PlusOutlined />}
                onClick={() => this.props.history.push('/app/government-projects/add')}
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

      </LeftRightLayoutPure>
    )
  }
}

function mapStateToProps(state) {
  const { country, projectProgress, projectIDToDataroom, tag } = state.app;
  const userPageSize = state.currentUser ? state.currentUser.page : 10;
  return { country, userPageSize, projectProgress, projectIDToDataroom, tag };
}


export default connect(mapStateToProps)(withRouter(GovernmentProjectList));
