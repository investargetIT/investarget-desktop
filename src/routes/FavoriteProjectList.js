import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'

import { Input, Icon, Table, Button, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'



class FavoriteProjectList extends React.Component {
  constructor(props) {
    super(props)
    console.log('>>>', props)
  }

  handlePageChange = (page, pageSize) => {
    this.props.dispatch({ type: 'favoriteProjectList/changePage', payload: page })
  }

  handleShowSizeChange = (current, pageSize) => {
    this.props.dispatch({ type: 'favoriteProjectList/changePageSize', payload: pageSize })
  }

  render() {
    const { location, total, list, loading, page, pageSize } = this.props
    const columns = [
      {
        title: '图片',
        key: 'image',
        render: (text, record) => {
          const industry = record.industries && record.industries[0]
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
          return record.projtitle
        }
      },
      {
        title: '国家',
        key: 'country',
        render: (text, record) => {
          const country = record.country
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
          const transactionAmount = record.transactionAmount
          return transactionAmount || 'N/A'
        }
      },
      {
        title: '当前状态',
        key: 'projstatus',
        render: (text, record) => {
          const status = record.projstatus
          const statusName = status ? status.name : ''
          return statusName
        }
      }
    ]

    const path = this.props.route.path
    const type = /.*\/(.*)?$/.exec(path)[1]
    const map = {
      'recommend': '推荐项目',
      'favor': '收藏项目',
      'interest': '感兴趣项目',
    }
    const title = map[type] || '平台项目'

    return (
      <MainLayout location={location}>
        <PageTitle title={title} />

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
          onChange={this.handlePageChange}
          showSizeChanger
          onShowSizeChange={this.handleShowSizeChange}
          showQuickJumper
        />

      </MainLayout>
    )
  }
}


function mapStateToProps(state) {
  return { ...state.favoriteProjectList, loading: state.loading.effects['favoriteProjectList/get'] }
}

export default connect(mapStateToProps)(FavoriteProjectList)
