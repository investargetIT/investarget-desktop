import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { formatMoney, i18n, hasPerm } from '../utils/util'
import { Link, routerRedux } from 'dva/router'
import { Modal, Row, Col, Popover, Button, Popconfirm, Input, Form } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { OrganizationRemarkList } from '../components/RemarkList'
import { BasicFormItem } from '../components/Form'

const dataSample = [{
  id: 1,
  position: '总裁',
  org: 1,
  user: [
    {
      id: 9,
      name: '马云',
      avatar: '/images/avatar1.png',
      trader: {
        id: 104,
        name: '夏琰'
      }
    }
  ]
}]

const PositionWithUser = props => {

  function popoverChildren(user) {
    if (user.isUnreachUser && hasPerm('usersys.admin_deleteuser')) {
      return <Popconfirm title="你确定要这么做吗？" onConfirm={props.onRemoveUserPosition.bind(this, props.id, user.key)}>
        <Button type="danger">移除</Button>
      </Popconfirm>
    } else if (user.isUnreachUser && !hasPerm('usersys.deleteuser')) {
      return null
    }

    if (hasPerm('usersys.admin_changeuser') || user.isMyInvestor) {
      return <div>
        <p>交易师：<Link to={"/app/user/" + user.trader.id}>{user.trader.name}</Link></p>
        <p style={{ textAlign: 'center', marginTop: 10 }}>
          <Link to={"/app/user/edit/" + user.id + '?redirect=' + props.pathname}><Button>编辑</Button></Link>&nbsp;
              <Popconfirm title="你确定要这么做吗？" onConfirm={props.onRemoveUserPosition.bind(this, props.id, user.key)}>
            <Button type="danger">移除</Button>
          </Popconfirm>
        </p>
      </div>
    }

    return null
  }

  return (
    <div>
      <div style={{ width: '20%', fontSize: 16, float: 'left', textAlign: 'right', paddingRight: 10, paddingTop: 10 }}>{props.position}</div>
      <div style={{ width: '80%', marginLeft: '20%' }}>
        {props.user.map(m => <Link key={m.key} to={m.isUnreachUser ? null : "/app/user/" + m.id}>
          <Popover content={popoverChildren(m)} title={m.name}>
            <img style={{ width: 48, height: 48, marginRight: 10, borderRadius: '50%' }} src={m.photourl || '/images/default-avatar.png'} />
          </Popover>
        </Link>)}
        { hasPerm('usersys.admin_adduser') ?
          <img onClick={props.onAddButtonClicked.bind(this, props.orgID, props.id)} style={{ width: 48, height: 48, marginRight: 10, borderRadius: '50%', cursor: 'pointer' }} src="/images/add_circle.png" />
          :
          <Link to={`/app/organization/selectuser?orgID=${props.orgID}&titleID=${props.id}`}><img style={{ width: 48, height: 48, marginRight: 10, borderRadius: '50%', cursor: 'pointer' }} src="/images/add_circle.png" /></Link>
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

const Field = (props) => {
  return (
    <Row style={rowStyle}>
      <Col span={6}>{props.title}</Col>
      <Col span={18}>{props.value}</Col>
    </Row>
  )
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
      orgcode: null,
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
    }
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
      data.mobile = (data.mobile && data.mobileAreaCode) ? ('+' + data.mobileAreaCode + '-' + data.mobile) : ''

      let currency = currencyMap[data.currency.id]
      data.transactionAmountF = data.transactionAmountF ? formatMoney(data.transactionAmountF, currency) : 'N/A'
      data.transactionAmountF_USD = data.transactionAmountF_USD ? formatMoney(data.transactionAmountF_USD, 'USD') : 'N/A'
      data.transactionAmountT = data.transactionAmountT ? formatMoney(data.transactionAmountT, currency) : 'N/A'
      data.transactionAmountT_USD = data.transactionAmountT_USD ? formatMoney(data.transactionAmountT_USD, 'USD') : 'N/A'
      data.fundSize = data.fundSize ? formatMoney(data.fundSize, currency) : 'N/A'
      data.fundSize_USD = data.fundSize_USD ? formatMoney(data.fundSize_USD, 'USD') : 'N/A'
      console.log(data)
      this.setState(data)

      const orgTypeID = result.data.orgtype && result.data.orgtype.id
      const orgStructure = orgTitleTable.filter(f => f.orgtype.id === orgTypeID)
      if (orgStructure.length > 0 && hasPerm('usersys.admin_getuser')) {
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
          api.getUser({ org: data.id, page_size: 1000 }),
          api.getUnreachUser({ org: data.id, page_size: 1000 }),
          api.getUserRelation({ page_size: 1000 }),
        ])
      } else {
        return Promise.resolve()
      }
    }).then(data => {
      if (!data) return
      const myInvestorIDArr = data[2].data.data.map(m => m.investoruser.id)
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
          const isMyInvestor = myInvestorIDArr.includes(m.id)
          const key = 'reach-' + m.id
          newData[index].user.push({ ...m, name, avatar, trader, isUnreachUser, key, isMyInvestor })
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

  render() {
    const id = this.props.params.id

    return (
      <MainLayout location={this.props.location}>
        <PageTitle title={<span>机构详情（<Link to={'/app/orguser/list?org=' + id}>投资人名单</Link>）</span>} />
        <div style={{ width: '50%', float: 'left' }}>
          <Field title="名称" value={this.state.orgname} />
          <Field title="机构类型" value={this.state.orgtype} />
          <Field title="货币类型" value={this.state.currency} />
          <Field title="行业" value={this.state.industry} />
          <Field title="交易范围起" value={this.state.transactionAmountF + ' / ' + this.state.transactionAmountF_USD} />
          <Field title="交易范围至" value={this.state.transactionAmountT + ' / ' + this.state.transactionAmountT_USD} />
          <Field title="基金规模" value={this.state.fundSize + ' / ' + this.state.fundSize_USD} />
          <Field title="决策周期（天）" value={this.state.decisionCycle} />
          <Field title="公司邮箱" value={this.state.companyEmail} />
          <Field title="公司官网" value={this.state.webSite} />
          <Field title="电话" value={this.state.mobile} />
          <Field title="微信公众号" value={this.state.weChat} />
          <Field title="轮次" value={this.state.orgtransactionphase} />
          <Field title="审核状态" value={this.state.orgstatus} />
          <Field title="股票代码" value={this.state.orgcode} />
          <Field title="是否投海外项目" value={this.state.investoverseasproject} />
          <Field title="地址" value={this.state.address} />
          <Field title="描述" value={this.state.description} />
          <Field title="典型投资案例" value={this.state.typicalCase} />
          <Field title="合伙人/投委会成员" value={this.state.partnerOrInvestmentCommiterMember} />
          <Field title="决策流程" value={this.state.decisionMakingProcess} />

          <OrganizationRemarkList typeId={id} readOnly />
        </div>

        <div style={{ width: '50%', marginLeft: '50%' }}>
          {this.state.data.map(m => <div key={m.id} style={{ marginBottom: 10 }}>
            <PositionWithUser
              id={m.id}
              orgID={m.org}
              position={m.position}
              user={m.user}
              onRemoveUserPosition={this.onRemoveUserPosition.bind(this)}
              pathname={this.props.location.pathname}
              onAddButtonClicked={this.handleAddUser.bind(this)} />
          </div>)}
        </div>

        <Modal visible={this.state.chooseModalVisible} title="请选择" footer={null} onCancel={this.handleCancelChoose}>
          <div style={{ textAlign: 'center' }}>
           <Button style={{ marginRight: 10 }} onClick={this.handleChooseInvestor}>从已有投资人中进行选择</Button>
           { hasPerm('usersys.admin_adduser') ?
             <Button onClick={this.handleAddNewInvestor}>添加新的投资人</Button>
           : null }
          </div>
        </Modal>

        <Modal
          title="添加投资人"
          visible={this.state.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}>

          <Form>
            <BasicFormItem label={i18n("username")} name="name" required><Input /></BasicFormItem>
            <BasicFormItem label={i18n("email")} name="email"><Input /></BasicFormItem>
            <BasicFormItem label={i18n("mobile")} name="mobile"><Input /></BasicFormItem>
          </Form>

        </Modal>

      </MainLayout>
    )
  }
}

export default connect()(Form.create()(OrganizationDetail))
