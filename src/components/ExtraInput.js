import { connect } from 'dva'
import React from 'react'
import {
  InputNumber,
  Select,
  Cascader,
  Input,
  Icon,
  Button,
  Checkbox,
  Slider,
  Radio,
} from 'antd'
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
import TabCheckbox from './TabCheckbox'
import Select2 from './Select2'
import _ from 'lodash'
import * as api from '../api'
import { i18n, hasPerm, getCurrentUser } from '../utils/util'


function RadioGroup2 ({children, onChange, ...extraProps}) {
  function handleChange(e) {
    onChange(e.target.value)
  }

  return (
    <RadioGroup size="large" {...extraProps} onChange={handleChange} />
  )
}


class _Select extends React.Component {
  render() {
    const { children, options, value, onChange, ...extraProps } = this.props
    return (
      <Select value={value} onChange={onChange} size="large" {...extraProps}>
        {options.map((item, index) =>
          <Option key={item.key || index} value={item.value}>{item.label}</Option>
        )}
      </Select>
    )
  }
}

class SelectNumber extends React.Component {

  handleChange = (value) => {
    value = Array.isArray(value) ? value.map(item => Number(item)) : Number(value)
    if (this.props.onChange) { this.props.onChange(value) }
  }

  render() {
    const {children, options, value, onChange, ...extraProps} = this.props
    const _options = options.map(item => ({ label: item.label, value: String(item.value) }))
    let _value
    if (value == undefined) {
      _value = value
    } else {
      _value = Array.isArray(value) ? value.map(item => String(item)) : String(value)
    }

    return (
      <Select value={_value} onChange={this.handleChange} size="large" {...extraProps}>
        {_options && _options.map((item, index) =>
          <Option key={index} value={item.value}>{item.label}</Option>
        )}
      </Select>
    )
  }
}


const withOptions = function(Component, options) {
  return class extends React.Component {
    constructor(props) {
      super(props)
    }

    render() {
      const Option = Select.Option
      const {children, ...extraProps} = this.props
      return (
        <Component options={options} {...extraProps} />
      )
    }
  }
}

const withOptionsAsync = function(Component, sourceTypeList, mapStateToProps) {
  class WrappedComponent extends React.Component {
    constructor(props) {
      super(props)
    }

    componentDidMount() {
      this.props.dispatch({ type: 'app/getSourceList', payload: sourceTypeList })
    }

    render() {
      const {options, children, dispatch, ...extraProps} = this.props // 剔除属性 options, children, dispatch
      return (
        <Component options={options} {...extraProps} />
      )
    }
  }
  return connect(mapStateToProps)(WrappedComponent)
}

function withYear(Component) {
  class WrappedComponent extends React.Component {

    render() {
      const currYear = new Date().getFullYear()
      const { disabledYears=[], start=currYear, end=currYear-100, children, ...extraProps } = this.props
      const yearList = _.range(start, end)
      const options = yearList.map(year => {
        return { label: String(year), value: year, disabled: disabledYears.includes(year) }
      })

      return (
        <Component options={options} {...extraProps} />
      )
    }
  }
  return WrappedComponent
}



/************************************************************************************************/

/**
 * SelectTag
 */

