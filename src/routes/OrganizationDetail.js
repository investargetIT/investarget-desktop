import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { 
  formatMoney, 
  i18n, 
  hasPerm, 
  isLogin,
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
} from 'antd';
import LeftRightLayout from '../components/LeftRightLayout'
import { OrganizationRemarkList } from '../components/RemarkList'
import { BasicFormItem } from '../components/Form'

const TabPane = Tabs.TabPane;

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
            <img style={{ cursor: 'pointer', marginBottom: 4 }} src="/images/delete.png" />
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
      <div style={{ width: '20%', fontSize: 16, float: 'left', textAlign: 'right', paddingRight: 10, paddingTop: 10 }}>{props.position}</div>
      <div style={{ width: '80%', marginLeft: '20%'}}>
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

function Contact(props) {
  return <div>
    {props.data.map(m =>
      <div key={m.id} style={{ marginBottom: 50 }}>
        <Row>
          <Col span={4} style={{ fontWeight: 500 }}>地址</Col>
          <Col span={20}>{ m.address || '暂无' }</Col>
        </Row>
        <Row>
          <Col span={4} style={{ fontWeight: 500 }}>邮编</Col>
          <Col span={20}>{ m.postcode || '暂无' }</Col>
        </Row>
        <Row>
          <Col span={4} style={{ fontWeight: 500 }}>电话</Col>
          <Col span={20}>{ m.numbercode ? m.countrycode + '-' + m.areacode + '-' + m.numbercode : '暂无' }</Col>
        </Row>
        <Row>
          <Col span={4} style={{ fontWeight: 500 }}>传真</Col>
          <Col span={20}>{ m.faxcode ? m.countrycode + '-' + m.areacode + '-' + m.faxcode : '暂无' }</Col>
        </Row>
        <Row>
          <Col span={4} style={{ fontWeight: 500 }}>邮箱</Col>
          <Col span={20}>{ m.email || '暂无' }</Col>
        </Row>
      </div>
    )}
  </div>;
}

const currencyMap = {'1': 'CNY', '2': 'USD', '3': 'CNY'}


