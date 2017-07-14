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






class EmailDetail extends React.Component {

  constructor(props) {
    super(props)
  }

  handleDelete = (id) => {
    this.props.dispatch({ type: 'emailDetail/delete', payload: id })
  }


  handleFilterChange = (key, value) => {
    this.props.dispatch({ type: 'emailDetail/setFilter', payload: { [key]: value } })
  }

  handleFilt = () => {
    this.props.dispatch({ type: 'emailDetail/filt' })
  }

  handleReset = () => {
    this.props.dispatch({ type: 'emailDetail/reset' })
  }

  handleSearchChange = (e) => {
    const search = e.target.value
    this.props.dispatch({ type: 'emailDetail/setField', payload: { search } })
  }

  handleSearch = (search) => {
    this.props.dispatch({ type: 'emailDetail/search' })
  }

  handlePageChange = (page, pageSize) => {
    this.props.dispatch({ type: 'emailDetail/changePage', payload: page })
  }

  handleShowSizeChange = (current, pageSize) => {
    this.props.dispatch({ type: 'emailDetail/changePageSize', payload: pageSize })
  }

  render() {
    const { location, total, list, loading, page, pageSize, filter, search } = this.props

    const columns = [
      { title: '姓名', key: '', dataIndex: '' },
      { title: '公司', key: '', dataIndex: '' },
      { title: '职位', key: '', dataIndex: '' },
      { title: '行业', key: '', dataIndex: '' },
      { title: '手机号码', key: '', dataIndex: '' },
      { title: '邮箱', key: '', dataIndex: '' },
      { title: '未读/已读', key: '', dataIndex: '' },
    ]

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title="邮件管理" />

          <div style={{marginBottom: '16px'}}>
            <Search value={search} onChange={this.handleSearchChange} placeholder="邮箱或电话" style={{width: 200}} onSearch={this.handleSearch} />
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
  return { ...state.emailDetail, loading: state.loading.effects['emailDetail/get'] }
}

export default connect(mapStateToProps)(EmailDetail)
