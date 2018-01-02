import React from 'react'
import { Button, Table, Pagination, Input, Popconfirm, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { ProjectBDFilter } from '../components/Filter'
import { Search2 } from '../components/Search'
import { handleError, time, i18n } from '../utils/util'
import * as api from '../api'
import { Link } from 'dva/router'
import BDModal from '../components/BDModal';


class ProjectBDList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      filters: ProjectBDFilter.defaultValue,
      search: null,
      page: 1,
      pageSize: 10,
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
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
      if (this.state.currentBDId) {
        const comments = list.filter(item => item.id == this.state.currentBDId)[0].BDComments || []
        this.setState({ comments })
      }
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

  render() {
    const { filters, search, page, pageSize, total, list, loading, source } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      {title: i18n('project_bd.project_name'), dataIndex: 'com_name', key:'com_name', sorter:true},
      {title: i18n('project_bd.status'), dataIndex: 'bd_status.name', key:'bd_status', sorter:true},
      {title: i18n('project_bd.area'), dataIndex: 'location.name', key:'location', sorter:true},
      {title: i18n('project_bd.import_methods'), render: (text, record) => {
        return record.source_type == 0 ? i18n('filter.project_library') : i18n('filter.other')
      }, key:'source_type', sorter:true},
      {title: i18n('project_bd.source'), dataIndex: 'source', key:'source', sorter:true, render: text => text || '-'},
      {title: i18n('project_bd.contact'), dataIndex: 'username', key:'username', sorter:true},
      {title: i18n('project_bd.contact_title'), dataIndex: 'usertitle.name', key:'usertitle', sorter:true},
      {title: i18n('project_bd.contact_mobile'), dataIndex: 'usermobile', key:'usermobile', sorter:true},
      {title: i18n('project_bd.manager'), dataIndex: 'manager.username', key:'manager', sorter:true},
      {title: i18n('project_bd.created_time'), render: (text, record) => {
        return time(record.createdtime + record.timezone)
      }, key:'createdtime', sorter:true},
      {title: i18n('project_bd.operation'), render: (text, record) => {
        return (<span style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',flexWrap:'wrap',maxWidth:'100px'}}>
          <Link to={'/app/projects/bd/edit/' + record.id}>
            <Button style={buttonStyle} className="buttonStyle" size="small">{i18n('common.edit')}</Button>
          </Link>
          <div>        
          <a style={buttonStyle} href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record.id)}>{i18n('remark.comment')}</a>
          </div>
          </div>
          <div>
          <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(this, record.id)}>
            <a type="danger"><img style={imgStyle} src="/images/delete.png" /></a>
          </Popconfirm>
          </div>
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
