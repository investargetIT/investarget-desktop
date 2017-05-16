import React from 'react'
import { Input, Select, Icon, Button } from 'antd'
import { FormattedMessage } from 'react-intl'

const Option = Select.Option

class Search extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      key: null
    }
  }

  onChange(value) {
    this.setState({ key: value })
  }

  render() {
    const selectBefore = (
      <Select defaultValue="name" style={{ width: 80 }} onChange={this.onChange.bind(this)}>
        <Option value="name"><FormattedMessage id="user.name" /></Option>
        <Option value="phone"><FormattedMessage id="user.phone" /></Option>
        <Option value="email"><FormattedMessage id="user.email" /></Option>
        <Option value="organization"><FormattedMessage id="user.organization" /></Option>
        <Option value="transaction"><FormattedMessage id="user.transaction" /></Option>
      </Select>
    )

    return (
      <Input.Search 
        style={{ width: 200 }} 
        placeholder=""
        addonBefore={selectBefore}
        onSearch={this.props.onSearch.bind(this, this.state.key)} />
    )
  }
}

export default Search

