import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Input, Icon, Tooltip } from 'antd'
import Trigger from 'rc-trigger'
import 'rc-trigger/assets/index.css';
import _ from 'lodash'
import styles from './Select2.css'
import { i18n } from '../utils/util'

function isParent(obj, parentObj) {
  while (obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY') {
    if (obj == parentObj) {
      return true
    }
    obj = obj.parentNode
  }
  return false
}

const valueStyle = {
  position: 'relative',
  display: 'block',
  boxSizing: 'border-box',
  paddingLeft: '7px',
  paddingRight: '7px',
  outline: 'none',
  border: '1px solid #d9d9d9',
  height: '32px',
  lineHeight: '32px',
  borderRadius: '4px',
  backgroundColor: '#fff',
  transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
  cursor: 'pointer',
  userSelect: 'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
const searchStyle = {
  marginTop: '8px',
  borderRadius: '4px',
  overflow: 'hidden',
  boxShadow: '0 1px 6px rgba(0, 0, 0, 0.2)',
}
const inputStyle = {
  borderRadius: 'none',
  outline: 'none',
}
const resultStyle = {
  minHeight: '200px',
  maxHeight: '250px',
  overflow: 'scroll',
  border: '1px solid #d9d9d9',
  backgroundColor: '#fff',
}
const tipStyle = {
  marginLeft: '8px',
}


class Select2 extends React.Component {

  // static propTypes = {
  //   value: PropTypes.number.isRequired,
  //   onChange: PropTypes.func.isRequired,
  //   getData: PropTypes.func.isRequired,
  //   getNameById: PropTypes.func.isRequired,
  // }

  isLoading = false

  constructor(props) {
    super(props)

    this.state = {
      label: '',
      visible: false,
      search: '',
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      reloading: false,
      loading: false,
    }

    if (props.value) {
      this.getLabelByValue(props.value).then(name => {
        this.setState({ label: name })
      }, error => {
        this.handleError(error)
      })
    }

    this.handleScroll = _.throttle(this.handleScroll, 300)
    this.delayReloadData = _.debounce(this.reloadData, 500)
  }

  handleSearch = (e) => {
    const search = e.target.value
    this.reset()
    this.setState({ search }, this.delayReloadData)
  }

  reloadData = () => {
    const { search, pageSize } = this.state
    const params = { search, page_index: 1, page_size: pageSize }
    this.setState({ page: 1, reloading: true })
    this.props.getData(params).then(data => {
      const { total, list } = data
      this.setState({ reloading: false, total, list })
    }, error => {
      this.setState({ reloading: false })
      this.handleError(error)
    })
  }

  loadMoreData = () => {
    const { search, page, pageSize } = this.state
    this.setState({ page: page + 1 }) // 加载下一页...
    const params = { search, page_index: page + 1, page_size: pageSize }
    this.setState({ loading: true })
    this.props.getData(params).then(data => {
      const { total, list } = data
      this.setState({ loading: false, total, list: [...this.state.list, ...list] }) // append
      this.isLoading = false
    }, error => {
      this.setState({ loading: false })
      this.isLoading = false
      this.handleError(error)
    })
  }

  getLabelByValue = (value) => {
    if (value) {
      // first, search from this.state.list, then, search from remote api
      let { list } = this.state
      let item = list.filter(item => item.value == value)[0]
      let name = item ? item.label : ''
      if (name) {
        return Promise.resolve(name)
      } else {
        return this.props.getNameById(value)
      }
    } else {
      return Promise.resolve('')
    }
  }

  handleSelect = ({label, value}) => {
    let newValue
    if(this.props.allowCreate){
      newValue = label
      if(this.props.formName=='userform'){
        newValue = `${value}`
      }
    }
    else{
      newValue=value
    }
    //this.props.onChange(this.props.allowCreate ? `${value}` : value)
    this.props.onChange(newValue)
    this.closeSearch()
  }

  handleCreate = value => {
    this.props.onChange(value);
    this.closeSearch();
  }

  handleScroll = (e) => {
    // load more when go to bottom
    const { total, list } = this.state
    const el = this.refs.result
    const distance = el.scrollHeight - el.clientHeight - el.scrollTop
    if (distance < 10 && list.length < total && !this.isLoading) {
      this.isLoading = true
      this.loadMoreData()
    }
  }

  reset = () => {
    this.setState({ search: '', page: 1, pageSize: 10, total: 0, list: [], reloading: false, loading: false })
  }

  getFocus = () => {
    const inputEl = this.refs.search.refs.input
    inputEl.focus()
  }

  openSearch = () => {
    this.setState({ visible: true }, this.getFocus)
    this.reloadData()
  }

  closeSearch = () => {
    this.setState({ visible: false })
    this.reset()
  }

  toggleSearch = () => {
    const { visible } = this.state
    if (visible) {
      this.closeSearch()
    } else {
      this.openSearch()
    }
  }

  handleError = (error) => {
    this.props.dispatch({
      type: 'app/findError',
      payload: error,
    })
  }

  componentWillReceiveProps(nextProps) {
    const value = nextProps.value
    const allowCreate = nextProps.allowCreate
    if (allowCreate) {
      this.setState({ label: value});
      if(this.props.formName=='userform'&& !isNaN(value)){
        this.getLabelByValue(parseInt(value)).then(name => {
        this.setState({ label: name })
      }, error => {
        this.handleError(error)
      })
      }
    } else {
      this.getLabelByValue(value).then(name => {
        this.setState({ label: name })
      }, error => {
        this.handleError(error)
      })
    }
  }

  handleOutClick = (e) => {
    const containerEl = this.refs.container
    const contentEl   = this.refs.content
    const targetEl = e.target
    // 如果 containerEl 不是 targetEl 的祖先元素，则 closeSearch
    if (!isParent(targetEl, containerEl) && !isParent(targetEl, contentEl)) {
      this.closeSearch()
    }
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

  componentDidMount() {
    document.body.addEventListener('click', this.handleOutClick)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleOutClick)
  }

  render() {
    const { label, visible, search, list, reloading, loading, total } = this.state;
    const content = (
      <div style={{ ...searchStyle }} ref="content">
        <Input ref="search" style={inputStyle} size="large" suffix={this.props.allowCreate ? <Icon type="plus" onClick={this.handleCreate.bind(this, search)} /> : null} placeholder={this.props.placeholder} value={search} onChange={this.handleSearch} />
        <div ref="result" style={resultStyle} onScroll={this.handleScroll}>
          { reloading ? <p style={tipStyle}>{i18n('common.is_searching')}</p> : null }
          { !reloading && total === 0 ? <p style={tipStyle}>{this.props.noResult || '暂无'}</p> : null }
          <ul className={styles['list']}>
            {
              list.map(item =>
              <Tooltip key={item.value} title={item.description && <div dangerouslySetInnerHTML={{ __html: item.description.replace(/\n/g, '<br>') }} />}>
                <li key={item.value} className={styles['item']} onClick={this.handleSelect.bind(this, {label:item.label, value: item.value})}>{item.label}</li>
              </Tooltip>
              )
            }
          </ul>
          {
            loading ? <p style={tipStyle}>{i18n('common.is_loading')}</p> : null
          }
        </div>
      </div>
    )


    return (
      <div ref="container" style={this.props.containerStyle}>
        <Trigger
          action={['click']}
          popup={content}
          popupVisible={visible}
          popupAlign={{points: ['tl', 'bl'],offset:[0,3]}}
          ref="trigger"
        >
          <div style={{...valueStyle, ...this.props.style}} onClick={this.toggleSearch}>{label || this.props.placeholder}<span className="ant-select-arrow"></span></div>
        </Trigger>
      </div>
    )
  }
}

export default connect()(Select2)
