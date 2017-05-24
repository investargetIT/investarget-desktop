import React from 'react'
import { Row, Col, Button } from 'antd'
import { connect } from 'dva'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { Checkbox, Select, Radio } from 'antd'
import TabCheckbox from './TabCheckbox'

const RadioGroup = Radio.Group

function BasicContainer(props) {
  return (
    <Row gutter={16} style={{marginBottom: '16px'}}>
      <Col span={4} >{ props.label }</Col>
      <Col span={20} >{ props.children }</Col>
    </Row>
  )
}

function FilterOperation(props) {
  return (
    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
      <Button type="primary" icon="search" onClick={props.onSearch}><FormattedMessage id="filterr" /></Button>
      <Button style={{ marginLeft: 10 }} onClick={props.onReset}><FormattedMessage id="reset" /></Button>
    </div>
  )
}

function TransactionPhaseFilter(props) {
  return (
    <BasicContainer label={ props.intl.formatMessage({id: "filter.investment_rounds"}) }>
      <Checkbox.Group options={props.transactionPhaseOptions} value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function mapStateToPropsForTransactionPhase(state) {
  var { transactionPhases: transactionPhaseOptions } = state.app
  transactionPhaseOptions = transactionPhaseOptions.map(item => ({ label: item.name, value: item.id }))
  return { transactionPhaseOptions }
}

TransactionPhaseFilter = connect(mapStateToPropsForTransactionPhase)(injectIntl(TransactionPhaseFilter))



function TagFilter(props) {
  return (
    <BasicContainer label={ props.intl.formatMessage({id: 'filter.tag'}) }>
      <div style={{ lineHeight: 2 }}>
        <Checkbox.Group options={props.tagOptions} value={props.value} onChange={props.onChange} />
      </div>
    </BasicContainer>
  )
}

function mapStateToPropsForTag(state) {
  var { tag: tagOptions } = state.app
  tagOptions = tagOptions.map(item => ({ label: item.name, value: item.id }))
  return { tagOptions }
}

TagFilter = connect(mapStateToPropsForTag)(injectIntl(TagFilter))



function CurrencyFilter(props) {
  return (
    <BasicContainer label={ props.intl.formatMessage({id: 'filter.currency'}) }>
      <Checkbox.Group options={props.currencyOptions} value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function mapStateToPropsForCurrency(state) {
  var { currencyType: currencyOptions } = state.app
  currencyOptions = currencyOptions.map(item => ({ label: item.currency, value: item.id }))
  return { currencyOptions }
}

CurrencyFilter = connect(mapStateToPropsForCurrency)(injectIntl(CurrencyFilter))



function AuditFilter(props) {
  return (
    <BasicContainer label={ props.intl.formatMessage({id: 'filter.audit_status'}) }>
      <Checkbox.Group options={props.auditOptions} value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function mapStateToPropsForAudit(state) {
  var { audit: auditOptions } = state.app
  auditOptions = auditOptions.map(item => ({ label: item.name, value: item.id }))
  return { auditOptions }
}

AuditFilter = connect(mapStateToPropsForAudit)(injectIntl(AuditFilter))



function AreaFilter(props) {
  return (
    <BasicContainer label={ props.intl.formatMessage({id: 'filter.area'}) }>
      <Select style={{ width: '100%' }} mode = "multiple" allowClear optionFilterProp="children" onChange={props.onChange} value = {props.value} tokenSeparators={[',']}>
        { props.areaOptions.map(item => (<Select.Option key={item.value.toString()} value={item.value.toString()}>{ item.label }</Select.Option>)) }
      </Select>
    </BasicContainer>
  )
}

function mapStateToPropsForArea(state) {
  var { orgarea: areaOptions } = state.app
  areaOptions = areaOptions.map(item => ({ label: item.name, value: item.id }))
  return { areaOptions }
}

AreaFilter = connect(mapStateToPropsForArea)(injectIntl(AreaFilter))




function OverseaFilter(props) {
  const formatMessage = props.intl.formatMessage
  function handleChange(e) {
    const value = e.target.value
    props.onChange(value)
  }
  const overseaOptions = [
    { label: formatMessage({id: 'common.yes'}), value: true },
    { label: formatMessage({id: 'common.no'}), value: false }
  ]
  return (
    <BasicContainer label={formatMessage({id: 'filter.invest_oversea'})}>
      <RadioGroup options={overseaOptions} value={props.value} onChange={handleChange} />
    </BasicContainer>
  )
}

OverseaFilter = injectIntl(OverseaFilter)



function IndustryFilter(props) {
  return (
    <BasicContainer label={props.intl.formatMessage({id: 'filter.industry'})}>
      <TabCheckbox options={props.industryOptions} value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function mapStateToPropsForIndustry(state) {
  const { industry: industries } = state.app

  let pIndustries = industries.filter(item => item.id == item.Pindustry)
  pIndustries.forEach(item => {
    let Pindustry = item.id
    let subIndustries = industries.filter(item => item.Pindustry == Pindustry && item.id != Pindustry)
    item.children = subIndustries
  })
  const industryOptions = pIndustries.map(item => {
    return {
      label: item.industry,
      value: item.id,
      children: item.children.map(item => {
        return {
          label: item.industry,
          value: item.id
        }
      })
    }
  })

  return { industryOptions }
}

IndustryFilter = connect(mapStateToPropsForIndustry)(injectIntl(IndustryFilter))



function OrganizationTypeFilter(props) {
  return (
    <BasicContainer label={props.intl.formatMessage({id: 'filter.org_type'})}>
      <Checkbox.Group options={props.organizationTypeOptions} value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function mapStateToPropsForOrganizationType(state) {
  const { orgtype: organizationTypes } = state.app
  const organizationTypeOptions = organizationTypes.map(item => {
    return {
      label: item.name,
      value: item.id
    }
  })
  return { organizationTypeOptions }
}

OrganizationTypeFilter = connect(mapStateToPropsForOrganizationType)(injectIntl(OrganizationTypeFilter))




function UserListFilter(props) {
  return (
    <div>
      <TransactionPhaseFilter value={props.value.transactionPhases} onChange={props.onChange.bind(this, 'transactionPhases')} />
      <TagFilter value={props.value.tags} onChange={props.onChange.bind(this, 'tags')} />
      <CurrencyFilter value={props.value.currency} onChange={props.onChange.bind(this, 'currency')} />
      <AuditFilter value={props.value.audit} onChange={props.onChange.bind(this, 'audit')} />
      <AreaFilter value={props.value.areas.map(item=>item.toString())} onChange={props.onChange.bind(this, 'areas')} />
      <FilterOperation onSearch={props.onSearch} onReset={props.onReset} />
    </div>
  )
}

function OrganizationListFilter(props) {
  return (
    <div>
      <OverseaFilter value={props.value.isOversea} onChange={props.onChange.bind(this, 'isOversea')} />
      <CurrencyFilter value={props.value.currency} onChange={props.onChange.bind(this, 'currency')} />
      <TransactionPhaseFilter value={props.value.transactionPhases} onChange={props.onChange.bind(this, 'transactionPhases')} />
      <IndustryFilter value={props.value.industries} onChange={props.onChange.bind(this, 'industries')} />
      <TagFilter value={props.value.tags} onChange={props.onChange.bind(this, 'tags')} />
      <OrganizationTypeFilter value={props.value.organizationTypes} onChange={props.onChange.bind(this, 'organizationTypes')} />
      <FilterOperation onSearch={props.onSearch} onReset={props.onReset} />
    </div>
  )
}

module.exports = {
  mapStateToPropsForTransactionPhase,
  mapStateToPropsForTag,
  mapStateToPropsForCurrency,
  mapStateToPropsForAudit,
  mapStateToPropsForArea,
  mapStateToPropsForIndustry,
  mapStateToPropsForOrganizationType,

  UserListFilter,
  OrganizationListFilter,
}