const SelectTag = withOptionsAsync(SelectNumber, ['tag'], function(state) {
  const { tag } = state.app
  const options = tag ? tag.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

const SelectService = withOptionsAsync(SelectNumber, ['service'], function(state) {
  const { service } = state.app
  const options = service ? service.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectRole
 */

const SelectRole = withOptionsAsync(SelectNumber, ['character'], function(state) {
  const { character } = state.app
  const options = character ? character.map(item => ({value: item.id, label: item.character})) : []
  return { options }
})

/**
 * SelectYear
 */
const SelectYear = withYear(SelectNumber)


/**
 * SelectTransactionType
 */

const SelectTransactionType = withOptionsAsync(SelectNumber, ['transactionType'], function(state) {
  const { transactionType } = state.app
  const options = transactionType ? transactionType.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectCurrencyType
 */

const SelectCurrencyType = withOptionsAsync(SelectNumber, ['currencyType'], function(state) {
  const { currencyType } = state.app
  const options = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
  return { options }
})

/**
 * SelectOrganizationType
 */

const SelectOrganizationType = withOptionsAsync(SelectNumber, ['orgtype'], function(state) {
  const { orgtype } = state.app
  const options = orgtype ? orgtype.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectTransactionPhase
 */

const SelectTransactionPhase = withOptionsAsync(SelectNumber, ['transactionPhases'], function(state) {
  const { transactionPhases } = state.app
  const options = transactionPhases ? transactionPhases.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectOrganizatonArea
 */
const SelectOrganizatonArea = withOptionsAsync(SelectNumber, ['orgarea'], function(state) {
  const { orgarea } = state.app
  const options = orgarea ? orgarea.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectOrganization
 */
class SelectOrganization extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      org: [],
    }
  }

  handleOrgChange = value => {

    if (value === '') {
      this.setState({ org: [] })
      return
    } else if (value.length < 2) {
      this.setState({ org: [] })
      return
    } else if (this.state.org.map(i => i.name).includes(value)) {
      return
    }

    api.getOrg({search: value}).then(data => {
      const org = data.data.data.map(item => {
        return { id: item.id, name: item.orgname }
      })
      this.setState({ org: org })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  onChange = (value) => {
    this.props.onChange(value)
    this.handleOrgChange(value)
  }

  render() {
    const { org } = this.state
    return (
      <Select size="large" mode="combobox" value={this.props.value} onChange={this.onChange}>
        { org ? org.map(d => <Option key={d.id} value={d.name}>{d.name}</Option> ) : null }
      </Select>
    )
  }
}
SelectOrganization = connect()(SelectOrganization)

/**
 * SelectExistOrganization
 */
class SelectExistOrganization extends React.Component {

  getOrg = (params) => {
    return api.getOrg(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, orgname: label, description } = item
        return { value, label, description }
      })
      return { total, list }
    })
  }

  getOrgnameById = (id) => {
    return api.getOrgDetailLang(id).then(result => {
      return result.data.orgname
    })
  }

  render() {
    const { value, onChange, allowCreate, ...extraProps } = this.props
    return (
      <Select2
        getData={this.getOrg}
        getNameById={this.getOrgnameById}
        value={this.props.value}
        onChange={this.props.onChange}
        allowCreate={this.props.allowCreate}
        {...extraProps}
      />
    )
  }
}

/**
 * SelectExistUser
 */
class SelectExistUser extends React.Component {

  getUser = (params) => {
    params = { ...params, userstatus: 2 } // 审核通过
    return api.getUser(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, username: label } = item
        return { value, label }
      })
      return { total, list }
    })
  }

  getUsernameById = (id) => {
    return api.getUserDetailLang(id).then(result => {
      return result.data.username
    })
  }

  render() {
    return (
      <Select2
        style={this.props.style || {}}
        getData={this.getUser}
        getNameById={this.getUsernameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
      />
    )
  }

}

/**
 * SelectExistInvestor
 */
class SelectExistInvestor extends React.Component {

  getInvestor = (params) => {
    params = { ...params, traderuser: getCurrentUser() } // 审核通过
    return api.getUserRelation(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => item.investoruser).map(item => {
        const { id: value, username: label } = item
        return { value, label }
      })
      return { total, list }
    })
  }

  getUsernameById = (id) => {
    return api.getUserDetailLang(id).then(result => {
      return result.data.username
    })
  }

  render() {
    return (
      <Select2
        style={this.props.style || {}}
        getData={this.getInvestor}
        getNameById={this.getUsernameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
      />
    )
  }
}

/**
 * SelectExistProject
 */
class SelectExistProject extends React.Component {

  getProject = (params) => {
    params = { ...params }
    params['skip_count'] = (params['page_index'] - 1) * params['page_size']
    params['max_size'] = params['page_size']
    delete params['page_index']
    delete params['page_size']
    return api.getProj(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, projtitle: label } = item
        return { value, label }
      })
      return { total, list }
    })
  }

  getProjectNameById = (id) => {
    return api.getProjLangDetail(id).then(result => {
      return result.data.projtitle
    })
  }

  render() {
    return (
      <Select2
        style={this.props.style || {}}
        getData={this.getProject}
        getNameById={this.getProjectNameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
      />
    )
  }
}

/**
 * SelectUser
 */
class SelectUser extends React.Component {
  state = {
    data: [],
  }
  componentDidMount() {

    api.queryUserGroup({ type: this.props.type || 'trader' })
    .then(data => api.getUser({ groups: data.data.data.map(m => m.id), userstatus: 2, page_size: 1000 }))
    .then(data => this.setState({ data: data.data.data }))
    .catch(error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }
  render() {
    return (
      <Select
      mode={this.props.mode}
      showSearch
      disabled={this.props.disabled}
      optionFilterProp="children"
      allowClear={this.props.allowClear}
      value={this.props.value}
      onChange={this.props.onChange}
      onSelect={this.props.onSelect}
      onDeselect={this.props.onDeselect}>
        {this.state.data.map(d => <Option key={d.id} value={d.id + ""}
          disabled={this.props.disabledOption && (parseInt(this.props.disabledOption, 10) === d.id || this.props.disabledOption.includes(d.id + ""))}>
          {d.username}</Option>)}
      </Select>
    )
  }
}
SelectUser = connect()(SelectUser)

/**
 * SelectOrgUser
 */
class SelectOrgUser extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      options: []
    }
  }

  componentDidMount() {
    const { org, type } = this.props
    api.queryUserGroup({ type: type || 'trader'}).then(data => {
      const groups = data.data.data.map(item => item.id)
      const param = { groups, userstatus: 2, org, page_size: 1000 }
      return api.getUser(param)
    }).then(data => {
      const traders = data.data.data
      const options = traders.map(item => {
        return { label: item.username, value: item.id }
      })
      this.setState({ options })
    })
  }

  render() {
    return <SelectNumber options={this.state.options} {...this.props} />
  }
}

