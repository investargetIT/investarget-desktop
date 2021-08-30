import React from 'react'
import { Icon, Input } from 'antd'
import { connect } from 'dva'
import { Link } from 'dva/router'
import classNames from 'classnames'
import _ from 'lodash'
import debounce from 'lodash/debounce';
import * as api from '../api'
import { i18n, handleError, isParent, requestAllData } from '../utils/util';
import styles from './SiteSearch.css'
import { SearchOutlined } from '@ant-design/icons';


const searchStyle = {
  float: 'left',
  position: 'relative',
  width: 250,
  height: 50,
  borderRight: '1px solid #eee',
}
const searchInputStyle = {
  height: '100%',
  width: '100%',
  border: 'none',
  outline: 'none',
  padding: '18px 20px',
  paddingRight: 40,
}
const searchIconStyle = {
  position: 'absolute',
  right: 8,
  top: 15,
  zIndex: 1,
  fontSize: 16,
  color: '#595959',
}
const resultStyle = {
  position: 'absolute',
  zIndex: 9999,
  top: '100%',
  left: -1,
  backgroundColor: '#fff',
  width: '100%',
  border: '1px solid #eee',
  boxSizing: 'content-box',
  borderRadius: '0 0 3px 3px',
}
const listStyle = {
  padding: '10px',
  maxHeight: 212,
  overflow: 'scroll',
}
const itemStyle = {
  padding: '0 10px',
  lineHeight: '24px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
}
const loadingItemStyle = {
  ...itemStyle,
  color: '#ccc',
}


class SiteSearch extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      total: 0,
      results: [],
      page: 1,
      reloading: false,
      loading: false,
    }

    this.handleScroll = _.throttle(this.handleScroll, 300)
    this.searchData = debounce(this.searchData, 800);
  }

  isLoading = false

  handleChangeSearch = (e) => {
    const search = e.target.value
    this.props.dispatch({ type: 'app/saveSearch', payload: search })
    if (search) {
      this.showResults()
    } else {
      this.hideResults()
    }
  }

  handleKeyUp = (e) => {
    if (e.keyCode == 13) {
      let search = e.target.value
      this.onSearch(search)
      this.hideResults()
    }
  }

  handleScroll = (e) => {
    if (this.isLoading) {
      e.preventDefault();
      return;
    }
    const el = this.refs.results
    const distance = el.scrollHeight - el.clientHeight - el.scrollTop
    const { results, total } = this.state
    if (distance < 24 && results.length < total && !this.isLoading) {
      this.isLoading = true
      this.loadMoreData()
    }
  }

  handleClickItem = (com_name) => {
    this.onSearch(com_name)
    this.hideResults()
  }

  onSearch = (search) => {
    this.props.dispatch({ type: 'app/globalSearch', payload: search })
  }

  // reloadData = (search) => {
  //   this.setState({ page: 1, reloading: true })
  //   const param = { page_index: 1, page_size: 10, com_name: search }
  //   api.getLibProjSimple(param).then(result => {
  //     const { count, data } = result.data
  //     this.setState({ total: count, results: data, reloading: false })
  //   }).catch(error => {
  //     handleError(error)
  //     this.setState({ reloading: false })
  //   })
  // }

  searchData = async content => {
    window.echo('seach dd');
    const result = await Promise.all([
      requestAllData(api.getLibProjSimple, { com_name: content }, 50),
      requestAllData(api.getProj, { search: content }, 50),
    ]);
    window.echo('search result', result);
  }

  loadMoreData = () => {
    const nextPage = this.state.page + 1
    this.setState({ loading: true, page: nextPage })
    const param = { page_index: nextPage, page_size: 10, com_name: this.props.search }
    api.getLibProjSimple(param).then(result => {
      const { count, data } = result.data
      this.setState({ results: [...this.state.results, ...data], loading: false }, () => {
        // this.isLoading = false
      })
      this.isLoading = false
    }).catch(error => {
      handleError(error)
      this.setState({ loading: false }, () => {
        this.isLoading = false
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.search)
    const { search } = nextProps
    if (search) {
      // this.reloadData(search)
      this.searchData(search);
    }
  }

  handleClickOut = (e) => {
    const targetEl = e.target
    const searchEl = this.refs.site_search
    if (!isParent(targetEl, searchEl)) {
      this.hideResults()
    }
  }

  showResults = () => {
    this.setState({ visible: true })
    document.body.style.overflow = 'hidden'
  }

  hideResults = () => {
    this.setState({ visible: false })
    document.body.style.overflow = 'initial'
  }

  componentDidMount() {
    document.body.addEventListener('click', this.handleClickOut)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleClickOut)
  }

  render() {
    const { visible, results, reloading, loading } = this.state

    var content
    if (reloading) {
      content = (
        <ul style={listStyle}>
          <li style={loadingItemStyle}>{i18n('common.is_searching')}</li>
        </ul>
      )
    } else {
      if (results.length > 0) {
        content = (
          <ul style={listStyle} ref="results" onScroll={this.handleScroll}>
            {results.map(item =>
              <li
                key={item.id}
                style={itemStyle}
                className={styles['result-item']}
                onClick={this.handleClickItem.bind(this, item.com_name)}
              >
                {item.com_name}
              </li>
            )}
            {loading ? <li style={loadingItemStyle}>{i18n('common.is_loading')}</li> : null}
          </ul>
        )
      } else {
        content = (
          <ul style={listStyle}>
            <li style={itemStyle}>{i18n('query_no_results')}</li>
          </ul>
        )
      }
    }

    return (
      <div style={searchStyle} ref="site_search">
        <input
          placeholder={i18n('site_search')}
          style={searchInputStyle}
          value={this.props.search}
          onChange={this.handleChangeSearch}
          onKeyUp={this.handleKeyUp}
          onBlur={this.handleBlur}
        />
        <SearchOutlined style={searchIconStyle} />
        <div style={{ ...resultStyle, display: visible ? 'block' : 'none' }}>
          {content}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { search } = state.app
  return { search }
}

export default connect(mapStateToProps)(SiteSearch)
