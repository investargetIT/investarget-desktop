import React from 'react'
import { Row, Col } from 'antd'
import { connect } from 'dva'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { Checkbox } from 'antd'
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

function InvestorListFilter(props) {
  return (
    <div>
      <TransactionPhaseFilter transactionPhases={props.value.transactionPhases} transactonPhaseHandler={props.onChange.bind(this, 'transactionPhases')} />
      <TagFilter tags={props.value.tags} tagHandler={props.onChange.bind(this, 'tags')} />
    </div>
  )
}

module.exports = {
  TransactionPhaseFilter,
  TagFilter,
  InvestorListFilter
}
