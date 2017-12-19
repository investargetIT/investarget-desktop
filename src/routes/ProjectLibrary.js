import React from 'react'
import { Button, Table, Pagination, Input } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { ProjectLibraryFilter } from '../components/Filter'
import { Search3 } from '../components/Search'
import { Link } from 'dva/router'

import { i18n, handleError, getUserInfo } from '../utils/util'
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
      listForExport: [], 
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleChangeSearch = (search) => {
    this.setState({ search })
  }

  handleSearch = (search) => {
    this.setState({ page: 1 }, this.getProject)
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
    const user=getUserInfo()
    var allList=[]
    api.getLibProj(param).then(result => {
      const { count: total, data: list } = result.data
      var promises=list.map( (item,index) => {
        const {com_id}=item
        var hasComment=false;
        return api.getLibProjRemark({com_id}).then(remarks => {
          if(remarks.data.data.some(remark=>{return remark.createuser_id==user.id})){
            hasComment=true;
          }
          allList[index]={...item,hasComment:hasComment}
        })
        })
      Promise.all(promises).then((val)=>{
        this.setState({ total, list:allList, loading: false })
      })
      
    }).catch(error => {
      this.setState({ loading: false })
      handleError(error)
    })
  }

  getAllProject = () => {
    const { filters, search } = this.state
    const param = { page_size: 500, com_name: search, ...filters }
    api.getLibProj(param).then(result => {
      const { data: list } = result.data;
      this.setState({ listForExport: list });
    });
  }

  getLibProj = (_param) => {
    var param = { ..._param }
    param['com_name'] = param['search']
    delete param['search']
    return api.getLibProj(param)
  }

  exportExcel = () => {
    var link = document.createElement('a')
    link.download = 'Investors.xls'
    var table = document.querySelectorAll('table')[1];
    link.href = tableToExcel(table, '投资人')
    link.click()
  }

  handleQuery = (location) => {
    const { query } = location
    if (query) {
      let { search } = query
      if (search) {
        this.handleChangeSearch(search)
        this.handleSearch(search)
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.handleQuery(nextProps.location)
  }

  componentDidMount() {
    this.getProject()
    this.getAllProject();
    this.handleQuery(this.props.location)
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
    const comNameStyle={color:'#d24914'}
    const columns = [
      {title: i18n('project_library.project_name'), render: (text, record) => {
        return (<div style={{minWidth:200}}><Link to={{ pathname: '/app/projects/library/' + record.com_id }} style={{display:'flex',alignItems:'center'}}>
                  <div style={{...iconStyle, backgroundImage: 'url('+record.com_logo_archive+')'}}></div>
                  <div style={record.hasComment?comNameStyle:null}>{record.com_name}</div>
                </Link></div>)
      }, width: 120},
      {title: i18n('project_library.established_time'), dataIndex: 'com_born_date'},
      {title: i18n('project_library.area'), dataIndex: 'com_addr'},
      {title: i18n('project_library.industry'), dataIndex: 'com_cat_name'},
      {title: i18n('project_library.latest_financial_time'), dataIndex: 'invse_date',width:100},
      {title: i18n('project_library.latest_financial_events'), dataIndex: 'invse_detail_money',width:100},
      {title: i18n('project_library.investment_round'), dataIndex: 'invse_round_id'},
      {title: i18n('project_library.fund_needs'), dataIndex: 'com_fund_needs_name'},
      {title: i18n('project_library.operating_status'), dataIndex: 'com_status'},
      {title: i18n('common.operation'), render: (text, record) => {
        return <Link to={{pathname: '/app/projects/bd/add', state:{com_name: record.com_name}}}><Button style={buttonStyle}>{i18n('project_library.new_bd')}</Button></Link>
      }}
    ]

    return (
      <LeftRightLayout location={this.props.location} title={i18n('project_library.project_library')}>
        <ProjectLibraryFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }} className="clearfix">
          <Search3
            getApi={this.getLibProj}
            value={search}
            onChange={this.handleChangeSearch}
            onSearch={this.handleSearch}
            placeholder={i18n('project.project_name')}
            style={{ width: 250,float:'right' }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />

        <Table
          style={{ display: 'none' }}
          columns={columns}
          dataSource={this.state.listForExport}
          rowKey={record=>record.id}
          pagination={false}
        />

        <div style={{ margin: '16px 0' }} className="clearfix">
          <Button style={{ backgroundColor: 'orange', border: 'none' }} type="primary" size="large" onClick={this.exportExcel}>{i18n('project_library.export_excel')}</Button>
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
      </LeftRightLayout>
    )
  }
}

export default ProjectLibrary
