import React from 'react'
import { Link } from 'dva/router'
import { i18n, showError } from '../utils/util'

import { Icon, Table, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { Search } from '../components/Search'


class EmailList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: null,
      _param: {},
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleSearchChange = (search) => {
    this.setState({ search })
  }

  handleSearch = () => {
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.getEmailList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getEmailList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getEmailList)
  }

  getEmailList = () => {
    const { _params, page, pageSize } = this.state
    const params = { ..._params, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getEmailList(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
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
            <Search value={search} onChange={this.handleSearchChange} style={{width: 200}} onSearch={this.handleSearch} />
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

export default EmailList
