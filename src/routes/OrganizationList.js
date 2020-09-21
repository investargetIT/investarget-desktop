import React from 'react'
import { Link } from 'dva/router'
import { 
  i18n, 
  hasPerm,
  getUserInfo,
} from '../utils/util';
import * as api from '../api'
import { connect } from 'dva'
import { Button, Popconfirm, Modal, Table, Pagination, Select, Icon, Radio } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { OrganizationListFilter } from '../components/Filter'
import { Search } from '../components/Search';
import { PAGE_SIZE_OPTIONS } from '../constants';

const Option = Select.Option
const RadioGroup = Radio.Group;

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right', marginTop: window.innerWidth < 1200 ? 10 : undefined };


class OrganizationList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : OrganizationListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10
    const searchOption = setting ? (setting.searchOption || 0) : 0

    this.state = {
      filters,
      search,
      page,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      sort:undefined,
      desc:undefined,
      selectedIds: [],
      downloadUrl: null,
      searchOption,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.handleOrgSearch);
  }

  handleReset = (filters) => {
    this.setState({ searchOption: 0, filters, page: 1, search: null }, this.getOrg);
  }

  // handleSearch = (search) => {
  //   this.setState({ search, page: 1 }, this.getOrg)
  // }

  handleOrgSearch = () => {
    if (this.state.searchOption === 0) {
      this.setState({ page: 1 }, this.getOrg);
    } else if (this.state.searchOption === 1) {
      this.setState({ page: 1 }, this.searchOrg);
    }
  }

  handleFilterOrg = () => {
    if (this.state.searchOption === 0) {
      this.getOrg();
    } else if (this.state.searchOption === 1) {
      this.searchOrg();
    }
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.handleFilterOrg)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.handleFilterOrg)
  }

  getOrg = () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    // const orgstatus = [];
    // if (!hasPerm('org.admin_changeorg')) {
    //   orgstatus.push(2); // 审核通过 
    // }
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort, desc, issub: false }
    this.setState({ loading: true })
    console.log(params)
    api.getOrg(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }

  searchOrg = () => {
    if (!this.state.search) {
      Modal.error({
        title: '无效操作',
        content: '搜索备注及附件内文字时，内容不能为空',
      });
      return;
    };
    const { filters, search: text, page, pageSize, sort, desc } = this.state;
    const params = { ...filters, text, page_index: page, page_size: pageSize, sort, desc, issub: false };
    this.setState({ loading: true })
    api.searchOrg(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }

  // 按创建时间排序
  handleSortChange = value => {
    const desc = value === 'desc' ? 1 : 0;
    this.setState({ desc, sort: undefined }, this.handleOrgSearch);
  }

  deleteOrg = (id) => {
    this.setState({ loading: true })
    api.deleteOrg(id).then(result => {
      this.handleFilterOrg();
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  writeSetting = () => {
    const { filters, search, page, pageSize, searchOption } = this.state;
    const data = { filters, search, page, pageSize, searchOption };
    localStorage.setItem('OrganizationList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('OrganizationList')
    return data ? JSON.parse(data) : null
  }
  
  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.handleFilterOrg
    );
  }

  componentDidMount() {
    this.handleFilterOrg();
  }

  handleExportBtnClicked = () => {
    api.addOrgExport({ org: this.state.selectedIds.join(',') })
      .then(() => Modal.success({
          title: '请求已成功发送',
          content: '请稍后在导出任务中进行下载',
        })
      )
      .catch(error => this.props.dispatch({
        type: 'app/findError',
        payload: error
      }));
  }

  handleRowSelectionChange = selectedIds => {
    if (selectedIds.length > 300) {
      Modal.error({
        title: '无效操作',
        content: '最多导出300家机构',
      })
      return;
    }
    this.setState({ selectedIds })
  }

  render() {
    const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      { title: '全称', key: 'orgname',  
        render: (text, record) => <Link to={'/app/organization/' + record.id}>
          <div style={{ color: "#428BCA" }}>
            { record.orglevel && [1, 2].includes(record.orglevel.id) ?
            <img style={{ width: 10, marginTop: -10 }} src="/images/certificate.svg" />
            : null}
            {record.orgfullname}
            { record.orglevel && [1, 2].includes(record.orglevel.id) ? 
            <span style={{ color: 'gray' }}><Icon type="user" />({record.user_count})</span>
            : null }
          </div>
        </Link>,
      //sorter:true, 
      },
      { title: i18n('organization.industry'), key: 'industry', dataIndex: 'industry.industry', sorter:true, },
      { title: i18n('organization.currency'), key: 'currency', dataIndex: 'currency.currency', sorter:true, },
      { title: i18n('organization.decision_cycle'), key: 'decisionCycle', dataIndex: 'decisionCycle', sorter:true, },
      { title: i18n('organization.transaction_phase'), key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return <span className="span-phase">{phases.map(p => p.name).join(' / ')}</span>
      }, sorter:true, },
      { title: i18n('organization.stock_code'), key: 'stockcode', dataIndex: 'stockcode', sorter:true, },
      { title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <span className="span-operation" style={{display:'flex',justifyContent:'space-between'}}>

            <Link to={'/app/organization/edit/' + record.id}>
              <Button style={buttonStyle} disabled={!record.action.change} size="small" >{i18n("common.edit")}</Button>
            </Link>

            <Popconfirm title={i18n('delete_confirm')} onConfirm={this.deleteOrg.bind(null, record.id)}>
              <Button style={buttonStyle} size="small" disabled={!record.action.delete} >
                <Icon type="delete" />
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state
    const action = hasPerm('org.admin_addorg') || hasPerm('org.user_addorg') ?
                    { name: i18n('organization.new_org'), link: "/app/organization/add" } : null

    return (
      <LeftRightLayout location={this.props.location} title={i18n('menu.organization_management')} action={action}>

        <div>

          <OrganizationListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />

          <div style={{ overflow: 'auto' }}>

            {/* <div style={{ float: 'left', marginBottom: '24px', width: '200px' }}>
              <Search
                style={{ width: 250 }}
                placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')}
                onSearch={() => this.setState({ page: 1 }, this.getOrg)}
                onChange={search => this.setState({ search })}
                value={search}
              />
            </div> */}

            <div style={{ float: 'left', marginBottom: '24px', width: '700px' }}>
              <RadioGroup onChange={e => this.setState({ searchOption: e.target.value })} defaultValue={0} value={this.state.searchOption}>
                <Radio value={0}>搜索机构名称/股票代码</Radio>
                <Radio value={1}>搜索备注以及附件内文字</Radio>
              </RadioGroup>
              <Search
                style={{ width: 250, marginLeft: 10 }}
                placeholder="搜索内容"
                onChange={search => this.setState({ search })}
                value={search}
                onSearch={this.handleOrgSearch}
              />
            </div>

            <div style={{ float: 'right' }}>
              {i18n('common.sort_by_created_time')}
              <Select size="large" style={{ marginLeft: 8 }} defaultValue="desc" onChange={this.handleSortChange}>
                <Option value="asc">{i18n('common.asc_order')}</Option>
                <Option value="desc">{i18n('common.dec_order')}</Option>
              </Select>
            </div>

          </div>

          <Table
            onChange={this.handleTableChange}
            style={tableStyle}
            columns={columns}
            dataSource={list}
            rowKey={record => record.id}
            loading={loading}
            pagination={false}
            rowSelection={{ onChange: this.handleRowSelectionChange, selectedRowKeys: this.state.selectedIds }}
          />

          <div style={{ fontSize: 13, marginTop: 0, float: window.innerWidth > 1200 ? 'left' : undefined }}>
            <Button
              disabled={this.state.selectedIds.length == 0}
              style={{ backgroundColor: 'orange', border: 'none' }}
              type="primary"
              size="large"
              loading={this.state.isLoadingExportData}
              onClick={this.handleExportBtnClicked}>
              {i18n('project_library.export_excel')}
            </Button>
            <img style={{ marginLeft: 10, width: 10 }} src="/images/certificate.svg" />表示Top机构，
            <Icon type="user" />表示该机构下有联系方式的投资人数量
          </div>

          <Pagination
            style={paginationStyle}
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

        <iframe style={{ display: 'none' }} src={this.state.downloadUrl}></iframe>

      </LeftRightLayout>
    )

  }

}

export default connect()(OrganizationList)
