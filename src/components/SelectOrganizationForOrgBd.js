import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { 
  i18n,
  getUserInfo,
  checkRealMobile,
  requestAllData,
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
      loadingSubOrg: false,
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
    this.setState({ page }, this.tryToLoadData);
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.tryToLoadData);
  }

  getAllOrg = async () => {
    const { searchOrgName: search } = this.props.query;
    const param = {
      search,
      page_size: 100,
      issub: false,
      orgstatus: 2,
    };

    let list = [];
    const req1 = await api.getOrg(param);

    const { count: count1, data: list1 } = req1.data;
    if (count1 > 100) {
      const req2 = await api.getOrg({
        ...param,
        page_size: count1,
      });
      list = list.concat(req2.data.data);
    } else {
      list = list.concat(list1);
    }
    return list;
  }

  searchAllOrg = async () => {
    let list = [];
    const { search: text, lv } = this.props.query;
    const param2 = {
      lv,
      text,
      page_size: 100,
      issub: false,
      orgstatus: 2,
    };
    const req3 = await api.searchOrg(param2);
    const { count: count3, data: list3 } = req3.data;
    if (count3 > 100) {
      const req4 = await api.searchOrg({
        ...param2,
        page_size: count3,
      });
      list = list.concat(req4.data.data);
    } else {
      list = list.concat(list3);
    }
    return list;
  }

  combineAllOrg = async () => {
    let list = [];

    const allGetOrg = await this.getAllOrg();
    list = list.concat(allGetOrg);
    const allSearchOrg = await this.searchAllOrg();
    list = list.concat(allSearchOrg);

    list = list.filter(f => f.id);
    const orgId = list.map(m => m.id);
    const uniqueOrgId = orgId.filter((v, i, a) => a.indexOf(v) === i);

    const uniqueOrg = uniqueOrgId.map(m => list.filter(f => f.id === m)[0]);
    window.echo('unique org', uniqueOrg);
    return { data: { count: uniqueOrg.length, data: uniqueOrg } };
  }

  getAndSearchAllOrg = () => {
    this.setState({ loading: true });
    this.combineAllOrg().then(result => {
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

  // getOrg = () => {
  //   const { filters, search, page, pageSize } = this.state
  //   const params = { ...filters, search, page_index: page, page_size: pageSize, issub: false, orgstatus: 2 };
  //   // if (this.props.traderId) {
  //   //   params['trader'] = this.props.traderId
  //   // }
  //   this.setState({ loading: true })
  //   api.getOrg(params).then(result => {
  //     const { count: total, data: list } = result.data
  //     this.setState({ total, list, loading: false })
  //   }, error => {
  //     this.setState({ loading: false })
  //     this.props.dispatch({
  //       type: 'app/findError',
  //       payload: error
  //     })
  //   })
  // }

  getOrgFromQuery = () => {
    const { page, pageSize } = this.state;
    const { searchOrgName: search } = this.props.query;
    const params = {
      search,
      page_size: pageSize,
      page_index: page,
      issub: false,
      orgstatus: 2,
    };
    this.setState({ loading: true });
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
    const { search: text, lv } = this.props.query;
    const params = {
      lv,
      text,
      page_size: pageSize,
      page_index: page,
      issub: false,
      orgstatus: 2,
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
    // this.searchOrg();
    this.tryToLoadData();
  }

  tryToLoadData = () => {
    const { search, searchOrgName } = this.props.query;
    if (search && searchOrgName) {
      this.getAndSearchAllOrg();
      return;
    }
    if (search) {
      this.searchOrg();
      return;
    }
    this.getOrgFromQuery();
  }

  isHidePagination = () => {
    const { search, searchOrgName } = this.props.query;
    return search && searchOrgName;
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
        return requestAllData(api.getUser, {
          groups: investorGroups,
          starmobile: true,
          org: [orgID]
        }, 100);
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

  handleRowExpand = async (expanded, record) => {
    if (!expanded) return;
    this.setState({ loadingSubOrg: true });
    const { id: org } = record;
    const req1 = await api.getOrgManageFund({ org });
    const { count, data } = req1.data;
    let fundData = [];
    if (count === 0) {
      this.setState({ loadingSubOrg: false });
      return;
    }
    if (count <= 10) {
      fundData = data;
    } else {
      const req2 = await api.getOrgManageFund({ org, page_size: count });
      fundData = req2.data.data;
    }
    const orgIds = fundData.map(m => m.fund);
    const reqOrg = await api.getOrg({ ids: orgIds, page_size: orgIds.length });
    const subOrg = fundData.map((m) => {
      const orgDetails = reqOrg.data.data.filter(f => f.id === m.fund)[0];
      return orgDetails;
    });
    const newList = [...this.state.list];
    for (let index = 0; index < newList.length; index++) {
      const element = newList[index];
      if (element.id === org) {
        element.subOrg = subOrg;
      }
    }
    this.setState({ list: newList, loadingSubOrg: false });
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

    const expandedRowRender = (record) => {
      const subColumns = [
        { title: i18n('organization.orgname'), key: 'orgname', dataIndex: 'orgname' },
        { title: i18n('organization.industry'), key: 'industry', dataIndex: 'industry.industry' },
        { title: i18n('organization.currency'), key: 'currency', dataIndex: 'currency.currency' },
        {
          title: i18n('organization.transaction_phase'), key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (text, record) => {
            let phases = record.orgtransactionphase || []
            return <span className="span-phase">{phases.map(p => p.name).join(' / ')}</span>
          },
        },
        { title: i18n('organization.stock_code'), key: 'stockcode', dataIndex: 'stockcode' },
      ];
      return (
        <Table
          showHeader={false}
          columns={subColumns}
          dataSource={record.subOrg}
          rowKey={record => record.id}
          pagination={false}
          loading={this.state.loadingSubOrg}
          size={"small"}
          // rowSelection={rowSelection}
        />
      );
    };

    const { filters, search, total, list, loading, page, pageSize } = this.state
 
    return (
      <div>
        {/* <OrgFilterForOrgBd defaultValue={filters} onChange={this.handleFilt} onSearch={this.handleFilt} onReset={this.handleReset} /> */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>

        <div style={{ fontSize: 13, marginTop: 14 }}>
          <img style={{ width: 10 }} src="/images/certificate.svg" />表示Top机构，
          <Icon type="user" />表示该机构下有联系方式的投资人数量
        </div>

        {/* <Popover content="支持多机构名搜索，机构名之间用分号隔开">
          <Search
            style={{ width: 250 }}
            placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')}
            onSearch={this.handleSearch}
            onChange={search => this.setState({ search })}
            value={search}
          />
        </Popover> */}
        </div> 

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
        {!(this.props.query.search && this.props.query.searchOrgName) &&
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
        }

        <Table
          style={tableStyle}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          expandedRowRender={expandedRowRender}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
          onExpand={this.handleRowExpand}
        />

        {!(this.props.query.search && this.props.query.searchOrgName) &&
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
        }
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
