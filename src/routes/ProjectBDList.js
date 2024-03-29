import React from 'react'
import { Button, Table, Pagination, Popconfirm, Modal, Popover, Row, Col, Tooltip, Affix, notification } from 'antd';
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
  sleep,
} from '../utils/util';
import * as api from '../api'
import { Link } from 'dva/router'
import BDModal from '../components/BDModal';
import { isLogin } from '../utils/util'
import ModalModifyProjectBDStatus from '../components/ModalModifyProjectBDStatus';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { connect } from 'dva';
import { DeleteOutlined, EditOutlined, PlusOutlined, ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';
import BDComments, { BDCommentsWithoutForm, EditBDComment } from '../components/BDComments';
import styles from './ProjectBDList.css';
import lodash from 'lodash';

class ProjectBDList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting? setting.filters : ProjectBDFilter.defaultValue;
    let search = null;
    const searchFromURL = getURLParamValue(props, 'search');
    if (searchFromURL) {
      search = searchFromURL;
      // Reset url
      history.replaceState(undefined, '', '/app/projects/bd');
    } else if (setting) {
      search = setting.search;
    }
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: null

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
      footerAffixed: false,
      modalExpanded: false,
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

  getProjectBDListWithOutSearch = () => {
    const { filters, page, pageSize, sort, desc } = this.state;
    const param = {
      page_index: page,
      page_size: pageSize,
      sort,
      desc,
      ...filters,
    };
    return api.getProjBDList(param);
  }

  getProjBDListWithSearch = async () => {
    const { filters, sort, desc, search } = this.state;
    const params = [
      {
        contractors_str: search,
        ...filters,
      },
      {
        manager_str: search,
        ...filters,
      },
      {
        search,
        ...filters,
      },
    ];
    const req = await Promise.all(params.map(m => requestAllData(api.getProjBDList, m, 10)));
    let allList = req.reduce((prev, curr) => prev.concat(curr.data.data), []);
    allList = lodash.uniqBy(allList, 'id');
    if (sort) {
      if (sort === 'createdtime') {
        allList = allList.sort((a, b) => desc ? (new Date(b.createdtime) - new Date(a.createdtime)) : (new Date(a.createdtime) - new Date(b.createdtime)));
      } else if (sort === 'com_name') {
        allList = allList.sort((a, b) => desc ? b.com_name.localeCompare(a.com_name) : a.com_name.localeCompare(b.com_name));
      } else if (sort === 'manager') {
        allList = allList.sort((a, b) => {
          const aManagerStr = a.manager ? a.manager.map(m => m.manager.username).join('') : '';
          const bManagerStr = b.manager ? b.manager.map(m => m.manager.username).join('') : '';
          return desc ? bManagerStr.localeCompare(aManagerStr) : aManagerStr.localeCompare(bManagerStr);
        });
      } else if (sort === 'contractors') {
        allList = allList.sort((a, b) => {
          const aContractorsStr = a.contractors ? a.contractors.username : '';
          const bContractorsStr = b.contractors ? b.contractors.username : '';
          return desc ? bContractorsStr.localeCompare(aContractorsStr) : aContractorsStr.localeCompare(bContractorsStr);
        });
      }
    }
    allList = allList.sort((a, b) => a.isimportant === b.isimportant ? 0: a.isimportant ? -1 : 1)
    return { data: { data: allList, count: allList.length } };
  }

  getProjectBDList = () => {
    this.setState({ loading: true });
    let request = this.getProjectBDListWithOutSearch;
    if (this.state.search) {
      request = this.getProjBDListWithSearch;
    }
    let list = [];
    return request().then(result => {
      this.writeSetting();
      const { count: total, data: bdList } = result.data
      list = bdList;
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
        if (currentBD) {
          this.props.dispatch({
            type: 'app/getProjBDCommentsByID',
            payload: { projBDID: currentBD.id, forceUpdate: false },
          });
        }
      })
      return this.props.dispatch({ type: 'app/getSource', payload: 'bdStatus' });
    })
    .then(allBdStatus => {
      list = list.map(m => {
        const bdStatus = allBdStatus.find(f => f.id === m.bd_status);
        return { ...m, bd_status: bdStatus };
      });
      this.setState({ list });
      return this.props.dispatch({ type: 'app/getSource', payload: 'title' });
    })
    .then(allTitles => {
      list = list.map(m => {
        const userTitle = allTitles.find(f => f.id === m.usertitle);
        return { ...m, usertitle: userTitle };
      });
      this.setState({ list });
    })
    .catch(error => {
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
    this.setState({ displayAddBDCommentModal: false });
    let transid = null;
    if (speechFile && speechFile instanceof File) {
      try {
        const { data } = await api.requestAudioTranslate({ key, file_name: filename });
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
  }

  handleEditCommentIconClick = (comment) => {
    this.setState({ editBDComment: comment, displayAddBDCommentModal: true });
  }

  handleEditComment = async (id, data, speechFile) => {
    this.setState({ displayAddBDCommentModal: false });
    let transid = null;
    if (speechFile && speechFile instanceof File) {
      try {
        const body = {
          key: data.key,
          file_name: data.filename,
        }
        const { data: reqData } = await api.requestAudioTranslate(body);
        transid = reqData.id;
      } catch (error) {
        handleError(error)
        return
      }
    }

    const params = { ...data, transid };
    try {
      const reqProjBDCom = await api.editProjBDCom(id, params);
      const { projectBD } = reqProjBDCom.data;
      this.updateCurrentBD(projectBD);
    } catch (error) {
      handleError(error);
      return;
    }
  }

  handleAutoSaveComment = async (comment, data) => {
    const body = { ...data, projectBD: this.state.currentBD.id };
    if (comment) {
      api.editProjBDCom(comment.id, body);
    } else {
      // 添加行动计划时，自动保存只会发生在第一次
      const req = await api.addProjBDCom(body);
      const { data: { id } } = req;
      this.setState({ editBDComment: { id } });
    }
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

  updateCurrentBD = (projBDID = this.state.currentBD.id) => {
    this.setState({ displayAddBDCommentModal: false });
    this.props.dispatch({
      type: 'app/getProjBDCommentsByID',
      payload: { projBDID, forceUpdate: true },
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
      .then(() => {
        const { scrollPosition, currentBD } = this.props;
        window.scrollTo(0, scrollPosition );
        if (currentBD) {
          this.setState({ currentBD });
        }
        // Reset position
        this.props.dispatch({ type: 'app/saveSource', payload: { sourceType: 'projectBDListParameters', data: { scrollPosition: 0, currentBD: null } } });
      });
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

  handleMouseEnterProjectName = async projBD => {
    this.setState({ currentBD: projBD });
    this.props.dispatch({
      type: 'app/getProjBDCommentsByID',
      payload: { projBDID: projBD.id, forceUpdate: false },
    });
  }

  calculateContentHeight = () => {
    if (!this.state.affixed && !this.state.footerAffixed) return 500 - 60;
    if (!this.state.affixed && this.state.footerAffixed) return 'unset';
    if (this.state.affixed && this.state.footerAffixed) return 'calc(100vh - 110px)';
    if (this.state.affixed && !this.state.footerAffixed) return 'calc(100vh - 110px - 16px - 32px - 16px - 30px )';
    return undefined;
  }

  handleEditBtnClicked = () => {
    const { pageYOffset: scrollPosition } = window;
    const { currentBD } = this.state;
    this.props.dispatch({ type: 'app/saveSource', payload: { sourceType: 'projectBDListParameters', data: { scrollPosition, currentBD } } });
  }

  handleCancelEditCommentBtnClicked = () => {
    this.setState({ displayAddBDCommentModal: false });
    this.updateCurrentBD();
  }

  render() {
    const currentUser = getUserInfo();
    const currentUserId = currentUser && currentUser.id;
    const { filters, search, page, pageSize, total, list, loading, source } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',padding:4}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
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
                <a target="_blank" onClick={e => e.stopPropagation()} href={"/app/projects/library/" + encodeURIComponent(text)} onMouseEnter={() => this.handleMouseEnterProjectName(record)}>{text}</a>
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
                <div style={{ color: "#428bca" }} onMouseEnter={() => this.handleMouseEnterProjectName(record)}>{text}</div>
              </Popover>
            }
          </div>
        )
      },
      {title: i18n('project_bd.status'), dataIndex: ['bd_status', 'name'], key:'bd_status', width: 80, sorter:true},
      {
        title: i18n('project_bd.manager'),
        key: 'manager',
        sorter: true,
        render: (_, record) => {
          if (!record.manager) return null;
          let allManager = record.manager.map(m => m.manager);
          allManager = lodash.uniqBy(allManager, 'id');
          return allManager.map(m => m.username).join('、');
        }
      },
      {title: i18n('project_bd.contractors'), dataIndex: ['contractors', 'username'], key: 'contractors', sorter:true},
      {title: i18n('project_bd.created_time'), render: (text, record) => {
        return timeWithoutHour(record.createdtime + record.timezone)
      }, key:'createdtime', sorter:true},
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
                  <Button size="small" type="link" onClick={this.handleEditBtnClicked}><EditOutlined /></Button>
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
            placeholder="开发团队/发起人/全文检索"
            onSearch={this.handleSearch}
            onChange={search => this.setState({ search })}
            value={search}
          />
        </div>
        <Row>
          <Col span={18}>
            <Table
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
                <div>
                  <div style={{ height: 55, padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ height: '100%' }}>
                      <div style={{ fontWeight: 500 }}>行动计划</div>
                      <div style={{ fontSize: 10, color: 'gray' }}>{this.state.currentBD && this.state.currentBD.com_name}</div>
                    </div>
                    {this.hasPermForComment(currentUserId) && this.state.currentBD && (
                      <Tooltip title="添加行动计划">
                        <PlusOutlined className={styles['create-comment-icon']} style={{ cursor: 'pointer', fontSize: 16 }} onClick={() => this.setState({ displayAddBDCommentModal: true, editBDComment: null })} />
                      </Tooltip>
                    )}
                  </div>
                  <div style={{ padding: 16, overflowY: 'auto', height: this.calculateContentHeight() }}>
                    {this.hasPermForComment(currentUserId) ? (
                      <BDCommentsWithoutForm
                        BDComments={this.state.currentBD ? this.props.allProjBDComments[this.state.currentBD.id] : []}
                        onEdit={this.handleEditCommentIconClick}
                        onDelete={this.handleDeleteComment} />
                    ) : '没有权限'}
                  </div>
                </div>
              </Affix>
            </div>
          </Col>
        </Row>

        <Affix offsetBottom={0} onChange={affixed => this.setState({ footerAffixed: affixed })}>
          <div />
        </Affix>

        <div style={{ margin: '16px 0' }} className="clearfix">
          {this.state.search ? (
            <ul style={{ float: 'right', width: 200, height: 32, margin: 0, padding: 0 }} />
          ) : (
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
          )}
        </div>

        <Modal title="行动计划" visible={this.state.visible} footer={null} onCancel={this.handleCloseModal} maskClosable={false} destroyOnClose={true}>
          <BDComments
            BDComments={this.state.currentBD && this.state.currentBD.BDComments}
            onAdd={this.handleAddComment}
            onEdit={this.handleEditComment}
            onDelete={this.handleDeleteComment} />
        </Modal>

        <Modal
          title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>编辑行动计划</div>
            <div>
              <Button type="link" icon={this.state.modalExpanded ? <ShrinkOutlined className={styles['icon-modal-operation']} /> : <ArrowsAltOutlined className={styles['icon-modal-operation']} />} onClick={() => this.setState({ modalExpanded: !this.state.modalExpanded })} />
              <Button type="link" icon={<CloseOutlined className={styles['icon-modal-operation']} />} onClick={this.handleCancelEditCommentBtnClicked} />
            </div>
          </div>}
          visible={this.state.displayAddBDCommentModal}
          footer={null}
          closable={false}
          maskClosable={false}
          destroyOnClose={true}
          style={{ maxWidth: this.state.modalExpanded ? '90vw' : undefined }}
          width={this.state.modalExpanded ? '90vw' : undefined}
        >
          <EditBDComment
            comment={this.state.editBDComment}
            onAdd={this.handleAddComment}
            onEdit={this.handleEditComment}
            onAutoSave={this.handleAutoSaveComment}
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

function mapStateToProps(state) {
  const { allProjBDComments, projectBDListParameters: { scrollPosition, currentBD } } = state.app;
  return { allProjBDComments, scrollPosition, currentBD };
}

export default connect(mapStateToProps)(ProjectBDList);
