import React from 'react'
import { connect } from 'dva'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { i18n } from '../utils/util'

import { Row, Col, Button, Checkbox, Select, Radio } from 'antd'
const RadioGroup = Radio.Group

import TabCheckbox from './TabCheckbox'
import {
  RadioTrueOrFalse,
  RadioAudit,
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

function CountryFilter(props) {
  return (
    <BasicContainer label="地区">
      <TabCheckboxCountry value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function RevenueFilter(props) {
  const value = props.value.map(item => parseInt(item / 1000000))
  const onChange = (value) => { props.onChange(value.map(item => item * 1000000)) }
  return (
    <BasicContainer label="收入">
      <SliderMoney min={0} max={500} value={value} onChange={onChange} />
    </BasicContainer>
  )
}

function ProfitFilter(props) {
  const value = props.value.map(item => parseInt(item / 1000000))
  const onChange = (value) => { props.onChange(value.map(item => item * 1000000)) }
  return (
    <BasicContainer label="利润">
      <SliderMoney min={-200} max={200} value={value} onChange={onChange} />
    </BasicContainer>
  )
}

function ProjectStatusFilter(props) {
  return (
    <BasicContainer label="状态">
      <CheckboxProjStatus value={props.value} onChange={props.onChange} />
    </BasicContainer>
  )
}

function ProjectTypeFilter(props) {
  function handleChange(e) {
    props.onChange(e.target.value)
  }
  return (
    <BasicContainer label="类型">
      <RadioGroup value={props.value} onChange={handleChange}>
        <Radio value={false}>独家项目</Radio>
        <Radio value={true}>精品项目</Radio>
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
    <BasicContainer label="状态">
      <Select value={value} onChange={onChange}>
        <Option value="0">全部</Option>
        <Option value="1">未结束</Option>
        <Option value="2">已结束</Option>
      </Select>
    </BasicContainer>
  )
}

function TimelineFilter(props) {
  function handleChange(key, value) {
    props.onChange({ ...props.value, [key]: value })
  }
  return (
    <div>
      <TimelineStatusFilter value={props.value.isClose} onChange={handleChange.bind(this, 'isClose')} />
      <FilterOperation onSearch={props.onSearch} onReset={props.onReset} />
    </div>
  )
}



function UserListFilter(props) {
  return (
    <div>
      <TransactionPhaseFilter
        value={props.value ? props.value.orgtransactionphases : null}
        onChange={props.onChange.bind(this, 'orgtransactionphases')} />
      <TagFilter
        value={props.value ? props.value.tags : null}
        onChange={props.onChange.bind(this, 'tags')} />
      <CurrencyFilter
        value={props.value ? props.value.currency : null}
        onChange={props.onChange.bind(this, 'currency')} />
      <UserAuditFilter
        value={props.value ? props.value.userstatus : null}
        onChange={props.onChange.bind(this, 'userstatus')} />
      <OrganizationAreaFilter
        value={props.value ? props.value.areas.map(item=>item.toString()) : []}
        onChange={props.onChange.bind(this, 'areas')} />
      <FilterOperation
        onSearch={props.onSearch}
        onReset={props.onReset} />
    </div>
  )
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

function OrganizationListFilter(props) {
  function handleChange(key, value) {
    props.onChange({ ...props.value, [key]: value })
  }
  return (
    <div>
      <OverseaFilter value={props.value.isOversea} onChange={handleChange.bind(this, 'isOversea')} />
      <CurrencyFilter value={props.value.currencys} onChange={handleChange.bind(this, 'currencys')} />
      <TransactionPhaseFilter value={props.value.orgtransactionphases} onChange={handleChange.bind(this, 'orgtransactionphases')} />
      <IndustryFilter value={props.value.industries} onChange={handleChange.bind(this, 'industries')} />
      <TagFilter value={props.value.tags} onChange={handleChange.bind(this, 'tags')} />
      <OrganizationTypeFilter value={props.value.orgtypes} onChange={handleChange.bind(this, 'orgtypes')} />
      <FilterOperation onSearch={props.onSearch} onReset={props.onReset} />
    </div>
  )
}

class ProjectListFilter extends React.Component {

  static DefaultValue = {
    netIncome_USD_F: 0,
    netIncome_USD_T: 500000000,
    grossProfit_F: -200000000,
    grossProfit_T: 200000000,
  }

  constructor(props) {
    super(props)
    this.state = {
      tags: [],
      country: [],
      industries: [],
      netIncome_USD_F: 0,
      netIncome_USD_T: 500000000,
      grossProfit_F: -200000000,
      grossProfit_T: 200000000,
      projstatus: [],
      ismarketplace: null,
    }
  }

  handleChange = (key, value) => {
    this.setState({ [key]: value })
  }

  handleSearch = () => {
    var data = {}
    for (let prop in this.state) {
      let value = this.state[prop]
      if (Array.isArray(value) && value.length > 0) {
        data[prop] = value
      } else if (typeof value == 'number' && value != ProjectListFilter.DefaultValue[prop]) {
        data[prop] = value
      } else if (typeof value == 'boolean') {
        data[prop] = value
      }
    }
    this.props.onSearch(data)
    if (this.props.storeKey) {
      localStorage.setItem(this.props.storeKey, JSON.stringify(data))
    }
  }

  handleReset = () => {
    this.setState({
      tags: [],
      country: [],
      industries: [],
      netIncome_USD_F: 0,
      netIncome_USD_T: 500000000,
      grossProfit_F: -200000000,
      grossProfit_T: 200000000,
      projstatus: [],
      ismarketplace: null,
    }, this.props.onReset)
    if (this.props.storeKey) {
      localStorage.setItem(this.props.storeKey, JSON.stringify({}))
    }
  }

  componentDidMount() {
    if (this.props.storeKey) {
      let data = JSON.parse(localStorage.getItem(this.props.storeKey))
      this.setState({ ...data })
    }
  }

  render() {
    const { tags, country, industries, netIncome_USD_F, netIncome_USD_T, grossProfit_F, grossProfit_T, projstatus, ismarketplace } = this.state
    return (
      <div>
        <TagFilter value={tags} onChange={this.handleChange.bind(this, 'tags')} />
        <CountryFilter value={country} onChange={this.handleChange.bind(this, 'country')} />
        <IndustryFilter value={industries} onChange={this.handleChange.bind(this, 'industries')} />
        <RevenueFilter
          value={[netIncome_USD_F, netIncome_USD_T]}
          onChange={this.handleChange.bind(this, ['netIncome_USD_F', 'netIncome_USD_T'])} />
        <ProfitFilter
          value={[grossProfit_F, grossProfit_T]}
          onChange={this.handleChange.bind(this, ['grossProfit_F', 'grossProfit_T'])} />
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
  OrganizationListFilter,
  ProjectListFilter,
  TimelineFilter,
}
