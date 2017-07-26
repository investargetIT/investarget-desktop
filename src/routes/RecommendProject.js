import React from 'react'
import { Input, Table, Pagination, Button, message } from 'antd'
import { Search } from '../components/Search'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }

const columns = [
  { title: '投资人', key: 'investor', dataIndex: 'username' },
  { title: '所属机构', key: 'org', dataIndex: 'org.orgname' },
  { title: '职位', key: 'title', dataIndex: 'title.name' },
  { title: '电话', key: 'mobile', dataIndex: 'mobile' },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
]

const userInfo = JSON.parse(localStorage.getItem('user_info'))
const userId = userInfo ? userInfo.id : null
const groupId = userInfo && userInfo.groups.length > 0 ? userInfo.groups[0].id : null


class RecommendProject extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projId: Number(this.props.params.id),
      projTitle: '',
      search: null,
      page: 0,
      pageSize: 10,
      _param: {},
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
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.getUser)
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
    })
  }

  getUser = () => {
    // 交易师 自己的投资人，管理员 所有投资人
    if (groupId == 2) {
      this.setState({ loading: true })
      api.getUserRelation({ traderuser: userId }).then(result => {
        const total = result.data.count
        const data = result.data.data
        const list = data.map(item => item.investoruser)
        this.setState({ loading: false, total, list })
      })
    } else if (groupId == 3) {
      this.setState({ loading: true })
      api.getUser({ groups: [1] }).then(result => {
        const total = result.data.count
        const list = result.data.data
        this.setState({ loading: false, total, list })
      })
    }
  }

  recommendProject = () => {
    const { projId, selectedUsers: userIds } = this.state

    const q = userIds.map(id => {

      const params = groupId == 2 ? {
        'favoritetype': 3,
        'projs': [projId],
        'user': id,
        'trader': userId,
      } : {
        'favoritetype': 2,
        'projs': [projId],
        'user': id,
      }
      return api.favoriteProj(params)
    })
    Promise.all(q).then(results => {
      message.success('推荐成功', 2)
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
      <MainLayout location={location}>
        <PageTitle title="推荐项目" />
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
      </MainLayout>
    )
  }
}


export default RecommendProject
