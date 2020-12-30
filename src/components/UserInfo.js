import React from 'react'
import { connect } from 'dva'
import {Link} from 'dva/router'
import { 
  i18n,
  getUserInfo,
  time,
} from '../utils/util';
import { 
  Row, 
  Col,
  Tabs,
  Table,
  Popconfirm,
  Pagination,
  Icon,
  Button,
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
const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
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
    api.getUserAttachment({
      user: this.props.user, 
      page_size: this.state.pageSize, 
      page_index: this.state.page,
      sort: this.state.sort,
      desc: this.state.desc,
    }).then(result => {
      let total = result.data.count
      let data = result.data.data
      let loading = false
      
      Promise.all(result.data.data.map(m => api.downloadUrl(m.bucket, m.key)))
             .then(urlResult => {
        data = data.map((v,i) => ({...v, url: urlResult[i].data}))
        this.setState({total, data, loading})
      })
    })
      
  }

  delete(id) {
    api.deleteUserAttachment(id)
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
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button size="small" style={buttonStyle}>
              <Icon type="delete" />
            </Button>
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
const fileExtensions = [
  '.pdf',
  '.doc',
  '.xls',
  '.ppt',
  '.docx',
  '.xlsx',
  '.pptx',
];

class InvestEvent extends React.Component {

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
    let buyout;
    api.getUserInvestEvent({ 
      user: this.props.user, 
      page_size: this.state.pageSize, 
      page_index: this.state.page,
      sort: this.state.sort,
      desc: this.state.desc,
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
      {title: '投资项目', dataIndex: 'comshortname', render: text => <Link to={"/app/projects/library?search=" + text}>{text}</Link>},
      {title: '投资时间', dataIndex: 'investDate', render: text => text ? text.substr(0, 10) : '', sorter: true},
      {title: '轮次', dataIndex: 'round', render: text => text || 'N/A'},
      {
        title: i18n('common.operation'), key: 'action', render: (text, record) => (
          <Popconfirm title={i18n('delete_confirm')} onConfirm={this.delete.bind(this, record.id)}>
            <Button size="small" style={buttonStyle}>
              <Icon type="delete" />
            </Button>
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
      area: '',
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
      attachment: [],
    }
  }

  async componentDidMount() {
    try {
      const { username, org } = await this.getUsernameAndSetState();
      await this.getHistoryOrg(username, org);
    } catch (error) {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    }
  }

  getUsernameAndSetState = async () => {
    const userId = this.props.userId;
    const result = await api.getUserInfo(userId)
    const data = result.data
    console.log(data)
    const username = data.username
    const title = data.title ? data.title.name : ''
    const tags = (data.tags && data.tags.length) ? data.tags.map(item => item.name).join(', ') : ''
    const country = data.country ? data.country.country : ''
    const area = data.orgarea ? data.orgarea.name : '';
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
    const orgid = data.org ? data.org.id : ''
    this.setState({
      username, title, tags, country, area, org, mobile, wechat, email, userstatus, ishasfundorplan, mergedynamic, targetdemand, orgid
    })
    if (this.props.onGetUsername) {
      this.props.onGetUsername(username);
    }
    if (this.props.onGetMobile) {
      this.props.onGetMobile(mobile);
    }
    if (cardBucket && cardKey) {
      api.downloadUrl(cardBucket, cardKey).then(result => {
        this.setState({ cardUrl: result.data })
      })
    }
    return { username, org: data.org };
  }

  getHistoryOrg = async (username, org) => {
    const pageSize = 100;
    const params = { search: username, page_size: pageSize };
    let res = await api.getLogOfUserUpdate(params);
    const { count } = res.data;
    if (count > pageSize) {
      res = await api.getLogOfUserUpdate({ ...params, page_size: count });
    }
    let historyOrg = res.data.data.filter(f => f.user_id === this.props.userId && f.type === 'organization' && f.before);
    historyOrg.sort((a, b) => new Date(b.updatetime)- new Date(a.updatetime))
    historyOrg = historyOrg.map(m => m.before);
    if (org) {
      if (org.orgname) {
        historyOrg = historyOrg.filter(f => f !== org.orgname);
      }
      if (org.orgfullname) {
        historyOrg = historyOrg.filter(f => f !== org.orgfullname);
      }
    }
    if (historyOrg.length > 0) {
      this.setState({ org: `${this.state.org}，之前机构：${historyOrg.join('、')}` });
    }
  }


  render() {
    const { targetdemand, mergedynamic, ishasfundorplan, username, title, tags, country, area, org, mobile, wechat, email, userstatus, cardUrl, orgid } = this.state
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
            <Field title={i18n('user.area')} value={area} />
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

{/* { this.state.attachment.length > 0 ? */}
        <TabPane tab="附件" key="3">
          <AttachmentList user={this.props.userId} />
        


        </TabPane>
        {/* : null } */}

      </Tabs>
    )
  }
}

export default connect()(UserInfo)
