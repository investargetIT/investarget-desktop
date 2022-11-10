import React, { useEffect, useState } from 'react'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router';
import { 
  i18n, 
  hasPerm, 
  formatMoney, 
  isShowCNY,
  getUserInfo,
  findAllParentArea,
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

function GovernmentProjectList(props) {

  const setting = readSetting();
  const defaultFilters = setting ? setting.filters : NewProjectListFilter.defaultValue;
  const defaultSearch = setting ? setting.search : null;
  const defaultPage = setting && setting.page ? setting.page : 1;

  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState(defaultSearch);
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(props.userPageSize || 10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState(undefined);
  const [desc, setDesc] = useState(undefined);

  useEffect(() => {
    getGovernmentProject();
  }, [filters, page, pageSize, sort, desc]);

  function handleFilt(filters) {
    setFilters(filters);
    setPage(1);
  }

  function handleReset(filters) {
    setFilters(filters);
    setPage(1);
    setSearch(null);
  }

  function handleSearch(search) {
    setSearch(search);
    setPage(1);
    getGovernmentProject();
  }

  function handlePageChange(page, pageSize) {
    setPage(page);
    setPageSize(pageSize);
  }

  function getGovernmentProject() {
    const params = { name: search, page, page_size: pageSize, sort, desc };
    setLoading(true);
    let newList = [];
    api.getGovernmentProject(params)
      .then(result => {
        const { count: total, data: list } = result.data;
        newList = list.slice();
        setTotal(total);
        setList(newList);
        setLoading(false);
        return props.dispatch({ type: 'app/getSource', payload: 'projstatus' });
      })
      .then(allProjstatus => {
        newList = newList.map(m => {
          const projstatus = allProjstatus.find(f => f.id === m.projstatus);
          return { ...m, projstatus };
        });
        setList(newList);
        return props.dispatch({ type: 'app/getSource', payload: 'country' });
      })
      .then(allCountries => {
        newList = newList.map(project => {
          let location = [];
          if (project.location) {
            location = allCountries.find(f => f.id == project.location);
            location = findAllParentArea(location, allCountries);
          }
          project = { ...project, location: location.map(m => m.country).join('-') };
          return project;
        })
        setList(newList);
      })
      .catch(error => {
        setLoading(false);
        props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    writeSetting()
  }

  function handleDelete(id) {
    setLoading(true);
    api.deleteGovernmentProject(id).then(() => {
      getGovernmentProject();
    }, error => {
      setLoading(false);
      props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  function writeSetting() {
    const data = { filters, search, page, pageSize };
    localStorage.setItem('Project;List2', JSON.stringify(data))
  }

  function readSetting() {
    var data = localStorage.getItem('ProjectList2')
    return data ? JSON.parse(data) : null
  }

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'country' });
    props.dispatch({ type: 'app/getSource', payload: 'tag' });
  }, []);

  function handleDeleteBtnClick(projId) {
    Modal.confirm({
      title: '删除项目',
      content: '确认删除该项目吗？',
      onOk() {
        handleDelete(projId);
      },
    });
  }

  function handleTableChange(pagination, filters, sorter) {
    setSort(sorter.column ? sorter.column.key : undefined);
    setDesc(sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined);
  }

  function currentUserHasIndGroup() {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    if (!userInfo.indGroup) return false;
    if (!userInfo.indGroup.id) return false;
    return true;
  }

  function getTagNameByID(tagID) {
    const tag = props.tag.find(f => f.id === tagID);
    if (!tag) return null;
    return tag.name;
  }

  const { location } = props;
  const columns = [
    {
      title: i18n('project.name'),
      key: 'title',
      render: (_, record) => {
        return (
          <Tooltip title="项目详情">
            <span className="span-title">
              <Link to={`/app/government-projects/${record.id}`}>{record.realname}</Link>
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: '地区',
      key: 'location',
      dataIndex: 'location',
    },
    {
      title: '标签',
      key: 'tags',
      render: (_, record) => {
        return (
          <div>
            {record.tags && record.tags.map(m => getTagNameByID(m))
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
                <Button type="link">
                  <EditOutlined />
                </Button>
              </Link>
            </div>
            <div>
              <Button type="link" onClick={() => handleDeleteBtnClick(record.id)}>
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
            <Search
              style={{ width: 200, marginRight: 20 }}
              placeholder="请输入项目名称"
              onSearch={handleSearch}
              onChange={search => setSearch(search)}
              value={search}
              size="middle"
            />
            {/* <NewProjectListFilter defaultValue={filters} onSearch={handleFilt} onReset={handleReset} /> */}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => props.history.push('/app/government-projects/add')}
          >
            添加新项目
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={list}
          rowKey={record => record.id}
          loading={loading}
          pagination={false}
          onChange={handleTableChange}
        />

        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
            size="large"
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </Card>

    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { country, projectProgress, projectIDToDataroom, tag } = state.app;
  const userPageSize = state.currentUser ? state.currentUser.page : 10;
  return { country, userPageSize, projectProgress, projectIDToDataroom, tag };
}


export default connect(mapStateToProps)(withRouter(GovernmentProjectList));
