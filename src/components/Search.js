import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Select, Icon, Button } from 'antd'

import _ from 'lodash'
import { i18n } from '../utils/util'
import styles from '../components/Select2.css'
import Trigger from 'rc-trigger'
import 'rc-trigger/assets/index.css';

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


const resultStyle = {
  maxHeight: '250px',
  overflow: 'scroll',
  backgroundColor: '#fff',
  boxShadow: '0 1px 6px rgba(0,0,0,.2)',
  borderRadius: '4px',
  boxSizing: 'border-box',
  outline: 'none',
}
const tipStyle = {
  marginLeft: '8px',
}

class Search3 extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        visible: false,
        page: 1,
        pageSize: 10,
        total: 0,
        list: [],
        reloading: false,
        loading: false,
      }

      this.handleScroll = _.throttle(this.handleScroll, 300)
      this.reloadData = _.debounce(this.reloadData, 500)
    }

    isLoading = false

    handleScroll = (e) => {
      // load more when go to bottom
      const { total, list } = this.state
      const el = this.refs.result
      const distance = el.scrollHeight - el.clientHeight - el.scrollTop
      if (distance < 30 && list.length < total && !this.isLoading) {
        this.isLoading = true
        this.loadMoreData()
      }
    }

    handleChange = (e) => {
      const search = e.target.value
      if (search) {
        this.setState({ visible: true }, this.reloadData)
      } else {
        this.setState({ total: 0, list: [], visible: false })
      }
      this.props.onChange(search)
    }

    handleSearch = (value) => {
      this.props.onSearch(value)
      // 执行搜索后，blur 搜索框
      const Search = this.refs.search
      setTimeout(function() {
        Search.input.blur()
      }, 0)
    }

    handleFocus = (e) => {
      this.setState({ visible: !!this.props.value })
      if (this.props.value && this.state.list.length == 0) {
        this.reloadData()
      }
    }

    reloadData = () => {
      const param = { search: this.props.value }
      this.setState({ reloading: true, page: 1 })
      this.props.getApi(param).then(result => {
        const { count: total, data: list } = result.data
        this.setState({ reloading: false, total, list })
      })
    }

    loadMoreData = () => {
      const { page, pageSize, list } = this.state
      this.setState({ loading: true, page: page + 1 })
      const param = { search: this.props.value, page_index: page + 1, page_size: pageSize }
      this.props.getApi(param).then(result => {
        const { count, data } = result.data
        this.setState({ loading: false, list: [...list, ...data] })
        this.isLoading = false
      }).catch(error => {
        handleError(error)
        this.isLoading = false
      })
    }

    handleItemClicked = (value) => {
      const list = this.state.list.filter(item => item.com_name == value)
      this.setState({ list })
      this.props.onChange(value)
      this.props.onSearch(value)
    }

    getPopupDOMNode = () => {
      return this.refs.trigger.getPopupDomNode()
    }

    componentDidUpdate() {
      const dropdownDOMNode = this.getPopupDOMNode()

      if (dropdownDOMNode) {
        dropdownDOMNode.style['width'] = `${ReactDOM.findDOMNode(this).offsetWidth}px`
      }
    }

    render() {
      const { getApi, value, onChange, onSearch, onFocus, ...extraProps } = this.props
      const { visible, page, pageSize, total, list, reloading, loading } = this.state

      const result = (
        <div ref="result" style={{...resultStyle, display: visible ? 'block' : 'none'}} onScroll={this.handleScroll}>
          { reloading ? <p style={tipStyle}>{i18n('common.is_searching')}</p> : null }
          <ul className={styles['list']}>
            {
              list.map(item =>
                <li key={item.com_id} className={styles['item']} onClick={this.handleItemClicked.bind(this, item.com_name)}>{item.com_name}</li>
              )
            }
          </ul>
          {
            loading ? <p style={tipStyle}>{i18n('common.is_loading')}</p> : null
          }
        </div>
      )

      return (
        <Trigger
          action={['focus']}
          popup={result}
          popupAlign={{points: ['tl', 'bl'],offset:[0,3]}}
          ref="trigger"
        >
          <Input.Search
            ref="search"
            value={this.props.value}
            onChange={this.handleChange}
            onSearch={this.handleSearch}
            onFocus={this.handleFocus}
            {...extraProps}
          />
        </Trigger>
      )
    }
  }



export { Search, Search2, Search3 }
