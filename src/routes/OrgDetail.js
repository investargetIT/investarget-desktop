import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { 
  formatMoney, 
  i18n, 
  hasPerm, 
  isLogin,
  getUserInfo,
  time,
  requestAllData,
} from '../utils/util';
import { Link, routerRedux } from 'dva/router'
import { 
  Tooltip, 
  Modal, 
  Row, 
  Col, 
  Popover, 
  Button, 
  Popconfirm, 
  Input, 
  Form, 
  Icon,
  Tabs,
  Table,
  Pagination,
  Upload,
} from 'antd';
import LeftRightLayout from '../components/LeftRightLayout'
import { OrganizationRemarkList } from '../components/RemarkList'
import { BasicFormItem } from '../components/Form'
import { PAGE_SIZE_OPTIONS } from '../constants';
import AddOrgDetail from '../components/AddOrgDetail';
import { baseUrl } from '../utils/request';
import { Modal as GModal } from '../components/GlobalComponents';
import { DeleteOutlined } from '@ant-design/icons';

const TabPane = Tabs.TabPane;
const buttonStyle={textDecoration:'underline',border:'none',background:'none'};
const PositionWithUser = props => {

  function popoverChildren(user) {
    if (user.isUnreachUser) {
      return <div>
        <p style={{ textAlign: 'center', marginBottom: 10 }}>{user.name}</p>
        {hasPerm('usersys.admin_deleteuser') ?
          <Popconfirm title="你确定要这么做吗？" onConfirm={props.onRemoveUserPosition.bind(this, props.id, user.key)}>
            <Button type="danger">移除</Button>
          </Popconfirm>
          : null}
      </div>
    } else if (user.isUnreachUser && !hasPerm('usersys.deleteuser')) {
      return null
    }

    if (user.couldEdit) {
      return <div>
        <div>
          <span style={{ fontSize: 16, fontWeight: 'bold' }}>{user.name}</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <Link to={"/app/user/edit/" + user.id + '?redirect=' + props.pathname}><span style={{ textDecoration: 'underline' }}>编辑</span></Link>&nbsp;&nbsp;
          <Popconfirm title="你确定要这么做吗？" onConfirm={props.onRemoveUserPosition.bind(this, props.id, user.key)}>
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        </div>
        {user.trader.id ?
        <div>
        <hr style={{ backgroundColor: 'rgb(192, 193, 194)', height: 1, margin: '0 -18px' }} />
        <p style={{marginTop: 4}}>交易师：<Link to={"/app/user/" + user.trader.id}>{user.trader.name}</Link></p>
        </div> :null}
      </div>
    } else {
     return <div>
       <p style={{ fontSize: 16, fontWeight: 'bold' }}>{user.name}</p>
       {user.trader.id ? <div><hr style={{ backgroundColor: 'rgb(192, 193, 194)', height: 1, margin: '0 -18px' }} />
       <p style={{marginTop: 4}}>交易师：<Link to={"/app/user/" + user.trader.id}>{user.trader.name}</Link></p></div> : null}
       
       </div> 
    }

    return null
  }

  return (
    <div>
      <div style={{ width: '10%', fontSize: 16, float: 'left', textAlign: 'right', paddingRight: 10, paddingTop: 10 }}>{props.position}</div>
      <div style={{ width: '90%', marginLeft: '10%'}}>
        {props.user.map(m => <Link key={m.key} to={m.isUnreachUser ? null : "/app/user/" + m.id}>
          <Popover content={popoverChildren(m)}>
            <img onMouseOver={props.onHover.bind(this, props.id, m.key)} style={{ width: 48, height: 48, marginRight: 10,marginBottom:10 }} src={m.photourl || '/images/default-avatar.png'} />
          </Popover>
        </Link>)}
        { hasPerm('usersys.admin_adduser') || hasPerm('usersys.user_adduser') ?
          <Icon type='plus' onClick={props.onAddButtonClicked.bind(this, props.orgID, props.id)} style={{ width:48,height:48,fontSize:'36px',color: '#108ee9', cursor: 'pointer',display:'inline_block'}} />       
          :
          <Link to={`/app/organization/selectuser?orgID=${props.orgID}&titleID=${props.id}`}><Icon type='plus' style={{ width: 48, height: 48,fontSize:'36px',color: '#108ee9', cursor: 'pointer',display:'inline_block'}} /></Link>
        }
      </div>
    </div>
  )
}

