import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'

import { 
  Row, 
  Col, 
  Button, 
  Checkbox, 
  Select, 
  Radio, 
  Icon, 
} from 'antd'
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

import TabCheckbox from './TabCheckbox'
import {
  RadioGroup2,
  RadioTrueOrFalse,
  RadioAudit,
  RadioRole,
  RadioBDStatus,
  RadioBDSource,
  CheckboxTransactionPhase,
  CheckboxCurrencyType,
  CheckboxTag,
  CheckboxOrganizationType,
  CheckboxProjStatus,
  CheckboxArea,
  CheckboxAreaString,
  CheckboxYear,
  SelectOrganizatonArea,
  SelectTimelineStatus,
  SelectOrgUser,
  SelectUser,
  SliderMoney,
  TabCheckboxIndustry,
  TabCheckboxCountry,
  CheckboxService, 
  TabCheckboxTag, 
  TabCheckboxOrgType, 
  TabCheckboxOrgArea, 
} from './ExtraInput'
import ITCheckboxGroup from './ITCheckboxGroup'


export function BasicContainer(props) {
  return (
    <Row gutter={16} style={{marginBottom: '16px'}}>
      <Col span={4} style={{color: '#4a535e'}}>{ props.label + '：'}</Col>
      <Col span={20} >{ props.children }</Col>
    </Row>
  )
}