/**
 * SelectTransactionStatus
 */
const SelectTransactionStatus = withOptionsAsync(SelectNumber, ['transactionStatus'], function(state) {
  const { transactionStatus } = state.app
  const options = transactionStatus ? transactionStatus.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})

/**
 * SelectProjectStatus
 */
const SelectProjectStatus = withOptionsAsync(SelectNumber, ['projstatus'], function(state) {
  const { projstatus } = state.app
  const options = projstatus ? projstatus.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})

/**
 * SelectUserGroup // 值要包装在数组中
 */
class SelectUserGroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      options: [],
    }
  }

  handleChange = (value) => {
    this.props.onChange([value])
  }

  componentDidMount() {
    api.queryUserGroup({ type: this.props.type }).then(result => {
      const groups = result.data.data
      const options = groups.map(item => ({ label: item.name, value: item.id }))
      this.setState({ options })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { value, onChange, children, ...extraProps } = this.props
    return (
      <SelectNumber
      options={this.state.options}
      value={value && value[0]} onChange={this.handleChange} {...extraProps} />
    )
  }
}
SelectUserGroup = connect()(SelectUserGroup)

/**
 * SelectTitle
 */
const SelectTitle = withOptionsAsync(SelectNumber, ['title'], function(state) {
  const { title } = state.app
  const options = title ? title.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})

/**
 * SelectBDStatus
 */
const SelectBDStatus = withOptionsAsync(SelectNumber, ['bdStatus'], function(state) {
  const { bdStatus } = state.app
  const options = bdStatus ? bdStatus.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectBDSource
 */
const BDSourceOptions = [
  { label: i18n('filter.project_library'), value: 0 },
  { label: i18n('filter.other'), value: 1 },
]
const SelectBDSource = withOptions(SelectNumber, BDSourceOptions)

/**
 * SelectArea
 */
const SelectArea = withOptionsAsync(SelectNumber, ['country'], function(state) {
  const { country } = state.app
  const options = country.filter(item => item.level == 3).map(item => {
    return { label: item.country, value: item.id }
  })
  return { options }
})


/**
 * CascaderCountry
 */

class CascaderCountry extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] })
  }

  handleChange(value) {
    // onChange 只返回 国家
    const countryId = value.length == 2 ? value[1] : value[0]
    if (this.props.onChange) {
      this.props.onChange(countryId)
    }
  }

  render() {
    // 剔除部分属性
    const {options, map, children, dispatch, value:countryId, onChange, ...extraProps} = this.props

    // value 修改为 [大洲,国家] || [国家]
    const continentId = map[countryId]
    const value = continentId ? [continentId, countryId] : [countryId]

    return (
      <Cascader options={options} value={value} onChange={this.handleChange} {...extraProps} />
    )
  }

}

