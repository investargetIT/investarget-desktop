import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { UserListSearch } from '../components/Search'
import { queryLogList } from '../api'
import { Table, Pagination } from 'antd'
import { routerRedux } from 'dva/router'
import { URI_11 } from '../constants'
import { connect } from 'dva'

class LogList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      count: 0,
      data: [],
      loading: false,
      current: props.location.query.page ? parseInt(props.location.query.page, 10) : 1
    }
    this.pageChangeHandler = this.pageChangeHandler.bind(this)
  }

  componentDidMount() {
    this.setState({loading: true})
    queryLogList(this.state.current, 10).then(data => {
      this.setState({
        count: data.data.count,
        data: data.data.data,
        loading: false
      })
    })
  }

  searchHandler(e, a) {
    console.log(e, a)
  }

  pageChangeHandler(page) {
    this.props.dispatch(
      routerRedux.push({
        pathname: URI_11,
        query: { page },
      })
    )
    this.setState({loading: true})
    queryLogList(page, 10).then(data => {
      this.setState({
        count: data.data.count,
        current: page,
        data: data.data.data,
        loading: false
      })
    })

  }

  render () {

    const columns = [
      {
        title: "操作者",
        dataIndex: 'requestuser_name',
        key: 'requestuser_name'
      },
      {
        title: "时间",
        dataIndex: 'actiontime',
        key: 'actiontime'
      },
      {
        title: "操作对象",
        dataIndex: 'model_name',
        key: 'model_name'
      },
      {
        title: "操作",
        dataIndex: 'method',
        key: 'method'
      },
      {
        title: '操作前',
        dataIndex: 'request_before',
        key: 'request_before'
      },
      {
        title: "操作后",
        dataIndex: 'request_after',
        key: 'request_after'
      },
    ]

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("log_list")}>

        <div style={{ marginBottom: '1.5em' }}>
          <UserListSearch onSearch={this.searchHandler} />
        </div>

        <Table
          columns={columns}
          dataSource={this.state.data}
          loading={this.state.loading}
          rowKey={record => record.id}
          pagination={false} />

        <Pagination
          className="ant-table-pagination"
          total={this.state.count}
          current={this.state.current}
          pageSize={10}
          onChange={this.pageChangeHandler}
          showSizeChanger
          showQuickJumper />

      </LeftRightLayout>
    )
  }

}

export default connect()(LogList)
