import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'

import { Row, Col, Button, Checkbox, Select, Radio } from 'antd'
const RadioGroup = Radio.Group

import TabCheckbox from './TabCheckbox'
import {
  RadioTrueOrFalse,
  RadioAudit,
  RadioRole,
  CheckboxTransactionPhase,
  CheckboxCurrencyType,
  CheckboxTag,
  CheckboxOrganizationType,
  CheckboxProjStatus,
  SelectOrganizatonArea,
  SelectTimelineStatus,
  SliderMoney,
  TabCheckboxIndustry,
  TabCheckboxCountry,
  CheckboxService,
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
      <Button type="primary" icon="search" onClick={props.onSearch}>{i18n('filter.filter')}</Button>
      <Button style={{ marginLeft: 10 }} onClick={props.onReset}>{i18n('filter.reset')}</Button>
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

function ServiceFilter(props) {
  return (
    <BasicContainer label={i18n('filter.service_type')}>
      <CheckboxService value={props.value} onChange={props.onChange} />
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

function CountryFilter(props) {
  return (
    <BasicContainer label={i18n('filter.area')}>
      <TabCheckboxCountry value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function RevenueFilter(props) {
  const value = props.value.map(item => parseInt(item / 1000000))
  const onChange = (value) => { props.onChange(value.map(item => item * 1000000)) }
  return (
    <BasicContainer label={i18n('filter.income')}>
      <SliderMoney min={0} max={500} value={value} onChange={onChange} />
    </BasicContainer>
  )
}

function ProfitFilter(props) {
  const value = props.value.map(item => parseInt(item / 1000000))
  const onChange = (value) => { props.onChange(value.map(item => item * 1000000)) }
  return (
    <BasicContainer label={i18n('filter.profit')}>
      <SliderMoney min={-200} max={200} value={value} onChange={onChange} />
    </BasicContainer>
  )
}

function ProjectStatusFilter(props) {
  return (
    <BasicContainer label={i18n('filter.status')}>
      <CheckboxProjStatus value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function ProjectTypeFilter(props) {
  function handleChange(e) {
    props.onChange(e.target.value)
  }
  return (
    <BasicContainer label={i18n('filter.project_type')}>
      <RadioGroup value={props.value} onChange={handleChange}>
        <Radio value={false}>{i18n('filter.exclusive_project')}</Radio>
        <Radio value={true}>{i18n('filter.choice_project')}</Radio>
      </RadioGroup>
    </BasicContainer>
  )
}

function TimelineStatusFilter(props) {

  var value
  if (props.value == null) {
    value = '0'
  } else if (props.value == false) {
    value = '1'
  } else {
    value = '2'
  }

  const onChange = (value) => {
    if (value == '0') {
      value = null
    } else if (value == '1') {
      value = false
    } else {
      value = true
    }
    props.onChange(value)
  }

  const Option = Select.Option
  return (
    <BasicContainer label={i18n('filter.status')}>
      <Select value={value} onChange={onChange}>
        <Option value="0">{i18n('timeline.all')}</Option>
        <Option value="1">{i18n('timeline.processing')}</Option>
        <Option value="2">{i18n('timeline.closed')}</Option>
      </Select>
    </BasicContainer>
  )
}

class GroupFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: [],
    }
  }

  componentDidMount() {
    api.queryUserGroup({ page_size: 100 }).then(result => {
      const groups = result.data.data.map(item => {
        return { value: item.id, label: item.name }
      })
      this.setState({ groups })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleChange = (e) => {
    this.props.onChange(e.target.value)
  }

  render() {
    return (
      <BasicContainer label={i18n('filter.group')}>
         <RadioGroup value={this.props.value} onChange={this.handleChange}>
          {
            this.state.groups.map(item =>
              <Radio key={item.value} value={item.value}>{item.label}</Radio>
            )
          }
        </RadioGroup>
      </BasicContainer>
    )
  }
}
GroupFilter = connect()(GroupFilter)


/*******************************/



class TimelineFilter extends React.Component {

  static defaultValue = {
    isClose: false,
  }

  constructor(props) {
    super(props)
    this.state = props.defaultValue || TimelineFilter.defaultValue
  }

  handleChange = (key, value) => {
    this.setState({ [key]: value })
  }

  handleSearch = () => {
    this.props.onSearch({ ...this.state })
  }

  handleReset = () => {
    this.setState({ ...TimelineFilter.defaultValue })
    this.props.onReset({ ...TimelineFilter.defaultValue })
  }

  render() {
    const { isClose } = this.state
    return (
      <div>
        <TimelineStatusFilter value={isClose} onChange={this.handleChange.bind(this, 'isClose')} />
        <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
      </div>
    )
  }
}


class UserListFilter extends React.Component {

  static defaultValue = {
    groups: null,
    orgtransactionphases: [],
    tags: [],
    currency: [],
    userstatus: null,
    areas: [],
  }

  constructor(props) {
    super(props)
    this.state = props.defaultValue || UserListFilter.defaultValue
  }

  handleChange = (key, value) => {
    if (key == 'groups') {
      this.setState({ ...UserListFilter.defaultValue })
    }
    this.setState({ [key]: value })
  }

  handleSearch = () => {
    this.props.onSearch({ ...this.state })
  }

  handleReset = () => {
    this.setState({ ...UserListFilter.defaultValue })
    this.props.onReset({ ...UserListFilter.defaultValue })
  }

  render() {
    const { groups, orgtransactionphases, tags, currency, userstatus, areas } = this.state

    return (
      <div>
        <GroupFilter value={groups} onChange={this.handleChange.bind(this, 'groups')} />
        {
          [null, 1].includes(groups) ? (
            <TransactionPhaseFilter value={orgtransactionphases} onChange={this.handleChange.bind(this, 'orgtransactionphases')} />
          ) : null
        }
        {
          [null, 1, 2].includes(groups) ? (
            <TagFilter value={tags} onChange={this.handleChange.bind(this, 'tags')} />
          ) : null
        }
        {
          [null, 1].includes(groups) ? (
            <CurrencyFilter value={currency} onChange={this.handleChange.bind(this, 'currency')} />
          ) : null
        }
        {
          [null, 1, 2].includes(groups) ? (
            <UserAuditFilter value={userstatus} onChange={this.handleChange.bind(this, 'userstatus')} />
          ) : null
        }
        {
          [null, 1].includes(groups) ? (
            <OrganizationAreaFilter value={areas.map(item=>item.toString())} onChange={this.handleChange.bind(this, 'areas')} />
          ) : null
        }
        <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
      </div>
    )
  }

}


class OrgUserListFilter extends React.Component {

    static defaultValue = {
      orgtransactionphases: [],
      tags: [],
      currency: [],
      userstatus: null,
      areas: [],
    }

    constructor(props) {
      super(props)
      this.state = props.defaultValue || OrgUserListFilter.defaultValue
    }

    handleChange = (key, value) => {
      this.setState({ [key]: value })
    }

    handleSearch = () => {
      this.props.onSearch({ ...this.state })
    }

    handleReset = () => {
      this.setState({ ...OrgUserListFilter.defaultValue })
      this.props.onReset({ ...OrgUserListFilter.defaultValue })
    }

    render() {
      const { orgtransactionphases, tags, currency, userstatus, areas } = this.state

      return (
        <div>
          <TransactionPhaseFilter value={orgtransactionphases} onChange={this.handleChange.bind(this, 'orgtransactionphases')} />
          <TagFilter value={tags} onChange={this.handleChange.bind(this, 'tags')} />
          <CurrencyFilter value={currency} onChange={this.handleChange.bind(this, 'currency')} />
          <UserAuditFilter value={userstatus} onChange={this.handleChange.bind(this, 'userstatus')} />
          <OrganizationAreaFilter value={areas.map(item=>item.toString())} onChange={this.handleChange.bind(this, 'areas')} />
          <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
        </div>
      )
    }

  }


class MyInvestorListFilter extends React.Component {

  state = {
    orgtransactionphases: [],
    tags: [],
    currency: [],
    userstatus: null,
    areas: []
  }

  onChange(key, value) {
    this.setState({ [key]: value })
  }

  onReset() {
    this.setState({
      orgtransactionphases: [],
      tags: [],
      currency: [],
      userstatus: null,
      areas: []
    })
  }

  onFilter() {
    this.props.onFilter(Object.assign({}, this.state))
  }

  render() {
    return (
      <div>
        <TransactionPhaseFilter
          value={this.state.orgtransactionphases}
          onChange={this.onChange.bind(this, 'orgtransactionphases')} />
        <TagFilter
          value={this.state.tags}
          onChange={this.onChange.bind(this, 'tags')} />
        <CurrencyFilter
          value={this.state.currency}
          onChange={this.onChange.bind(this, 'currency')} />
        <UserAuditFilter
          value={this.state.userstatus}
          onChange={this.onChange.bind(this, 'userstatus')} />
        <OrganizationAreaFilter
          value={this.state.areas}
          onChange={this.onChange.bind(this, 'areas')} />
        <FilterOperation
          onSearch={this.onFilter.bind(this)}
          onReset={this.onReset.bind(this)} />
      </div>
    )
  }
}

class OrganizationListFilter extends React.Component {

  static defaultValue = {
    isOversea: null,
    currencys: [],
    orgtransactionphases: [],
    industrys: [],
    tags: [],
    orgtypes: [],
    area: [],
  }

  constructor(props) {
    super(props)
    this.state = props.defaultValue || OrganizationListFilter.defaultValue
  }

  handleChange = (key, value) => {
    this.setState({ [key]: value })
  }

  handleSearch = () => {
    this.props.onSearch({ ...this.state })
  }

  handleReset = () => {
    this.setState({ ...OrganizationListFilter.defaultValue })
    this.props.onSearch({ ...OrganizationListFilter.defaultValue })
  }

  render() {
    const { isOversea, currencys, orgtransactionphases, industrys, tags, orgtypes, area } = this.state
    return (
      <div>
        <OverseaFilter value={isOversea} onChange={this.handleChange.bind(this, 'isOversea')} />
        <CurrencyFilter value={currencys} onChange={this.handleChange.bind(this, 'currencys')} />
        <TransactionPhaseFilter value={orgtransactionphases} onChange={this.handleChange.bind(this, 'orgtransactionphases')} />
        <IndustryFilter value={industrys} onChange={this.handleChange.bind(this, 'industrys')} />
        <TagFilter value={tags} onChange={this.handleChange.bind(this, 'tags')} />
        <OrganizationTypeFilter value={orgtypes} onChange={this.handleChange.bind(this, 'orgtypes')} />
        <OrganizationAreaFilter value={area.map(item=>item.toString())} onChange={this.handleChange.bind(this, 'area')} />
        <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
      </div>
    )
  }

}

class ProjectListFilter extends React.Component {

  static defaultValue = {
    tags: [],
    country: [],
    industries: [],
    netIncome_USD_F: 0,
    netIncome_USD_T: 500000000,
    grossProfit_F: -200000000,
    grossProfit_T: 200000000,
    projstatus: [],
    ismarketplace: null,
    service: [],
  }

  constructor(props) {
    super(props)
    this.state = props.defaultValue || ProjectListFilter.defaultValue
  }

  handleChange = (key, value) => {
    if (Array.isArray(key)) {
      key.forEach((item, index) => {
        this.setState({ [item]: value[index] })
      })
    } else {
      this.setState({ [key]: value })
    }

    if (key == 'ismarketplace' && value == true) {
      ['netIncome_USD_F', 'netIncome_USD_T', 'grossProfit_F', 'grossProfit_T', 'service'].forEach(item => {
        this.setState({ [item]: ProjectListFilter.defaultValue[item] })
      })
    }
  }

  handleSearch = () => {
    this.props.onSearch({ ...this.state })
  }

  handleReset = () => {
    this.setState({ ...ProjectListFilter.defaultValue })
    this.props.onReset({ ...ProjectListFilter.defaultValue })
  }

  render() {
    const { service, tags, country, industries, netIncome_USD_F, netIncome_USD_T, grossProfit_F, grossProfit_T, projstatus, ismarketplace } = this.state
    return (
      <div>
        <TagFilter value={tags} onChange={this.handleChange.bind(this, 'tags')} />
        <CountryFilter value={country} onChange={this.handleChange.bind(this, 'country')} />
        <IndustryFilter value={industries} onChange={this.handleChange.bind(this, 'industries')} />
        { ismarketplace ? null : (
          <RevenueFilter
            value={[netIncome_USD_F, netIncome_USD_T]}
            onChange={this.handleChange.bind(this, ['netIncome_USD_F', 'netIncome_USD_T'])} />
        )}
        { ismarketplace ? null : (
          <ProfitFilter
            value={[grossProfit_F, grossProfit_T]}
            onChange={this.handleChange.bind(this, ['grossProfit_F', 'grossProfit_T'])} />
          )}
        { ismarketplace ? null : (
          <ServiceFilter value={service} onChange={this.handleChange.bind(this, 'service')} />
        )}
        <ProjectStatusFilter value={projstatus} onChange={this.handleChange.bind(this, 'projstatus')} />
        <ProjectTypeFilter value={ismarketplace} onChange={this.handleChange.bind(this, 'ismarketplace')} />
        <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
      </div>
    )
  }
}




///// used in AddUser.js TODO:// refractor
function mapStateToPropsForAudit(state) {
  var { audit: auditOptions } = state.app
  auditOptions = auditOptions.map(item => ({ label: item.name, value: item.id }))
  return { auditOptions }
}

module.exports = {
  mapStateToPropsForAudit,
  MyInvestorListFilter,
  UserListFilter,
  OrgUserListFilter,
  OrganizationListFilter,
  ProjectListFilter,
  TimelineFilter,
}
