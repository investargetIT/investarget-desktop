import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import { 
  i18n, 
  time, 
  handleError, 
} from '../utils/util';
import * as api from '../api';
import { 
  Table, 
  Button, 
  Popconfirm, 
  Pagination, 
  Modal, 
  Input, 
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from '../components/Filter';
import { Search2 } from '../components/Search';
import ModalModifyOrgBDStatus from '../components/ModalModifyOrgBDStatus';

class OrgBDList extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
        filters: OrgBDFilter.defaultValue,
        search: null,
        page: 1,
        pageSize: 10,
        total: 0,
        list: [],
        loading: false,
        visible: false,
        currentBD: null,
        comments: [],
        newComment: '',
        status: null,
        commentVisible: false,
        sort:undefined,
        desc:undefined,
    }
  }

  componentDidMount() {
    this.getOrgBdList();
  }

  getOrgBdList = () => {
    this.setState({ loading: true });
    const { page, pageSize, search, filters, sort, desc } = this.state;
    const params = {
        page_index: page,
        page_size: pageSize,
        search,
        ...filters,
        sort,
        desc
        
    }
    api.getOrgBdList(params)
    .then(result => {
      console.log(result.data.data)
        this.setState({
          list: result.data.data,
          total: result.data.count,
          loading: false,
        });
        if (this.state.currentBD) {
          const comments = result.data.data.filter(item => item.id == this.state.currentBD.id)[0].BDComments || [];
          this.setState({ comments });
        }
    })
  }

  handleDelete(id) {
    api.deleteOrgBD(id)
      .then(data => this.getOrgBdList())
      .catch(error => handleError(error));
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleModifyStatusBtnClicked(bd) {
    this.setState({ 
        visible: true, 
        currentBD: bd,
        status: bd.bd_status.id,
    });
  }

  handleStatusChange = (status) => {
    this.setState({ status })
  }

  handleConfirmAudit = () => {
    api.modifyOrgBDStatus(this.state.currentBD.id, this.state.status)
    .then(result => {
        this.setState({ visible: false }, this.getOrgBdList);
    });  
  }

  handleOpenModal = bd => {
    this.setState({ commentVisible: true, currentBD: bd, comments: bd.BDComments || [] });
  }

  handleAddComment = () => {
    const body = {
      orgBD: this.state.currentBD.id,
      comments: this.state.newComment,
    };
    api.addOrgBDComment(body)
      .then(data => this.setState({ newComment: '' }, this.getOrgBdList))
      .catch(error => handleError(error));
  }

  handleDeleteComment = id => {
    api.deleteOrgBDComment(id)
    .then(() => this.getOrgBdList())
    .catch(error => handleError(error));
  }
  
  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getOrgBdList
    );
  }

  render() {

    const { filters, search, page, pageSize, total, list, loading } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'20px',height:'25px'}
    const columns = [
        {title: i18n('org_bd.contact'), dataIndex: 'username', key:'username', 
        render:(text,record)=>{return <Link to={'/app/user/'+record.bduser}>{record.username}</Link>},sorter:true },
        {title: i18n('org_bd.created_time'), render: (text, record) => {
            return time(record.createdtime + record.timezone)
        }, key:'createdtime', sorter:true},
        {title: i18n('org_bd.mobile'), dataIndex: 'usermobile', key:'usermobile', sorter:true},
        {title: i18n('org_bd.manager'), dataIndex: 'manager.username', key:'manager', sorter:true},
        {title: i18n('org_bd.org'), render: (text, record) => record.org ? record.org.orgname : null, key:'org', sorter:true},
        {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true},
        {title: i18n('org_bd.status'), dataIndex: 'bd_status.name', key:'bd_status', sorter:true},
        {
            title: i18n('org_bd.operation'), render: (text, record) => 
            {
            const latestComment = record.BDComments && record.BDComments[0]
            const comments = latestComment ? latestComment.comments : ''
            return (
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between'}}>
                <div style={{marginRight:4}}>
                <button style={buttonStyle} size="small" onClick={this.handleModifyStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</button>
                </div>
                <div>
                <a style={buttonStyle} href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record)}>{i18n('remark.comment')}</a>
                </div>
              </div>
                <div>
                <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record.id)}>
                    <a type="danger"><img style={imgStyle} src="/images/delete.png" /></a>
                </Popconfirm>
                 </div>
              </div>)
            }
        },
       
      ]

    return (
      <LeftRightLayout 
        location={this.props.location} 
        name={i18n('menu.organization_bd')} 
        title={i18n('menu.bd_management')}
        action={{ name: i18n('add_orgbd'), link: '/app/orgbd/add' }}
      >

        <OrgBDFilter
          defaultValue={filters}
          onSearch={this.handleFilt}
          onReset={this.handleReset}
          onChange={this.handleFilt}
        />
        
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }} className="clearfix">
          <Search2
            defaultValue={search}
            placeholder={i18n('project_bd.project_name')}
            style={{ width: 200, float: 'right' }}
            onSearch={search => this.setState({ search, page: 1 }, this.getOrgBdList)} 
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
            onChange={page => this.setState({ page }, this.getOrgBdList)}
            showSizeChanger
            onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getOrgBdList)}
            showQuickJumper
          />
        </div>

        <ModalModifyOrgBDStatus 
          visible={this.state.visible} 
          onCancel={() => this.setState({ visible: false })} 
          status={this.state.status}
          onStatusChange={this.handleStatusChange}
          onOk={this.handleConfirmAudit}
        />

        <Modal
          title={i18n('remark.comment')}
          visible={this.state.commentVisible}
          footer={null}
          onCancel={() => this.setState({ commentVisible: false, newComment: '', currentBD: null, comments: [] })}
          maskClosable={false}
        >
          <BDComments
            comments={this.state.comments}
            newComment={this.state.newComment}
            onChange={e => this.setState({ newComment: e.target.value })}
            onAdd={this.handleAddComment}
            onDelete={this.handleDeleteComment} 
          />
        </Modal>

      </LeftRightLayout>
    );
  }
}

export default OrgBDList;

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
              <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                <a href="javascript:void(0)">{i18n('common.delete')}</a>
              </Popconfirm>
            </p>
            <p>{comment.comments}</p>
          </div>
        )) : <p>{i18n('remark.no_comments')}</p>}
      </div>
    </div>
  )
}