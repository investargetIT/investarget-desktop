import React from 'react'
import { connect } from 'dva'
import {Link} from 'dva/router'
import { 
  i18n,
  getUserInfo,
} from '../utils/util';
import { 
  Row, 
  Col,
  Tabs,
  Table,
  Popconfirm,
  Pagination,
} from 'antd';
import ImageViewer from './ImageViewer'
import { PAGE_SIZE_OPTIONS } from '../constants';

const TabPane = Tabs.TabPane;

const rowStyle = {
  //borderBottom: '1px dashed #eee',
  padding: '12px 0',
  fontSize: '14px',
  marginLeft:'70px'
}

class InvestEvent extends React.Component {

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
    api.getUserInvestEvent({ 
      user: this.props.user, 
      page_size: this.state.pageSize, 
      page_index: this.state.page 
    })
    .then(result => {
      this.setState({
        total: result.data.count,
        data: result.data.data,
        loading: false,
      });
    });
  }

  delete(id) {
    api.deleteUserInvestEvent(id)
      .then(() => this.getData());
  }

  render() {

    const { page, pageSize, total } = this.state;

    const columns = [
      {title: '投资项目', dataIndex: 'comshortname', render: text => <Link to={"/app/projects/library?search=" + text}>{text}</Link>},
      {title: '投资时间', dataIndex: 'investDate', render: text => text ? text.substr(0, 10) : ''},
      {title: '轮次', dataIndex: 'round', render: text => text || 'N/A'},
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <a type="danger">
              <img style={{ width: '15px', height: '20px' }} src="/images/delete.png" />
            </a>
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
      if (cardBucket && cardKey) {
        api.downloadUrl(cardBucket, cardKey).then(result => {
          this.setState({ cardUrl: result.data })
        })
      }
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    api.getUserAttachment()
      .then(result => echo('result', result))

  }

  render() {
    const { targetdemand, mergedynamic, ishasfundorplan, username, title, tags, country, org, mobile, wechat, email, userstatus, cardUrl, orgid } = this.state
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="基本信息" key="1">
          <div>
            <Field title={i18n('user.cn_name')} value={username} />
            <Field title={i18n('user.institution')} value={org} orgid={orgid} />
            <Field title={i18n('user.department')} value={''} />
            <Field title={i18n('user.position')} value={title} />
            <Field title={i18n('user.tags')} value={tags} />
            <Field title={i18n('user.country')} value={country} />
            <Field title={i18n('user.area')} value={''} />
            <Field title={i18n('user.mobile')} value={mobile} />
            <Field title={i18n('user.wechat')} value={wechat} />
            <Field title={i18n('user.email')} value={email} />
            <Field title={i18n('user.status')} value={userstatus} />
            <Field title={i18n('user.card')} value={cardUrl ? <ImageViewer><img src={cardUrl} style={cardStyle} /></ImageViewer> : null} />
            <Field title={i18n('project.favorite_projects')} value={''} />
            <Field title={i18n('project.recommended_projects')} value={''} />
            <Field title={i18n('project.interested_projects')} value={''} />
            <Field title={i18n('user.target_demand')} value={targetdemand} />
            <Field title={i18n('user.merges')} value={mergedynamic} />
            <Field title={i18n('user.industry_fund')} value={ishasfundorplan} />
          </div>
        </TabPane>
        <TabPane tab="投资事件" key="2">
          <InvestEvent user={this.props.userId} />
        </TabPane>
      </Tabs>
    )
  }
}

export default connect()(UserInfo)
