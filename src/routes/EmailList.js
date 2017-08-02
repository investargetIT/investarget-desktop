import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'

import { Icon, Table, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { Search2 } from '../components/Search'


class EmailList extends React.Component {

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
    this.setState({ search, page: 1 }, this.getEmailList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getEmailList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getEmailList)
  }

  getEmailList = () => {
    const { search, page, pageSize } = this.state
    const params = { title: search, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getEmailList(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('EmailList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('EmailList')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getEmailList()
  }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, search } = this.state

    const columns = [
      { title: '项目名称', key: 'proj', render: (text, record) => {
        return <Link target="_blank" to={'/app/projects/' + record.proj.id}>{record.proj.Title}</Link>
      } },
      { title: '邮箱', key: 'email', render: (text, record) => {
        return <Link target="_blank" to={'/app/email/detail/' + record.proj.id}><Icon type="mail" style={{fontSize: '16px'}} /></Link>
      } },
    ]

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title="邮件管理" />

          <div style={{marginBottom: '16px'}}>
            <Search2 style={{width: 200}} placeholder="项目名称" defaultValue={search} onSearch={this.handleSearch} />
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
            onShowSizeChange={this.handlePageSizeChange}
            showQuickJumper
          />
        </div>
      </MainLayout>
    )
  }
}

export default connect()(EmailList)
