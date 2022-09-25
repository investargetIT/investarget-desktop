import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import _ from 'lodash'
import debounce from 'lodash/debounce';
import * as api from '../api'
import { i18n, handleError, isParent, requestAllData } from '../utils/util';
import styles from './SiteSearch.css'
import { SearchOutlined } from '@ant-design/icons';
import { Tag } from 'antd';


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
  overflowY: 'scroll',
}
const itemStyle = {
  padding: '0 10px',
  lineHeight: '24px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  // whiteSpace: 'nowrap',
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

  handleClickItem = item => {
    this.onSearch(item);
  }

  onSearch = (item) => {
    switch (item.type) {
      case 'project':
        window.open(`/app/projects/${item.id}`);
        break;
      case 'user':
        window.open(`/app/user/${item.id}`);
        break;
      case 'projBD':
        window.open(`/app/projects/bd?search=${item.com_name}`);
        break;
      default:
        break;
    }
  }

  searchData = async () => {
    let { search: content } = this.props;
    content = content.trim();
    if (!content) return;
    try {
      this.setState({ reloading: true });
      const res = await Promise.all([
        requestAllData(api.getUser, { search: content }, 50),
        requestAllData(api.getProjBDList, { search: content }, 50),
        requestAllData(api.getProj, { search: content }, 50),
      ]);
      const res0 = res[0].data.data.map(m => ({ ...m, com_name: m.username, type: 'user', label: '用户' }));
      const res1 = res[1].data.data.map(m => ({ ...m, type: 'projBD', label: '项目BD' }));
      const res2 = res[2].data.data.map(m => ({ ...m, com_name: m.projtitle, type: 'project', label: '项目' }));
      const allResult = [...res0, ...res1, ...res2];
      const total = res[0].data.count + res[1].data.count + res[2].data.coount;
      this.setState({ total, results: allResult, reloading: false });
    } catch (error) {
      handleError(error);
      this.setState({ reloading: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.search !== this.props.search) {
      this.searchData();
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
          <ul style={listStyle} ref="results" 
          >
            {results.map(item =>
              <li
                key={item.id}
                style={itemStyle}
                className={styles['result-item']}
                onClick={this.handleClickItem.bind(this, item)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ lineHeight: '1.3' }}>{item.com_name}</div>
                  <div><Tag style={{ marginRight: 0, marginLeft: 8 }}>{item.label}</Tag></div>
                </div>
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
      <div className="remove-on-mobile" style={searchStyle} ref="site_search">
        <input
          placeholder={i18n('site_search')}
          style={searchInputStyle}
          value={this.props.search}
          onChange={this.handleChangeSearch}
          onKeyUp={this.handleKeyUp}
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
