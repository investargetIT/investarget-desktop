import React from 'react'
import { Link } from 'dva/router'
import { Table, Pagination } from 'antd'


const columns = [
  {
    title: '图片',
    key: 'image',
    render: (text, record) => {
      const industry = record.proj.industries && record.proj.industries[0]
      const imgUrl = industry ? industry.url : 'defaultUrl'
      return (
        <img src={imgUrl} style={{width: '80px', height: '50px'}} />
      )
    }
  },
  {
    title: '名称',
    key: 'title',
    render: (text, record) => {
      return (
        <Link to={'/app/projects/' + record.proj.id}>{record.proj.projtitle}</Link>
      )
    }
  },
  {
    title: '国家',
    key: 'country',
    render: (text, record) => {
      const country = record.proj.country
      const countryName = country ? country.country : ''
      const imgUrl = country ? ('https://o79atf82v.qnssl.com/' + country.key) : ''
      return (
        <span><img src={imgUrl} style={{width: '20px', height: '14px'}} />{countryName}</span>
      )
    }
  },
  {
    title: '交易规模',
    key: 'transactionAmount',
    render: (text, record) => {
      const transactionAmount = record.proj.transactionAmount
      return transactionAmount || 'N/A'
    }
  },
  {
    title: '当前状态',
    key: 'projstatus',
    render: (text, record) => {
      const status = record.proj.projstatus
      const statusName = status ? status.name : ''
      return statusName
    }
  }
]


class FavoriteProjectList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { page, pageSize, total, list, loading, onPageChange, onPageSizeChange } = this.props

    return (
      <div>
        <Table
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />
        <Pagination
          className="ant-table-pagination"
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={onPageChange}
          showSizeChanger
          onShowSizeChange={onPageSizeChange}
          showQuickJumper
        />
      </div>
    )
  }
}

export default FavoriteProjectList
