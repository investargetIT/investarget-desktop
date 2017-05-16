import React from 'react'
import { Checkbox } from 'antd'

const styles = {
  container: {},
  tabbar: {},
  tab: {
    marginRight: '16px',
    cursor: 'pointer',
  },
  checkboxWrapper: {
    lineHeight: 2,
  }
}
styles.activeTab = Object.assign({}, styles.tab, {
  color: '#333',
})


class TabCheckbox extends React.Component {
  constructor(props) {
    super(props)
    /**
     * options: { label, value, children: { label, value } }
     * value: []
     * onChange: Function
     */
    this.state = {
      currParentId: props.options[0].value,
    }

    this.handleCheckAllChange = this.handleCheckAllChange.bind(this)
  }

  handleClick(id) {
    this.setState({
      currParentId: id
    })
  }

  handleChange(id) {
    let value = this.props.value.slice()
    if (value.includes(id)) {
      let index = value.indexOf(id)
      value.splice(index, 1)
    } else {
      value.push(id)
    }
    value = value.sort()
    this.props.onChange(value)
  }

  handleCheckAllChange(e) {
    const checked = e.target.checked
    const subOptions = this.props.options.filter(item => item.value == this.state.currParentId)[0].children
    let value = this.props.value.slice()
    if (checked) {
      subOptions.forEach(item => {
        if (!value.includes(item.value)) {
          value.push(item.value)
        }
      })
    } else {
      subOptions.forEach(item => {
        if (value.includes(item.value)) {
          let index = value.indexOf(item.value)
          value.splice(index, 1)
        }
      })
    }
    value = value.sort()
    this.props.onChange(value)
  }

  render() {
    const options = this.props.options
    const value = this.props.value
    const subOptions = options.filter(item => item.value == this.state.currParentId)[0].children

    const checkedSubOptions = subOptions.filter(item => value.includes(item.value))
    const isIndeterminate = !!checkedSubOptions.length && checkedSubOptions.length < subOptions.length
    const isAllChecked = checkedSubOptions.length == subOptions.length

    return (
      <div style={styles.container}>
        <div style={styles.tabbar}>
          {
            this.props.options
            .map(item => {
              const active = item.value == this.state.currParentId
              const subOptions = options.filter(item2 => item2.value == item.value)[0].children
              const checkedSubOptions = subOptions.filter(item => value.includes(item.value))
              return <span key={item.value}
                           onClick={this.handleClick.bind(this, item.value)}
                           style={active ? styles.activeTab : styles.tab}
                     >{item.label}{checkedSubOptions.length ? '('+checkedSubOptions.length+')' : null}</span>
            })
          }
        </div>
        <div style={styles.checkboxWrapper}>
          <Checkbox
            indeterminate={isIndeterminate}
            onChange={this.handleCheckAllChange}
            checked={isAllChecked}
          >
            全选
          </Checkbox>
          {
            subOptions.map(item => {
              const isChecked = this.props.value.includes(item.value)
              return <Checkbox key={item.value} checked={isChecked} onChange={this.handleChange.bind(this, item.value)}>{item.label}</Checkbox>
            })
          }
        </div>
      </div>
    )
  }
}

export default TabCheckbox
