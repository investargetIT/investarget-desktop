import React from 'react'
import { Link } from 'dva/router'
import { i18n, showError } from '../utils/util'
import * as api from '../api'

import { Button, Popconfirm, Modal } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import CommonList from '../components/CommonList'
import {
  OverseaFilter,
  CurrencyFilter,
  TransactionPhaseFilter,
  IndustryFilter,
  TagFilter,
  OrganizationTypeFilter,
} from '../components/Filter'



class OrganizationList extends React.Component {

  constructor(props) {
    super(props)
  }

  deleteOrg = (id) => {
    api.deleteOrg(id).then(result => {
      this.orgList.getData()
    }, error => {
      showError(error.message)
    })
  }

  render() {

    const columns = [
      { title: '名称', key: 'orgname', dataIndex: 'orgname' },
      { title: '行业', key: 'industry', dataIndex: 'industry.industry' },
      { title: '货币类型', key: 'currency', dataIndex: 'currency.currency' },
      { title: '决策周期（天）', key: 'decisionCycle', dataIndex: 'decisionCycle' },
      { title: '轮次', key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return phases.map(p => p.name).join(' ')
      } },
      { title: '股票代码', key: 'orgcode', dataIndex: 'orgcode' },
      { title: '操作', key: 'action', render: (text, record) => (
          <span>
            <Link to={'/app/organization/' + record.id}>
              <Button disabled={!record.action.get} size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <Link to={'/app/organization/edit/' + record.id}>
              <Button disabled={!record.action.change} size="small" >{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.deleteOrg.bind(null, record.id)}>
              <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]

    const filterOptions = [
      { title: '是否投资海外', key: 'isOversea', component: OverseaFilter },
      { title: '货币', key: 'currencys', component: CurrencyFilter },
      { title: '轮次', key: 'orgtransactionphases', component: TransactionPhaseFilter },
      { title: '行业', key: 'industries', component: IndustryFilter },
      { title: '标签', key: 'tags', component: TagFilter },
      { title: '机构类型', key: 'orgtypes', component: OrganizationTypeFilter },
    ]

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title={i18n('organization.org_list')} actionLink="/app/organization/add" actionTitle={i18n('organization.new_org')} />
          <CommonList columns={columns} hasFilters={true} filterOptions={filterOptions} hasSearch={true} getData={api.getOrg} />
        </div>
      </MainLayout>
    )

  }

}

export default OrganizationList