const detailStyle = { marginBottom: '24px' }

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
}

const h3Style={
  marginTop:'64px',
  marginBottom:'24px'
}

const titleStyle={
  color:'black'
}
const Field = (props) => {
  return (
    <Row style={rowStyle}>
      <Col span={6} style={titleStyle}>{props.title}</Col>
      <Col span={18}>{props.value}</Col>
    </Row>
  )
}

class Contact extends React.Component {

  state = {
    page: 1,
    pageSize: getUserInfo().page || 10,
    data: [],
    total: 0,
    loading: false,
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    api.getOrgContact({
      org: this.props.id,
      page_index: this.state.page,
      page_size: this.state.pageSize,
    })
      .then(result => {
        this.setState({ 
          total: result.data.count,
          data: result.data.data, 
          loading: false,
        });
      })
      .catch(err => console.error(err));
  }

  delete(id) {
    api.deleteOrgContact(id)
      .then(() => this.getData());
  }

  render() {

    const { page, pageSize, total } = this.state;

    const columns = [
      {title: '地址', dataIndex: 'address' }, 
      {
        title: '电话', 
        dataIndex: 'numbercode', 
        render: (text, m) => m.numbercode ? m.countrycode + '-' + m.areacode + '-' + m.numbercode : '暂无'
      },
      {
        title: '传真', 
        dataIndex: 'faxcode', 
        render: (text, m) => m.faxcode ? m.countrycode + '-' + m.areacode + '-' + m.faxcode : '暂无'
      },
      {title: '邮箱', dataIndex: 'email'},
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        ),
      },
    ];

    return <div>
      <Table
        columns={columns}
        dataSource={this.state.data}
        rowKey={record => record.id}
        loading={this.state.loading}
        pagination={false}
      />
      <Pagination
        style={{ float: 'right', marginTop: 20 }}
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={ page => this.setState({ page }, this.getData)}
        showSizeChanger
        onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getData)}
        showQuickJumper
        pageSizeOptions={PAGE_SIZE_OPTIONS} />
    </div>;
  }
}

class ManageFund extends React.Component {

  state = {
    page: 1,
    pageSize: getUserInfo().page || 10,
    data: [],
    loading: false,
    total: 0,
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    let manageFund;
    api.getOrgManageFund({
      org: this.props.id,
      page_index: this.state.page,
      page_size: this.state.pageSize,
    })
      .then(result => {
        this.setState({ total: result.data.count});
        manageFund = result.data.data;
        return Promise.all(manageFund.map(m =>
          m.fund ? api.getOrgDetail(m.fund, { lang: window.LANG }) : Promise.resolve({ data: { orgname: '' }})
        ))
      })
      .then(result => {
        manageFund.forEach((element, index) => {
          element['fundname'] = result[index].data.orgname;
        });
        this.setState({ data: manageFund, loading: false });
      })
      .catch(err => console.error(err));
  }

  delete(id) {
    api.deleteOrgManageFund(id)
      .then(() => this.getData());
  }

  render() {

    const { page, pageSize, total } = this.state;

    const columns = [
      {title: '基金', dataIndex: 'fundname'},
      {title: '类型', dataIndex: 'type'},
      {title: '资本来源', dataIndex: 'fundsource'},
      {title: '募集时间', dataIndex: 'fundraisedate', render: text => text ? text.substr(0, 10) : ''},
      {title: '募集规模', dataIndex: 'fundsize'},
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        ),
      },
    ];

    return <div>
      <Table
        columns={columns}
        dataSource={this.state.data}
        rowKey={record => record.id}
        loading={this.state.loading}
        pagination={false}
      />
      <Pagination
        style={{ float: 'right', marginTop: 20 }}
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={ page => this.setState({ page }, this.getData)}
        showSizeChanger
        onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getData)}
        showQuickJumper
        pageSizeOptions={PAGE_SIZE_OPTIONS} />
    </div>;
  }
}

class InvestEvent extends React.Component {
 
