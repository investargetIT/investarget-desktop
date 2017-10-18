import React from 'react'
import { Button, Table, Pagination, Input, Popconfirm, Modal } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { ProjectBDFilter } from '../components/Filter'
import { Search2 } from '../components/Search'
import { handleError, time } from '../utils/util'
import * as api from '../api'
import { Link } from 'dva/router'


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
    const { filters, search, page, pageSize } = this.state
    const param = {
      page_index: page,
      page_size: pageSize,
      search,
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
      handleError(error.message)
      this.setState({ loading: false })
    })
  }

  handleDelete = (id) => {
    api.deleteProjBD(id).then(data => {
      this.getProjectBDList()
    }).catch(error => {
      handleError(error.message)
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
      handleError(error.message)
    })
  }

  handleDeleteComment = (id) => {
    api.deleteProjBDCom(id).then(data => {
      this.getProjectBDList()
    }).catch(error => {
      handleError(error.message)
    })
  }

  componentDidMount() {
    this.getProjectBDList()
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading } = this.state

    const columns = [
      {title: '项目名称', dataIndex: 'com_name'},
      {title: '状态', dataIndex: 'bd_status.name'},
      {title: '地点', dataIndex: 'location.country'},
      {title: '导入方式', dataIndex: 'source'},
      {title: '联系人', dataIndex: 'username'},
      {title: '联系人职位', dataIndex: 'usertitle.name'},
      {title: '联系电话', dataIndex: 'usermobile'},
      {title: '负责人', dataIndex: 'manager.username'},
      {title: '创建时间', render: (text, record) => {
        return time(record.createdtime + record.timezone)
      }},
      {title: '操作', render: (text, record) => {
        return (<span>
          <Link to={'/app/projects/bd/edit/' + record.id}>
            <Button size="small" style={{marginRight: 4}}>编辑</Button>
          </Link>
          <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(this, record.id)}>
            <Button size="small" type="danger">删除</Button>
          </Popconfirm>
        </span>)
      }},
      {title: 'Comments', render: (text, record) => {
        const latestComment = record.BDComments && record.BDComments[0]
        const comments = latestComment ? latestComment.comments : ''
        return (<div>
          <p style={{maxWidth: 250,overflow: 'hidden',whiteSpace: 'nowrap',textOverflow: 'ellipsis'}}>{comments}</p>
          <a href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record.id)}>查看/添加</a>
        </div>)
      }},
    ]

    return (
      <MainLayout location={this.props.location}>
        <PageTitle title="项目BD" actionLink="/app/projects/bd/add" actionTitle={'添加项目BD'} />

        <ProjectBDFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '16px' }} className="clearfix">
          <Search2 defaultValue={search} placeholder={'项目名称'} style={{ width: 200, float: 'left' }} onSearch={this.handleSearch} />
        </div>
        <Table
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

        <Modal title="Comments" visible={this.state.visible} footer={null} onCancel={this.handleCloseModal} maskClosable={false}>
          <BDComments
            comments={this.state.comments}
            newComment={this.state.newComment}
            onChange={this.handleChangeComment}
            onAdd={this.handleAddComment}
            onDelete={this.handleDeleteComment} />
        </Modal>
      </MainLayout>
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
        <Button onClick={onAdd} type="primary" disabled={newComment == ''}>添加</Button>
      </div>
      <div>
        {comments.length ? comments.map(comment => (
          <div key={comment.id} style={{marginBottom:8}}>
            <p>
              <span style={{marginRight: 8}}>{time(comment.createdtime + comment.timezone)}</span>
              <Popconfirm title="确定删除吗？" onConfirm={onDelete.bind(this, comment.id)}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            </p>
            <p>{comment.comments}</p>
          </div>
        )) : <p>暂无评论</p>}
      </div>
    </div>
  )
}
