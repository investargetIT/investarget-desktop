import React from 'react'
import { connect } from 'dva'
import { i18n, shwoError } from '../utils/util'
import { Link } from 'dva/router';
import { Icon, Table, Pagination } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

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
      sort: undefined,
      desc: undefined, 
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
    const { search, page, pageSize, sort, desc } = this.state
    const params = { search, proj: id, page_index: page, page_size: pageSize, sort, desc }
    this.setState({ loading: true })
    api.getEmail(params).then(result => {
      const { count: total, data: list } = result.data
      // 填充用户信息
      const q = list.map(item => {
        return api.getUserInfo(item.user).then(result => {
          return result.data
        }, error => {
          return undefined
        })
      })
      return Promise.all(q).then(results => {
        results.forEach((data, index) => {
          if (data) {
            list[index].title = data.title
            list[index].mobile = data.mobile
            list[index].userEmail = data.email;
          } else {
            list[index].username = list[index].username + '(已删除)'
          }
        })
        this.setState({ total, list, loading: false })
      })
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
    localStorage.setItem('EmailDetail', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('EmailDetail')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getUserList()
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getUserList
    );
  }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, search } = this.state

    const columns = [
      { title: i18n('email.username'), key: 'username', dataIndex: 'username', render: (text, record) => <Link to={'/app/user/' + record.user}>{text}</Link> },
      // { title: '公司', key: '', dataIndex: '' },
      { title: i18n('email.title'), key: 'title', dataIndex: 'title.name' },
      // { title: '行业', key: '', dataIndex: '' },
      { title: i18n('email.mobile'), key: 'mobile', dataIndex: 'mobile' },
      { title: i18n('email.email'), key: 'userEmail', dataIndex: 'userEmail' },
      { title: i18n('user.status'), key: 'events', sorter: true, dataIndex: 'events', render: text => i18n(text || 'email.not_read') },
    ]

    return (
      <LeftRightLayout location={location} title={i18n('email.investors')}>
        <div>

          <div style={{marginBottom: '16px'}}>
            <Search2 placeholder={i18n('email.email') + ' / ' + i18n('email.mobile')} style={{width: 200}} defaultValue={search} onSearch={this.handleSearch} />
          </div>

          <Table
            columns={columns}
            onChange={this.handleTableChange}
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
      </LeftRightLayout>
    )
  }
}

export default connect()(EmailDetail)
