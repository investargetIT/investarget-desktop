import React from 'react'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router'
import { 
  i18n, 
  getUserInfo, 
} from '../utils/util';
import { Icon, Table, Pagination } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { Search2 } from '../components/Search'
import { PAGE_SIZE_OPTIONS } from '../constants';


class EmailList extends React.Component {

  constructor(props) {
    super(props)

    // const { page } = props.location.query;

    const setting = this.readSetting()
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize : 10

    this.state = {
      search,
      page,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getEmailList)
  }

  handlePageChange = (page) => {
    // this.props.router.push(`/app/email/list?page=${page}`);
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
    const data = { filters, search, page };
    localStorage.setItem('EmailList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('EmailList')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getEmailList()
  }

  // componentWillReceiveProps(nextProps) {
  //   const { page: nextPage } = nextProps.location.query;
  //   const { page: currentPage } = this.props.location.query;
  //   if (nextPage !== currentPage) {
  //     this.setState({ page: parseInt(nextPage, 10) || 1 }, this.getEmailList);
  //   }
  // }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, search } = this.state

    const columns = [
      { title: i18n('email.project_name'), key: 'proj', render: (text, record) => {
        return <Link to={'/app/projects/' + record.proj.id}>{record.proj.Title}</Link>
      } },
      { title: i18n('email.email'), key: 'email', render: (text, record) => {
        return <Link to={'/app/email/detail/' + record.proj.id}><Icon type="mail" style={{fontSize: '16px'}} /></Link>
      } },
    ]

    return (
      <LeftRightLayout location={location} title={i18n('email.email_management')}>
        <div>

          <div style={{marginBottom: '16px'}} className="clearfix">
            <Search2 style={{width: 200,float:'right'}} placeholder={i18n('email.project_name')} defaultValue={search} onSearch={this.handleSearch} />
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
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(EmailList));
