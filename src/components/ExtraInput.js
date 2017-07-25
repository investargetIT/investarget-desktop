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
import _ from 'lodash'
import * as api from '../api'


function Select2 ({options, children, ...extraProps}) {
  return (
    <Select {...extraProps}>
      {options && options.map((item, index) =>
        <Option key={index} value={item.value}>{item.label}</Option>
      )}
    </Select>
  )
}

function RadioGroup2 ({children, onChange, ...extraProps}) {
  function handleChange(e) {
    onChange(e.target.value)
  }

  return (
    <RadioGroup {...extraProps} onChange={handleChange} />
  )
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
      <Select2 options={_options} value={_value} onChange={this.handleChange} {...extraProps} />
    )
  }
}


const withOptions = function(Component, options, mapStateToProps) {
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





/************************************************************************************************/

/**
 * SelectTag
 */

const SelectTag = withOptionsAsync(SelectNumber, ['tag'], function(state) {
  const { tag } = state.app
  const options = tag ? tag.map(item => ({value: item.id, label: item.name})) : []
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
const currYear = new Date().getFullYear()
const yearList = _.range(currYear, currYear - 100)
const yearOptions = yearList.map(item => ({ value: item, label: String(item) }))
const SelectYear = withOptions(SelectNumber, yearOptions)


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
    })
  }

  onChange = (value) => {
    this.props.onChange(value)
    this.handleOrgChange(value)
  }

  render() {
    const { org } = this.state
    return (
      <Select mode="combobox" value={this.props.value} onChange={this.onChange}>
        { org ? org.map(d => <Option key={d.id} value={d.name}>{d.name}</Option> ) : null }
      </Select>
    )
  }
}

/**
 * SelectExistOrganization
 */
class SelectExistOrganization extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      org: [],
    }

    if (props.value) {
      this.getOrg(props.value)
    }
  }

  getOrg = (id) => {
    api.getOrgDetailLang(id).then(result => {
      const org = result.data
      this.setState({
        org: [{ value: org.id, label: org.orgname }],
      })
    })
  }

  handleSearch = value => {
    // 清空 value 和更新 org 同时进行
    const isNumber = !Number.isNaN(parseInt(value))
    if (!isNumber && value.length >= 2) {
      this.props.onChange(undefined)
      api.getOrg({search: value}).then(data => {
        const org = data.data.data.map(item => {
          return { value: item.id, label: item.orgname }
        })
        this.setState({ org })
      })
    }
  }

  handleChange = (value) => {
    this.props.onChange(Number(value))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && this.state.org.length == 0) {
      this.getOrg(nextProps.value)
    }
  }

  render() {
    const { showSearh, value, onSearch, onChange, placeholder, children, optionLabelProp, ...extraProps } = this.props
    const { org } = this.state
    return (
      <Select
        showSearch
        value={value && String(value)}
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        placeholder="输入至少2个字，查找机构"
        optionFilterProp="children"
        optionLabelProp="children"
        {...extraProps}
      >
        { org ? org.map(d => <Option key={d.value} value={String(d.value)}>{d.label}</Option> ) : null }
      </Select>
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
    api.getUser({ groups: [2] }).then(result => {
      this.setState({
        data: result.data.data
      })
    })
  }
  render() {
    return (
      <Select mode={this.props.mode} showSearch optionFilterProp="children" value={this.props.value} onChange={this.props.onChange}>
        {this.state.data.map(d => <Option key={d.id}>{d.username}</Option>)}
      </Select>
    )
  }
}

/**
 * SelectTimelineProcess
 */