  state = {
    page: 1,
    pageSize: getUserInfo().page || 10,
    area: [],
    data: [],
    total: 0,
    loading: false,
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    this.setState({ loading: true });
    api.getSource('country')
      .then(result => this.setState({ area: result.data }))
      .catch(err => console.error(err));

    api.getOrgInvestEvent({
      org: this.props.id,
      page_index: this.state.page,
      page_size: this.state.pageSize,
    })
      .then(result => this.setState({ 
        data: result.data.data, 
        total: result.data.count,
        loading: false,
      }))
      .catch(err => console.error(err));
  }

  delete(id) {
    api.deleteOrgInvestEvent(id)
      .then(() => this.getData());
  }

  render() {
    const { page, pageSize, total } = this.state;

    const columns = [
      {title: '企业名称', dataIndex: 'comshortname', render: text => <Link to={"/app/projects/library?search=" + text}>{text}</Link>},
      {title: '行业分类', dataIndex: 'industrytype'},
      // {
      //   title: '地区', dataIndex: 'area', render: text => {
      //     const area = this.state.area.filter(f => f.id === text);
      //     return area && area.length > 0 ? area[0].country : '';
      //   }
      // },
      // {title: '投资人', dataIndex: 'investor'},
      {title: '投资时间', dataIndex: 'investDate', render: text => text ? text.substr(0, 10) : ''},
      {title: '投资性质', dataIndex: 'investType'},
      {title: '投资金额', dataIndex: 'investSize'},
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        ),
      },
    ];

    return <div>
      <Table
        columns={columns}
        dataSource={this.state.data}
        rowKey={record => record.id}
        loading={this.state.loading}
        pagination={false}
      />
      <Pagination
        style={{ float: 'right', marginTop: 20 }}
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={page => this.setState({ page }, this.getData)}
        showSizeChanger
        onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getData)}
        showQuickJumper
        pageSizeOptions={PAGE_SIZE_OPTIONS} />
    </div>;
  }

}

class Cooperation extends React.Component {

  state = {
    page: 1,
    pageSize: getUserInfo().page || 10,
    data: [],
    total: 0,
    loading: false,
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    let cooperation;
    api.getOrgCooperation({
      org: this.props.id,
      page_index: this.state.page,
      page_size: this.state.pageSize,
    })
      .then(result => {
        this.setState({ total: result.data.count});
        cooperation = result.data.data;
        return Promise.all(cooperation.map(m =>
          m.cooperativeOrg ? api.getOrgDetail(m.cooperativeOrg, { lang: window.LANG }) : Promise.resolve({ data: { orgname: '' }})
        ))
      })
      .then(result => {
        cooperation.forEach((element, index) => {
          element['partner'] = result[index].data.orgname;
        });
        this.setState({ data: cooperation, loading: false });
      })
      .catch(err => console.error(err));
  }

  delete(id) {
    api.deleteOrgCooperation(id)
      .then(() => this.getData());
  }

  render() {

    const { page, pageSize, total } = this.state;

    const columns = [
      {title: '合作投资机构', dataIndex: 'partner', render: (text, record) => <Link to={'/app/organization/' + record.cooperativeOrg}>{text}</Link>},
      {title: '投资时间', dataIndex: 'investDate', render: text => text ? text.substr(0, 10) : ''},
      {title: '合作投资企业', dataIndex: 'comshortname'},
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        ),
      },
    ];

    return <div>
      <Table
        columns={columns}
        dataSource={this.state.data}
        rowKey={record => record.id}
        loading={this.state.loading}
        pagination={false}
      />
      <Pagination
        style={{ float: 'right', marginTop: 20 }}
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={ page => this.setState({ page }, this.getData)}
        showSizeChanger
        onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getData)}
        showQuickJumper
        pageSizeOptions={PAGE_SIZE_OPTIONS} />
    </div>;
  }
}

class Buyout extends React.Component {

