import React from 'react'
import { Link } from 'dva/router'
import { Table, Pagination } from 'antd'
import { i18n, formatMoney, isShowCNY } from '../utils/util'
import { connect } from 'dva';

class FavoriteProjectList extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'country' });
  }

  render() {
    const { page, pageSize, total, list, loading, onPageChange, onPageSizeChange } = this.props

    const columns = [
      {
        title: i18n('project.image'),
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
        title: i18n('project.name'),
        key: 'title',
        render: (text, record) => {
          return (
            <Link to={'/app/projects/' + record.proj.id}>{record.proj.projtitle}</Link>
          )
        }
      },
      {
        title: i18n('project.country'),
        key: 'country',
        render: (text, record) => {
          const country = record.proj.country
          const countryName = country ? country.country : ''
          const imgUrl = country ? country.url : ''
          return (
            <span><img src={imgUrl} style={{width: '20px', height: '14px'}} />{countryName}</span>
          )
        }
      },
      {
        title: i18n('project.transaction_size'),
        key: 'transactionAmount',
        render: (text, record) => {
          if (isShowCNY(record.proj, this.props.country)) {
            return record.proj.financeAmount ? formatMoney(record.proj.financeAmount, 'CNY') : 'N/A'
          } else {
            return record.proj.financeAmount_USD ? formatMoney(record.proj.financeAmount_USD) : 'N/A'
          }
        }
      },
      {
        title: i18n('project.current_status'),
        key: 'projstatus',
        render: (text, record) => {
          const status = record.proj.projstatus
          const statusName = status ? status.name : ''
          return statusName
        }
      }
    ]

    if (this.props.showInvestor) {
      columns.push({
        title: i18n('account.investor'),
        key: 'investor',
        render: (text, record) => {
          if (record.user) {
            let { id, username } = record.user
            return <Link to={'/app/user/' + id}>{username}</Link>
          } else {
            return null
          }
        }
      })
    }

    if (this.props.showTrader) {
      columns.push({
        title: i18n('account.trader'),
        key: 'trader',
        render: (text, record) => {
          if (record.trader) {
            let { id, username } = record.trader
            return <Link to={'/app/user/' + id}>{username}</Link>
          } else {
            return null
          }
        }
      })
    }

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

function mapStateToProps(state) {
  const { country } = state.app
  return { country }
}

export default connect(mapStateToProps)(FavoriteProjectList);
