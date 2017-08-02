import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'
import { Input, Icon, Table, Button, Pagination, Popconfirm } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import {
  RadioTrueOrFalse,
  CheckboxCurrencyType,
} from '../components/ExtraInput'
import { queryDataRoom, getUserBase, getProjLangDetail } from '../api'
import * as api from '../api'
import { Search2 } from '../components/Search'


class DataRoomList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

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
    this.setState({ search, page: 1 }, this.getDataRoomList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getDataRoomList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getDataRoomList)
  }

  getDataRoomList = () => {
    const { search, page, pageSize } = this.state
    const params = { search, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.queryDataRoom(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }


  deleteDataRoom = (id) => {
    // TODO
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('DataRooomList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('DataRooomList')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getDataRoomList()
  }

  render() {
    const { location } = this.props
    const { total, list, loading, search, page, pageSize } = this.state

    const columns = [
      { title: '项目', key: 'project', dataIndex: 'proj.projtitle' },
      { title: '投资人', key: 'investor', dataIndex: 'investor.username' },
      { title: '交易师', key: 'trader', dataIndex: 'trader.username' },
      { title: '项目方', key: 'user', dataIndex: 'proj.supportUser.username' },
      { title: '创建时间', key: 'createdtime', dataIndex: 'createdtime' },
      { title: '状态', key: 'isclose', render: record => record.isClose ? '已关闭' : '未关闭' },
      { title: '操作', key: 'action', render: (text, record) => (
          <span>
            <Button size="small">关闭</Button>
            &nbsp;
            <Link to={`/app/dataroom/detail?id=${record.id}&projectID=${record.proj.id}`}>
              <Button size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to="">
              <Button size="small" >{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.deleteDataRoom.bind(this, record.id)}>
              <Button type="danger" size="small">{i18n("delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title="Data Room" />

          <div style={{marginBottom: '16px'}}>
            <Search2 style={{width: 200}} placeholder="" defaultValue={search} onSearch={this.handleSearch} />
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

export default connect()(DataRoomList)
