import React from 'react'
import { Button, Input, Table as _Table, Pagination as _Pagination } from 'antd'


function Filters(props) {

  const filterStyle = { marginBottom: '16px', textAlign: 'center' }

  function handleChange(itemKey, itemValue) {
    const value = { ...props.value, [itemKey]: itemValue }
    props.onChange(value)
  }

  return (
    <div>
      {
        props.options.map(item => {
          const FilterItem = item.component
          return <FilterItem key={item.key} value={props.value[item.key]} onChange={handleChange.bind(null, item.key)} />
        })
      }
      <div style={filterStyle}>
        <Button type="primary" icon="search" onClick={props.onFilt}>过滤</Button>
        <Button style={{ marginLeft: 10 }} onClick={props.onReset}>重置</Button>
      </div>
    </div>
  )

}

function Search(props) {

  const searchStyle = { width: 200, marginBottom: '16px' }

  function handleChange(e) {
    props.onChange(e.target.value)
  }

  return (
    <div>
      <Input.Search
        value={props.value}
        onChange={handleChange}
        onSearch={props.onSearch}
        style={searchStyle}
      />
    </div>
  )
}

function Table(props) {

  const { columns, dataSource, rowKey, loading, pagination, style, ...extraProps } = props
  const tableStyle = { marginBottom: '24px' }
  return (
    <_Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      loading={loading}
      pagination={false}
      style={tableStyle}
      {...extraProps}
    />
  )
}

function Pagination(props) {

  const { total, current, pageSize, onChange, showSizeChanger, onShowSizeChange, showQuickJumper, style, ...extraProps } = props
  const paginationStyle = { marginBottom: '24px', textAlign: 'center' }

  return (
    <_Pagination
      total={total}
      current={current}
      pageSize={pageSize}
      onChange={onChange}
      showSizeChanger
      onShowSizeChange={onShowSizeChange}
      showQuickJumper
      style={paginationStyle}
      {...extraProps}
    />
  )
}

export {
  Filters,
  Search,
  Table,
  Pagination,
}
