import React from 'react'
import _ from 'lodash'
import { i18n } from '../utils/util'

import { Input, Select, Icon, Button } from 'antd'
const Option = Select.Option


function Search(props) {
  function handleChange(e) {
    props.onChange(e.target.value)
  }
  const { value, onChange, onSearch, ...extraProps } = props
  return (
    <div style={{ marginBottom: '24px', width: '200px' }}>
      <Input.Search value={props.value} onChange={handleChange} onSearch={props.onSearch} {...extraProps} />
    </div>
  )
}


class Search2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.defaultValue || null
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


export { Search, Search2 }
