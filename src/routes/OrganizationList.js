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
import { Button, Popconfirm, Modal, Table, Pagination, Select, Radio, Input, Row, Col, Tooltip, Avatar, List, Comment } from 'antd'
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

// function OrgRemarks(props) {
//   const { BDComments, onAdd, onEdit, onDelete } = props;

//   const [bdComments, setBdComments] = useState([]);
//   const [comment, setComment] = useState(null);

//   const updateComments = (BDComments) => {
//     if (BDComments) {
//       Promise.all(BDComments.map((comment) => {
//         if (!comment.url && comment.key && comment.bucket) {
//           return api.downloadUrl(comment.bucket, comment.key)
//             .then((res) => ({ ...comment, url: res.data }))
//             .catch(() => comment);
//         } else {
//           return Promise.resolve(comment);
//         }
//       })).then((bdComments) => {
//         setBdComments(bdComments);
//       });
//     } else {
//       setBdComments([]);
//     }
//   };

//   useEffect(() => {
//     updateComments(BDComments);
//   }, [BDComments]);

//   return (
//     <div>
//       <div style={{ display: comment ? 'none' : '' }}>
//         {bdComments && bdComments.length ? bdComments.map(comment => (
//           <BDCommnet
//             key={comment.id}
//             comment={comment}
//             onEdit={() => onEdit(comment)}
//             onDelete={() => onDelete(comment.id)}
//           />
//         )) : <p>暂无备注</p>}
//       </div>
//     </div>
//   );
// }

// function BDCommnet({ comment, onEdit, onDelete }) {
//   // const [translateSuccess, setTranslateSuccess] = useState(false);
//   // useEffect(() => {
//   //   if (comment.transid) {
//   //     api.getAudioTranslate(comment.transid).then((res) => {
//   //       if (res.data && res.data.taskStatus === "9") {
//   //         setTranslateSuccess(true);
//   //       }
//   //     });
//   //   }
//   // }, []);

//   return (
//     <div key={comment.id} style={{ marginBottom: 8 }}>
//       <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ marginRight: 8 }}>{time(comment.createdtime)}</span>

//         {/* {hasPerm('BD.manageProjectBD') || getUserInfo().id === comment.createuser ?
//           <Button type="link" onClick={onEdit}><EditOutlined /></Button>
//           : null} */}

//         &nbsp;
//         {hasPerm('BD.manageProjectBD') || getUserInfo().id === comment.createuser ?
//           <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete}>
//             <Button type="link"><DeleteOutlined /></Button>
//           </Popconfirm>
//           : null}
//       </p>
//       <div style={{ display: 'flex' }}>
//         {comment.createuserobj &&
//           <div style={{ marginRight: 10 }}>
//             <Tooltip title={comment.createuserobj.username}>
//               <a target="_blank" href={`/app/user/${comment.createuserobj.id}`}>
//                 <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuserobj.photourl} />
//               </a>
//             </Tooltip>
//           </div>
//         }
//         <div style={{ flex: 1, overflow: 'hidden' }}>
//           <p dangerouslySetInnerHTML={{ __html: comment.remark.replace(/\n/g, '<br>') }}></p>
//           {/* {comment.url && (
//             <div>
//               <FileLink
//                 filekey={comment.key}
//                 url={comment.url}
//                 filename={comment.filename || comment.key}
//               />
//               {comment.filetype && <Tag>{comment.filetype}</Tag>}
//             </div>
//           )} */}
//           {/* {comment.transid && translateSuccess && (
//             <div style={{ marginTop: 4 }}>
//               <Link
//                 style={{ color: 'red' }}
//                 to={`/app/speech-to-text/${comment.transid}?speechKey=${comment.key}`}
//               >
//                 语音转文字
//               </Link>
//             </div>
//           )} */}
//         </div>
//       </div>
//     </div>
//   );
// }

