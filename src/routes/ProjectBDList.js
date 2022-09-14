import React from 'react'
import { Button, Table, Pagination, Popconfirm, Modal, Popover, Row, Col, Tooltip, Affix } from 'antd';
import LeftRightLayout from '../components/LeftRightLayout'
import { ProjectBDFilter } from '../components/Filter'
import { Search } from '../components/Search';
import { 
  handleError, 
  timeWithoutHour, 
  i18n, 
  hasPerm,
  getUserInfo,
  formatMoney,
  getURLParamValue,
  requestAllData,
} from '../utils/util';
import * as api from '../api'
import { Link } from 'dva/router'
import BDModal from '../components/BDModal';
import { isLogin } from '../utils/util'
import ModalModifyProjectBDStatus from '../components/ModalModifyProjectBDStatus';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { connect } from 'dva';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import BDComments, { BDCommentsWithoutForm, EditBDComment } from '../components/BDComments';
import styles from './ProjectBDList.css';

class ProjectBDList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = ProjectBDFilter.defaultValue;
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

    const currentUser = getUserInfo();
    this.state = {
      filters,
      search,
      page,
      pageSize: (currentUser && currentUser.page) || 10,
      total: 0,
      list: [],
      loading: false,

      visible: false,
      sort: 'isimportant',
      desc: 1,
      source: getURLParamValue(this.props, 'status') || 0, 
      status: null, 
      isShowModifyStatusModal: false,
      currentBD:null,

      displayAddBDCommentModal: false,
      editBDComment: null, // 编辑的行动计划

      affixed: false,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProjectBDList)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1, search: null }, this.getProjectBDList)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getProjectBDList)
  }

  handlePageChange = (page, pageSize) => {
    this.setState({ page, pageSize }, this.getProjectBDList)
  }

  getProjectBDList = () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    const param = {
      page_index: page,
      page_size: pageSize,
      search,
      sort,
      desc,
      ...filters,

    }
    this.writeSetting();
    this.setState({ loading: true })
    return api.getProjBDList(param).then(result => {
      let { count: total, data: list } = result.data
      let promises = list.map(item=>{
        if(item.bduser){
          return api.checkUserRelation(isLogin().id, item.bduser)
        }
        else{
          return {data:false}
        }
      })
      Promise.all(promises).then(result=>{
        result.forEach((item,index)=>{
          list[index].hasRelation=item.data           
        })
        this.setState({ loading: false, total, list })

        // Set default currentBD
        let currentBD = null;
        if (list.length > 0) {
          currentBD = list[0];
        }
        // 更新 currentBD
        if (this.state.currentBD) {
          const index = list.findIndex((item) => item.id === this.state.currentBD.id);
          if (index !== -1) {
            currentBD = list[index];
          }
        }
        this.setState({ currentBD });
      })
    }).catch(error => {
      handleError(error)
      this.setState({ loading: false })
    })
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state;
    const data = { filters, search, page, pageSize };
    localStorage.setItem('ProjectBDList', JSON.stringify(data));
  }

  readSetting = () => {
    const data = localStorage.getItem('ProjectBDList');
    return data ? JSON.parse(data) : null;
  }

  handleDelete = (id) => {
    api.deleteProjBD(id).then(data => {
      this.getProjectBDList()
    }).catch(error => {
      handleError(error)
    })
  }

  // comments

  handleOpenModal = (bd) => {
    this.setState({ visible: true, currentBD: bd })
  }

  handleCloseModal = () => {
    this.setState({ visible: false, currentBD: null })
  }

  handleAddComment = async ({ comments, bucket, key, filename, filetype }, speechFile) => {
    let transid = null;
    if (speechFile && speechFile instanceof File) {
      try {
        const formData = new FormData();
        formData.append('file', speechFile);
        const { data } = await api.addAudioTranslate(formData);
        transid = data.id;
      } catch (error) {
        handleError(error)
        return
      }
    }

    const { currentBD } = this.state;
    const param = {
      projectBD: currentBD.id,
      comments,
      bucket,
      key,
      filename,
      transid,
      filetype,
    }
    try {
      await api.addProjBDCom(param)
    } catch (error) {
      handleError(error)
      return
    }
    this.updateCurrentBD()
    api.editProjBD(currentBD.id, {});
  }

  handleEditCommentIconClick = (comment) => {
    this.setState({ editBDComment: comment, displayAddBDCommentModal: true });
  }

  handleEditComment = async (id, data, speechFile) => {
    let transid = null;
    if (speechFile && speechFile instanceof File) {
      try {
        const formData = new FormData();
        formData.append('file', speechFile);
        const { data } = await api.addAudioTranslate(formData);
        transid = data.id;
      } catch (error) {
        handleError(error)
        return
      }
    }

    const params = { ...data, transid };
    try {
      await api.editProjBDCom(id, params);
    } catch (error) {
      handleError(error);
      return;
    }

    this.updateCurrentBD()
    const { currentBD } = this.state;
    api.editProjBD(currentBD.id, {});
  }

  handleDeleteComment = (id) => {
    const { currentBD } = this.state;
    api.deleteProjBDCom(id).then(data => {
      this.updateCurrentBD()
      api.editProjBD(currentBD.id, {});
    }).catch(error => {
      handleError(error)
    })
  }

  updateCurrentBD = () => {
    const { list, currentBD: bd } = this.state;
    requestAllData(api.getProjBDCom, { projectBD: bd.id }, 10).then((result) => {
      const BDComments = result.data.data;
      const currentBD = {
        ...bd,
        BDComments,
      }
      const index = list.findIndex((item) => item.id === bd.id);
      this.setState({
        currentBD,
        list: [
          ...list.slice(0, index),
          currentBD,
          ...list.slice(index + 1),
        ],
        displayAddBDCommentModal: false,
      })
    });
  }

  checkExistence = (mobile, email) => {
    return new Promise((resolve, reject) => {
      Promise.all([api.checkUserExist(mobile), api.checkUserExist(email)])
        .then(result => {
          for (let item of result) {
            if (item.data.result === true)
              resolve(true);
          }
          resolve(false);
        })
        .catch(err => reject(err));
    });
  }
  
  handleConfirm =(state)=>{
    const react = this;
    if ( state.status === 3 && this.state.currentBD.bd_status.id !==3 && !this.state.currentBD.bduser){
      this.checkExistence(state.mobile, state.email).then(ifExist => {
          if (ifExist) {
            Modal.error({
              content: i18n('user.message.user_exist')
            });
          } else {
            this.setState({ isShowModifyStatusModal: false }, () => this.setState({ loading: true }));
            this.handleConfirmAudit(state);
          }
        })
    }
    else{
      this.handleConfirmAudit(state)
    }
  }

  handleUpdateContact = async (formData) => {
    const usermobile = (formData.mobileAreaCode && formData.mobile) ? `+${formData.mobileAreaCode}-${formData.mobile}` : formData.mobile;
    const body = { ...formData, usermobile };
    try {
      await api.editProjBD(this.state.currentBD.id, body);
      const { username, usermobile: mobile, email } = body;
      await api.addProjBDCom({
        projectBD: this.state.currentBD.id,
        comments: `联系人姓名：${username}，电话：${mobile}，邮箱：${email || '暂无'}`,
      });
      this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList);
    } catch (error) {
      handleError(error);
    }
  }

  handleConfirmAudit = state => {
    const { status, usernameC, mobile, email } = state;
    const body = {
      bd_status: status
    }
    // 状态改为暂不BD后，详细需求见bugClose #344
    if (status === 4 && this.state.currentBD.bd_status.id !== 4) {
      const { bd_status, contractors } = this.state.currentBD;
      api.addProjBDCom({
        projectBD: this.state.currentBD.id,
        comments: `之前状态：${bd_status.name}，发起人: ${ contractors ? contractors.username : '无' }`,
      });
      // body.contractors = null;
    }
    api.editProjBD(this.state.currentBD.id, body)
      .then(result => 
        {
          if (status !== 3 || this.state.currentBD.bd_status.id === 3){
            this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
          }
        }
        );

    if (status !== 3 || this.state.currentBD.bd_status.id === 3) return;

    if (this.state.currentBD.bduser) {
      api.addUserRelation({
        relationtype: false,
        investoruser: this.state.currentBD.bduser,
        traderuser: this.state.currentBD.manager.id
      })
        .then(result => {
          this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
        })
        .catch(error => {
          this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
        });
              
    } else {
      api.addProjBDCom({
        projectBD: this.state.currentBD.id,
        comments: `${i18n('account.username')}: ${usernameC} ${i18n('account.mobile')}: ${mobile} ${i18n('account.email')}: ${email}`
      });
        const userBody = {...state, userstatus: 1};
        delete userBody.status;
        api.addUser(userBody)
          .then(result =>{
            if (this.state.currentBD.username === null) {
              api.editProjBD(this.state.currentBD.id, { bduser: result.data.id })
                .then(data => {
                  this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
                })
            }
            api.addUserRelation({
              relationtype: false,
              investoruser: result.data.id,
              traderuser: this.state.currentBD.manager.id
            }).then(data=>{
              this.setState({ isShowModifyStatusModal: false, loading: false });
            })
          });
      }
    }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey || 'isimportant', 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getProjectBDList
    );
  }

  componentDidMount() {
    this.getProjectBDList()
    this.props.dispatch({ type: 'app/getGroup' });
  }

  handleStatusChange =(status)=>{
    this.setState({status})
  }

  handleModifyBDStatusBtnClicked = bd => {
    this.setState({currentBD:bd})
    this.setState({ isShowModifyStatusModal: true, status: bd.bd_status.id });
  }

  showPhoneNumber = item => {
    const { usermobile } = item;
    if (!usermobile) return '暂无';
    const { bduser } = item;
    if (bduser || usermobile.startsWith('+')) return usermobile;
    return `+${usermobile}`;
  }

  currentUserHasIndGroup = () => {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    if (!userInfo.indGroup) return false;
    if (!userInfo.indGroup.id) return false;
    return true;
  }

  hasPermForComment = (currentUserId) => {
    if (hasPerm('BD.manageProjectBD')) return true;    
    if (!this.state.currentBD) return false;

    const record = this.state.currentBD;
    if (currentUserId === record.createuser) return true;
    if (record.contractors && currentUserId === record.contractors.id) return true;

    let normalManagerIds = [];
    if (record.manager) {
      normalManagerIds = record.manager.filter(f => f.type === 3).map(m => m.manager.id);
    }
    if (normalManagerIds.includes(currentUserId)) return true;
    return false;
  }

  render() {
    const currentUser = getUserInfo();
    const currentUserId = currentUser && currentUser.id;
    const { filters, search, page, pageSize, total, list, loading, source } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',padding:4}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      // {title: i18n('project_bd.contact'), key:'username', sorter:true, render:(text, record) =>{
      //   return (<div>{record&&record.hasRelation ? <Link to={'app/user/edit/'+record.bduser}>
      //           {record.username}
      //           </Link> : record.username}</div>
      //           )
      // }},
      {title: i18n('project_bd.project_name'), dataIndex: 'com_name', key:'com_name', sorter:true, 
        render: (text, record) => (
          <div style={{ position: 'relative' }}>
            {record.isimportant ? <img style={{ position: 'absolute', height:'10px',width:'10px',marginTop:'-5px',marginLeft:'-5px'}} src="/images/important.png" /> : null}
            {record.source_type === 0 ?
              <Popover title="项目方联系方式" content={
                <div>
                  <div>{`姓名：${record.username || '暂无'}`}</div>
                  <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                  <div>{`电话：${this.showPhoneNumber(record)}`}</div>
                  <div>{`邮箱：${record.useremail || '暂无'}`}</div>
                </div>
              }>
                <a target="_blank" onClick={e => e.stopPropagation()} href={"/app/projects/library/" + encodeURIComponent(text)} onMouseEnter={() => this.setState({ currentBD: record })}>{text}</a>
              </Popover>
              :
              <Popover title="项目方联系方式" content={
                <div>
                  <div>{`姓名：${record.username || '暂无'}`}</div>
                  <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                  <div>{`电话：${this.showPhoneNumber(record)}`}</div>
                  <div>{`邮箱：${record.useremail || '暂无'}`}</div>
                </div>
              }>
                <div style={{ color: "#428bca" }} onMouseEnter={() => this.setState({ currentBD: record })}>{text}</div>
              </Popover>
            }
          </div>
        )
      },
      {title: i18n('project_bd.status'), dataIndex: ['bd_status', 'name'], key:'bd_status', width: 80, sorter:true},
      // {title: i18n('project_bd.area'), dataIndex: 'location.name', key:'location', sorter:true},
      // {title: i18n('project_bd.import_methods'), render: (text, record) => {
      //   return record.source_type == 0 ? i18n('filter.project_library') : i18n('filter.other')
      // }, key:'source_type', sorter:true},
      // {title: i18n('project_bd.source'), dataIndex: 'source', key:'source', sorter:true, render: text => text || '-'},      
      // {title: i18n('project_bd.contact_title'), dataIndex: 'usertitle.name', key:'usertitle', sorter:true},
      // {title: i18n('phone'), dataIndex: 'usermobile', key:'usermobile', width: 120, sorter:true, render: text => text ? (text.indexOf('-') > -1 ? '+' + text : text) : ''},
      // {title: i18n('email.email'), dataIndex: 'useremail', key:'useremail', sorter: true},
      {
        title: i18n('project_bd.manager'),
        key: 'manager',
        sorter: true,
        render: (_, record) => record.manager && record.manager.filter(f => f.type === 3).map(m => m.manager.username).join('、'),
      },
      // {title: i18n('project_bd.finance_amount'), dataIndex: 'financeAmount', key: 'financeAmount', width: 170, sorter:true, render: (text, record) => {
      //   const currency = record.financeCurrency ? record.financeCurrency.currency : '';
      //   if (text && record.financeCurrency && record.financeCurrency.id === 1) {
      //     return `${currency} ${formatMoney(text, 'CNY')}`;
      //   } else {
      //     return `${currency} ${record.financeAmount ? formatMoney(text) : ''}`;
      //   }
      // }},
      {title: i18n('project_bd.contractors'), dataIndex: ['contractors', 'username'], key: 'contractors', sorter:true},
      {title: i18n('project_bd.created_time'), render: (text, record) => {
        return timeWithoutHour(record.createdtime + record.timezone)
      }, key:'createdtime', sorter:true},
      // {
      //   title: '行动计划',
      //   dataIndex: 'BDComments',
      //   render: (text, record) => {
      //     const comments = record.BDComments;
      //     return comments && comments.length > 0 && <Popover placement="left" title="全部备注" content={
      //       <ul style={{ listStyle: 'outside', marginLeft: 20 }}>
      //         {comments.map(m => <li key={m.id}>
      //           {m.createdtime.substring(0, 16).replace('T', ' ')}
      //           <br/>
      //           <p dangerouslySetInnerHTML={{ __html: m.comments.replace(/\n/g, '<br>') }} />
      //           </li>)}
      //       </ul>
      //     }>
      //       <div style={{ color: "#428bca" }} dangerouslySetInnerHTML={{ __html: comments[0].comments.replace(/\n/g, '<br>') }} />
      //     </Popover>;
      //   },
      // },
    ];

    const allCreateUser = list.map(m => m.createuser);
    const allContractor = list.filter(f => f.contractors).map(m => m.contractors.id);
    const allManager = list.filter(f => f.manager).map(m => m.manager.filter(f => f.type === 3).map(m => m.manager.id))
      .reduce((prev, curr) => prev.concat(curr), []);

    if (hasPerm('BD.manageProjectBD') || allCreateUser.includes(currentUserId) || allContractor.includes(currentUserId) || allManager.includes(currentUserId)) {
      columns.push(
        {title: i18n('project_bd.operation'), width: 160, render: (text, record) => {
          
          let normalManagerIds = [];
          if (record.manager) {
            normalManagerIds = record.manager.filter(f => f.type === 3).map(m => m.manager.id);
          }

          return (<span style={{ display:'flex', alignItems: 'center' }}>
            <div>
              {hasPerm('BD.manageProjectBD') || currentUserId === record.createuser ?
                <Link to={'/app/projects/bd/edit/' + record.id}>
                  <Button size="small" type="link"><EditOutlined /></Button>
                </Link>
                :
                normalManagerIds.includes(currentUserId) || (record.contractors && currentUserId === record.contractors.id) ?
                <Button type="link" size="small" onClick={this.handleModifyBDStatusBtnClicked.bind(this, record)}><EditOutlined /></Button>
                : null
              }
            </div>

            { hasPerm('BD.manageProjectBD') || currentUserId === record.createuser ? 
            <div style={{ marginLeft: 7 }}>
            <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record.id)}>
              <Button size="small" type="link">
                <DeleteOutlined />
              </Button>
            </Popconfirm>
            </div>
            : null }

            <div>
              {/* 备注按钮 */}
              {/* { hasPerm('BD.manageProjectBD') || currentUserId === record.createuser || normalManagerIds.includes(currentUserId) || (record.contractors && currentUserId === record.contractors.id) ?
              <Button style={{}} onClick={() => this.handleOpenModal(record)} type="link" size="small">行动计划</Button>
              : null } */}
            </div>

          </span>)
        }}
      );
    }

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n('menu.project_bd')}
        action={
          (hasPerm('BD.manageProjectBD') || hasPerm('usersys.as_trader')) ?
            {
              name: i18n('project_bd.add_project_bd'),
              link: "/app/projects/bd/add",
              disabled: !hasPerm('BD.manageProjectBD') && !this.currentUserHasIndGroup(),
            }
            :
            undefined
        }
      >
        {/* {source!=0 ? <BDModal source={source}  element='proj'/> : null} */}
        <ProjectBDFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: 16, textAlign: 'right' }} className="clearfix">
          <Search
            style={{ width: 200 }}
            placeholder="全文检索"
            onSearch={this.handleSearch}
            onChange={search => this.setState({ search })}
            value={search}
          />
        </div>
        <Row>
          <Col span={18}>
            <Table
              // onRow={record => {
              //   return {
              //     onMouseEnter: () => {
              //       this.setState({ currentBD: record }); 
              //     },
              //   };
              // }}
              rowClassName={record => {
                return this.state.currentBD && record.id === this.state.currentBD.id ? styles['current-row'] : '';
              }}
              onChange={this.handleTableChange}
              columns={columns}
              dataSource={list}
              rowKey={record => record.id}
              loading={loading}
              pagination={false}
            />
          </Col>
          <Col span={6} style={{ minHeight: 500 }}>
            <div style={{ width: '100%', height: '100%', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'absolute', borderBottom: '1px solid #f0f0f0' }}>
              <Affix offsetTop={50} onChange={affixed => this.setState({ affixed })}>
                <div style={{ padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 500 }}>行动计划</div>
                  {this.hasPermForComment(currentUserId) && (
                    <Tooltip title="添加行动计划">
                      <PlusOutlined className={styles['create-comment-icon']} style={{ cursor: 'pointer', fontSize: 16 }} onClick={() => this.setState({ displayAddBDCommentModal: true, editBDComment: null })} />
                    </Tooltip>
                  )}
                </div>
                <div style={{ padding: 16, overflowY: 'auto', height: this.state.affixed ? 'calc(100vh - 110px)' : 'unset' }}>
                  {this.hasPermForComment(currentUserId) ? (
                    <BDCommentsWithoutForm
                      BDComments={this.state.currentBD && this.state.currentBD.BDComments}
                      onEdit={this.handleEditCommentIconClick}
                      onDelete={this.handleDeleteComment} />
                  ) : '没有权限'}
                </div>
              </Affix>
            </div>
          </Col>
        </Row>
        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
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

        <Modal title="行动计划" visible={this.state.visible} footer={null} onCancel={this.handleCloseModal} maskClosable={false} destroyOnClose={true}>
          <BDComments
            BDComments={this.state.currentBD && this.state.currentBD.BDComments}
            onAdd={this.handleAddComment}
            onEdit={this.handleEditComment}
            onDelete={this.handleDeleteComment} />
        </Modal>

        <Modal
          title="编辑行动计划"
          visible={this.state.displayAddBDCommentModal}
          footer={null}
          onCancel={() => this.setState({ displayAddBDCommentModal: false })}
          maskClosable={false}
          destroyOnClose={true}
        >
          <EditBDComment
            comment={this.state.editBDComment}
            BDComments={this.state.currentBD && this.state.currentBD.BDComments}
            onAdd={this.handleAddComment}
            onEdit={this.handleEditComment}
          />
        </Modal>

        {this.state.isShowModifyStatusModal?
        <ModalModifyProjectBDStatus 
          visible={this.state.isShowModifyStatusModal} 
          onCancel={() => this.setState({ isShowModifyStatusModal: false })} 
          onOk={this.handleConfirm}
          onUpdateContact={this.handleUpdateContact}
          bd={this.state.currentBD}
        />
        :null}

      </LeftRightLayout>
    )
  }
}

export default connect()(ProjectBDList);