function FilterOperation(props) {
  return (
    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
      {/* <Button size="large" type="primary" icon="search" onClick={props.onSearch}>{i18n('filter.filter')}</Button> */}
      <Button size="large" style={{ marginLeft: 10 }} icon="reload" onClick={props.onReset}>{i18n('filter.reset')}</Button>
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
      <Select size="large" value={value} onChange={onChange}>
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
    this.setState({ [key]: value },this.handleSearch)
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
      this.setState({ ...UserListFilter.defaultValue },this.handleSearch)
    }
    this.setState({ [key]: value },this.handleSearch)
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
    this.setState({ [key]: value },this.onFilter)
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
    this.setState({ [key]: value }, this.handleSearch);
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
    console.log({area})
    console.log({orgtypes})
    return (
      <div>
        <OverseaFilter value={isOversea} onChange={this.handleChange.bind(this, 'isOversea')} />
        {/* <CurrencyFilter value={currencys} onChange={this.handleChange.bind(this, 'currencys')} /> */}
        <BasicContainer label={i18n('filter.currency')}>
          <ITCheckboxGroup options={this.props.currencys} value={currencys} onChange={this.handleChange.bind(this, 'currencys')} />
        </BasicContainer> 
        {/* <TransactionPhaseFilter value={orgtransactionphases} onChange={this.handleChange.bind(this, 'orgtransactionphases')} /> */}
        <BasicContainer label={i18n('filter.investment_rounds')}>
          <ITCheckboxGroup options={this.props.orgtransactionphases} value={orgtransactionphases} onChange={this.handleChange.bind(this, 'orgtransactionphases')} />
        </BasicContainer>
        <IndustryFilter value={industrys} onChange={this.handleChange.bind(this, 'industrys')} />
        {/* <TagFilter value={tags} onChange={this.handleChange.bind(this, 'tags')} /> */}
        <TabCheckboxTag value={tags} onChange={this.handleChange.bind(this, 'tags')} />
        {/* <OrganizationTypeFilter value={orgtypes} onChange={this.handleChange.bind(this, 'orgtypes')} /> */}
        <TabCheckboxOrgType value={orgtypes} onChange={this.handleChange.bind(this, 'orgtypes')} />
        {/* <OrganizationAreaFilter value={area.map(item=>item.toString())} onChange={this.handleChange.bind(this, 'area')} /> */}
        <TabCheckboxOrgArea value={area} onChange={this.handleChange.bind(this, 'area')} />
        <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
      </div>
    )
  }

}
function mapStateToPropsForRounds(state) {
  const { transactionPhases, currencyType } = state.app;
  const orgtransactionphases = transactionPhases ? transactionPhases.map(item =>({value: item.id, label: item.name})) : []
  const currencys = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
  return { orgtransactionphases, currencys }
}
OrganizationListFilter = connect(mapStateToPropsForRounds)(OrganizationListFilter);

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
        this.setState({ [item]: value[index] },this.handleSearch)
      })
    } else {
      this.setState({ [key]: value },this.handleSearch)
    }

    if (key == 'ismarketplace' && value == true) {
      ['netIncome_USD_F', 'netIncome_USD_T', 'grossProfit_F', 'grossProfit_T', 'service'].forEach(item => {
        this.setState({ [item]: ProjectListFilter.defaultValue[item] },this.handleSearch)
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


class ProjectLibraryFilter extends React.Component {

  static defaultValue = {
    com_sub_cat_name: [],
    com_born_date: [],
    com_addr: [],
    invse_round_id: [],
    com_status: [],
    com_fund_needs_name: [],
  }

  constructor(props) {
    super(props)
    this.state = props.defaultValue || ProjectLibraryFilter.defaultValue
  }

  handleChange = (key, value) => {
    this.setState({ [key]: value },this.handleSearch)

  }

  handleSearch = () => {
    this.props.onSearch({ ...this.state })
  }

  handleReset = () => {
    this.setState({ ...ProjectLibraryFilter.defaultValue })
    this.props.onReset({ ...ProjectLibraryFilter.defaultValue })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getLibIndustry' })
  }

  render() {
    const { industryOptions } = this.props
    const { com_sub_cat_name, com_born_date, com_addr, invse_round_id, com_status, com_fund_needs_name } = this.state

    // TODO//翻译
    const _fundStatus = ['尚未获投','种子轮','天使轮','Pre-A轮','A轮','A+轮','Pre-B轮','B轮','B+轮','C轮','C+轮','D轮','D+轮','E轮','F轮-上市前','已上市','新三板','战略投资','已被收购','不明确']
    const fundStatusOptions = _fundStatus.map(item => ({ label: item, value: item }))
    const _status = ['运营中','未上线','已关闭','已转型']
    const statusOptions = _status.map(item => ({ label: item, value: item }))
    const _fundNeeds = ['需要融资','不需要融资','寻求被收购','不明确']
    const fundNeedsOptions = _fundNeeds.map(item => ({ label: item, value: item }))

    return (
      <div>
        <BasicContainer label={i18n('filter.industry')}>
          <TabCheckbox options={industryOptions} value={com_sub_cat_name} onChange={this.handleChange.bind(this, 'com_sub_cat_name')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_library.established_time')}>
          <CheckboxYear end={2000-1} value={com_born_date} onChange={this.handleChange.bind(this, 'com_born_date')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_library.area')}>
          <CheckboxAreaString value={com_addr} onChange={this.handleChange.bind(this, 'com_addr')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_library.investment_round')}>
          <ITCheckboxGroup options={fundStatusOptions} value={invse_round_id} onChange={this.handleChange.bind(this, 'invse_round_id')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_library.operating_status')}>
          <ITCheckboxGroup options={statusOptions} value={com_status} onChange={this.handleChange.bind(this, 'com_status')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_library.fund_needs')}>
          <ITCheckboxGroup options={fundNeedsOptions} value={com_fund_needs_name} onChange={this.handleChange.bind(this, 'com_fund_needs_name')} />
        </BasicContainer>
        <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
      </div>
    )
  }
}
ProjectLibraryFilter = connect(mapStateToPropsIndustry)(ProjectLibraryFilter)

function mapStateToPropsIndustry (state) {
  const { libIndustry: industry } = state.app

  let pIndustries = industry.filter(item => item.p_cat_id === null)
  pIndustries.forEach(item => {
    let p_cat_id = item.cat_id
    let subIndustries = industry.filter(item => item.p_cat_id == p_cat_id && item.cat_id != p_cat_id)
    item.children = subIndustries
  })
  const industryOptions = pIndustries.map(item => {
    var ret = {
      label: item.cat_name,
      value: item.cat_name,
    }
    if (item.children.length > 0) {
      ret['children'] = item.children.map(item => {
        return {
          label: item.cat_name,
          value: item.cat_name
        }
      })
    }
    return ret
  })

  return { industryOptions }
}


class ProjectBDFilter extends React.Component {

  static defaultValue = {
    bd_status: null,
    source_type: null,
    location: [],
    manager: [],
  }

  constructor(props) {
    super(props)
    this.state = props.defaultValue || ProjectBDFilter.defaultValue
  }

  handleChange = (key, value) => {
    this.setState({ [key]: value },this.handleSearch)
  }

  handleSearch = () => {
    this.props.onSearch({ ...this.state })
  }

  handleReset = () => {
    this.setState({ ...ProjectBDFilter.defaultValue })
    this.props.onReset({ ...ProjectBDFilter.defaultValue })
  }

  render() {
    const { bd_status, source_type, location, manager } = this.state

    return (
      <div>
        <BasicContainer label={i18n('project_bd.bd_status')}>
          <RadioBDStatus value={bd_status} onChange={this.handleChange.bind(this, 'bd_status')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_bd.import_methods')}>
          <RadioBDSource value={source_type} onChange={this.handleChange.bind(this, 'source_type')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_bd.area')}>
          <CheckboxArea value={location} onChange={this.handleChange.bind(this, 'location')} />
        </BasicContainer>
        <BasicContainer label={i18n('project_bd.bd_manager')}>
          <SelectOrgUser style={{width:'100%'}} type="trader" mode="multiple" value={manager} onChange={this.handleChange.bind(this, 'manager')} />
        </BasicContainer>
        <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
      </div>
    )
  }
}

class OrgBDFilter extends React.Component {

    static defaultValue = {
      bd_status: null,
      manager: [],
    }

    constructor(props) {
      super(props)
      this.state = props.defaultValue || OrgBDFilter.defaultValue
    }

    handleChange = (key, value) => {
      this.setState({ [key]: value }, () => this.props.onChange({...this.state}));
    }

    handleSearch = () => {
      this.props.onSearch({ ...this.state })
    }

    handleReset = () => {
      this.setState({ ...OrgBDFilter.defaultValue })
      this.props.onReset({ ...OrgBDFilter.defaultValue })
    }

    render() {
      const { bd_status, source_type, location, manager } = this.state

      return (
        <div>
          <BasicContainer label={i18n('project_bd.bd_status')}>
            <RadioBDStatus value={bd_status} onChange={this.handleChange.bind(this, 'bd_status')} />
          </BasicContainer>
          <BasicContainer label={i18n('project_bd.bd_manager')}>
            <SelectOrgUser style={{width:'100%'}} type="trader" mode="multiple" value={manager} onChange={this.handleChange.bind(this, 'manager')} />
          </BasicContainer>
          <FilterOperation onSearch={this.handleSearch} onReset={this.handleReset} />
        </div>
      )
    }
  }

class WxMessageFilter extends React.Component {

  static defaultValue = {
    isShow: false,
  }

  constructor(props) {
    super(props)
    this.state = this.props.defaultValue || WxMessageFilter.defaultValue
  }

  handleChange = (key, value) => {
    this.setState({ [key]: value })
  }

  handleSearch = () => {
    this.props.onSearch({ ...this.state })
  }

  handleReset = () => {
    this.setState({ ...WxMessageFilter.defaultValue })
    this.props.onReset({ ...WxMessageFilter.defaultValue })
  }

  render() {
    const { isShow } = this.state
    const options = [{label: '显示', value: true }, { label: '隐藏', value: false }]
    return (
      <div>
        <BasicContainer label="状态">
          <RadioGroup2 options={options} value={isShow} onChange={this.handleChange.bind(this, 'isShow')} />
        </BasicContainer>
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
  ProjectLibraryFilter,
  ProjectBDFilter,
  WxMessageFilter,
  OrgBDFilter, 
}
