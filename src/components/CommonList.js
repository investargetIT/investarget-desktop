import React from 'react'
import { Table, Pagination, Button, Input, Modal } from 'antd'
import { showError } from '../utils/util'


const filterStyle = { marginBottom: '16px', textAlign: 'center' }
const searchStyle = {width: 200, marginBottom: '16px'}
const tableStyle = {marginBottom: '24px'}
const paginationStyle = {marginBottom: '24px', textAlign: 'center'}





class CommonList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      filters: {},
      search: null,
      sorters: {},
      page: 1,
      pageSize: 10,
      total: 20,
      list: [],
      loading: false,
      _params: {},
    }
  }

  handleFilterChange = (key, value) => {
    let filters = { ...this.state.filters, [key]: value }
    this.setState({ filters })
  }

  handleFilt = () => {
    let { _params, filters } = this.state
    _params = { ..._params, ...filters }
    this.setState({ _params, page: 1 }, this.getData)
  }

  handleReset = () => {
    this.setState({ filters: {}, page: 1, _params: {} }, this.getData)
  }

  handleSearchChange = (e) =>  {
    this.setState({ search: e.target.value })
  }

  handleSearch = () => {
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.getData)
  }

  handlePageChange = (page, pageSize) => {
    this.setState({ page }, this.getData)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ page: 1, pageSize }, this.getData)
  }

  getData = () => {
    const { _params, page, pageSize } = this.state
    const params = { ..._params, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    this.props.getData(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  componentDidMount() {
    this.getData()
  }

  render() {

    const { columns, hasFilters, filterOptions, hasSearch } = this.props
    const { loading, total, list, page, pageSize, filters, search } = this.state

    return (
      <div>
        {
          hasFilters ? (
            <div>
              {filterOptions.map(item => {
                const FilterItem = item.component
                return <FilterItem key={item.key} value={filters[item.key]} onChange={this.handleFilterChange.bind(this, [item.key])} />
              })}
              <div style={filterStyle}>
                <Button type="primary" icon="search" onClick={this.handleFilt}>过滤</Button>
                <Button style={{ marginLeft: 10 }} onClick={this.handleReset}>重置</Button>
              </div>
            </div>
          ) : null
        }

        {
          hasSearch ? (
            <Input.Search
              value={search}
              onChange={this.handleSearchChange}
              onSearch={this.handleSearch}
              style={searchStyle}
            />
          ) : null
        }

        <Table
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
          style={tableStyle}
        />
        <Pagination
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handlePageChange}
          showSizeChanger
          onShowSizeChange={this.handlePageSizeChange}
          showQuickJumper
          style={paginationStyle}
        />
      </div>
    )
  }

}

export default CommonList
