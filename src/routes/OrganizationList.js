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
} from '@ant-design/icons';
import { OrganizationListFilter } from '../components/Filter'
import { PAGE_SIZE_OPTIONS } from '../constants';
import styles from './ProjectBDList.css';

const Option = Select.Option
const RadioGroup = Radio.Group;

const paginationStyle = { marginBottom: '24px', textAlign: 'right', marginTop: window.innerWidth < 1200 ? 10 : undefined };

class OrganizationList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : OrganizationListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: null;
    const searchOption = setting ? (setting.searchOption || 0) : 0

    const currentUser = getUserInfo();
    this.state = {
      filters,
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
      searchOption,
      currentOrg: null,
      affixed: false,
      footerAffixed: false,
    }
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
    return api.getOrg(params).then(result => {
      const { count: total, data: list } = result.data
      const newList = list.map(m => {
        const { createuser } = m;
        let hasOperationPermission = false;
        if (createuser && getCurrentUser() === createuser.id) {
          hasOperationPermission = true;
        }
        return { ...m, hasOperationPermission };
      });
      this.props.dispatch({
        type: 'app/getOrgRemarks',
        payload: {
          orgIDArr: list.map(m => m.id),
          forceUpdate: false
        }
      });
      this.setState(
        { total, list: newList, loading: false, currentOrg: list.length > 0 ? list[0].id : null },
        () => this.getOrgInvestors(newList.map(m => m.id)),
      );
      this.writeSetting();
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  getOrgInvestors = async orgArr => {
    const req = await requestAllData(api.getUser, { org: orgArr }, 100);
    let allInvestors = [];
    const newOrgListWithInvestors = this.state.list.map(m => {
      allInvestors = req.data.data;
      const investors = allInvestors.filter(f => f.org.id === m.id);
      return { ...m, investors };
    });
    this.setState(
      { list: newOrgListWithInvestors },
      () => this.getOrgInvestorRemarks(allInvestors.map(m => m.id)),
    );
  }

  getOrgInvestorRemarks = async investorArr => {
    const req = await requestAllData(api.getUserRemark, { user: investorArr }, 100);
    const newOrgListWithInvestorRemarks = this.state.list.map(m => {
      const newInvestorsWithRemarks = m.investors.map(investor => {
        const remarks = req.data.data.filter(f => f.user === investor.id);
        return { ...investor, remarks };
      });
      return { ...m, investors: newInvestorsWithRemarks };
    });
    this.setState({ list: newOrgListWithInvestorRemarks });
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
      // this.setState({ total, list, loading: false })
      this.setState(
        { total, list, loading: false, currentOrg: list.length > 0 ? 0 : null },
        () => this.getOrgInvestors(list.map(m => m.id)),
      );
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
    localStorage.setItem('OrganizationList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('OrganizationList')
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
    this.props.dispatch({ type: 'app/getSource', payload: 'tag' });
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
    if (this.state.affixed && !this.state.footerAffixed) return 'calc(100vh - 110px - 24px - 40px - 24px - 30px )';
    return undefined;
  }

  handleEditBtnClicked = () => {
    const { pageYOffset: scrollPosition } = window;
    const { currentOrg } = this.state;
    this.props.dispatch({ type: 'app/saveSource', payload: { sourceType: 'orgListParameters', data: { scrollPosition, currentOrg } } });
  }

  getCurrentOrgFromID = () => {
    return this.state.list.find(f => f.id === this.state.currentOrg);
  }

  getCurrentOrgRemarksFromRedux = () => {
    return this.props.orgRemarks.find(f => f.id === this.state.currentOrg);
  }

  getCurrentOrgRemarks = () => {
    const currentOrgObj = this.getCurrentOrgRemarksFromRedux();
    return currentOrgObj ? currentOrgObj.remarks.sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime)) : [];
  }

  getCurrentOrgInvestors = () => {
    const currentOrgObj = this.getCurrentOrgFromID(this.state.currentOrg);
    return currentOrgObj ? currentOrgObj.investors : [];
  }

  getTagNameByID = tagID => {
    const tag = this.props.tag.find(f => f.id === tagID);
    if (!tag) return tagID;
    return tag.name;
  }

  render() {
    const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      { title: '全称', key: 'orgname',  
        render: (text, record) => <Link to={'/app/organization/' + record.id}>
          <div style={{ color: "#428BCA" }} onMouseEnter={() => this.setState({ currentOrg: record.id })}>
            {record.orgfullname}
          </div>
        </Link>,
      //sorter:true, 
      },
      // { title: i18n('organization.industry'), key: 'industry', dataIndex: ['industry', 'industry'], sorter: this.state.searchOption === 0 ? true : false, },
      // 隐藏机构货币类型
      // { title: i18n('organization.currency'), key: 'currency', dataIndex: ['currency', 'currency'], sorter: this.state.searchOption === 0 ? true : false, },
      // { title: i18n('organization.decision_cycle'), key: 'decisionCycle', dataIndex: 'decisionCycle', sorter: this.state.searchOption === 0 ? true : false, },
      { title: i18n('organization.transaction_phase'), key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return <span className="span-phase">{phases.map(p => p.name).join(' / ')}</span>
      }, sorter: this.state.searchOption === 0 ? true : false, },
      // { title: i18n('organization.stock_code'), key: 'stockcode', dataIndex: 'stockcode', sorter: this.state.searchOption === 0 ? true : false, },
      { title: i18n('common.operation'), key: 'action', align: 'center', render: (text, record) => (
          <span className="span-operation orgbd-operation-icon-btn">

            <Link to={'/app/organization/edit/' + record.id}>
              <Button onClick={this.handleEditBtnClicked} type="link" disabled={!hasPerm('org.admin_manageorg') && !record.hasOperationPermission}><EditOutlined /></Button>
            </Link>

            <Popconfirm title={i18n('delete_confirm')} disabled={!hasPerm('org.admin_manageorg') && !record.hasOperationPermission} onConfirm={this.deleteOrg.bind(null, record.id)}>
              <Button type="link" disabled={!hasPerm('org.admin_manageorg') && !record.hasOperationPermission} >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ]

    const selectBefore = (
      <Select
        defaultValue="0"
        style={{ width: 200 }}
        value={this.state.searchOption.toString()}
        onChange={e => this.setState({ searchOption: parseInt(e, 10)})} 
      >
        <Option value="0">搜索机构名称/股票代码</Option>
        <Option value="1">搜索备注以及附件内文字</Option>
      </Select>
    );

    const { filters, search, total, list, loading, page, pageSize } = this.state
    const action = hasPerm('usersys.as_trader') ?
                    { name: i18n('organization.new_org'), link: "/app/organization/add" } : null

    return (
      <LeftRightLayout location={this.props.location} title={i18n('menu.organization_management')} action={action}>

        <div>

          <div style={{ overflow: 'auto' }}>
            <div style={{ float: 'left', marginBottom: '24px', width: '700px' }}>
              <Input.Search
                style={{ width: 450, marginLeft: 10 }}
                placeholder="搜索内容"
                size="large"
                addonBefore={selectBefore}
                value={search}
                onChange={e => this.setState({ search: e.target.value })}
                onSearch={this.handleOrgSearch}
              />
            </div>
            
            {this.state.searchOption === 0 &&
              <div style={{ float: 'right' }}>
                {i18n('common.sort_by_created_time')}
                <Select size="large" style={{ marginLeft: 8 }} defaultValue="desc" onChange={this.handleSortChange}>
                  <Option value="asc">{i18n('common.asc_order')}</Option>
                  <Option value="desc">{i18n('common.dec_order')}</Option>
                </Select>
              </div>
            }
          </div>

          <Row>
            <Col span={10}>
              <Table
                rowClassName={record => {
                  return record.id === this.state.currentOrg ? styles['current-row'] : '';
                }}
                onChange={this.handleTableChange}
                columns={columns}
                dataSource={list}
                rowKey={record => record.id}
                loading={loading}
                pagination={false}
                rowSelection={{ onChange: this.handleRowSelectionChange, selectedRowKeys: this.state.selectedIds }}
                // footer={() => (
                //   <Affix offsetBottom={0} onChange={affixed => this.setState({ footerAffixed: affixed })} />
                // )}
              />
            </Col>

            <Col span={6} style={{ minHeight: 500 }}>
              <div style={{ width: '100%', height: '100%', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'absolute', borderBottom: '1px solid #f0f0f0', justifyContent: 'space-between' }}>
                <Affix offsetTop={50} onChange={affixed => this.setState({ affixed })}>
                  <div>
                    <div style={{ padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ lineHeight: '27px', fontWeight: 500 }}>备注</div>
                    </div>
                    <div style={{ padding: 16, overflowY: 'auto', height: this.calculateContentHeight() }} >
                      <List
                        className="comment-list"
                        itemLayout="horizontal"
                        dataSource={this.getCurrentOrgRemarks()}
                        renderItem={item => (
                          <li>
                            <Comment
                              // actions={item.actions}
                              author={item.createuserobj && item.createuserobj.username}
                              avatar={item.createuserobj && <Link to={`/app/user/${item.createuser}`}><Avatar src={item.createuserobj.photourl} /></Link>}
                              content={<p dangerouslySetInnerHTML={{ __html: item.remark }} />}
                              datetime={time(item.createdtime)}
                            />
                          </li>
                        )}
                      />
                    </div>
                  </div>
                </Affix>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ width: '100%', height: '100%', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'absolute', borderBottom: '1px solid #f0f0f0' }}>
                <Affix offsetTop={50}>
                  <div>
                    <div style={{ padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ lineHeight: '27px', fontWeight: 500 }}>投资人</div>
                    </div>
                    <div style={{ padding: 16, overflowY: 'auto', borderLeft: '1px solid #f0f0f0', height: this.calculateContentHeight() }}>
                      <List
                        itemLayout="horizontal"
                        dataSource={this.getCurrentOrgInvestors()}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar src={item.photourl} />}
                              title={
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 8px', color: 'rgba(0, 0, 0, .45)', lineHeight: 2, fontWeight: 'normal' }}>
                                  <div><Link to={`/app/user/${item.id}`}>{item.username}</Link></div>
                                  <div>{item.mobile}</div>
                                  <div>{item.tags && item.tags.map(m => <Tag key={m} style={{ color: 'rgba(0, 0, 0, .45)' }}>{this.getTagNameByID(m)}</Tag>)}</div>
                                </div>
                              }
                              description={item.remarks && item.remarks.map(remark => (
                                <Comment
                                  key={remark.id}
                                  author={remark.createuser && remark.createuser.username}
                                  avatar={remark.createuser && <Link to={`/app/user/${remark.createuser.id}`}><Avatar size="small" src={remark.createuser.photourl} /></Link>}
                                  content={remark.remark}
                                  datetime={time(remark.createdtime)}
                                />
                              ))}
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                </Affix>
              </div>
            </Col>

          </Row>
         
          <Affix offsetBottom={0} onChange={affixed => this.setState({ footerAffixed: affixed })}>
            <div />
          </Affix>

          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, marginBottom: 24 }}>
              <Button
                disabled={this.state.selectedIds.length == 0}
                style={{ backgroundColor: 'orange', border: 'none' }}
                type="primary"
                size="large"
                loading={this.state.isLoadingExportData}
                onClick={this.handleExportBtnClicked}>
                {i18n('project_library.export_excel')}
              </Button>
              <img style={{ marginLeft: 10, width: 10 }} src="/images/certificate.svg" />表示Top机构，
              <UserOutlined />表示该机构下有联系方式的投资人数量
            </div>

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

      </LeftRightLayout>
    )

  }

}

function mapStateToProps(state) {
  const { orgListParameters: { scrollPosition, currentOrg }, tag, orgRemarks } = state.app;
  return { scrollPosition, currentOrg, tag, orgRemarks };
}

export default connect(mapStateToProps)(OrganizationList);