function mapStateToPropsCountry (state) {
  const { country } = state.app

  var list = country.filter(item => item.parent == null)
  list = list.map(item => {
    var children = country.filter(i => i.parent == item.id)
    return { ...item, children }
  })
  var options = list.map(item => {
    var ret = {
      label: item.country,
      value: item.id,
    }
    if (item.children.length > 0) {
      ret['children'] = item.children.map(i => {
        return {
          label: i.country,
          value: i.id,
        }
      })
    }
    return ret
  })

  var map = {}
  country.forEach(item => {
    map[item.id] = item.parent
  })

  return { options, map }
}

CascaderCountry = connect(mapStateToPropsCountry)(CascaderCountry)


/**
 * CascaderIndustry
 */


class CascaderIndustry extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'industry' })
  }

  handleChange(value) {
    let v = value.length == 2 ? value[1] : value[0]
    if (this.props.onChange) {
      this.props.onChange(v)
    }
  }


  render() {
    const { disabled, options, industry2pIndustry, children, dispatch, value:industryId, onChange, ...extraProps } = this.props
    const pIndustryId = industry2pIndustry[industryId]
    const value = pIndustryId ? [pIndustryId, industryId] : [industryId]

    let _options = options.map(item => {
      const { label, value, children } = item
      const ret = disabled.includes(value) ? { label, value, disabled: true } : { label, value }
      if (children) {
        ret.children = children.map(item => {
          const { label, value } = item
          return disabled.includes(value) ? { label, value, disabled: true } : { label, value }
        })
      }
      return ret
    })

    return (
      <Cascader options={_options} value={value} onChange={this.handleChange} {...extraProps} />
    )
  }
}

function mapStateToPropsIndustry (state) {
  const { industry } = state.app
  let pIndustries = industry.filter(item => item.id == item.Pindustry)
  pIndustries.forEach(item => {
    let Pindustry = item.id
    let subIndustries = industry.filter(item => item.Pindustry == Pindustry && item.id != Pindustry)
    item.children = subIndustries
  })
  const options = pIndustries.map(item => {
    var ret = {
      label: item.industry,
      value: item.id,
    }
    if (item.children.length > 0) {
      ret['children'] = item.children.map(item => {
        return {
          label: item.industry,
          value: item.id
        }
      })
    }
    return ret
  })
  let industry2pIndustry = {}
  industry.forEach(item => {
    industry2pIndustry[item.id] = item.Pindustry
  })

  return { options, industry2pIndustry }
}

CascaderIndustry = connect(mapStateToPropsIndustry)(CascaderIndustry)


/**
 * InputCurrency
 */

