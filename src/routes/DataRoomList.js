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

const Search = Input.Search

class DataRoomList extends React.Component {

  constructor(props) {
    super(props)
     this.state = {
       dataRoomList: []
     }
  }

  componentDidMount() {
    queryDataRoom().then(data => {
      const dataRoomListRawData = data.data.data.filter(f => f.investor && f.trader)
      dataRoomListRawData.map(m => {
        const obj = {}
        obj.id = m.id
        obj.createdtime = m.createdtime
        Promise.all([
          getProjLangDetail(m.proj),
          getUserBase(m.investor),
          getUserBase(m.trader),
        ]).then(data => {
          obj.proj = data[0].data.projtitle
          obj.user = data[0].data.supportUser.username
          obj.investor = data[1].data.username
          obj.trader = data[2].data.username
          this.setState({
            dataRoomList: this.state.dataRoomList.concat(obj)
          })
        })
        return obj
      })
    })
  }

  handleDelete = (id) => {
    this.props.dispatch({ type: 'dataRoomList/delete', payload: id })
  }


  handleFilterChange = (key, value) => {
    this.props.dispatch({ type: 'dataRoomList/setFilter', payload: { [key]: value } })
  }

  handleFilt = () => {
    this.props.dispatch({ type: 'dataRoomList/filt' })
  }

  handleReset = () => {
    this.props.dispatch({ type: 'dataRoomList/reset' })
  }

  handleSearchChange = (e) => {
    const search = e.target.value
    this.props.dispatch({ type: 'dataRoomList/setField', payload: { search } })
  }

  handleSearch = (search) => {
    this.props.dispatch({ type: 'dataRoomList/search' })
  }

  handlePageChange = (page, pageSize) => {
    this.props.dispatch({ type: 'dataRoomList/changePage', payload: page })
  }

  handleShowSizeChange = (current, pageSize) => {
    this.props.dispatch({ type: 'dataRoomList/changePageSize', payload: pageSize })
  }

  render() {
    const { location, total, list, loading, page, pageSize, filter, search } = this.props

    const columns = [
      { title: '项目', key: 'project', dataIndex: 'proj' },
      { title: '投资人', key: 'investor', dataIndex: 'investor' },
      { title: '交易师', key: 'trader', dataIndex: 'trader' },
      { title: '项目方', key: 'user', dataIndex: 'user' },
      { title: '创建时间', key: 'createdtime', dataIndex: 'createdtime' },
      { title: '状态', key: 'isclose', render: record => record.isClose ? '已关闭' : '未关闭' },
      { title: '操作', key: 'action', render: (text, record) => (
          <span>
            <Button size="small">关闭</Button>
            &nbsp;
            <Link to={'/app/dataroom/detail'}>
              <Button size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to="">
              <Button size="small" >{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(null, record.id)}>
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
            <Search value={search} onChange={this.handleSearchChange} style={{width: 200}} onSearch={this.handleSearch} />
          </div>

          <Table
            columns={columns}
            dataSource={this.state.dataRoomList}
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


function mapStateToProps(state) {
  return { ...state.dataRoomList, loading: state.loading.effects['dataRoomList/get'] }
}

export default connect(mapStateToProps)(DataRoomList)
