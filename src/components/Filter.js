import React from 'react'
import { Row, Col } from 'antd'
import { connect } from 'dva'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { Checkbox, Select } from 'antd'
import { t } from '../utils/util'

function BasicContainer(props) {
  return (
    <Row gutter={16} style={{marginBottom: '16px'}}>
      <Col span={4} >{ props.label }</Col>
      <Col span={20} >{ props.children }</Col>
    </Row>
  )
}


function TransactionPhaseFilter(props) {
  return (
    <BasicContainer label={ t(props, "user.investment_rounds") }>
      <Checkbox.Group options={props.transactionPhaseOptions} value={props.transactionPhases} onChange={props.transactonPhaseHandler} />
    </BasicContainer>
  )
}

function mapStateToProps(state) {
  var { transactionPhases: transactionPhaseOptions } = state.app
  transactionPhaseOptions = transactionPhaseOptions.map(item => ({ label: item.name, value: item.id })) 
  return { transactionPhaseOptions }
}

TransactionPhaseFilter = connect(mapStateToProps)(injectIntl(TransactionPhaseFilter))

function TagFilter(props) {
  return (
    <BasicContainer label={ t(props, "user.tag") }>
      <Checkbox.Group options={props.tagOptions} value={props.tags} onChange={props.tagHandler} />
    </BasicContainer>
  )
}

function mapStateToPropsForTagFilter(state) {
  var { tags: tagOptions } = state.app
  tagOptions = tagOptions.map(item => ({ label: item.name, value: item.id }))
  return { tagOptions }
}

TagFilter = connect(mapStateToPropsForTagFilter)(injectIntl(TagFilter))

function CurrencyFilter(props) {
  return (
    <BasicContainer label={ t(props, "user.currency") }>
      <Checkbox.Group options={props.currencyOptions} value={props.currency} onChange={props.currencyHandler} />
    </BasicContainer>
  )
}

function mapStateToPropsForCurrencyFilter(state) {
  var { currency: currencyOptions } = state.app
  currencyOptions = currencyOptions.map(item => ({ label: item.name, value: item.id }))
  return { currencyOptions }
}

CurrencyFilter = connect(mapStateToPropsForCurrencyFilter)(injectIntl(CurrencyFilter))

function AuditFilter(props) {
  return (
    <BasicContainer label={ t(props, "user.audit_status") }>
      <Checkbox.Group options={props.auditOptions} value={props.audit} onChange={props.auditHandler} />
    </BasicContainer>
  )
}

function mapStateToPropsForAuditFilter(state) {
  var { audit: auditOptions } = state.app
  auditOptions = auditOptions.map(item => ({ label: item.name, value: item.id }))
  return { auditOptions }
}

AuditFilter = connect(mapStateToPropsForAuditFilter)(injectIntl(AuditFilter))

function AreaFilter(props) {
  return (
    <BasicContainer label={ t(props, "user.area") }>
      <Select style={{ width: '100%' }} mode = "multiple" allowClear optionFilterProp="children" onChange={props.onChange} value = {props.value} tokenSeparators={[',']}>
        { props.areaOptions.map(item => (<Select.Option key={item.value.toString()} value={item.value.toString()}>{ item.label }</Select.Option>)) }
      </Select>
    </BasicContainer>
  )
}

function mapStateToPropsForAreaFilter(state) {
  var { areas: areaOptions } = state.app
  areaOptions = areaOptions.map(item => ({ label: item.areaName, value: item.id }))
  return { areaOptions }
}

AreaFilter = connect(mapStateToPropsForAreaFilter)(injectIntl(AreaFilter))

function InvestorListFilter(props) {
  return (
    <div>
      <TransactionPhaseFilter transactionPhases={props.value.transactionPhases} transactonPhaseHandler={props.onChange.bind(this, 'transactionPhases')} />
      <TagFilter tags={props.value.tags} tagHandler={props.onChange.bind(this, 'tags')} />
      <CurrencyFilter currency={props.value.currency} currencyHandler={props.onChange.bind(this, 'currency')} />
      <AuditFilter audit={props.value.audit} auditHandler={props.onChange.bind(this, 'audit')} />
      <AreaFilter value={props.value.areas.map(item=>item.toString())} onChange={props.onChange.bind(this, 'areas')} />
    </div>
  )
}

module.exports = {
  InvestorListFilter,
}
