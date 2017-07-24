import React from 'react'
import * as api from '../api'
import { formatMoney } from '../utils/util'

import { Row, Col } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import OrganizationRemarkList from '../components/OrganizationRemarkList'


const detailStyle = { marginBottom: '24px' }

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
}

const Field = (props) => {
  return (
    <Row style={rowStyle}>
      <Col span={6}>{props.title}</Col>
      <Col span={18}>{props.value}</Col>
    </Row>
  )
}

const currencyMap = {'1': 'CNY', '2': 'USD', '3': 'CNY'}


class OrganizationDetail extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      orgname: null,
      orgtype: null,
      industry: null,
      orgtransactionphase: [],
      orgstatus: null,
      orgcode: null,
      investoverseasproject: null,
      currency: null,
      transactionAmountF: 'N/A',
      transactionAmountF_USD: 'N/A',
      transactionAmountT: 'N/A',
      transactionAmountT_USD: 'N/A',
      fundSize: 'N/A',
      fundSize_USD: 'N/A',
      companyEmail: null,
      webSite: null,
      mobileAreaCode: null,
      mobile: null,
      weChat: null,
      address: null,
      description: null,
      typicalCase: null,
      partnerOrInvestmentCommiterMember: null,
      decisionCycle: null,
      decisionMakingProcess: null,
    }
  }

  componentDidMount() {
    const id = this.props.params.id
    api.getOrgDetail(id, { lang: window.LANG }).then(result => {
      let data = { ...result.data }
      data.currency = data.currency && data.currency.currency
      data.industry = data.industry && data.industry.industry
      data.orgstatus = data.orgstatus && data.orgstatus.name
      data.orgtransactionphase = data.orgtransactionphase ? data.orgtransactionphase.map(item => item.name).join('/') : []
      data.orgtype = data.orgtype && data.orgtype.name
      data.investoverseasproject = data.investoverseasproject ? '是' : '否'
      data.mobile = (data.mobile && data.mobileAreaCode) ? ('+' + data.mobileAreaCode + '-' + data.mobile) : ''

      let currency = currencyMap[data.currency.id]
      data.transactionAmountF = data.transactionAmountF ? formatMoney(data.transactionAmountF, currency) : 'N/A'
      data.transactionAmountF_USD = data.transactionAmountF_USD ? formatMoney(data.transactionAmountF_USD, 'USD') : 'N/A'
      data.transactionAmountT = data.transactionAmountT ? formatMoney(data.transactionAmountT, currency) : 'N/A'
      data.transactionAmountT_USD = data.transactionAmountT_USD ? formatMoney(data.transactionAmountT_USD, 'USD') : 'N/A'
      data.fundSize = data.fundSize ? formatMoney(data.fundSize, currency) : 'N/A'
      data.fundSize_USD = data.fundSize_USD ? formatMoney(data.fundSize_USD, 'USD') : 'N/A'


      console.log(data)
      this.setState(data)
    }, error => {
      console.error(error)
    })
  }

  render() {
    const id = this.props.params.id
    return (
      <MainLayout location={this.props.location}>
        <PageTitle title="机构详情（投资人名单）" />
        <div style={detailStyle}>
          <Field title="名称" value={this.state.orgname} />
          <Field title="机构类型" value={this.state.orgtype} />
          <Field title="货币类型" value={this.state.currency} />
          <Field title="行业" value={this.state.industry} />
          <Field title="交易范围起" value={this.state.transactionAmountF + ' / ' + this.state.transactionAmountF_USD} />
          <Field title="交易范围至" value={this.state.transactionAmountT + ' / ' + this.state.transactionAmountT_USD} />
          <Field title="基金规模" value={this.state.fundSize + ' / ' + this.state.fundSize_USD} />
          <Field title="决策周期（天）" value={this.state.decisionCycle} />
          <Field title="公司邮箱" value={this.state.companyEmail} />
          <Field title="公司官网" value={this.state.webSite} />
          <Field title="电话" value={this.state.mobile} />
          <Field title="微信公众号" value={this.state.weChat} />
          <Field title="轮次" value={this.state.orgtransactionphase} />
          <Field title="审核状态" value={this.state.orgstatus} />
          <Field title="股票代码" value={this.state.orgcode} />
          <Field title="是否投海外项目" value={this.state.investoverseasproject} />
          <Field title="地址" value={this.state.address} />
          <Field title="描述" value={this.state.description} />
          <Field title="典型投资案例" value={this.state.typicalCase} />
          <Field title="合伙人/投委会成员" value={this.state.partnerOrInvestmentCommiterMember} />
          <Field title="决策流程" value={this.state.decisionMakingProcess} />
        </div>

        <OrganizationRemarkList orgId={id} readOnly />
      </MainLayout>
    )
  }
}

export default OrganizationDetail