const timelineProcessOptions = [
  { label: '获取项目概要', value: 1 },
  { label: '签署保密协议', value: 2 },
  { label: '获取投资备忘录', value: 3 },
  { label: '进入一期资料库', value: 4 },
  { label: '签署投资意向书/投资条款协议', value: 5 },
  { label: '进入二期资料库', value: 6 },
  { label: '进场尽职调查', value: 7 },
  { label: '签署约束性报价书', value: 8 },
  { label: '起草法律协议', value: 9 },
  { label: '签署法律协议', value: 10 },
  { label: '完成交割', value: 11 },
]
const SelectTimelineProcess = withOptions(SelectNumber, timelineProcessOptions)

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
    api.queryUserGroup().then(result => {
      const groups = result.data.data
      const options = groups.map(item => ({ label: item.name, value: item.id }))
      this.setState({ options })
    })
  }

  render() {
    const { value, onChange, children, ...extraProps } = this.props
    return (
      <SelectNumber options={this.state.options} value={value && value[0]} onChange={this.handleChange} {...extraProps} />
    )
  }
}

/**
 * SelectTitle
 */
const SelectTitle = withOptionsAsync(SelectNumber, ['title'], function(state) {
  const { title } = state.app
  const options = title ? title.map(item => ({ value: item.id, label: item.name })) : []
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
    this.props.dispatch({ type: 'app/getSourceList', payload: ['continent', 'country'] })
  }

  handleChange(value) {
    // onChange 只返回 国家
    const countryId = value[1]
    if (this.props.onChange) {
      this.props.onChange(countryId)
    }
  }

  render() {
    // 剔除部分属性
    const {options, country2continent, children, dispatch, value:countryId, onChange, ...extraProps} = this.props

    // value 修改为 [大洲,国家]
    const continentId = country2continent[countryId]
    const value = [continentId, countryId]

    return (
      <Cascader options={options} value={value} onChange={this.handleChange} {...extraProps} />
    )
  }

}

function mapStateToPropsCountry (state) {
  const { continent, country } = state.app

  let country2continent = {}
  country.forEach(item => {
    country2continent[item.id] = item.continent
  })
  const options = continent.map(continent => {
    return {
      label: continent.continent,
      value: continent.id,
      children: country.filter(country => country.continent == continent.id)
                        .map(country => ({ label: country.country, value: country.id }))
    }
  })

  return { options, country2continent }
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
    if (this.props.onChange) {
      this.props.onChange(value[1])
    }
  }

  render() {
    const { options, industry2pIndustry, children, dispatch, value:industryId, onChange, ...extraProps } = this.props
    const pIndustryId = industry2pIndustry[industryId]
    const value = [pIndustryId, industryId]
    return (
      <Cascader options={options} value={value} onChange={this.handleChange} {...extraProps} />
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

/**
 * CheckboxProjStatus
 */

const CheckboxProjStatus = withOptionsAsync(CheckboxGroup, ['projstatus'], function(state) {
  const { projstatus } = state.app
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
 * TabCheckboxCountry
 */

const TabCheckboxCountry = withOptionsAsync(TabCheckbox, ['continent', 'country'], mapStateToPropsCountry)


/**
 * TabCheckboxIndustry
 */

const TabCheckboxIndustry = withOptionsAsync(TabCheckbox, ['industry'], mapStateToPropsIndustry)


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
      <span style={{marginLeft: '24px'}}>单位（百万美元）</span>
    </div>
  )
}

/**
 * RadioTrueOrFalse
 */

const RadioTrueOrFalse = withOptions(RadioGroup2, [
  { value: true, label: '是' },
  { value: false, label: '否' },
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


export {
  SelectNumber,

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
  SelectUser,
  SelectTimelineProcess,
  SelectProjectStatus,
  SelectUserGroup,
  SelectTitle,
  CascaderCountry,
  CascaderIndustry,
  InputCurrency,
  InputPhoneNumber,
  CheckboxTag,
  CheckboxProjStatus,
  CheckboxCurrencyType,
  CheckboxTransactionPhase,
  CheckboxOrganizationType,
  TabCheckboxCountry,
  TabCheckboxIndustry,
  SliderMoney,
  RadioTrueOrFalse,
  RadioCurrencyType,
  RadioAudit,
}
