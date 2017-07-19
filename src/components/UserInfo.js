import React from 'react'

import { Row, Col } from 'antd'
import { showError } from '../utils/util'


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
    }
  }

  componentDidMount() {
    const userId = this.props.userId
    api.getUserDetailLang(userId).then(result => {
      const data = result.data
      const username = data.username
      const title = data.title ? data.title.name : ''
      const tags  = (data.tags && data.tags.length) ? data.tags.map(item => item.name).join(', ') : ''
      const country = data.country ? data.country.country : ''
      const org = data.org ? data.org.orgname : ''
      const mobile = (data.mobile && data.mobileAreaCode) ? (data.mobile + data.mobileAreaCode) : ''
      const wechat = data.wechat
      const email = data.email
      const userstatus = data.userstatus.name
      const cardUrl = '' // TODO card url
      this.setState({
        username, title, tags, country, org, mobile, wechat, email, userstatus, cardUrl
      })
    }, error => {
      showError(error.message)
    })
  }

  render() {
    const { username, title, tags, country, org, mobile, wechat, email, userstatus, cardUrl } = this.state
    return (
      <div>
        <Field title="姓名" value={username} />
        <Field title="公司" value={''} />
        <Field title="部门" value={''} />
        <Field title="职位" value={title} />
        <Field title="标签" value={tags} />
        <Field title="国家" value={country} />
        <Field title="所属机构" value={org} />
        <Field title="地区" value={''} />
        <Field title="手机号码" value={mobile} />
        <Field title="微信号" value={wechat} />
        <Field title="邮箱" value={email} />
        <Field title="审核状态" value={userstatus} />
        <Field title="名片" value={<img src={cardUrl} />} />
        <Field title="收藏项目" value={''} />
        <Field title="推荐项目" value={''} />
        <Field title="感兴趣项目" value={''} />
      </div>
    )
  }
}

export default UserInfo
