import React from 'react'
import { connect } from 'dva'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { i18n } from '../utils/util'

import { Row, Col, Button, Checkbox, Select, Radio } from 'antd'
const RadioGroup = Radio.Group

import TabCheckbox from './TabCheckbox'
import {
  CheckboxTransactionPhase,
  CheckboxCurrencyType,
  RadioTrueOrFalse,
  TabCheckboxIndustry,
  CheckboxTag,
  CheckboxOrganizationType,
  RadioAudit,
  SelectOrganizatonArea,
} from './ExtraInput'



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
    <BasicContainer label={ i18n("filter.investment_rounds") }>
      <CheckboxTransactionPhase value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function TagFilter(props) {
  return (
    <BasicContainer label={i18n('filter.tag')}>
      <CheckboxTag value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function CurrencyFilter(props) {
  return (
    <BasicContainer label={i18n('filter.currency')}>
      <CheckboxCurrencyType value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function UserAuditFilter(props) {
  return (
    <BasicContainer label={ i18n('filter.audit_status') }>
      <RadioAudit value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function OrganizationAreaFilter(props) {
  return (
    <BasicContainer label={i18n('filter.area')}>
      <SelectOrganizatonArea style={{width: '400px'}} mode="multiple" allowClear optionFilterProp="children" tokenSeparators={[',']} value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function OverseaFilter(props) {
  return (
    <BasicContainer label={i18n('filter.invest_oversea')}>
      <RadioTrueOrFalse value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function IndustryFilter(props) {
  return (
    <BasicContainer label={i18n('filter.industry')}>
      <TabCheckboxIndustry value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function OrganizationTypeFilter(props) {
  return (
    <BasicContainer label={i18n('filter.org_type')}>
      <CheckboxOrganizationType value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}



function UserListFilter(props) {
  return (
    <div>
      <TransactionPhaseFilter value={props.value.transactionPhases} onChange={props.onChange.bind(this, 'transactionPhases')} />
      <TagFilter value={props.value.tags} onChange={props.onChange.bind(this, 'tags')} />
      <CurrencyFilter value={props.value.currency} onChange={props.onChange.bind(this, 'currency')} />
      <UserAuditFilter value={props.value.audit} onChange={props.onChange.bind(this, 'audit')} />
      <OrganizationAreaFilter value={props.value.areas.map(item=>item.toString())} onChange={props.onChange.bind(this, 'areas')} />
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



///// used in AddUser.js TODO:// refractor
function mapStateToPropsForAudit(state) {
  var { audit: auditOptions } = state.app
  auditOptions = auditOptions.map(item => ({ label: item.name, value: item.id }))
  return { auditOptions }
}

module.exports = {
  mapStateToPropsForAudit,

  UserListFilter,
  OrganizationListFilter,
}
