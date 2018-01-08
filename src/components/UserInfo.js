import React from 'react'
import { connect } from 'dva'
import {Link} from 'dva/router'
import { i18n } from '../utils/util'
import { Row, Col } from 'antd'
import ImageViewer from './ImageViewer'

const rowStyle = {
  //borderBottom: '1px dashed #eee',
  padding: '12px 0',
  fontSize: '14px',
  marginLeft:'70px'
}

const Field = (props) => {
  return (
    <Row style={rowStyle} gutter={24}>
      <Col span={6}>
        <div style={{textAlign: 'left',color:'#282828',fontSize:'16px'}}>{props.title}</div>
      </Col>
      <Col span={18}>
      {props.orgid? <Link to={"/app/organization/"+props.orgid}><div>{props.value}</div></Link> :
      <div>{props.value}</div>
      }
      </Col>
    </Row>
  )
}

const cardStyle = { maxWidth: '100%', maxHeight: '150px', cursor: 'pointer' }


class UserInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      title: '',
      tags: '',
      country: '',
      org: '',
      mobile: '',
      wechat: '',
      email: '',
      userstatus: '',
      cardUrl: '',
      ishasfundorplan: '',
      mergedynamic: '',
      targetdemand: '',
      orgid:'',
    }
  }

  componentDidMount() {
    const userId = this.props.userId
    api.getUserInfo(userId).then(result => {
      const data = result.data
      console.log(data)
      const username = data.username
      const title = data.title ? data.title.name : ''
      const tags  = (data.tags && data.tags.length) ? data.tags.map(item => item.name).join(', ') : ''
      const country = data.country ? data.country.country : ''
      const org = data.org ? data.org.orgname : ''
      const mobile = (data.mobile && data.mobileAreaCode) ? (`+${data.mobileAreaCode} ${data.mobile}`) : ''
      const wechat = data.wechat
      const email = data.email
      const userstatus = data.userstatus.name
      const cardBucket = data.cardBucket
      const cardKey = data.cardKey
      const ishasfundorplan = data.ishasfundorplan
      const mergedynamic = data.mergedynamic
      const targetdemand = data.targetdemand
      const orgid=data.org ? data.org.id : ''
      this.setState({
        username, title, tags, country, org, mobile, wechat, email, userstatus, ishasfundorplan, mergedynamic, targetdemand, orgid
      })
      api.downloadUrl(cardBucket, cardKey).then(result => {
        this.setState({ cardUrl: result.data })
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { targetdemand, mergedynamic, ishasfundorplan, username, title, tags, country, org, mobile, wechat, email, userstatus, cardUrl, orgid } = this.state
    return (
      <div>
        <Field title={i18n('user.cn_name')} value={username} />
        <Field title="公司" value={''} />
        <Field title={i18n('user.department')} value={''} />
        <Field title={i18n('user.position')} value={title} />
        <Field title={i18n('user.tags')} value={tags} />
        <Field title={i18n('user.country')} value={country} />
        <Field title={i18n('user.institution')} value={org} orgid={orgid}/>
        <Field title={i18n('user.area')} value={''} />
        <Field title={i18n('user.mobile')} value={mobile} />
        <Field title={i18n('user.wechat')} value={wechat} />
        <Field title={i18n('user.email')} value={email} />
        <Field title={i18n('user.status')} value={userstatus} />
        <Field title={i18n('user.card')} value={<ImageViewer><img src={cardUrl} style={cardStyle} /></ImageViewer>} />
        <Field title={i18n('project.favorite_projects')} value={''} />
        <Field title={i18n('project.recommended_projects')} value={''} />
        <Field title={i18n('project.interested_projects')} value={''} />
        <Field title={i18n('user.target_demand')} value={targetdemand} />
        <Field title={i18n('user.merges')} value={mergedynamic} />
        <Field title={i18n('user.industry_fund')} value={ishasfundorplan} />
      </div>
    )
  }
}

export default connect()(UserInfo)
