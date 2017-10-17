import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Table, Pagination, Input } from 'antd'
import Trigger from 'rc-trigger'
import 'rc-trigger/assets/index.css';
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { ProjectLibraryFilter } from '../components/Filter'
import { Search2 } from '../components/Search'
import { Link } from 'dva/router'
import styles from '../components/Select2.css'

import { i18n, handleError } from '../utils/util'
import * as api from '../api'


const iconStyle = {
  width: '24px',
  height: '24px',
  border: '1px solid #e1e8ee',
  borderRadius: '4px',
  marginRight:'8px',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize:'contain'
}

function tableToExcel(table, worksheetName) {
  var uri = 'data:application/vnd.ms-excel;base64,'
  var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
  var base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
  var format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

  var ctx = { worksheet: worksheetName, table: table.outerHTML }
  var href = uri + base64(format(template, ctx))
  return href
}


class ProjectLibrary extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      filters: ProjectLibraryFilter.defaultValue,
      search: null,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getProject)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getProject)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProject)
  }

  getProject = () => {
    const { filters, search, page, pageSize } = this.state
    const param = { page_index: page, page_size: pageSize, com_name: search, ...filters }
    this.setState({ loading: true })
    api.getLibProj(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list })

      // load events
      const q = list.map(item => {
        return api.getLibEvent({ com_name: item.com_name })
      })
      return Promise.all(q).then(results => {
        const events = results.map(result => {
          const event = result.data.data[0]
          if (event) {
            let { round, date, money, invsest_with } = event
            return [round, date, money, invsest_with ? invsest_with.join('，') : ''].join('，')
          } else {
            return '-'
          }
        })
        this.setState({
          list: list.map((item, index) => ({ ...item, event: events[index] })),
          loading: false,
        })
      })

    }).catch(error => {
      this.setState({ loading: false })
      handleError(error.message)
    })
  }

  exportExcel = () => {
    var link = document.createElement('a')
    link.download = 'Investors.xls'
    var table = document.querySelector('table')
    link.href = tableToExcel(table, '投资人')
    link.click()
  }

  componentDidMount() {
    this.getProject()
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading } = this.state

    const columns = [
      {title: '项目名称', render: (text, record) => {
        return (<Link to={{ pathname: '/app/projects/library/' + record.com_id }} target="_blank" style={{display:'flex',alignItems:'center'}}>
                  <div style={{...iconStyle, backgroundImage: 'url('+record.com_logo_archive+')'}}></div>
                  {record.com_name}
                </Link>)
      }},
      {title: '成立时间', dataIndex: 'com_born_date'},
      {title: '地区', dataIndex: 'com_addr'},
      {title: '行业', dataIndex: 'com_cat_name'},
      {title: '最近融资时间', dataIndex: 'invse_date'},
      {title: '最近融资事件', dataIndex: 'event'},
      {title: '轮次', dataIndex: 'invse_round_id'},
      {title: '运营状态', dataIndex: 'com_status'},
    ]

    return (
      <MainLayout location={location}>
        <PageTitle title={'项目全库'} />
        <ProjectLibraryFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '16px' }} className="clearfix">
          {/* <Search2 defaultValue={search} placeholder={i18n('project.project_name')} style={{ width: 200, float: 'left' }} onSearch={this.handleSearch} /> */}
          <Search defaultValue={search} onSearch={this.handleSearch} />
        </div>
        <Table
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />
        <div style={{ margin: '16px 0' }} className="clearfix">
          <Button type="primary" onClick={this.exportExcel}>导出</Button>
          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handlePageSizeChange}
            showQuickJumper
          />
        </div>
      </MainLayout>
    )
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

class Search extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      search: null,
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
      this.setState({ search, visible: true }, this.reloadData)
    } else {
      this.setState({ search, total: 0, list: [], visible: false })
    }
  }

  handleSearch = (search) => {
    this.props.onSearch(search)
    // 执行搜索后，blur 搜索框
    const Search = this.refs.search
    setTimeout(function() {
      Search.input.blur()
    }, 0)
  }

  handleFocus = (e) => {
    this.setState({ visible: !!this.state.search })
  }

  reloadData = () => {
    const { search } = this.state
    const param = { com_name: search }
    this.setState({ reloading: true, page: 1 })
    api.getLibProj(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ reloading: false, total, list })
    })
  }

  loadMoreData = () => {
    const { search, page, pageSize, list } = this.state
    this.setState({ loading: true, page: page + 1 })
    const param = { com_name: search, page_index: page + 1, page_size: pageSize }
    api.getLibProj(param).then(result => {
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
    this.setState({ search: value, list })
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
    const { visible, search, page, pageSize, total, list, reloading, loading } = this.state

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
          style={{width:'250px'}}
          placeholder={i18n('project.project_name')}
          value={search}
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          onFocus={this.handleFocus}
        />
      </Trigger>
    )
  }
}


export default ProjectLibrary
