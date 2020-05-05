import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { 
  i18n,
  getUserInfo,
  checkRealMobile,
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
  Icon,
} from 'antd';
import { OrgFilterForOrgBd } from './Filter'
import { Search } from './Search'
import PropTypes from 'prop-types';

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


function Investor(props) {
  const loadLabelByValue = (type, value) => {
    if (Array.isArray(value) && props.tag.length > 0) {
      return value.map(m => props[type].filter(f => f.id === m)[0].name).join(' / ');
    } 
  }
  return (
    <Row style={{ padding: '4px 0' }}>
      <Col span={5}>
        <div style={{ display: 'flex' }}>
          { props.mobiletrue ? 
          <i style={{ fontSize: 20, marginTop: 1, marginRight: 2 }} className="fa fa-mobile-phone"></i>
          : null } 
          {props.username}
        </div>
      </Col>
      <Col span={5}>
      { props.traderList.map(m => <span key={m.value} style={{ marginRight: 10, color: m.onjob ? 'rgb(34, 124, 205)' : 'rgb(165, 166, 167)' }}>{m.label}</span>) }
      </Col>
      <Col span={14}>{props.tags ? loadLabelByValue('tag', props.tags) : ''}</Col>
    </Row>
  )
}

function mapStateToProps(state) {
  const { tag } = state.app;
  return { tag };
}
Investor = connect(mapStateToProps)(Investor);

class SelectOrganization extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      filters: OrgFilterForOrgBd.defaultValue,
      search: null,
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      orgInvestor: [],
    }
  }

  // handleFilt = (filters) => {
  //   this.setState({ filters, page: 1 }, this.getOrg)
  //   if (this.props.onFilterChange) {
  //     this.props.onFilterChange(filters);
  //   }
  // }

  // handleReset = (filters) => {
  //   this.setState({ filters, page: 1, search: null }, this.getOrg)
  // }

  // handleSearch = (search) => {
  //   this.setState({ search, page: 1 }, this.getOrg)
  // }

  handlePageChange = (page) => {
    this.setState({ page }, this.searchOrg);
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.searchOrg);
  }

  getOrg = () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, issub: false, orgstatus: 2 };
    // if (this.props.traderId) {
    //   params['trader'] = this.props.traderId
    // }
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

  searchOrg = () => {
    const { page, pageSize } = this.state;
    const { search: text, like, lv } = this.props.query;
    const params = {
      lv,
      text,
      page_size: pageSize,
      page_index: page,
      like,
    };
    this.setState({ loading: true });
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
  }

  componentDidMount() {
    // this.getOrg()
    this.searchOrg();
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
        return <div style={{ width: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <i style={{ fontSize: 20, marginTop: 1, marginRight: 2 }} className="fa fa-mobile-phone"></i>
          表示该用户的联系方式可用
          </div>
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
    const orgInvestor = {
      id: orgID,
    };
    api.queryUserGroup({ type: 'investor' })
      .then(data => {
        const investorGroups = data.data.data.map(item => item.id);
        return api.getUser({
          page_size: 1000,
          groups: investorGroups,
          starmobile: true,
          org: [orgID]
        });
      })
      .then(data => {
        orgInvestor.investors = data.data;
        return Promise.all(data.data.data.map(m => api.getUserRelation({ investoruser: m.id }))); 
      })
      .then(data => {
        orgInvestor.investors.data.forEach((element, index) => {
          const relationShip = data[index].data.data.sort((a, b) => Number(b.relationtype) - Number(a.relationtype));
          const traderList = [];
          relationShip.forEach(item => {
            const trader = item.traderuser;
            if (trader) {
              traderList.push({ label: trader.username, value: trader.id, onjob: trader.onjob });
            }
          });
          element['traderList'] = traderList;
        });
        this.setState({ orgInvestor: this.state.orgInvestor.concat(orgInvestor) });
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

            { [1, 2].includes(record.orglevel.id) ? 
            <img style={{ width: 10, marginTop: -10 }} src="/images/certificate.svg" />
            : null }

            <a href={"/app/organization/" + record.id} target="_blank">
              <span style={{ color: '#428BCA' }} onMouseEnter={this.handleOrgNameHover.bind(this, record)}>
                {text}
              </span>
            </a>

            { [1, 2].includes(record.orglevel.id) ? 
            <span style={{ color: 'gray' }}><Icon type="user" />({record.user_count})</span>
            : null }

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
        {/* <OrgFilterForOrgBd defaultValue={filters} onChange={this.handleFilt} onSearch={this.handleFilt} onReset={this.handleReset} />
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>

        <div style={{ fontSize: 13, marginTop: 14 }}>
          <img style={{ width: 10 }} src="/images/certificate.svg" />表示Top机构，
          <Icon type="user" />表示该机构下有联系方式的投资人数量
        </div>

        <Popover content="支持多机构名搜索，机构之间用逗号或空格隔开">
          <Search
            style={{ width: 250 }}
            placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')}
            onSearch={this.handleSearch}
            onChange={search => this.setState({ search })}
            value={search}
          />
        </Popover>
        </div> */}

        {/* 选中的机构以 Tag 的形式展现在表格上方，方便用户随时查看自己选中的机构，避免在分页中迷失 */}
        {/* <div style={{ marginBottom: 10 }}>
          { this.props.details.length > 1 && <Button style={{ marginRight: 10 }} type="danger" onClick={this.props.onReset}>清空</Button> }
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
        </div> */}
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper pageSizeOptions={PAGE_SIZE_OPTIONS} />
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper pageSizeOptions={PAGE_SIZE_OPTIONS} />
      </div>
    )

  }

}
SelectOrganization.propTypes = {
  value: PropTypes.array,
  details: PropTypes.array,
  onFilterChange: PropTypes.func,
  onChange: PropTypes.func,
  onReset: PropTypes.func, // 用户点击了清空按钮
};

export default connect()(SelectOrganization)