const USDFormatter = function(value) {
  if (isNaN(value)) {
    return '$ '
  } else{
    return '$ ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}
const USDParser = function(value) {
  return value.replace(/\$\s?|(,*)/g, '')
}
const CNYFormatter = function(value) {
  if (isNaN(value)) {
    return '￥ '
  } else {
    return '￥ ' + value.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  }
}
const CNYParser = function(value) {
  return value.replace(/\￥\s?|(,*)/g, '')
}

class InputCurrency extends React.Component {

  static formatterMap = {
    '1': CNYFormatter,
    '2': USDFormatter,
    '3': CNYFormatter,
  }
  static parserMap = {
    '1': CNYParser,
    '2': USDParser,
    '3': CNYParser,
  }

  render() {
    const { currencyType, formatter, parser, ...restProps } = this.props
    return (
      <InputNumber
        style={{width: '100%'}}
        formatter={InputCurrency.formatterMap[currencyType]}
        parser={InputCurrency.parserMap[currencyType]}
        {...restProps}
      />
    )
  }
}


class InputPhoneNumber extends React.Component {
  constructor(props) {
    super(props)

    if (this.props.value) {
      let valArr = this.props.value.split('-')
      this.state = { areaCode: valArr[0], phoneNumber: valArr[1] }
    } else {
      this.state = { areaCode: '', phoneNumber: '' }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value) {
      let valArr = nextProps.value.split('-')
      this.setState({ areaCode: valArr[0], phoneNumber: valArr[1] })
    } else {
      this.setState({ areaCode: '', phoneNumber: '' })
    }
  }

  handleAreaChange = (e) => {
    const areaCode = e.target.value
    if (!('value' in this.props)) {
      this.setState({ areaCode }, this.triggerChange)
    } else {
      this.triggerChange({
        areaCode,
        phoneNumber: this.state.phoneNumber
      })
    }
  }

  handlePhoneNumberChange = (e) => {
    const phoneNumber = e.target.value
    if (!('value' in this.props)) {
      this.setState({ phoneNumber }, this.triggerChange)
    } else {
      this.triggerChange({
        areaCode: this.state.areaCode,
        phoneNumber
      })
    }
  }

  triggerChange = ({areaCode, phoneNumber}) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(areaCode + '-' + phoneNumber)
    }
  }

  render() {
    const InputGroup = Input.Group
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: '80px', flexShrink: 0, marginRight: '8px' }}>
          <Input size="large" prefix={<Icon type="plus" />} value={this.state.areaCode} onChange={this.handleAreaChange} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <Input size="large" value={this.state.phoneNumber} onChange={this.handlePhoneNumberChange} />
        </div>
      </div>
    )
  }
}


/**
 * CheckboxTag
 */