class OrganizationList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : OrganizationListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10
    const searchOption = setting ? (setting.searchOption || 0) : 0

    const currentUser = getUserInfo();
    this.state = {
      filters,
      search,
      page,
      pageSize: (currentUser && currentUser.page) || 10,
      total: 0,
      list: [],
      loading: false,
      sort:undefined,
      desc:undefined,
      selectedIds: [],
      downloadUrl: null,
      searchOption,
      currentOrg: null,
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
      this.getOrg();
    } else if (this.state.searchOption === 1) {
      this.searchOrg();
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
    api.getOrg(params).then(result => {
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
        { total, list: newList, loading: false, currentOrg: list.length > 0 ? list[0] : null },
        () => this.getOrgRemarks(newList.map(m => m.id)),
      );
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }

  getOrgRemarks = async orgArr => {
    const req = await requestAllData(api.getOrgRemark, { org: orgArr }, 100);
    const newOrgListWithRemarks = this.state.list.map(m => {
      const remarks = req.data.data.filter(f => f.org === m.id);
      return { ...m, remarks };
    });
    this.setState({ list: newOrgListWithRemarks, currentOrg: newOrgListWithRemarks.length > 0 ? newOrgListWithRemarks[0] : null }, () => this.getOrgInvestors(orgArr));
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
      { list: newOrgListWithInvestors, currentOrg: newOrgListWithInvestors.length > 0 ? newOrgListWithInvestors[0] : null },
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
    this.setState({ list: newOrgListWithInvestorRemarks, currentOrg: newOrgListWithInvestorRemarks.length > 0 ? newOrgListWithInvestorRemarks[0] : null });
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
    api.searchOrg(params).then(result => {
      const { count: total, data: list } = result.data
      // this.setState({ total, list, loading: false })
      this.setState(
        { total, list, loading: false, currentOrg: list.length > 0 ? list[0] : null },
        () => this.getOrgRemarks(list.map(m => m.id)),
      );
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
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
    this.handleFilterOrg();
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

  // handleDeleteComment = (id) => {
  //   const { currentOrg } = this.state;
  //   api.deleteOrgRemark(id)
  //     .then(() => {
  //       const newList = this.state.list.map(m => {
  //         if (m.id === currentOrg.id) {
  //           const remarks = m.remarks.filter(f => f.id !== id);
  //           return { ...m, remarks };
  //         }
  //         return m;
  //       });
  //       const newCurrentOrg = { ...currentOrg, remarks: currentOrg.remarks.filter(f => f.id !== id) };
  //       this.setState({ list: newList, currentOrg: newCurrentOrg });
  //     })
  //     .catch(handleError);
  // }

  render() {
    const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      { title: '全称', key: 'orgname',  
        render: (text, record) => <Link to={'/app/organization/' + record.id}>
          <div style={{ color: "#428BCA" }} onMouseEnter={() => this.setState({ currentOrg: record })}>
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
              <Button type="link" disabled={!hasPerm('org.admin_manageorg') && !record.hasOperationPermission}><EditOutlined /></Button>
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

          {/* <OrganizationListFilter
            hideTag={this.state.searchOption === 1}
            defaultValue={filters}
            onSearch={this.handleFilt}
            onReset={this.handleReset}
          /> */}

          <div style={{ overflow: 'auto' }}>

            {/* <div style={{ float: 'left', marginBottom: '24px', width: '200px' }}>
              <Search
                style={{ width: 250 }}
                placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')}
                onSearch={() => this.setState({ page: 1 }, this.getOrg)}
                onChange={search => this.setState({ search })}
                value={search}
              />
            </div> */}

            <div style={{ float: 'left', marginBottom: '24px', width: '700px' }}>
              {/* <RadioGroup onChange={e => this.setState({ searchOption: e.target.value })} defaultValue={0} value={this.state.searchOption}>
                <Radio value={0}>搜索机构名称/股票代码</Radio>
                <Radio value={1}>搜索备注以及附件内文字</Radio>
              </RadioGroup>
              <Search
                style={{ width: 250, marginLeft: 10 }}
                placeholder="搜索内容"
                onChange={search => this.setState({ search })}
                value={search}
                onSearch={this.handleOrgSearch}
              /> */}
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

          <Row style={{ marginBottom: 24 }}>
            <Col span={10}>
              <Table
                // onRow={record => {
                //   return {
                //     onMouseEnter: () => {
                //       this.setState({ currentOrg: record });
                //     },
                //   };
                // }}
                rowClassName={record => {
                  return this.state.currentOrg && record.id === this.state.currentOrg.id ? styles['current-row'] : '';
                }}
                onChange={this.handleTableChange}
                columns={columns}
                dataSource={list}
                rowKey={record => record.id}
                loading={loading}
                pagination={false}
                rowSelection={{ onChange: this.handleRowSelectionChange, selectedRowKeys: this.state.selectedIds }}
              /></Col>
            <Col span={6}>
              <div style={{ width: '100%', height: '100%', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'absolute', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ lineHeight: '27px', fontWeight: 500 }}>备注</div>
                </div>
                <div style={{ padding: 16, overflowY: 'auto' }}>
                  {/* <OrgRemarks
                    BDComments={this.state.currentOrg && this.state.currentOrg.remarks}
                    // onEdit={this.handleEditCommentIconClick}
                    onDelete={this.handleDeleteComment}
                  /> */}

                  <List
                    className="comment-list"
                    itemLayout="horizontal"
                    dataSource={this.state.currentOrg ? this.state.currentOrg.remarks: []}
                    renderItem={item => (
                      <li>
                        <Comment
                          // actions={item.actions}
                          author={item.createuserobj && item.createuserobj.username}
                          avatar={item.createuserobj && <Link to={`/app/user/${item.createuser}`}><Avatar src={item.createuserobj.photourl} /></Link>}
                          content={item.remark}
                          datetime={time(item.createdtime)}
                        />
                      </li>
                    )}
                  />

                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ width: '100%', height: '100%', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'absolute', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ lineHeight: '27px', fontWeight: 500 }}>投资人</div>
                </div>
                <div style={{ padding: 16, overflowY: 'auto', minHeight: 'calc(100% - 60px)', borderLeft: '1px solid #f0f0f0' }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={this.state.currentOrg ? this.state.currentOrg.investors : []}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={item.photourl} />}
                          title={<Link to={`/app/user/${item.id}`}>{item.username}&nbsp;{item.mobile}</Link>}
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
            </Col>
          </Row>
         

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
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

export default connect()(OrganizationList)