class OrganizationDetail extends React.Component {

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
    }

    this.id = props.params.id;
  }

  componentDidMount() {

    let orgTitleTable
    api.getSource('orgtitletable').then(data => {
      orgTitleTable = data.data
      const id = this.props.params.id
      return api.getOrgDetail(id, { lang: window.LANG })
    }).then(result => {
      let data = { ...result.data }
      data.currency = data.currency && data.currency.currency
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
          api.getUser({ org: data.id, page_size: 1000, title: orgStructure.map(m => m.title.id)}),
          api.getUnreachUser({ org: data.id, page_size: 1000 }),
        ])
      } else {
        return Promise.resolve()
      }
    }).then(data => {
      if (!data) return
      const newData = this.state.data.slice()
      data[0].data.data.map(m => {
        const index = newData.map(m => m.id).indexOf(m.title && m.title.id)
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
      data[1].data.data.map(m => {
        const index = newData.map(m => m.id).indexOf(m.title)
        if (index > -1) {
          const trader = {
            id: m.trader_relation && m.trader_relation.traderuser.id,
            name: m.trader_relation && m.trader_relation.traderuser.username
          }
          const isUnreachUser = true
          const isMyInvestor = false
          const key = 'unreach-' + m.id
          newData[index].user.push({ ...m, trader, isUnreachUser, key, isMyInvestor })
        }
      })
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
      api.getOrgContact({ org: this.id, page_size: 100 }),
      api.getOrgManageFund({ org: this.id }),
      api.getOrgInvestEvent({ org: this.id }),
      api.getOrgCooperation({ org: this.id }),
      api.getOrgBuyout({ org: this.id }),
    ];
    Promise.all(allReq)
      .then(result => {
        echo('result', result)
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
    routerRedux.push(`/app/organization/selectuser?orgID=${this.props.params.id}&titleID=${this.titleID}`)
  ))

  handleSubmit = e => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const title = this.titleID
        const org = this.props.params.id
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
  handleHoverInvestor = (positionID, userKey) => {
    const newData = this.state.data.slice()
    .map(m => {
      const user = m.user.slice()
      return {...m, user}
    })
    const positionIndex = newData.map(m => m.id).indexOf(positionID)
    const index = newData[positionIndex].user.map(m => m.key).indexOf(userKey)
    if (hasPerm('usersys.admin_changeuser')) {
      newData[positionIndex].user[index].couldEdit = true;
      this.setState({ data: newData });
      return
    }
    api.checkUserRelation(userKey.split('-')[1], isLogin().id)
    .then(result => {
      if (!result.data) return
      newData[positionIndex].user[index].couldEdit = true;
      this.setState({ data: newData });
    });
  }

  render() {
    echo(this.state.data);
    const id = this.props.params.id

    const isShowTabs = this.state.contact.length > 0 || this.state.manageFund.length > 0
      || this.state.investEvent.length > 0 || this.state.cooperation.length > 0 
      || this.state.buyout.length > 0;

    const basic = <div>
      <Field title={i18n('organization.name')} value={this.state.orgname} />
      <Field title={i18n('organization.org_type')} value={this.state.orgtype} />
      <Field title={i18n('organization.currency')} value={this.state.currency} />
      <Field title={i18n('organization.industry')} value={this.state.industry} />
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
      <Field title={i18n('organization.invest_oversea_project')} value={this.state.investoverseasproject} />
      <Field title={i18n('organization.address')} value={this.state.address} />
      <Field title={i18n('organization.description')} value={this.state.description} />
      <Field title={i18n('organization.typical_case')} value={this.state.typicalCase} />
      <Field title={i18n('organization.partner_or_investment_committee_member')} value={this.state.partnerOrInvestmentCommiterMember} />
      <Field title={i18n('organization.decision_process')} value={this.state.decisionMakingProcess} />
    </div>;

    return (
      <LeftRightLayout location={this.props.location} title={i18n('menu.organization_management')} name={i18n('organization.org_detail')}action={{ name: i18n('organization.investor_list'), link: '/app/orguser/list?org=' + id }}>
        
        <OrganizationRemarkList typeId={id} />

        <h3 style={h3Style}>
          {i18n('project_library.information_detail')}:
        </h3>

        <div style={{ width: '55%', float: 'left' }}>
          {isShowTabs ?
            <Tabs defaultActiveKey="1" >
              <TabPane tab={i18n('project.basics')} key="1">
                {basic}
              </TabPane>
              <TabPane tab="联系方式" key="2">
                <Contact data={this.state.contact} />
              </TabPane>
              <TabPane tab="管理基金" key="3">
                {/* <Shareholder data={projInfo && projInfo.indus_foreign_invest} source="foreign" /> */}
              </TabPane>
              <TabPane tab="投资事件" key="4">
                {/* <IndusBui data={projInfo && projInfo.indus_busi_info} /> */}
              </TabPane>
              <TabPane tab="合作关系" key="5">
                {/* <IndusBusi data={projInfo && projInfo.indus_busi_info} /> */}
              </TabPane>
              <TabPane tab="退出分析" key="6">
                {/* <IndusBusi data={projInfo && projInfo.indus_busi_info} /> */}
              </TabPane>
            </Tabs>
            : basic}
        </div>

        <div style={{ width: '50%', marginLeft: '50%' }}>
          {this.state.data.map(m => <div key={m.id} style={{ marginBottom: 10 }}>
            <PositionWithUser
              id={m.id}
              orgID={m.org}
              position={m.position}
              user={m.user}
              onHover={this.handleHoverInvestor}
              onRemoveUserPosition={this.onRemoveUserPosition.bind(this)}
              pathname={this.props.location.pathname}
              onAddButtonClicked={this.handleAddUser.bind(this)} />
          </div>)}
        </div>

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

      </LeftRightLayout>
    )
  }
}

export default connect()(Form.create()(OrganizationDetail))
