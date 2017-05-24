import React from 'react'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Icon, Table, Button, Pagination } from 'antd'
import MainLayout from '../components/MainLayout'
import { OrganizationListFilter } from '../components/Filter'
import Search from '../components/Search'
import { dataToColumn } from '../utils/util'

const styles = {
  title: {
    fontSize: '16px',
    marginBottom: '24px',
  },
  right: {
    float: 'right',
  }
}


function OrganizationList({ dispatch, intl, industryOptions, selectedIndustries, filter, total, page, pageSize, data, loading }) {

  const { formatMessage } = intl

  function filterOnChange(type, value) {
    dispatch({
      type: 'organizationList/filterOnChange',
      payload: {
        type,
        value
      }
    })
  }

  function filtHandler() {
    dispatch({
      type: 'organizationList/get'
    })
  }

  function resetHandler() {
    dispatch({
      type: 'organizationList/reset'
    })
  }


  function onShowSizeChange(current, pageSize) {
    dispatch({
      type: 'organizationList/changePageSize',
      payload: pageSize
    })
  }
  function onPageChange(page, pageSize) {
    dispatch({
      type: 'organizationList/changePage',
      payload: page
    })
  }

  const searchKeys = [
    { value: 'name', label: <FormattedMessage id="organization.name" /> },
    { value: 'stockCode', label: <FormattedMessage id="organization.stock_code" /> }
  ]

  function searchOnChange(key, value) {
    if (key == 'stockCode') {
      value = parseInt(value, 10)
    }
    dispatch({
      type: 'organizationList/searchChange',
      payload: { key, value }
    })
  }

  function onSearch(key, value) {
    dispatch({
      type: 'organizationList/get',
    })
  }

  function operationHandler(action, id) {
    console.log(action, id)
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
        <OrganizationListFilter value={filter} onChange={filterOnChange} onSearch={filtHandler} onReset={resetHandler} />
        <div style={{marginBottom: '16px'}}>
          <Search keys={searchKeys} onChange={searchOnChange} onSearch={onSearch}/>
        </div>
        <Table
          columns={dataToColumn(data, operationHandler)}
          dataSource={data}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false} />
        <Pagination
          className="ant-table-pagination"
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={onPageChange}
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          showQuickJumper
        />
      </div>
    </MainLayout>
  )

}


function mapStateToProps(state) {

  const { isOversea, currency, transactionPhases, industries, tags, organizationTypes, data, page, total, pageSize } = state.organizationList

  const filter = { isOversea, currency, transactionPhases, industries, tags, organizationTypes }

  return {
    total,
    page,
    pageSize,
    filter,
    data,
    loading: state.loading.effects['organizationList/get'],
  }
}

OrganizationList.propTypes = {
  intl: intlShape.isRequired
}

export default connect(mapStateToProps)(injectIntl(OrganizationList))
