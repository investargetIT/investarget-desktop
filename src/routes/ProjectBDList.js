import React from 'react'
import { Button, Table, Pagination, Input, Popconfirm, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectBDStatus } from '../components/ModalModifyOrgBDStatus';
import { ProjectBDFilter } from '../components/Filter'
import { Search2 } from '../components/Search'
import { 
  handleError, 
  time, 
  timeWithoutHour, 
  i18n, 
  hasPerm,
  getUserInfo,
} from '../utils/util';
import * as api from '../api'
import { Link } from 'dva/router'
import BDModal from '../components/BDModal';
import { isLogin } from '../utils/util'
import ModalModifyOrgBDStatus from '../components/ModalModifyOrgBDStatus';
import { PAGE_SIZE_OPTIONS } from '../constants';

class ProjectBDList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      filters: ProjectBDFilter.defaultValue,
      search: null,
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,

      visible: false,
      currentBDId: null,
      comments: [],
      newComment: '',
      sort:undefined,
      desc:undefined,
      source:this.props.location.query.status||0, 
      status: null, 
      isShowModifyStatusModal: false,
      currentBD:null
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProjectBDList)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getProjectBDList)
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

  handleAddComment = () => {
    const param = {
      projectBD: this.state.currentBDId,
      comments: this.state.newComment,
    }
    api.addProjBDCom(param).then(data => {
      this.setState({ newComment: '' })
      this.getProjectBDList()
    }).catch(error => {
      handleError(error)
    })
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
            this.handleConfirmAudit(state);
          }
        })
    }
    else{
      this.handleConfirmAudit(state)
    }
  }

  handleConfirmAudit = ({ status,username, mobile, email, group }) => {
    const body = {
      bd_status: status
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
        comments: `${i18n('account.username')}: ${username} ${i18n('account.mobile')}: ${mobile} ${i18n('account.email')}: ${email}`
      });
      const newUser = { mobile, email, groups: [Number(group)], userstatus: 1 };
      if (window.LANG === 'en') {
        newUser.usernameE = username;
      } else {
        newUser.usernameC = username;
      }
      this.checkExistence(mobile,email).then(ifExist=>{
        if(ifExist){
          Modal.error({
          content: i18n('user.message.user_exist')
        });
        }
        else{
        api.addUser(newUser)
          .then(result =>{
            api.addUserRelation({
            relationtype: false,
            investoruser: result.data.id,
            traderuser: this.state.currentBD.manager.id
          }).then(data=>{
            this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
          })
          });
        }
      })
      }
    }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getProjectBDList
    );
  }

  componentDidMount() {
    this.getProjectBDList()
  }

  handleStatusChange =(status)=>{
    this.setState({status})
  }

  handleModifyBDStatusBtnClicked = bd => {
    this.setState({currentBD:bd})
    this.setState({ isShowModifyStatusModal: true, status: bd.bd_status.id });
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      {title: i18n('project_bd.contact'), key:'username', sorter:true, render:(text, record) =>{
        return (<div>{record&&record.hasRelation ? <Link to={'app/user/edit/'+record.bduser}>
                {record.username}
                </Link> : record.username}</div>
                )
      }},
      {title: i18n('project_bd.project_name'), dataIndex: 'com_name', key:'com_name', sorter:true},
      {title: i18n('project_bd.status'), dataIndex: 'bd_status.name', key:'bd_status', sorter:true},
      {title: i18n('project_bd.area'), dataIndex: 'location.name', key:'location', sorter:true},
      {title: i18n('project_bd.import_methods'), render: (text, record) => {
        return record.source_type == 0 ? i18n('filter.project_library') : i18n('filter.other')
      }, key:'source_type', sorter:true},
      // {title: i18n('project_bd.source'), dataIndex: 'source', key:'source', sorter:true, render: text => text || '-'},      
      // {title: i18n('project_bd.contact_title'), dataIndex: 'usertitle.name', key:'usertitle', sorter:true},
      {title: i18n('phone'), dataIndex: 'usermobile', key:'usermobile', sorter:true, render: text => text ? (text.indexOf('-') > -1 ? '+' + text : text) : ''},
      {title: i18n('email.email'), dataIndex: 'useremail', key:'useremail', sorter: true},
      {title: i18n('project_bd.manager'), dataIndex: 'manager.username', key:'manager', sorter:true},
      {title: i18n('project_bd.created_time'), render: (text, record) => {
        return timeWithoutHour(record.createdtime + record.timezone)
      }, key:'createdtime', sorter:true},
      {title: i18n('project_bd.operation'), render: (text, record) => {
        return (<span style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',flexWrap:'wrap',maxWidth:'100px'}}>
            {hasPerm('BD.manageProjectBD') ?
              <Link to={'/app/projects/bd/edit/' + record.id}>
                <Button style={buttonStyle} className="buttonStyle" size="small">{i18n('common.edit')}</Button>
              </Link>
              :
              <div style={{ padding: '0 7px' }}>
                <a style={buttonStyle} onClick={this.handleModifyBDStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</a>
              </div>
            }
              <div>
                <a style={buttonStyle} href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record.id)}>{i18n('remark.comment')}</a>
              </div>


          </div>
          { hasPerm('BD.manageProjectBD') ? 
          <div>
          <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record.id)}>
            <a type="danger"><img style={imgStyle} src="/images/delete.png" /></a>
          </Popconfirm>
          </div>
          : null }
        </span>)
      }},
    ]

    return (
      <LeftRightLayout location={this.props.location} title={i18n('menu.project_bd')} action={{ name: i18n('project_bd.add_project_bd'), link: "/app/projects/bd/add" }}>
        {source!=0 ? <BDModal source={source}  element='proj'/> : null}
        <ProjectBDFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '16px' }} className="clearfix">
          <Search2 defaultValue={search} placeholder={i18n('project_bd.project_name')} style={{ width: 200, float: 'right' }} onSearch={this.handleSearch} />
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

        <Modal title={i18n('remark.comment')} visible={this.state.visible} footer={null} onCancel={this.handleCloseModal} maskClosable={false}>
          <BDComments
            comments={this.state.comments}
            newComment={this.state.newComment}
            onChange={this.handleChangeComment}
            onAdd={this.handleAddComment}
            onDelete={this.handleDeleteComment} />
        </Modal>
        
        {this.state.isShowModifyStatusModal?
        <ModalModifyOrgBDStatus 
          visible={this.state.isShowModifyStatusModal} 
          onCancel={() => this.setState({ isShowModifyStatusModal: false })} 
          status={this.state.status}
          onStatusChange={this.handleStatusChange}
          onOk={this.handleConfirm}
          bd={this.state.currentBD}
          projectBD
        />
        :null}

      </LeftRightLayout>
    )
  }
}

export default ProjectBDList


function BDComments(props) {
  const { comments, newComment, onChange, onDelete, onAdd } = props
  return (
    <div>
      <div style={{marginBottom:'16px',display:'flex',flexDirection:'row',alignItems:'center'}}>
        <Input.TextArea rows={3} value={newComment} onChange={onChange} style={{flex:1,marginRight:16}} />
        <Button onClick={onAdd} type="primary" disabled={newComment == ''}>{i18n('common.add')}</Button>
      </div>
      <div>
        {comments.length ? comments.map(comment => (
          <div key={comment.id} style={{marginBottom:8}}>
            <p>
              <span style={{marginRight: 8}}>{time(comment.createdtime + comment.timezone)}</span>
              { hasPerm('BD.manageProjectBD') ?
              <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                <a href="javascript:void(0)">{i18n('common.delete')}</a>
              </Popconfirm>
              : null }
            </p>
            <p dangerouslySetInnerHTML={{__html:comment.comments.replace(/\n/g,'<br>')}}></p>
          </div>
        )) : <p>{i18n('remark.no_comments')}</p>}
      </div>
    </div>
  )
}
