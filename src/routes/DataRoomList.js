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
const Search = Input.Search






class DataRoomList extends React.Component {

  constructor(props) {
    super(props)
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
      { title: '项目', key: '', dataIndex: '' },
      { title: '投资人', key: '', dataIndex: '' },
      { title: '交易师', key: '', dataIndex: '' },
      { title: '项目方', key: '', dataIndex: '' },
      { title: '创建时间', key: '', dataIndex: '' },
      { title: '状态', key: '', dataIndex: '' },
      { title: '操作', key: 'action', render: (text, record) => (
          <span>
            <Button size="small">关闭</Button>
            <Link to={'/app/dataroom/detail'}>
              <Button disabled={!record.action.get} size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to="">
              <Button disabled={!record.action.change} size="small" >{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(null, record.id)}>
              <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
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


function mapStateToProps(state) {
  return { ...state.dataRoomList, loading: state.loading.effects['dataRoomList/get'] }
}

export default connect(mapStateToProps)(DataRoomList)
