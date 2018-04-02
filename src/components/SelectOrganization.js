import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { 
  i18n,
  getUserInfo,
} from '../utils/util';
import * as api from '../api'
import { PAGE_SIZE_OPTIONS } from '../constants';
import { 
  Button, 
  Popconfirm, 
  Modal, 
  Table, 
  Pagination, 
  Popover,
  Tag,
  Spin,
  Row,
  Col,
} from 'antd';
import { OrganizationListFilter } from './Filter'
import { Search2 } from './Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


function Investor(props) {
  return (
    <Row style={{ padding: '4px 0' }}>
      <Col span={6}>{props.username}</Col>
      <Col span={6}>{props.mobile}</Col>
      <Col span={12}>{props.tags ? props.tags.map(m => m.name).join('，') : ''}</Col>
    </Row>
  )
}

class SelectOrganization extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      filters: OrganizationListFilter.defaultValue,
      search: null,
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      orgInvestor: [],
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrg)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrg)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getOrg)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getOrg)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getOrg)
  }

  getOrg = () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, issub: false}
    if (this.props.traderId) {
      params['trader'] = this.props.traderId
    }
    this.setState({ loading: true })
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
  }

  componentDidMount() {
    this.getOrg()
  }

  // 用户删除了某个机构 Tag，模拟取消选中那个机构产生的 onChange 事件
  handleDeleteOrgTag(tag, e) {
    const newOrg = this.props.value.filter(f => f !== tag.id);
    const newOrgDetails = this.props.details.filter( f => f.id !== tag.id);
    this.props.onChange(newOrg, newOrgDetails);
  }

  popoverContent = record => {
    const orgInvestor = this.state.orgInvestor.filter(f => f.id === record.id);
    if (orgInvestor.length > 0) {
      const investor = orgInvestor[0].investors.data;
      if (investor.length > 0) {
        return <div style={{ width: 500 }}>
          {investor.map(m => <Investor key={m.id} {...m} />)}
        </div>;
      } else {
        return '暂无投资人';
      }
    } else {
      return <Spin />;
    }
  }

  handleOrgNameHover = record => {
    const orgInvestor = this.state.orgInvestor.filter(f => f.id === record.id);
    if (orgInvestor.length === 0) {
      this.getInvestor(record.id);
    }
  }

  getInvestor = orgID => {
    api.queryUserGroup({ type: 'investor' })
      .then(data => {
        const investorGroups = data.data.data.map(item => item.id);
        return api.getUser({
          page_size: 1000,
          groups: investorGroups,
          starmobile: true,
          org: [orgID]
        })
      })
      .then(data => {
        this.setState({ orgInvestor: this.state.orgInvestor.concat({
          id: orgID,
          investors: data.data
        })});
      })
  }

  render() {

    const rowSelection= {
      selectedRowKeys: this.props.value,
      onChange: this.props.onChange,
    }

    const columns = [
      { title: i18n('organization.orgname'), key: 'orgname', dataIndex: 'orgname', 
        render: (text, record) => <div>
          <Popover placement="topLeft" content={this.popoverContent(record)}>
            <span style={{ color: '#428BCA' }} onMouseEnter={this.handleOrgNameHover.bind(this, record)}>{text}</span>
          </Popover>
        </div>
      },
      { title: i18n('organization.industry'), key: 'industry', dataIndex: 'industry.industry' },
      { title: i18n('organization.currency'), key: 'currency', dataIndex: 'currency.currency' },
      { title: i18n('organization.transaction_phase'), key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
        let phases = record.orgtransactionphase || []
        return <span className="span-phase">{phases.map(p => p.name).join(' / ')}</span>
      } },
      { title: i18n('organization.stock_code'), key: 'stockcode', dataIndex: 'stockcode' },
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state
 
    return (
      <div>
        <OrganizationListFilter defaultValue={filters} onChange={this.handleFilt} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <Popover content="支持多机构名搜索，机构之间用逗号或空格隔开">
          <Search2 style={{ width: '250px' }} placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')} defaultValue={search} onSearch={this.handleSearch} />
        </Popover>
        </div>

        {/* 选中的机构以 Tag 的形式展现在表格上方，方便用户随时查看自己选中的机构，避免在分页中迷失 */}
        <div style={{ marginBottom: 10 }}>
          {this.props.details.map(m => 
            <Tag 
              key={m.id} 
              closable 
              style={{ marginBottom: 8 }} 
              onClose={this.handleDeleteOrgTag.bind(this, m)}
            >
              {m.orgfullname}
            </Tag>
          )}
        </div>

        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper pageSizeOptions={PAGE_SIZE_OPTIONS} />
      </div>
    )

  }

}

export default connect()(SelectOrganization)
