import React from 'react'
import { Checkbox } from 'antd'
import { i18n } from '../utils/util'


const styles = {
  container: {},
  tabbar: {
    marginBottom: 8,
  },
  tab: {
    marginRight: '16px',
    cursor: 'pointer',
    color: '#4a535e',
  },
  checkboxWrapper: {}
}
styles.activeTab = Object.assign({}, styles.tab, {
  color: '#428BCA',
})


class TabCheckbox extends React.Component {

  static defaultProps = {
    options: [],
    defaultValue: [],
    value: [],
    onChange() {},
  }

  constructor(props) {
    super(props)
    /**
     * options: [{ label, value, children: [{ label, value }] }]
     * value: []
     * onChange: Function
     */

    const value = 'value' in props ? props.value : props.defaultValue
    const currParentId = props.options.length > 0 ? props.options[0].value : null

    this.state = {
      value: value || [],
      currParentId: currParentId
    }

    this.handleCheckAllChange = this.handleCheckAllChange.bind(this)
  }

  handleClick(id) {
    this.setState({
      currParentId: id
    })
  }

  handleChange(id) {
    let value = this.state.value.slice()
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
    const subOptions = this.props.options.filter(item => item.value == this.state.currParentId)[0].children || []
    let value = this.state.value.slice()
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

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && nextProps.value) {
      this.setState({
        value: nextProps.value
      })
    }

    if (!this.state.currParentId && nextProps.options && nextProps.options.length > 0) {
      this.setState({
        currParentId: nextProps.options[0].value
      })
    }
  }

  render() {
    const options = this.props.options

    if (options.length > 0 && this.state.currParentId) {

      const subOptions = options.filter(item => item.value == this.state.currParentId)[0].children || []
      const checkedSubOptions = subOptions.filter(item => this.state.value.includes(item.value))
      const isIndeterminate = !!checkedSubOptions.length && checkedSubOptions.length < subOptions.length
      const isAllChecked = checkedSubOptions.length == subOptions.length

      return (
        <div style={styles.container}>
          <div style={styles.tabbar}>
            {
              this.props.options
              .map(item => {
                const active = item.value == this.state.currParentId
                const subOptions = options.filter(item2 => item2.value == item.value)[0].children || []
                const checkedSubOptions = subOptions.filter(item => this.state.value.includes(item.value))
                return <span key={item.value}
                            onClick={this.handleClick.bind(this, item.value)}
                            style={active ? styles.activeTab : styles.tab}
                      >{item.label}{checkedSubOptions.length ? '('+checkedSubOptions.length+')' : null}</span>
              })
            }
          </div>
          {
            subOptions.length > 0 ? (
              <div style={styles.checkboxWrapper}>
                <Checkbox
                  indeterminate={isIndeterminate}
                  onChange={this.handleCheckAllChange}
                  checked={isAllChecked}
                >
                  {i18n('common.select_all')}
                </Checkbox>
                {
                  subOptions.map(item => {
                    const isChecked = this.state.value.includes(item.value)
                    return <Checkbox key={item.value} checked={isChecked} onChange={this.handleChange.bind(this, item.value)}>{item.label}</Checkbox>
                  })
                }
              </div>
            ) : null
          }
        </div>
      )
    } else {
      return null
    }
  }
}


export default TabCheckbox
