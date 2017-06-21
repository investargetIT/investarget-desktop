import { connect } from 'dva'
import React from 'react'
import {
  InputNumber,
  Select,
  Cascader,
  Input,
  Icon,
  Button,
} from 'antd'
const Option = Select.Option
import _ from 'lodash'



function withSelectOptions(Select, options) {
  return class extends React.Component {
    constructor(props) {
      super(props)
    }

    render() {
      const Option = Select.Option
      const {children, ...extraProps} = this.props
      return (
        <Select {...extraProps}>
          {options && options.map((item, index) =>
            <Option key={index} value={String(item.value)}>{item.label}</Option>
          )}
        </Select>
      )
    }
  }
}


function withSelectNumberOptions(Select, options) {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.handleChange = this.handleChange.bind(this)
    }

    handleChange(value) {
      value = Array.isArray(value) ? value.map(item => Number(item)) : Number(value)
      if (this.props.onChange) {
        this.props.onChange(value)
      }
    }

    render() {
      const Option = Select.Option
      const {children, value, onChange, ...extraProps} = this.props
      let _value
      if (value == undefined) {
        _value = value
      } else {
        _value = Array.isArray(value) ? value.map(item => String(item)) : String(value)
      }
      return (
        <Select value={_value} onChange={this.handleChange} {...extraProps}>
          {options && options.map((item, index) =>
            <Option key={index} value={String(item.value)}>{item.label}</Option>
          )}
        </Select>
      )
    }
  }
}


function _withSelectOptions(Select, sourceType, mapStateToProps) {
  class WrappedSelect extends React.Component {
    constructor(props) {
      super(props)
    }

    componentDidMount() {
      this.props.dispatch({ type: 'app/getSource', payload: sourceType })
    }

    render() {
      const Option = Select.Option
      const {options, children, dispatch, ...extraProps} = this.props // 剔除属性 options, children, dispatch
      return (
        <Select {...extraProps}>
          {options.map((item, index) =>
            <Option key={index} value={String(item.value)}>{item.label}</Option>
          )}
        </Select>
      )
    }
  }

  return connect(mapStateToProps)(WrappedSelect)
}


function _withSelectNumberOptions(Select, sourceType, mapStateToProps) {
  class WrappedSelect extends React.Component {
    constructor(props) {
      super(props)
      this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount() {
      this.props.dispatch({ type: 'app/getSource', payload: sourceType })
    }

    handleChange(value) {
      value = Array.isArray(value) ? value.map(item => Number(item)) : Number(value)
      if (this.props.onChange) {
        this.props.onChange(value)
      }
    }

    render() {
      const Option = Select.Option
      const {options, children, dispatch, value, onChange, ...extraProps} = this.props // 剔除属性 options, children, dispatch
      let _value
      if (value == undefined) {
        _value = value
      } else {
        _value = Array.isArray(value) ? value.map(item => String(item)) : String(value)
      }
      return (
        <Select value={_value} onChange={this.handleChange} {...extraProps}>
          {options.map((item, index) =>
            <Option key={index} value={String(item.value)}>{item.label}</Option>
          )}
        </Select>
      )
    }
  }

  return connect(mapStateToProps)(WrappedSelect)
}


function _withCascaderOptions(Select, sourceTypeList, mapStateToProps) {
  class WrappedCascader extends React.Component {
    constructor(props) {
      super(props)
    }

    componentDidMount() {
      this.props.dispatch({ type: 'app/getSourceList', payload: sourceTypeList })
    }

    render() {
      const {options, children, dispatch, ...extraProps} = this.props // 剔除属性 options, children, dispatch
      return (
        <Cascader options={options} {...extraProps} />
      )
    }
  }
  return connect(mapStateToProps)(WrappedCascader)
}



/**
 * SelectTag
 */

const SelectTag = _withSelectNumberOptions(Select, 'tag', function(state) {
  const { tag } = state.app
  const options = tag ? tag.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectRole, TODO//后面改成网络请求
 */

const SelectRole = _withSelectNumberOptions(Select, 'character', function(state) {
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
const SelectYear = withSelectNumberOptions(Select, yearOptions)


/**
 * SelectTransactionType
 */

const SelectTransactionType = _withSelectNumberOptions(Select, 'transactionType', function(state) {
  const { transactionType } = state.app
  const options = transactionType ? transactionType.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectCurrencyType
 */

const SelectCurrencyType = _withSelectNumberOptions(Select, 'currencyType', function(state) {
  const { currencyType } = state.app
  const options = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
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

CascaderCountry = connect(
  function (state) {
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
})(CascaderCountry)


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

CascaderIndustry = connect(function (state) {
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
})(CascaderIndustry)


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


export {
  InputCurrency,
  SelectTag,
  SelectRole,
  SelectYear,
  SelectTransactionType,
  SelectCurrencyType,
  CascaderCountry,
  CascaderIndustry,
}
