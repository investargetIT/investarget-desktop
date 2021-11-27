import React from 'react'
import { Button, Table, Pagination, Input } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { ProjectLibraryFilter } from '../components/Filter'
import { Search3 } from '../components/Search'
import { Link, withRouter } from 'dva/router';
import { 
  i18n, 
  handleError, 
  getUserInfo, 
  hasPerm,
  requestAllData,
  getURLParamValue,
} from '../utils/util';
import * as api from '../api'
import { PAGE_SIZE_OPTIONS } from '../constants';
import qs from 'qs';


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

    // 根据是否从机构页面跳转而来设置相应的筛选条件
    const params = new URLSearchParams(props.location.search);
    const searchContent = params.get('search');
    let search, filters, page;
    if (searchContent) {
      search = searchContent;
      filters = ProjectLibraryFilter.defaultValue;
    } else {
      const setting = this.readSetting();
      filters = setting ? setting.filters : ProjectLibraryFilter.defaultValue;
      search = setting ? setting.search : null;
      page = setting ? setting.page : 1;
    }

    this.state = {
      filters,
      search,
      page: page || 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      listForExport: [],
      selectedIds: [],
      isLoadingExportData: false,
    }
  }

  writeSetting = () => {
    const { filters, search, page } = this.state;
    const data = { filters, search, page };
    localStorage.setItem('ProjectLibrary1', JSON.stringify(data));
  }

  readSetting = () => {
    var data = localStorage.getItem('ProjectLibrary1');
    return data ? JSON.parse(data) : null;
  }

  handleFilt = (filters) => {
    // const { search } = this.props.location.query;
    // const parameters = { search, page: 1 };
    // this.props.router.push(`/app/projects/library?${qs.stringify(parameters)}`);
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1, search: null }, this.getProject)
  }

  handleChangeSearch = (search) => {
    this.setState({ search })
  }

  handleSearch = (search) => {
    this.setState({ page: 1 }, this.getProject)
  }

  handlePageChange = (page) => {
    // const { search } = this.props.location.query;
    // const parameters = { search, page };
    // this.props.router.push(`/app/projects/library?${qs.stringify(parameters)}`);
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
    this.writeSetting();
  }

  getAllProject = () => {
    const { filters, search } = this.state
    const param = { page_size: 500, com_name: search, ...filters }
    requestAllData(api.getLibProjSimple, param, 500).then(result => {
      const { data: list } = result.data;
      this.setState({ listForExport: list });
    });
  }

  getLibProj = (_param) => {
    var param = { ..._param }
    param['com_name'] = param['search']
    delete param['search']
    return api.getLibProjSimple(param)
  }
  
  handleSelectChange = selectedIds => {
    this.setState({ selectedIds });
  }

  handleExportBtnClicked = () => {
    this.setState({ isLoadingExportData: true });
    api.getProjLibraryForExport({ com_ids: this.state.selectedIds })
      .then(data => {
        const { proj, event } = data.data;
        proj.forEach(element => {
          const projEvent = event.filter(f => f.com_id === element.com_id);
          element.event = projEvent;
        });
        this.setState(
          { isLoadingExportData: false, listForExport: proj },
          this.exportExcel,
        );
      })
  }

  exportExcel = () => {
    var link = document.createElement('a')
    link.download = 'Investors.xls'
    var table = document.querySelectorAll('table')[1];
    link.href = tableToExcel(table, '投资人')
    link.click()
  }

  // 目前在机构投资事件跳转到当前页面然后点击菜单栏的项目全库时会出发这个生命周期
  componentWillReceiveProps(nextProps) {
    const nextPage = getURLParamValue(nextProps, 'page');
    const nextSearch = getURLParamValue(nextProps, 'search');
    const currentPage = getURLParamValue(nextProps, 'page');
    const currentSearch = getURLParamValue(nextProps, 'search');
    if (currentSearch !== nextSearch) {
      this.setState({ filters: ProjectLibraryFilter.defaultValue, page: 1, search: nextSearch }, this.getProject);
    } else if (nextPage !== currentPage) {
      this.setState({ page: parseInt(nextPage, 10) || 1 }, this.getProject);
    }
  }

  componentDidMount() {
    this.getProject();
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, listForExport } = this.state
    const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const comNameStyle={color:'#d24914'}
    const rowSelection = {
      onChange: this.handleSelectChange,
    }
    const baseColumns = [
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
      {title: '最近融资金额', dataIndex: 'invse_detail_money',width:100},
      {title: i18n('project_library.investment_round'), dataIndex: 'invse_round_id'},
      {title: i18n('project_library.fund_needs'), dataIndex: 'com_fund_needs_name'},
      {title: i18n('project_library.operating_status'), dataIndex: 'com_status'},
    ]
    const columns = [...baseColumns];
    if (hasPerm('BD.manageProjectBD')) {
      columns.push({
        title: i18n('common.operation'),
        align: 'center',
        render: (text, record) => <Link to={{ pathname: '/app/projects/bd/add', state: { com_name: record.com_name } }}>
          <Button type="link">{i18n('project_library.new_bd')}</Button>
        </Link>
      });
    }
    const extraColumns = [
      {title: '简介', dataIndex: 'com_des'},
      {title: '网址', dataIndex: 'com_web'},
      {title: '电话', dataIndex: 'mobile'},
      {title: '邮箱', dataIndex: 'email'},
      {title: '地址', dataIndex: 'detailaddress'},
      {title: '历史融资情况', dataIndex: 'event', render: (text, record) => {
        return record.event.map(m => {
          const investors = m.invsest_with.map(m => m.invst_name).join('，');
          return m.date + ' ' + m.round + ' ' + investors + ' ' + m.money;
        }).join('；');
      }},
    ];
    const columnForExport = baseColumns.concat(extraColumns);

    return (
      <LeftRightLayout location={this.props.location} title={i18n('project_library.project_library')}>
        {/* <ProjectLibraryFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} /> */}
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
          rowSelection={rowSelection}
          dataSource={list}
          rowKey={record=>record.com_id}
          loading={loading}
          pagination={false}
        />

        <Table
          style={{ display: 'none' }}
          columns={columnForExport}
          dataSource={listForExport}
          rowKey={record=>record.com_id}
          pagination={false}
        />

        <div style={{ margin: '16px 0' }} className="clearfix">
          <Button 
            disabled={this.state.selectedIds.length==0} 
            style={{ backgroundColor: 'orange', border: 'none' }} 
            type="primary" 
            size="large" 
            loading={this.state.isLoadingExportData}
            onClick={this.handleExportBtnClicked}>
            {i18n('project_library.export_excel')}
          </Button>
          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handlePageSizeChange}
            showQuickJumper
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </LeftRightLayout>
    )
  }
}

export default withRouter(ProjectLibrary);
