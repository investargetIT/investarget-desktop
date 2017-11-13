import React from 'react'
import { connect } from 'dva'
import { Input, Table, Pagination, Button, message } from 'antd'
import { Search } from '../components/Search'
import LeftRightLayout from '../components/LeftRightLayout'

import { hasPerm, isLogin, getCurrentUser } from '../utils/util'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }

const columns = [
  { title: '投资人', key: 'investor', dataIndex: 'username' },
  { title: '所属机构', key: 'org', dataIndex: 'org.orgname' },
  { title: '职位', key: 'title', dataIndex: 'title.name' },
  { title: '电话', key: 'mobile', dataIndex: 'mobile' },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
]


class RecommendProject extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projId: Number(this.props.params.id),
      projTitle: '',
      search: null,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
      selectedUsers: [],
    }
  }

  handleSearchChange = (search) => {
    this.setState({ search })
  }

  handleSearch = () => {
    this.setState({ page: 1 }, this.getUser)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getUser)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getUser)
  }

  handleSelectUser = (selectedUsers) => {
    this.setState({ selectedUsers })
  }

  getProject = () => {
    const { projId } = this.state
    api.getProjLangDetail(projId).then(result => {
      const projTitle = result.data.projtitle
      this.setState({ projTitle })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  getUser = () => {
    if (hasPerm('proj.admin_addfavorite')) {
      this.getAllInvestors()
    } else if (hasPerm('usersys.as_trader')) {
      this.getMyInvestors()
    }
  }

  getAllInvestors = () => {
    this.setState({ loading: true })
    api.queryUserGroup({ type: 'investor' })
      .then(result => {
        const groups = result.data.data.map(m => m.id)
        const { search, page, pageSize } = this.state
        const params = { groups, search, page_index: page, page_size: pageSize }
        return api.getUser(params)
      })
      .then(result => {
        const { count: total, data: list } = result.data
        this.setState({ loading: false, total, list })
      })
      .catch(error => {
        this.props.dispatch({ type: 'app/findError', payload: error })
      })
  }

  getMyInvestors = () => {
    const userId = getCurrentUser()
    const { search, page, pageSize } = this.state
    this.setState({ loading: true })
    const params = { search, traderuser: userId, page_index: page, page_size: pageSize }
    api.getUserRelation(params).then(result => {
      const { count: total, data } = result.data
      const list = data.map(item => item.investoruser)
      this.setState({ loading: false, total, list })
    }).catch(error => {
      this.props.dispatch({ type: 'app/findError', payload: error })
    })
  }

  recommendProject = () => {
    const { projId, selectedUsers: userIds } = this.state

    const q = userIds.map(id => {
      const params = {
        user: id,
        projs: [projId],
        favoritetype: hasPerm('proj.admin_addfavorite') ? 2 : 3, // 有管理员推荐项目权限的全部当作后台推荐
        trader: hasPerm('proj.admin_addfavorite') ? undefined : isLogin() && isLogin().id, // 后台推荐不需要交易师
      }
      return api.favoriteProj(params)
    })
    Promise.all(q).then(results => {
      message.success('推荐成功', 2)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    this.getProject()
    this.getUser()
  }

  render() {
    const { search, page, pageSize, total, list, loading, selectedUsers, projTitle } = this.state

    const rowSelection= {
      selectedRowKeys: selectedUsers,
      onChange: this.handleSelectUser,
    }

    return (
      <LeftRightLayout location={this.props.location} title="推荐项目">
        <div>
          <h3 style={{lineHeight: 2, marginBottom: '24px'}}>项目名称：{projTitle}</h3>

          <div>
            <Search value={search} onChange={this.handleSearchChange} onSearch={this.handleSearch} />
            <Table
              style={tableStyle}
              rowSelection={rowSelection}
              columns={columns}
              dataSource={list}
              loading={loading}
              rowKey={record => record.id}
              pagination={false} />
            <Pagination
              style={paginationStyle}
              total={total}
              current={page}
              pageSize={pageSize}
              onChange={this.handlePageChange}
              showSizeChanger
              onShowSizeChange={this.handlePageSizeChange}
              showQuickJumper />
            <div>
              <Button type="primary" disabled={selectedUsers.length == 0} onClick={this.recommendProject}>推荐</Button>
            </div>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}


export default connect()(RecommendProject)