const CheckboxTag = withOptionsAsync(CheckboxGroup, ['tag'], function(state) {
  const {tag} = state.app
  const options = tag ? tag.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

const CheckboxService = withOptionsAsync(CheckboxGroup, ['service'], function(state) {
  const {service} = state.app
  const options = service ? service.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxProjStatus
 */

const CheckboxProjStatus = withOptionsAsync(CheckboxGroup, ['projstatus'], function(state) {
  var { projstatus } = state.app
  if (!hasPerm('usersys.as_admin')) {
    projstatus = projstatus.filter(item => item.id >= 4) // 非管理员只能查看终审发布之后的项目
  }
  const options = projstatus ? projstatus.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxCurrencyType
 */

const CheckboxCurrencyType = withOptionsAsync(CheckboxGroup, ['currencyType'], function(state) {
  const { currencyType } = state.app
  const options = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
  return { options }
})

/**
 * CheckboxTransactionPhase
 */
const CheckboxTransactionPhase = withOptionsAsync(CheckboxGroup, ['transactionPhases'], function(state) {
  const { transactionPhases } = state.app
  const options = transactionPhases ? transactionPhases.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxOrganizationType
 */
const CheckboxOrganizationType = withOptionsAsync(CheckboxGroup, ['orgtype'], function(state) {
  const { orgtype } = state.app
  const options = orgtype ? orgtype.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxArea
 */
const CheckboxArea = withOptionsAsync(CheckboxGroup, ['country'], function(state) {
  const { country } = state.app
  const options = country.filter(item => item.level == 3).map(item => {
    return { label: item.country, value: item.id }
  })
  return { options }
})
const CheckboxAreaString = withOptionsAsync(CheckboxGroup, ['country'], function(state) {
  const { country } = state.app
  const options = country.filter(item => item.level == 3).map(item => {
    return { label: item.country, value: item.country, key: item.id }
  })
  return { options }
})

/**
 * TabCheckboxCountry
 */

class TabCheckboxCountry extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] })
  }

  render() {
    if (this.props.options.filter(item => item.children != null).length > 0) {
      return <TabCheckbox options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    } else {
      return <CheckboxGroup options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    }
  }
}
TabCheckboxCountry = connect(mapStateToPropsCountry)(TabCheckboxCountry)

/**
 * TabCheckboxIndustry
 */

class TabCheckboxIndustry extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    const { options, value, onChange } = this.props
    if (options.filter(item => item.children != null).length > 0) {
      return <TabCheckbox options={options} value={value} onChange={onChange} />
    } else {
      return <CheckboxGroup options={options} value={value} onChange={onChange} />
    }
  }
}

TabCheckboxIndustry = connect(mapStateToPropsIndustry)(TabCheckboxIndustry)

/**
 * CheckboxYear
 */
const CheckboxYear = withYear(CheckboxGroup)


/**
 * Slider
 */

const SliderMoney = function(props) {
  const { min, max, marks, range, ...extraProps } = props
  const _marks = { [min]: min + '', [max]: max + '+' }
  return (
    <div style={{display: 'flex', alignItems: 'baseline'}}>
      <Slider
        {...extraProps}
        range
        min={min}
        max={max}
        marks={_marks}
        style={{width: '400px'}} />
      <span style={{marginLeft: '24px'}}>{i18n('common.unit') + ' (' + i18n('common.million') + ')'}</span>
    </div>
  )
}

/**
 * RadioTrueOrFalse
 */

const RadioTrueOrFalse = withOptions(RadioGroup2, [
  { value: true, label: i18n('common.yes') },
  { value: false, label: i18n('common.no') },
])

/**
 * RadioCurrencyType
 */

const RadioCurrencyType = withOptionsAsync(RadioGroup2, ['currencyType'], function(state) {
  const { currencyType } = state.app
  const options = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
  return { options }
})

/**
 * RadioAudit
 */

const RadioAudit = withOptionsAsync(RadioGroup2, ['audit'], function(state) {
  const { audit } = state.app
  const options = audit ? audit.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * RadioBDStatus
 */

const RadioBDStatus = withOptionsAsync(RadioGroup2, ['bdStatus'], function(state) {
  const { bdStatus } = state.app
  const options = bdStatus ? bdStatus.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * RadioBDSource
 */
const RadioBDSource = withOptions(RadioGroup2, BDSourceOptions)


export {
  SelectNumber,
  RadioGroup2,

  SelectTag,
  SelectRole,
  SelectYear,
  SelectTransactionType,
  SelectCurrencyType,
  SelectOrganizationType,
  SelectTransactionPhase,
  SelectOrganizatonArea,
  SelectOrganization,
  SelectExistOrganization,
  SelectExistUser,
  SelectExistProject,
  SelectExistInvestor,
  SelectUser,
  SelectTransactionStatus,
  SelectProjectStatus,
  SelectUserGroup,
  SelectTitle,
  SelectBDStatus,
  SelectBDSource,
  SelectArea,
  SelectOrgUser,
  CascaderCountry,
  CascaderIndustry,
  InputCurrency,
  InputPhoneNumber,
  CheckboxTag,
  CheckboxProjStatus,
  CheckboxCurrencyType,
  CheckboxTransactionPhase,
  CheckboxOrganizationType,
  CheckboxArea,
  CheckboxAreaString,
  CheckboxYear,
  TabCheckboxCountry,
  TabCheckboxIndustry,
  SliderMoney,
  RadioTrueOrFalse,
  RadioCurrencyType,
  RadioAudit,
  RadioBDStatus,
  RadioBDSource,
  CheckboxService,
  SelectService,
}