  state = {
    page: 1,
    pageSize: getUserInfo().page || 10,
    data: [],
    total: 0,
    loading: false,
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    let buyout;
    api.getOrgBuyout({
      org: this.props.id,
      page_index: this.state.page,
      page_size: this.state.pageSize,
    })
      .then(result => {
        this.setState({ total: result.data.count});
        buyout = result.data.data;
        return Promise.all(buyout.map(m =>
          m.buyoutorg ? api.getOrgDetail(m.buyoutorg, { lang: window.LANG }) : Promise.resolve({ data: { orgname: '' }})
        ))
      })
      .then(result => {
        buyout.forEach((element, index) => {
          element['buyoutorgname'] = result[index].data.orgname;
        });
        this.setState({ data: buyout, loading: false });
      })
      .catch(err => console.error(err));
  }

  delete(id) {
    api.deleteOrgBuyout(id)
      .then(() => this.getData());
  }

  render() {

    const { page, pageSize, total } = this.state;

    const columns = [
      {title: '企业名称', dataIndex: 'comshortname', render: text => <Link to={"/app/projects/library?search=" + text}>{text}</Link>},
      {title: '退出时间', dataIndex: 'buyoutDate', render: text => text ? text.substr(0, 10) : ''},
      {title: '退出基金', dataIndex: 'buyoutorgname'},
      {title: '退出方式', dataIndex: 'buyoutType'},
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        ),
      },
    ];

    return <div>
      <Table
        columns={columns}
        dataSource={this.state.data}
        rowKey={record => record.id}
        loading={this.state.loading}
        pagination={false}
      />
      <Pagination
        style={{ float: 'right', marginTop: 20 }}
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={ page => this.setState({ page }, this.getData)}
        showSizeChanger
        onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getData)}
        showQuickJumper
        pageSizeOptions={PAGE_SIZE_OPTIONS} />
    </div>;
  }
}

const currencyMap = {'1': 'CNY', '2': 'USD', '3': 'CNY'}

class AttachmentList extends React.Component {

  state = {
    page: 1,
    pageSize: getUserInfo().page || 10,
    data: [],
    total: 0,
    loading: false,
    sort: undefined,
    desc: undefined,
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    api.getOrgAttachment({
      org: this.props.org, 
      page_size: this.state.pageSize, 
      page_index: this.state.page,
      sort: this.state.sort,
      desc: this.state.desc,
    }).then(result => {
      let total = result.data.count
      let data = result.data.data
      let loading = false
      
      Promise.all(result.data.data.map(m => {
        let key = m.realkey;
        if (key === null) {
          const originalKeyWithoutSuffix = m.key.split('.')[0];
          const fileSuffix = m.filename.split('.')[1];
          key = [originalKeyWithoutSuffix, fileSuffix].join('.');
        }
        return api.downloadUrl(m.bucket, key);
      })).then(urlResult => {
        data = data.map((v,i) => ({...v, url: urlResult[i].data}))
        this.setState({total, data, loading})
      })
    })
      
  }

  delete(id) {
    api.deleteOrgAttachment(id)
      .then(() => this.getData());
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getData
    );
  }

  render() {

    const { page, pageSize, total } = this.state;

    const columns = [
      {title: '文件名称', dataIndex: 'filename', sorter: true, render: (text, record) => <a target="_blank" href={record.url}>{text}</a> },
      {title: '创建时间', dataIndex: 'createdtime', render: (text, record) => time(text + record.timezone) || 'N/A', sorter: true},
    ];
    if (hasPerm('org.admin_manageorgattachment')) {
      columns.push({
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        ),
      });
    }

    return <div>
      <Table
        columns={columns}
        dataSource={this.state.data}
        rowKey={record => record.id}
        loading={this.state.loading}
        pagination={false}
        onChange={this.handleTableChange}
      />
      <Pagination
        style={{ float: 'right', marginTop: 20 }}
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={ page => this.setState({ page }, this.getData)}
        showSizeChanger
        onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getData)}
        showQuickJumper
        pageSizeOptions={PAGE_SIZE_OPTIONS} />
    </div>;
  }
}

