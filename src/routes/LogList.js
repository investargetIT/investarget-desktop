import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n, dataToColumn } from '../utils/util'
import { UserListSearch } from '../components/Search'
import { queryLogList } from '../api'
import { Table, Pagination } from 'antd'

class LogList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      count: 0,
      data: [],
      loading: false,
      current: 1
    }
  }

  componentDidMount() {
    this.setState({loading: true})
    queryLogList(1, 10).then(data => {
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

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("log_list")}>

        <div style={{ marginBottom: '1.5em' }}>
          <UserListSearch onSearch={this.searchHandler} />
        </div>

        <Table
          columns={dataToColumn(this.state.data)}
          dataSource={this.state.data}
          loading={this.state.loading}
          rowKey={record => record.id}
          pagination={false} />

        <Pagination
          className="ant-table-pagination"
          total={this.state.count}
          current={this.state.current}
          pageSize={10}
          showSizeChanger
          showQuickJumper />

      </LeftRightLayout>
    )
  }

}

export default LogList
