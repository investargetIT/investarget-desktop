import React from 'react'
import { Button, Table, Pagination, Input, Popconfirm, Modal, Popover } from 'antd';
import LeftRightLayout from '../components/LeftRightLayout'
import { ProjectBDFilter } from '../components/Filter'
import { Search } from '../components/Search';
import { 
  handleError, 
  time, 
  timeWithoutHour, 
  i18n, 
  hasPerm,
  getUserInfo,
  formatMoney,
  getURLParamValue,
} from '../utils/util';
import * as api from '../api'
import { Link } from 'dva/router'
import BDModal from '../components/BDModal';
import { isLogin } from '../utils/util'
import ModalModifyProjectBDStatus from '../components/ModalModifyProjectBDStatus';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { connect } from 'dva';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

class ProjectBDList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = ProjectBDFilter.defaultValue;
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

    this.state = {
      filters,
      search,
      page,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,

      visible: false,
      currentBDId: null,
      comments: [],
      newComment: '',
      sort: 'isimportant',
      desc: 1,
      source: getURLParamValue(this.props, 'status') || 0, 
      status: null, 
      isShowModifyStatusModal: false,
      currentBD:null
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

  handlePageChange = (page) => {
    this.setState({ page }, this.getProjectBDList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProjectBDList)
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
        if (this.state.currentBDId) {
          const comments = list.filter(item => item.id == this.state.currentBDId)[0].BDComments || []
          this.setState({ comments })
        }
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

  handleOpenModal = (id) => {
    const bd = this.state.list.filter(item => item.id == id)[0]
    const comments = bd.BDComments || []
    this.setState({ visible: true, currentBDId: id, comments })
  }

  handleCloseModal = () => {
    this.setState({ visible: false, newComment: '', currentBDId: null, comments: [] })
  }

  handleChangeComment = (e) => {
    this.setState({ newComment: e.target.value })
  }

  handleAddComment = comments => {
    const param = {
      projectBD: this.state.currentBDId,
      comments,
    }
    api.addProjBDCom(param).then(data => {
      this.setState({ newComment: '' })
      this.getProjectBDList()
    }).catch(error => {
      handleError(error)
    })
  }

  handleEditComment = (id, content) => {
    const body = {
      comments: content,
    };
    api.editProjBDCom(id, body)
      .then(this.getProjectBDList)
      .catch(handleError);
  }

  handleDeleteComment = (id) => {
    api.deleteProjBDCom(id).then(data => {
      this.getProjectBDList()
    }).catch(error => {
      handleError(error)
    })
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
        comments: `之前状态：${bd_status.name}，签约负责人: ${ contractors ? contractors.username : '无' }`,
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

  render() {
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
                <a target="_blank" href={"/app/projects/library/" + encodeURIComponent(text)}>{text}</a>
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
                <div style={{ color: "#428bca" }}>{text}</div>
              </Popover>
            }
          </div>
        )
      },
      {title: i18n('project_bd.status'), dataIndex: 'bd_status.name', key:'bd_status', width: 80, sorter:true},
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
        render: (text, record) => {
          const { main, normal } = record.manager;
          let allManagers = [];
          if (main) {
            allManagers.push(main.username);
          }
          if (normal) {
            allManagers = allManagers.concat(normal.map(m => m.manager.username));
          }
          return allManagers.join('、');
        },
      },
      {title: i18n('project_bd.finance_amount'), dataIndex: 'financeAmount', key:'financeAmount', width: 170, sorter:true, render: (text, record) => {
        const currency = record.financeCurrency ? record.financeCurrency.currency : '';
        if (text && record.financeCurrency && record.financeCurrency.id === 1) {
          return `${currency} ${formatMoney(text, 'CNY')}`;
        } else {
          return `${currency} ${record.financeAmount ? formatMoney(text) : ''}`;
        }
      }},
      {title: i18n('project_bd.contractors'), dataIndex: 'contractors.username', key:'contractors', sorter:true},
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
    const allManager = list.filter(f => f.manager).map(m => {
      const { main, normal } = m.manager;
      const { id: mainManagerId } = main;
      let normalManagerIds = [];
      if (normal) {
        normalManagerIds = normal.map(m => m.manager.id);
      }
      return normalManagerIds.concat(mainManagerId);
    }).reduce((prev, curr) => prev.concat(curr), []);

    if (hasPerm('BD.manageProjectBD') || allCreateUser.includes(getUserInfo().id) || allContractor.includes(getUserInfo().id) || allManager.includes(getUserInfo().id)) {
      columns.push(
        {title: i18n('project_bd.operation'), width: 160, render: (text, record) => {
          
          let normalManagerIds = [];
          if (record.manager.normal) {
            normalManagerIds = record.manager.normal.map(m => m.manager.id);
          }

          return (<span style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              {hasPerm('BD.manageProjectBD') || getUserInfo().id === record.createuser ?
                <Link to={'/app/projects/bd/edit/' + record.id}>
                  <Button size="small" type="link"><EditOutlined /></Button>
                </Link>
                :
                getUserInfo().id === record.manager.main.id || normalManagerIds.includes(getUserInfo().id) || (record.contractors && getUserInfo().id === record.contractors.id) ?
                <Button type="link" size="small" onClick={this.handleModifyBDStatusBtnClicked.bind(this, record)}><EditOutlined /></Button>
                : null
              }
            </div>

            { hasPerm('BD.manageProjectBD') || getUserInfo().id === record.createuser ? 
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
              { hasPerm('BD.manageProjectBD') || getUserInfo().id === record.createuser || getUserInfo().id === record.manager.main.id || normalManagerIds.includes(getUserInfo().id) || (record.contractors && getUserInfo().id === record.contractors.id) ?
              <Button style={{}} onClick={this.handleOpenModal.bind(this, record.id)} type="link" size="small">行动计划</Button>
              : null }
            </div>

          </span>)
        }}
      );
    }

    return (
      <LeftRightLayout location={this.props.location} title={i18n('menu.project_bd')} action={{ name: i18n('project_bd.add_project_bd'), link: "/app/projects/bd/add" }}>
        {/* {source!=0 ? <BDModal source={source}  element='proj'/> : null} */}
        <ProjectBDFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: 16, textAlign: 'right' }} className="clearfix">
          <Search
            style={{ width: 200 }}
            placeholder={i18n('project_bd.project_name')}
            onSearch={this.handleSearch}
            onChange={search => this.setState({ search })}
            value={search}
          />
        </div>
        <Table
          onChange={this.handleTableChange}
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />
        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
            style={{ float: 'right' }}
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

        <Modal title="行动计划" visible={this.state.visible} footer={null} onCancel={this.handleCloseModal} maskClosable={false}>
          <BDComments
            comments={this.state.comments}
            newComment={this.state.newComment}
            onChange={this.handleChangeComment}
            onAdd={this.handleAddComment}
            onEdit={this.handleEditComment}
            onDelete={this.handleDeleteComment} />
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