class OrgDetail extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      orgname: null,
      orgtype: null,
      industry: null,
      orgtransactionphase: [],
      orgstatus: null,
      stockcode: null,
      investoverseasproject: null,
      currency: null,
      transactionAmountF: 'N/A',
      transactionAmountF_USD: 'N/A',
      transactionAmountT: 'N/A',
      transactionAmountT_USD: 'N/A',
      fundSize: 'N/A',
      fundSize_USD: 'N/A',
      companyEmail: null,
      webSite: null,
      mobileAreaCode: null,
      mobile: null,
      weChat: null,
      address: null,
      description: null,
      typicalCase: null,
      partnerOrInvestmentCommiterMember: null,
      decisionCycle: null,
      decisionMakingProcess: null,
      data: [],
      visible: false,
      chooseModalVisible: false,
      contact: [],
      manageFund: [],
      investEvent: [],
      cooperation: [],
      buyout: [],
      reloading: false,
      isShowOrgDetailForm: false,
      isUploading: false,
      hideUserInfo: false,
    }

    this.id = props.match.params.id;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.id) {
      this.id = nextProps.match.params.id;
      this.setState({
        reloading: true,
        data: [],
      });
      this.componentDidMount();
    }
  }

  componentDidMount() {

    let orgTitleTable
    api.getSource('orgtitletable').then(data => {
      orgTitleTable = data.data
      const id = this.props.match.params.id
      return api.getOrgDetail(id, { lang: window.LANG })
    }).then(result => {
      let data = { ...result.data }
      data.currency = data.currency && data.currency.currency
      data.tags  = (data.tags && data.tags.length) ? data.tags.map(item => item.name).join(', ') : '';
      data.industry = data.industry && data.industry.industry
      data.orgstatus = data.orgstatus && data.orgstatus.name
      data.orgtransactionphase = data.orgtransactionphase ? data.orgtransactionphase.map(item => item.name).join('/') : []
      data.orgtype = data.orgtype && data.orgtype.name
      data.investoverseasproject = data.investoverseasproject ? '是' : '否'
      let mobile = '';
      if (data.mobileAreaCode) {
        mobile += '+' + data.mobileAreaCode;
      }
      if (data.mobileCode) {
        mobile += data.mobileAreaCode ? '-' + data.mobileCode : data.mobileCode;
      }
      if (data.mobile) {
        mobile += data.mobileCode || data.mobileAreaCode ? '-' + data.mobile : data.mobile;
      }
      data.mobile = mobile;
      let currency = currencyMap[data.currency.id]
      data.transactionAmountF = data.transactionAmountF ? formatMoney(data.transactionAmountF, currency) : 'N/A'
      data.transactionAmountF_USD = data.transactionAmountF_USD ? formatMoney(data.transactionAmountF_USD, 'USD') : 'N/A'
      data.transactionAmountT = data.transactionAmountT ? formatMoney(data.transactionAmountT, currency) : 'N/A'
      data.transactionAmountT_USD = data.transactionAmountT_USD ? formatMoney(data.transactionAmountT_USD, 'USD') : 'N/A'
      data.fundSize = data.fundSize ? formatMoney(data.fundSize, currency) : 'N/A'
      data.fundSize_USD = data.fundSize_USD ? formatMoney(data.fundSize_USD, 'USD') : 'N/A'
      data.reloading = false;
      this.setState(data)

      const orgTypeID = result.data.orgtype && result.data.orgtype.id
      const orgStructure = orgTitleTable.filter(f => f.orgtype.id === orgTypeID)
      if (orgStructure.length > 0) {
        this.setState({
          data: orgStructure.map(m => {
            const id = m.title.id
            const position = m.title.name
            const org = data.id
            const user = []
            return { ...m, position, user, id, org }
          })
        })
        return Promise.all([
          requestAllData(api.getUser, { org: data.id, title: orgStructure.map(m => m.title.id) }, 100),
          // requestAllData(api.getUnreachUser, { org: data.id }, 1000),
        ])
      } else {
        return Promise.resolve()
      }
    }).then(data => {
      if (!data) return
      const newData = this.state.data.slice()
      data[0].data.data.map(m => {
        const index = newData.map(m => m.id).indexOf(m.title)
        if (index > -1) {
          const name = m.username
          const avatar = null
          const trader = {
            id: m.trader_relation && m.trader_relation.traderuser.id,
            name: m.trader_relation && m.trader_relation.traderuser.username
          }
          const isUnreachUser = false
          const key = 'reach-' + m.id
          newData[index].user.push({ ...m, name, avatar, trader, isUnreachUser, key })
        }
      })
      // data[1].data.data.map(m => {
      //   const index = newData.map(m => m.id).indexOf(m.title)
      //   if (index > -1) {
      //     const trader = {
      //       id: m.trader_relation && m.trader_relation.traderuser.id,
      //       name: m.trader_relation && m.trader_relation.traderuser.username
      //     }
      //     const isUnreachUser = true
      //     const isMyInvestor = false
      //     const key = 'unreach-' + m.id
      //     newData[index].user.push({ ...m, trader, isUnreachUser, key, isMyInvestor })
      //   }
      // })
      this.setState({ data: newData })
    })
    .catch(err => {
      this.props.dispatch({
        type: 'app/findError',
        payload: err
      })
    })

    this.getDetail();
  }

  getDetail = () => {
    const allReq = [
      api.getOrgContact({ org: this.id }),
      api.getOrgManageFund({ org: this.id }),
      api.getOrgInvestEvent({ org: this.id }),
      api.getOrgCooperation({ org: this.id }),
      api.getOrgBuyout({ org: this.id }),
    ];
    Promise.all(allReq)
      .then(result => {
        this.setState({
          contact: result[0].data.data,
          manageFund: result[1].data.data,
          investEvent: result[2].data.data,
          cooperation: result[3].data.data,
          buyout: result[4].data.data,
        });
      })
      .catch(error => console.error(error));
  }

  onRemoveUserPosition(positionID, userKey) {
    const newData = this.state.data.slice()
    .map(m => {
      const user = m.user.slice()
      return {...m, user}
    })
    const positionIndex = newData.map(m => m.id).indexOf(positionID)
    const index = newData[positionIndex].user.map(m => m.id).indexOf(userKey)
    newData[positionIndex].user.splice(index, 1)
    this.setState({
      data: newData
    })

    const isUnreachUser = userKey.split('-')[0] === 'unreach'
    const userID = userKey.split('-')[1]
    isUnreachUser ? api.deleteUnreachUser(userID) : api.editUser([userID], { title: null })
  }

  handleAddUser(orgID, titleID) {
    this.titleID = titleID
    this.setState({
      chooseModalVisible: true
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  handleCancelChoose = () => this.setState({ chooseModalVisible: false })
  handleAddNewInvestor = () => this.setState({ chooseModalVisible: false, visible: true })
  handleChooseInvestor = () => this.setState({ chooseModalVisible: false }, this.props.dispatch(
    routerRedux.push(`/app/organization/selectuser?orgID=${this.props.match.params.id}&titleID=${this.titleID}`)
  ))

  handleSubmit = e => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const title = this.titleID
        const org = this.props.match.params.id
        const body = { ... values, org, title }

        api.addUnreachUser(body).then(data => {
          const newUnreachUser = data.data

          const newData = this.state.data.slice().map(m => {
            const user = m.user.slice()
            return { ...m, user }
          })
          const index = newData.map(m => m.id).indexOf(newUnreachUser.title)
          const trader = {
            id: null,
            name: null
          }
          const isUnreachUser = true
          const key = 'unreach-' + newUnreachUser.id
          newData[index].user.push({ ...newUnreachUser, trader, isUnreachUser, key })

          this.setState({ visible: false, data: newData })
        })
      }
    })
  }

  /**
   * 鼠标停留在投资人上时判断是否有权限修改该投资人
   */
  // handleHoverInvestor = (positionID, userKey) => {
  //   const newData = this.state.data.slice()
  //   .map(m => {
  //     const user = m.user.slice()
  //     return {...m, user}
  //   })
  //   const positionIndex = newData.map(m => m.id).indexOf(positionID)
  //   const index = newData[positionIndex].user.map(m => m.key).indexOf(userKey)
  //   if (hasPerm('usersys.admin_changeuser')) {
  //     newData[positionIndex].user[index].couldEdit = true;
  //     this.setState({ data: newData });
  //     return
  //   }
  //   api.checkUserRelation(userKey.split('-')[1], isLogin().id)
  //   .then(result => {
  //     if (!result.data) return
  //     newData[positionIndex].user[index].couldEdit = true;
  //     this.setState({ data: newData });
  //   });
  // }

  onMobileUploadComplete(status, records) {
    if(!status) return;
    this.addOrgAttachments(records);
  }
  
  addOrgAttachments = (files) => {
    const requests = files.map((file) => {
      const { bucket, key, filename, realfilekey } = file;
      return api.addOrgAttachment({ bucket, key, filename, org: this.id, realkey: realfilekey });
    });
    Promise.all(requests)
      .then(() => {
        this.setState({ isUploading: false, hideUserInfo: true }, () => this.setState({ hideUserInfo: false }));
      });
  }

  handleMobileUploadBtnClicked() {
    GModal.MobileUploader.upload && GModal.MobileUploader.upload(this.onMobileUploadComplete.bind(this));
  }

  handleFileChange = ({ file }) => {
    this.setState({ isUploading: true });
    if (file.status === 'done') {
      this.handleFileUploadDone(file)
    } 
  }

  handleFileUploadDone = file => {
    file.bucket = 'file'
    file.key = file.response.result.key
    file.url = file.response.result.url
    file.realfilekey = file.response.result.realfilekey;
    file.filename = file.name;
    this.addOrgAttachment(file);
  }

  addOrgAttachment = file => {
    const { bucket, key, filename, realfilekey } = file;
    api.addOrgAttachment({ bucket, key, filename, org: this.id, realkey: realfilekey })
      .then(result => {
        this.setState({ isUploading: false, hideUserInfo: true }, () => this.setState({ hideUserInfo: false }));
      })
  }

  render() {
    const id = this.props.match.params.id

    // const isShowTabs = this.state.contact.length > 0 || this.state.manageFund.length > 0
    //   || this.state.investEvent.length > 0 || this.state.cooperation.length > 0 
    //   || this.state.buyout.length > 0 || this.state.data.length > 0 || !this.state.hideUserInfo;

    const basic = <div>
      <Field title="全称" value={this.state.orgfullname} />
      <Field title="简称" value={this.state.orgname} />
      <Field title={i18n('organization.org_type')} value={this.state.orgtype} />
      <Field title={i18n('organization.currency')} value={this.state.currency} />
      <Field title={i18n('organization.industry')} value={this.state.industry} />
      <Field title={i18n('user.tags')} value={this.state.tags} />
      <Field title={i18n('organization.transaction_amount_from')} value={this.state.transactionAmountF + ' / ' + this.state.transactionAmountF_USD} />
      <Field title={i18n('organization.transaction_amount_to')} value={this.state.transactionAmountT + ' / ' + this.state.transactionAmountT_USD} />
      <Field title={i18n('organization.fund_size')} value={this.state.fundSize + ' / ' + this.state.fundSize_USD} />
      <Field title={i18n('organization.decision_cycle')} value={this.state.decisionCycle} />
      <Field title={i18n('organization.company_email')} value={this.state.companyEmail} />
      <Field title={i18n('organization.company_website')} value={this.state.webSite} />
      <Field title={i18n('organization.telephone')} value={this.state.mobile} />
      <Field title={i18n('organization.wechat')} value={this.state.weChat} />
      <Field title={i18n('organization.transaction_phase')} value={this.state.orgtransactionphase} />
      <Field title={i18n('organization.audit_status')} value={this.state.orgstatus} />
      <Field title={i18n('organization.stock_code')} value={this.state.stockcode} />
      <Field title={i18n('filter.invest_oversea')} value={this.state.investoverseasproject} />
      <Field title={i18n('organization.headquarters')} value={this.state.address} />
      <Field title={i18n('organization.description')} value={this.state.description} />
      <Field title={i18n('organization.typical_case')} value={this.state.typicalCase} />
      <Field title={i18n('organization.partner_or_investment_committee_member')} value={this.state.partnerOrInvestmentCommiterMember} />
      <Field title={i18n('organization.decision_process')} value={this.state.decisionMakingProcess} />
    </div>;

    return (
      <LeftRightLayout location={this.props.location} title={i18n('menu.organization_management')} name={i18n('organization.org_detail')}action={{ name: i18n('organization.investor_list'), link: '/app/orguser/list?org=' + id }}>
        
        { this.state.reloading ? null : 
        <div>
        
        <OrganizationRemarkList typeId={this.id} /> 

        <h3 style={h3Style}>
          {i18n('project_library.information_detail')}:
          <Icon 
            type="plus" 
            style={{ cursor: 'pointer', padding: '4px', color: '#108ee9'}} 
            onClick={() => this.setState({ isShowOrgDetailForm: true })} 
          />
          {hasPerm('org.admin_manageorgattachment') ? <span>
            <Upload
              action={baseUrl + '/service/qiniubigupload?bucket=file'}
              // accept={fileExtensions.join(',')}
              onChange={this.handleFileChange}
              // onRemove={this.handleFileRemoveConfirm}
              showUploadList={false}
            >
              <Button loading={this.state.isUploading} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传附件</Button>
            </Upload>

            <Button loading={this.state.isUploading} onClick={this.handleMobileUploadBtnClicked.bind(this)} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>手机上传附件</Button>
          </span> : null }
        </h3>

          {!this.state.hideUserInfo &&
            <Tabs defaultActiveKey="1" >

              <TabPane tab={i18n('project.basics')} key="1">
                {basic}
              </TabPane>

              {/* { this.state.data.length > 0 ?
              <TabPane tab="组织架构" key="7">
                <div>
                  {this.state.data.map(m => <div key={m.id} style={{ marginBottom: 10 }}>
                    <PositionWithUser
                      id={m.id}
                      orgID={m.org}
                      position={m.position}
                      user={m.user}
                      onHover={this.handleHoverInvestor}
                      onRemoveUserPosition={this.onRemoveUserPosition.bind(this)}
                      pathname={this.props.location.pathname}
                      onAddButtonClicked={this.handleAddUser.bind(this)} 
                    />
                  </div>)}
                </div>
              </TabPane>
              : null } */}

              { this.state.contact.length > 0 ?
              <TabPane tab="联系方式" key="2">
                <Contact id={this.id} />
              </TabPane>
              : null }

              { this.state.manageFund.length > 0 ? 
              <TabPane tab="管理基金" key="3">
                <ManageFund id={this.id} />
              </TabPane>
              : null }

              { this.state.investEvent.length > 0 ?
              <TabPane tab="投资事件" key="4">
                <InvestEvent id={this.id} />
              </TabPane>
              : null }
              
              { this.state.cooperation.length > 0 ? 
              <TabPane tab="合作关系" key="5">
                <Cooperation id={this.id} />
              </TabPane>
              : null }

              { this.state.buyout.length > 0 ? 
              <TabPane tab="退出分析" key="6">
                <Buyout id={this.id} />
              </TabPane>
              : null }

              <TabPane tab="附件" key="8">
                <AttachmentList org={this.id} />
              </TabPane>

            </Tabs>
          }


        <Modal visible={this.state.chooseModalVisible} title="请选择" footer={null} onCancel={this.handleCancelChoose}>
          <div style={{ textAlign: 'center' }}>
           <Button style={{ marginRight: 10 }} onClick={this.handleChooseInvestor}>从已有投资人中进行选择</Button>
           <Button onClick={this.handleAddNewInvestor}>添加新的投资人</Button>
          </div>
        </Modal>

        { this.state.visible ? 
        <Modal
          title="添加投资人"
          visible={this.state.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}>

          <Form>
            <BasicFormItem label={i18n("user.name")} name="name" required><Input /></BasicFormItem>
            <BasicFormItem label={i18n("user.email")} name="email"><Input /></BasicFormItem>
            <BasicFormItem label={i18n("user.mobile")} name="mobile"><Input /></BasicFormItem>
          </Form>

        </Modal>
        : null }
    
        { this.state.isShowOrgDetailForm ? 
        <Modal
          title="添加信息详情"
          visible={true}
          footer={null}
          onCancel={() => this.setState({ isShowOrgDetailForm: false })}
        >
          <AddOrgDetail
            org={this.id}
            onNewDetailAdded={() => this.setState({
              reloading: true,
              data: [],
              isShowOrgDetailForm: false,
            }, this.componentDidMount)} 
          />
        </Modal>
        : null }

        </div> }
      </LeftRightLayout>
    )
  }
}

export default connect()(OrgDetail);
