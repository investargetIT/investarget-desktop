import React from 'react'
import { i18n, shwoError } from '../utils/util'

import { Icon, Table, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { Search2 } from '../components/Search'


class EmailDetail extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize : 10

    this.state = {
      search,
      page,
      pageSize,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleSearch = (search) => {

    this.setState({ search, page: 1 }, this.getUserList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getUserList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getUserList)
  }

  getUserList = () => {
    const id = Number(this.props.params.id)
    const { search, page, pageSize } = this.state
    const params = { search, id, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getEmail(params).then(result => {
      const { count: total, data: list } = result.data
      // 填充用户信息
      const q = list.map(item => {
        return api.getUserDetailLang(item.user).then(result => result.data)
      })
      Promise.all(q).then(results => {
        results.forEach((data, index) => {
          list[index].title = data.title
          list[index].mobile = data.mobile
        })
        this.setState({ total, list, loading: false })
      }, error => {
        showError(error.message)
      })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
    this.writeSetting()
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('EmailDetail', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('EmailDetail')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getUserList()
  }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, search } = this.state

    const columns = [
      { title: '姓名', key: 'username', dataIndex: 'username' },
      // { title: '公司', key: '', dataIndex: '' },
      { title: '职位', key: 'title', dataIndex: 'title.name' },
      // { title: '行业', key: '', dataIndex: '' },
      { title: '手机号码', key: 'mobile', dataIndex: 'mobile' },
      { title: '邮箱', key: 'userEmail', dataIndex: 'userEmail' },
      { title: '未读/已读', key: 'isRead', render: (text, record) => {
        return <Icon type={record.isRead ? 'check' : 'close'} />
      } },
    ]

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title="邮件管理" />

          <div style={{marginBottom: '16px'}}>
            <Search2 placeholder="邮箱、电话" style={{width: 200}} defaultValue={search} onSearch={this.handleSearch} />
          </div>

          <Table
            columns={columns}
            dataSource={list}
            rowKey={record=>record.id}
            loading={loading}
            pagination={false} />

          <Pagination
            className="ant-table-pagination"
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handleShowSizeChange}
            showQuickJumper
          />
        </div>
      </MainLayout>
    )
  }
}

export default EmailDetail
