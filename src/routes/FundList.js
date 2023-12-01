import React, { useState, useEffect } from 'react'
import { Link } from 'dva/router'
import { 
  i18n, 
  hasPerm,
  getUserInfo,
  getCurrentUser,
  requestAllData,
  time,
  handleError,
} from '../utils/util';
import * as api from '../api'
import { connect } from 'dva'
import { Button, Popconfirm, Modal, Table, Pagination, Select, Radio, Input, Row, Col, Tooltip, Avatar, List, Comment, Affix, Tag } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import {
  UserOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { OrganizationListFilterNew, ç } from '../components/Filter'
import { PAGE_SIZE_OPTIONS } from '../constants';
import styles from './ProjectBDList.css';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';

const Option = Select.Option
const RadioGroup = Radio.Group;

const paginationStyle = { marginBottom: '24px', textAlign: 'right', marginTop: window.innerWidth < 1200 ? 10 : undefined };

class FundList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = OrganizationListFilterNew.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: null;
    const searchOption = setting ? (setting.searchOption || 0) : 0

    const currentUser = getUserInfo();
    this.state = {
      filters: {...filters, orgtypes: [1]},
      search,
      page,
      pageSize: pageSize || (currentUser && currentUser.page) || 10,
      total: 0,
      list: [],
      loading: false,
      sort:undefined,
      desc:undefined,
      selectedIds: [],
      downloadUrl: null,
      searchOption: 0,
      currentOrg: null,
      affixed: false,
      footerAffixed: false,
    }
    this.footerContainerRef = React.createRef();
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.handleOrgSearch);
  }

  handleReset = (filters) => {
    this.setState({ searchOption: 0, filters, page: 1, search: null }, this.getOrg);
  }

  // handleSearch = (search) => {
  //   this.setState({ search, page: 1 }, this.getOrg)
  // }

  handleOrgSearch = () => {
    if (this.state.searchOption === 0) {
      this.setState({ page: 1 }, this.getOrg);
    } else if (this.state.searchOption === 1) {
      this.setState({ page: 1 }, this.searchOrg);
    }
  }

  handleFilterOrg = () => {
    if (this.state.searchOption === 0) {
      return this.getOrg();
    } else if (this.state.searchOption === 1) {
      return this.searchOrg();
    }
  }

  handlePageChange = (page, pageSize) => {
    this.setState({ page, pageSize }, this.handleFilterOrg)
  }

  // handlePageSizeChange = (current, pageSize) => {
  //   this.setState({ pageSize, page: 1 }, this.handleFilterOrg)
  // }

  getOrg = () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    // const orgstatus = [];
    // if (!hasPerm('org.admin_manageorg')) {
    //   orgstatus.push(2); // 审核通过 
    // }
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort, desc, issub: false }
    this.setState({ loading: true })
    console.log(params)
    return api.getOrg(params)
      .then(result => {
        const { count: total, data: list } = result.data
        const newList = list.map(m => {
          const { createuser } = m;
          let hasOperationPermission = false;
          if (createuser && getCurrentUser() === createuser.id) {
            hasOperationPermission = true;
          }
          return { ...m, hasOperationPermission };
        });
        this.setState(
          { total, list: newList, loading: false, currentOrg: list.length > 0 ? list[0].id : null },
        );
        this.writeSetting();
      })
      .catch(error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      });
  }

  searchOrg = () => {
    if (!this.state.search) {
      Modal.error({
        title: '无效操作',
        content: '搜索备注及附件内文字时，内容不能为空',
      });
      return;
    };
    const { filters, search: text, page, pageSize, sort, desc } = this.state;
    const params = { ...filters, text, page_index: page, page_size: pageSize, sort, desc, issub: false };
    this.setState({ loading: true })
    return api.searchOrg(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState(
        { total, list, loading: false, currentOrg: list.length > 0 ? list[0].id : null },
      );
      if (list.length > 0) {
        this.props.dispatch({
          type: 'app/getOrgRemarks',
          payload: {
            orgIDArr: [list[0].id],
            forceUpdate: false
          }
        });
        this.props.dispatch({
          type: 'app/getOrgInvestorsAndRemarks',
          payload: {
            orgIDArr: [list[0].id],
            forceUpdate: false
          }
        });
      }
      this.writeSetting();
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  // 按创建时间排序
  handleSortChange = value => {
    const desc = value === 'desc' ? 1 : 0;
    this.setState({ desc, sort: undefined }, this.handleOrgSearch);
  }

  deleteOrg = (id) => {
    this.setState({ loading: true })
    api.deleteOrg(id).then(result => {
      this.handleFilterOrg();
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  writeSetting = () => {
    const { filters, search, page, pageSize, searchOption } = this.state;
    const data = { filters, search, page, pageSize, searchOption };
    localStorage.setItem('FundList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('FundList')
    return data ? JSON.parse(data) : null
  }
  
  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.handleFilterOrg
    );
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['tag', 'orgtype'] });
    this.handleFilterOrg()
      .then(() => {
        const { scrollPosition, currentOrg } = this.props;
        window.scrollTo(0, scrollPosition );
        if (currentOrg) {
          this.setState({ currentOrg });
        }
        // Reset position
        this.props.dispatch({ type: 'app/saveSource', payload: { sourceType: 'orgListParameters', data: { scrollPosition: 0, currentOrg: null } } });
      });
  }

  handleExportBtnClicked = () => {
    api.addOrgExport({ org: this.state.selectedIds.join(',') })
      .then(() => Modal.success({
          title: '请求已成功发送',
          content: '请稍后在导出任务中进行下载',
        })
      )
      .catch(error => this.props.dispatch({
        type: 'app/findError',
        payload: error
      }));
  }

  handleRowSelectionChange = selectedIds => {
    if (selectedIds.length > 300) {
      Modal.error({
        title: '无效操作',
        content: '最多导出300家机构',
      })
      return;
    }
    this.setState({ selectedIds })
  }

  calculateContentHeight = () => {
    if (!this.state.affixed && !this.state.footerAffixed) return 500 - 60;
    if (!this.state.affixed && this.state.footerAffixed) return 'unset';
    if (this.state.affixed && this.state.footerAffixed) return 'calc(100vh - 110px)';
    if (this.state.affixed && !this.state.footerAffixed) {
      let footerHeight = this.footerContainerRef.current.clientHeight;
      footerHeight += 24;
      footerHeight += 30;
      return `calc(100vh - 110px - ${footerHeight}px)`;
    }
    return undefined;
  }

  handleEditBtnClicked = () => {
    const { pageYOffset: scrollPosition } = window;
    const { currentOrg } = this.state;
    this.props.dispatch({ type: 'app/saveSource', payload: { sourceType: 'orgListParameters', data: { scrollPosition, currentOrg } } });
  }

  getCurrentOrgRemarksFromRedux = () => {
    return this.props.orgRemarks.find(f => f.id === this.state.currentOrg);
  }

  getCurrentOrgRemarks = () => {
    const currentOrgObj = this.getCurrentOrgRemarksFromRedux();
    return currentOrgObj ? currentOrgObj.remarks.sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime)) : [];
  }

  getCurrentOrgInvestors = () => {
    const currentOrgObj = this.props.orgInvestorsAndRemarks.find(f => f.id === this.state.currentOrg);
    return currentOrgObj ? currentOrgObj.investors : [];
  }

  getTagNameByID = tagID => {
    const tag = this.props.tag.find(f => f.id === tagID);
    if (!tag) return tagID;
    return tag.name;
  }

  handleMouseEnterOrgName = record => {
    this.setState({ currentOrg: record.id });
    this.props.dispatch({
      type: 'app/getOrgRemarks',
      payload: {
        orgIDArr: [record.id],
        forceUpdate: false
      }
    });
    this.props.dispatch({
      type: 'app/getOrgInvestorsAndRemarks',
      payload: {
        orgIDArr: [record.id],
        forceUpdate: false
      }
    });
  }

  getCurrentOrgName = () => {
    const org = this.state.list.find(f => f.id === this.state.currentOrg);
    if (org) {
      return org.orgfullname;
    }
  }

  getCurrentOrgId = () => {
    const org = this.state.list.find(f => f.id === this.state.currentOrg);
    if (org) {
      return org.id;
    }
  }

  getOrgType = id => {
    if (!id || !this.props.orgtype) return null;
    const orgType = this.props.orgtype.find(f => f.id === id);
    return orgType.name;
  }

  render() {
    const columns = [
      { title: '#', key: 'no', render: (_, record, index) => index + 1 },
      { title: '基金名称', key: 'orgname',  
        render: (_, record) => <Link to={'/app/organization/' + record.id}>
          <div style={{ color: "#428BCA" }}>
            {record.orgfullname}
          </div>
        </Link>,
      },
      { title: "入库人", key: 'createuser', dataIndex: 'createuser', render: () => this.props.currentUser && this.props.currentUser.username },
      { title: "最新进展", key: 'latest', render: () => <span style={{ color: 'lightgrey' }}>暂无数据</span> },
      { title: '入库时间', key: 'date', width: 120, render: () => '2022-08-21' },
      { title: '基金概况', key: 'summary' },
    ];

    const { filters, search, total, list, loading, page, pageSize } = this.state
    const action = hasPerm('usersys.as_trader') ?
                    { name: i18n('organization.new_org'), link: "/app/organization/add" } : null

    return (
      <LeftRightLayoutPure location={this.props.location} title={i18n('menu.organization_management')} action={action}>

        <div style={{ backgroundColor: 'white', padding: 16 }}>

          <div style={{ display: 'flex', marginBottom: 16, justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              {/* <OrganizationListFilterNew onSearch={this.handleFilt} /> */}
              <Input.Search
                style={{ width: 250 }}
                placeholder="按基金名称查询"
                value={search}
                onChange={e => this.setState({ search: e.target.value })}
                onSearch={this.handleOrgSearch}
                allowClear
              />
            </div>
            {/* <Link to="/app/organization/add"><Button type="primary">新建</Button></Link> */}
          </div>

          <Table
            // bordered
            style={{ border: '1px solid #f0f0f0', borderBottomWidth: 0 }}
            onChange={this.handleTableChange}
            columns={columns}
            dataSource={list}
            rowKey={record => record.id}
            loading={loading}
            pagination={false}
          />

          <div ref={this.footerContainerRef} style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Pagination
              style={paginationStyle}
              total={total}
              current={page}
              pageSize={pageSize}
              onChange={this.handlePageChange}
              showSizeChanger
              // onShowSizeChange={this.handlePageSizeChange}
              showQuickJumper
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>

        </div>

        <iframe style={{ display: 'none' }} src={this.state.downloadUrl}></iframe>

      </LeftRightLayoutPure>
    )

  }

}

function mapStateToProps(state) {
  const { currentUser } = state;
  const { orgListParameters: { scrollPosition, currentOrg }, tag, orgRemarks, orgInvestorsAndRemarks, orgtype } = state.app;
  return { scrollPosition, currentOrg, tag, orgRemarks, orgInvestorsAndRemarks, currentUser, orgtype };
}

export default connect(mapStateToProps)(FundList);
