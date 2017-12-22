import React from 'react'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import { 
  Row, 
  Col, 
  Select, 
  Popover, 
} from 'antd';
const Option = Select.Option

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
  fontSize: '13px',
}

const traderInfoStyle={
  fontSize:'16px',
  paddingTop:'8px',
  paddingRight:'16px',
  color:'#282828',
  float:'right'
}
const traderStyle={
  border:'1px solid gray',
  maxWidth:'200px',
  float:'left'
}
const photoContainer={
  float:'left',
  margin:'8px',
  height:'30px',
  width:'30px'
}
const imgStyle={
  width:'100%',
  height:'100%'
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

function SimpleLine(props) {
  return (
    <Row style={{ lineHeight: '24px' }}>
      <Col span={8}>{props.title + '：'}</Col>
      <Col span={16} style={{wordWrap: 'break-word'}}>{props.value}</Col>
    </Row>
  );
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

  popoverContent(item) {
    const { traderuser: trader } = item;
    return <div style={{minWidth: 240}}>
      <SimpleLine title={i18n('user.name')} value={trader.username} />
      <SimpleLine title="公司" value={trader.org && trader.org.orgname} />
      <SimpleLine title={i18n('user.position')} value={trader.title && trader.title.name} />
      <SimpleLine title={i18n('user.tags')} value={trader.tags ? trader.tags.map(m => m.name).join('，') : ''} />
      <SimpleLine title={i18n('user.country')} value={trader.country && trader.country.country} />
      <SimpleLine title={i18n('user.mobile')} value={trader.mobile} />
      <SimpleLine title={i18n('user.email')} value={trader.email} />
      <SimpleLine title={i18n('user.score')} value={item.score} />
    </div>
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
    console.log(list)
    return list.length > 0 ?
      (<div>
      <Row >
        <Col span={6}>
          <div style={traderInfoStyle}>{i18n('user.trader_info')}</div>
        </Col>
        <Col span={18}>
        <div style={traderStyle}>
          {list.map(item=> <span key={item.id} style={photoContainer}>
            <Popover placement="bottomLeft" content={this.popoverContent(item)}>
              <a href={'/app/user/'+item.traderuser.id}><img style={imgStyle} src={item.traderuser.photourl} /></a>
            </Popover>
          </span>)}
        </div>
        </Col>
      </Row>
      </div>) : null

  }
}

export default connect()(TransactionInfo)
