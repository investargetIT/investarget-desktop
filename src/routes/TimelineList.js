import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'

import { Input, Icon, Table, Button, Pagination, Popconfirm } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { TimelineListFilter } from '../components/Filter'
import {
  RadioTrueOrFalse,
  CheckboxCurrencyType,
} from '../components/ExtraInput'
const Search = Input.Search


class TimelineList extends React.Component {
  constructor(props) {
    super(props)
  }

  handleDelete = (id) => {
    this.props.dispatch({ type: 'timelineList/delete', payload: id })
  }


  handleFilterChange = (key, value) => {
    this.props.dispatch({ type: 'timelineList/setFilter', payload: { [key]: value } })
  }

  handleFilt = () => {
    this.props.dispatch({ type: 'timelineList/filt' })
  }

  handleReset = () => {
    this.props.dispatch({ type: 'timelineList/reset' })
  }

  handleSearchChange = (e) => {
    const search = e.target.value
    this.props.dispatch({ type: 'timelineList/setField', payload: { search } })
  }

  handleSearch = (search) => {
    this.props.dispatch({ type: 'timelineList/search' })
  }

  handlePageChange = (page, pageSize) => {
    this.props.dispatch({ type: 'timelineList/changePage', payload: page })
  }

  handleShowSizeChange = (current, pageSize) => {
    this.props.dispatch({ type: 'timelineList/changePageSize', payload: pageSize })
  }

  render() {

    const { location, total, list, loading, page, pageSize, filter, search } = this.props

    const columns = [
      { title: '项目', key: '', dataIndex: '' },
      { title: '投资人', key: '', dataIndex: '' },
      { title: '投资人所属机构', key: '', dataIndex: '' },
      { title: '项目方', key: '', dataIndex: '' },
      { title: '交易师', key: '', dataIndex: '' },
      { title: '剩余天数', key: '', dataIndex: '' },
      { title: '当前状态', key: '', dataIndex: '' },
      { title: '最新备注', key: '', dataIndex: '' },
      { title: '操作', key: 'action', render: (text, record) => (
          <span>
            <Button disabled={!record.action.close} size="small">关闭</Button>
            <Link to={'/app/timeline/' + record.id}>
              <Button disabled={!record.action.get} size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to={'/app/timeline/edit/' + record.id}>
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
          <PageTitle title="时间轴列表" />

          <TimelineListFilter value={filter} onChange={this.handleFilterChange} onSearch={this.handleFilt} onReset={this.handleReset} />

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
  return { ...state.timelineList, loading: state.loading.effects['timelineList/get'] }
}

export default connect(mapStateToProps)(TimelineList)