class BDComments extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editContent: '',
      editComment: null,
    };
  }

  onChange = e => {
    const editContent = e.target.value;
    this.setState({ editContent });
  }

  handleConfirmBtnClicked = () => {
    if (this.state.editComment === null) {
      this.props.onAdd(this.state.editContent);
    } else {
      this.props.onEdit(this.state.editComment.id, this.state.editContent);
    }
    this.setState({ editContent: '', editComment: null});
  }

  handleEditBtnClicked = comment => {
    this.setState({ editContent: comment.comments, editComment: comment });
  }

  handleCancelBtnClicked = () => {
    this.setState({ editContent: '', editComment: null});
  }

  render() {
    const { comments, newComment, onChange, onDelete, onAdd } = this.props;
    return (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Input.TextArea rows={3} value={this.state.editContent} onChange={this.onChange} style={{ flex: 1, marginRight: 16 }} />
          <Button onClick={this.handleConfirmBtnClicked} type="primary" disabled={this.state.editContent === ''}>确定</Button>
          &nbsp;
          <Button onClick={this.handleCancelBtnClicked}>取消</Button>
        </div>

        { !this.state.editComment ? 
        <div>
          {comments.length ? comments.map(comment => (
            <div key={comment.id} style={{ marginBottom: 8 }}>
              <p>
                <span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span>

                { hasPerm('BD.manageProjectBD') || getUserInfo().id === comment.createuser ? 
                <Button type="link" onClick={this.handleEditBtnClicked.bind(this, comment)}><EditOutlined /></Button>
                : null }
                
                &nbsp;
              {hasPerm('BD.manageProjectBD') ?
                  <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                    <Button type="link"><DeleteOutlined /></Button>
                  </Popconfirm>
                  : null}
              </p>
              <div style={{ display: 'flex' }}>
                {comment.createuserobj &&
                  <div style={{ marginRight: 10 }}>
                    <a target="_blank" href={`/app/user/${comment.createuserobj.id}`}>
                      <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuserobj.photourl} />
                    </a>
                  </div>
                }
                <p dangerouslySetInnerHTML={{ __html: comment.comments.replace(/\n/g, '<br>') }}></p>
              </div>
            </div>

          )) : <p>暂无行动计划</p>}
        </div>
        : null }

      </div>
    );
  }
}
