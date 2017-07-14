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






class EmailList extends React.Component {

  constructor(props) {
    super(props)
  }

  handleDelete = (id) => {
    this.props.dispatch({ type: 'emailList/delete', payload: id })
  }


  handleFilterChange = (key, value) => {
    this.props.dispatch({ type: 'emailList/setFilter', payload: { [key]: value } })
  }

  handleFilt = () => {
    this.props.dispatch({ type: 'emailList/filt' })
  }

  handleReset = () => {
    this.props.dispatch({ type: 'emailList/reset' })
  }

  handleSearchChange = (e) => {
    const search = e.target.value
    this.props.dispatch({ type: 'emailList/setField', payload: { search } })
  }

  handleSearch = (search) => {
    this.props.dispatch({ type: 'emailList/search' })
  }

  handlePageChange = (page, pageSize) => {
    this.props.dispatch({ type: 'emailList/changePage', payload: page })
  }

  handleShowSizeChange = (current, pageSize) => {
    this.props.dispatch({ type: 'emailList/changePageSize', payload: pageSize })
  }

  render() {
    const { location, total, list, loading, page, pageSize, filter, search } = this.props

    const columns = [
      { title: '项目名称', key: '', dataIndex: '' },
      { title: '邮箱', key: '', render: (text, record) => {
        return <Link to="/app/email/detail"><Icon type="mail" style={{fontSize: '16px'}} /></Link>
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
            onShowSizeChange={this.handleShowSizeChange}
            showQuickJumper
          />
        </div>
      </MainLayout>
    )
  }

}


function mapStateToProps(state) {
  return { ...state.emailList, loading: state.loading.effects['emailList/get'] }
}

export default connect(mapStateToProps)(EmailList)
