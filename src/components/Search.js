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


function _Search(props) {
  const style = { marginBottom: '24px', width: '200px' }
  function handleChange(e) {
    props.onChange(e.target.value)
  }
  const { value, onChange, onSearch, ...extraProps } = props
  return (
    <div style={style}>
      <Input.Search value={props.value} onChange={handleChange} onSearch={props.onSearch} {...extraProps} />
    </div>
  )
}

class Search2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null
    }
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value })
  }

  handleSearch = () => {
    this.props.onSearch(this.state.value)
  }

  render() {
    const { value, onChange, onSearch, ...extraProps } = this.props
    return <Input.Search value={this.state.value} onChange={this.handleChange} onSearch={this.handleSearch} {...extraProps} />
  }
}


export { UserListSearch, _Search as Search, Search2 }
