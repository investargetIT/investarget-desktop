import React from 'react'
import { injectIntl, intlShape } from 'react-intl'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Icon, Table } from 'antd'
import MainLayout from '../components/MainLayout'
import { OrganizationListFilter } from '../components/Filter'


const styles = {
  title: {
    fontSize: '16px',
    marginBottom: '24px',
  },
  right: {
    float: 'right',
  }
}


function OrganizationList({ dispatch, intl, industryOptions, selectedIndustries, filter, data, loading }) {

  const { formatMessage } = intl

  const columns = [
    {
      title: formatMessage({id: 'organization.name'}),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: formatMessage({id: 'organization.industry'}),
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: formatMessage({id: 'organization.currency'}),
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: formatMessage({id: 'organization.decision_cycle'}),
      dataIndex: 'decision_cycle',
      key: 'decision_cycle',
    },
    {
      title: formatMessage({id: 'organization.transaction_phase'}),
      dataIndex: 'transaction_phase',
      key: 'transaction_phase',
    },
    {
      title: formatMessage({id: 'organization.stock_code'}),
      dataIndex: 'stock_code',
      key: 'stock_code',
    },
    {
      title: formatMessage({id: 'common.operation'}),
      key: 'operation',
      render: (text, record) => (
        <span>
          <a>修改</a>&nbsp;
          <a>删除</a>
        </span>
      )
    },
  ]


  const dataSource = data.map(item => {
    return {
      key: item.id,
      name: intl.locale === 'en-US' ? item.nameEn : item.name,
      industry: item.industry && item.industry.industryName,
      currency: item.currency,
      decision_cycle: item.decisionCycle,
      transaction_phase: item.transactionPhases.map(item => item.name).join(' '),
      stock_code: item.stockCode,

    }
  })


  function filterOnChange(type, value) {
    dispatch({
      type: 'organizationList/filterOnChange',
      payload: {
        type,
        value
      }
    })
  }

  return (
    <MainLayout location={location}>
      <div>
        <div style={styles.title}>
          <span>{intl.formatMessage({id: 'organization.org_list'})}</span>
          <span style={styles.right}>
            <Link to="/app/organization/add">
              <Icon type="plus" />{intl.formatMessage({id: 'organization.new_org'})}
            </Link>
          </span>
        </div>
        <OrganizationListFilter value={filter} onChange={filterOnChange} />
        <Table columns={columns} dataSource={dataSource} loading={loading} />
      </div>
    </MainLayout>
  )

}


function mapStateToProps(state) {

  const { isOversea, currency, transactionPhases, industries, tags, organizationTypes, data } = state.organizationList

  const filter = { isOversea, currency, transactionPhases, industries, tags, organizationTypes }

  return {
    filter,
    data,
    loading: state.loading.effects['organizationList/get'],
  }
}

OrganizationList.propTypes = {
  intl: intlShape.isRequired
}

export default connect(mapStateToProps)(injectIntl(OrganizationList))
