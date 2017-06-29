import React from 'react'
import { FormattedMessage } from 'react-intl'
import _ from 'lodash'

import { Input, Select, Icon, Button } from 'antd'
const Option = Select.Option

class Search extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      key: props.keys[0] && props.keys[0].value
    }
    this.onKeyChange = this.onKeyChange.bind(this)
  }

  onKeyChange(value) {
    this.setState({ key: value })
  }

  onValueChange(key, e) {
    const value = e.target.value
    if (this.props.onChange) {
      this.props.onChange(key, value)
    }
  }

  render() {
    const defaultSearchKey = this.props.keys[0] && this.props.keys[0].value
    const selectBefore = (
      <Select defaultValue={defaultSearchKey} style={{ minWidth: 80 }} onChange={this.onKeyChange}>
        {
          this.props.keys.map(item =>
            <Option key={item.value} value={item.value}>{item.label}</Option>
          )
        }
      </Select>
    )

    return (
      <Input.Search
        style={{ width: 200 }}
        placeholder=""
        addonBefore={selectBefore}
        onChange={this.onValueChange.bind(this, this.state.key)}
        onSearch={this.props.onSearch.bind(this, this.state.key)} />
    )
  }
}

class Search2 extends React.Component {

  constructor(props) {
    super(props)
    const defaultKey = props.options[0] && props.options[0].value
    const defaultValue = null
    const search = props.value
    const activeKey = _.findKey(search, val => val != null)
    const activeVal = search[activeKey]

    this.state = {
      key: activeKey || defaultKey,
      value: activeVal || defaultValue,
    }
  }

  handleKeyChange = key => {
    this.setState({ key }, () => {
      const value = this.state.value
      const onChange = this.props.onChange
      if (onChange) { onChange(key, value) }
    })
  }

  handleValueChange = (e) => {
    const key = this.state.key
    const value = e.target.value
    const onChange = this.props.onChange
    if (onChange) { onChange(key, value) }
  }

  handleSearch = (value) => {
    const key = this.state.key
    this.props.onSearch(key, value)
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const search = nextProps.value
      const key = this.state.key
      const value = search[key]
      this.setState({ value })
    }
  }

  render() {

    const search = this.props.value
    const activeKey = this.state.key
    const activeVal = search[activeKey]

    const selectBefore = (
      <Select value={activeKey} style={{ minWidth: 80 }} onChange={this.handleKeyChange}>
        {
          this.props.options.map(item =>
            <Option key={item.value} value={item.value}>{item.label}</Option>
          )
        }
      </Select>
    )

    return (
      <Input.Search
        style={{ width: 200 }}
        placeholder=""
        addonBefore={selectBefore}
        value={this.state.value}
        onChange={this.handleValueChange}
        onSearch={this.handleSearch} />
    )
  }
}

function OrganizationListSearch({ value, onChange, onSearch }) {
  const searchOptions = [
    { value: 'name', label: <FormattedMessage id="organization.name" /> },
    { value: 'stockCode', label: <FormattedMessage id="organization.stock_code" /> }
  ]
  return <Search2 options={searchOptions} value={value} onChange={onChange} onSearch={onSearch} />
}

function UserListSearch({ onChange, onSearch }) {
  const searchKeys = [
    { value: 'name', label: <FormattedMessage id="name" /> },
    { value: 'phone', label: <FormattedMessage id="phone" /> },
    { value: 'email', label: <FormattedMessage id="email" /> },
    { value: 'organization', label: <FormattedMessage id="org" /> },
    { value: 'transaction', label: <FormattedMessage id="transaction" /> },
  ]
  return <Search keys={searchKeys} onChange={onChange} onSearch={onSearch} />
}

export { Search, OrganizationListSearch, UserListSearch }
