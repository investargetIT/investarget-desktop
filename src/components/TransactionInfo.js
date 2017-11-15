import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import { Row, Col, Select } from 'antd'
const Option = Select.Option

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
  fontSize: '13px',
}

const Field = (props) => {
  return (
    <Row style={rowStyle} gutter={24}>
      <Col span={6}>
        <div style={{textAlign: 'right'}}>{props.title}</div>
      </Col>
      <Col span={18}>
        <div>{props.value}</div>
      </Col>
    </Row>
  )
}



class TransactionInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: null,
      list: [],

      company: '',
      title: '',
      tags: '',
      country: '',
      org: '',
      mobile: '',
      wechat: '',
      email: '',
      score: '',
    }
  }

  handleChangeTransaction = (value) => {
    const current = Number(value)
    this.setState({ current })
    const data = this.state.list.filter(item => item.id == current)[0]
    const traderId = data.traderuser.id
    this.getTransactionInfo(traderId)
    this.setState({ score: data.score })
  }

  componentDidMount() {
    const userId = this.props.userId
    const params = { investoruser: userId }
    api.getUserRelation(params).then(result => {
      const { count, data: list } = result.data
      if (count) {
        this.setState({ current: list[0].id, list })
        let data = list[0]
        let traderId = data.traderuser.id
        this.getTransactionInfo(traderId)
        this.setState({ score: data.score })
      }
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  getTransactionInfo = (id) => {
    api.getUserDetailLang(id).then(result => {
      const data = result.data

      const title = data.title ? data.title.name : ''
      const tags  = (data.tags && data.tags.length) ? data.tags.map(item => item.name).join(', ') : ''
      const country = data.country ? data.country.country : ''
      const org = data.org ? data.org.orgname : ''
      const mobile = (data.mobile && data.mobileAreaCode) ? (data.mobile + data.mobileAreaCode) : ''
      const wechat = data.wechat
      const email = data.email

      this.setState({
        title, tags, country, org, mobile, wechat, email
      })

    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { current, list } = this.state

    const relation = list.filter(item => item.id == current)[0]
    const relationId = relation ? relation.id : null

    const SelectTransaction = (
      <Select size="large" value={ relationId ? String(relationId) : null } onChange={this.handleChangeTransaction}>
        {
          list.map(item => <Option key={item.id} value={String(item.id)}>{item.traderuser.username}</Option>)
        }
      </Select>
    )

    const { company, title, tags, country, mobile, email, score } = this.state

    return list.length > 0 ?
      (<div>
          <h3>{i18n('user.trader_info')}</h3>
          <Field title={i18n('user.name')} value={SelectTransaction} />
          <Field title="公司" value={company} />
          <Field title={i18n('user.position')} value={title} />
          <Field title={i18n('user.tags')} value={tags} />
          <Field title={i18n('user.country')} value={country} />
          <Field title={i18n('user.mobile')} value={mobile} />
          <Field title={i18n('user.email')} value={email} />
          <Field title={i18n('user.score')} value={score} />
      </div>) : null

  }
}

export default connect()(TransactionInfo)
