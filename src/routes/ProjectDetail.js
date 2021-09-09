import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { formatMoney, isLogin, hasPerm, i18n, getPdfUrl, handleError, isShowCNY, requestAllData, getPdfUrlWithoutBase } from '../utils/util'
import { Link, routerRedux } from 'dva/router'
import { Timeline, Icon, Tag, Button, message, Steps, Modal, Row, Col, Tabs, Progress, Breadcrumb, Card } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { SelectNumber } from '../components/ExtraInput'
import TimelineViewNew from '../components/TimelineViewNew';
import {
  HeartOutlined,
  HeartFilled,
  CloudDownloadOutlined,
} from '@ant-design/icons';

const TabPane = Tabs.TabPane
const Step = Steps.Step

function Field (props) {
  const defaultLabelStyle = { width:150 }
  return (
    <div style={{display: 'flex'}}>
      <span style={props.labelStyle || defaultLabelStyle}>{props.label}</span>
      <span style={props.valueStyle || {}}>{props.value}</span>
    </div>
  )
}


const blockStyle = {
  color: '#595959',
}
const blockStyle2 = {
  marginBottom: 44,
}
const blockTitleStyle = {
  margin: '16px 0',
}


class ProjectFinanceYear extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      finance: []
    }
  }

  componentDidMount() {
    const id = this.props.projId
    api.getProjFinance(id).then(result => {
      this.setState({ finance: result.data.data })
    })

  }

  showFinanceInfo = (item, property) => this.props.isCNY ?
    item[property] && formatMoney(item[property], 'CNY')
    :
    item[property + '_USD'] && formatMoney(item[property + '_USD']);

  render() {
    const { finance } = this.state

    const containerStyle = {
    }
    const titleStyle = {
      fontWeight: 400,
      fontSize: 14,
      color: '#656565',
      paddingBottom: 10,
      lineHeight: 1.4,
      paddingLeft:120,
    }
    const yearStyle = {
      marginLeft: 10,
      color: '#ff6900',
    }
    const contentStyle = {
      height:320,
      width:510,
      borderCollapse:'collapse',
      color: '#595959',
    }
    const labelStyle = {
      width: 250,
    }
    const leftTd={
      border:'1px solid #eee',
      borderRight:'none',
      borderLeft:'none',
      width:'255px',
      padding: '14px 20px',
    }
    const rightTd={
      border:'1px solid #eee',
      borderLeft:'none',
      borderRight:'none',
      width:'255px',
      padding: '14px 20px',
    }
    const trStyle={
      border: '1px solid #eee',
      borderLeft: 'none',
      borderRight:'none'
    };

    return finance.length > 0 ? (
      <div style={{ width: '50%' }}>
        {
          finance.map(item =>
            <div key={item.fYear} style={containerStyle}>
              <div style={{ ...trStyle, backgroundColor: '#eee', color: '#262626', fontWeight: 'bold', padding: '14px 20px' }}>{i18n('project.fiscal_year')}{item.fYear}</div>

              <table style={contentStyle}>
              <tbody>
                <tr>  
                  <td style={leftTd}>{`${i18n('project.revenue')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`}</td> 
                  <td style={rightTd}>{this.showFinanceInfo(item, 'revenue') || '-'}</td>
                </tr>
                <tr> 
                  <td style={leftTd}>{`${i18n('project.profits')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`}</td>
                  <td style={rightTd}>{this.showFinanceInfo(item, 'netIncome') || '-'} </td>
                </tr>
                <tr> 
                  <td style={leftTd}>{`${i18n('project.gross_profits')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`}</td> 
                  <td style={rightTd}>{item.grossProfit ? formatMoney(item.grossProfit, this.props.isCNY ? 'CNY' : undefined) : '-'} </td>
                </tr>
                <tr>
                  <td style={leftTd}>{`${i18n('project.total_assets')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`} </td>
                  <td style={rightTd}>{item.totalAsset ? formatMoney(item.totalAsset, this.props.isCNY ? 'CNY' : undefined) : '-'} </td>
                </tr>
                <tr>
                  <td style={leftTd}>{`${i18n('project.net_assets')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`} </td>
                  <td style={rightTd}>{item.stockholdersEquity ? formatMoney(item.stockholdersEquity, this.props.isCNY ? 'CNY' : undefined) : '-'} </td>
                </tr>
                <tr> 
                  <td style={leftTd}>{`${i18n('project.net_cash_flow')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`} </td>
                  <td style={rightTd}>{item.grossMerchandiseValue ? formatMoney(item.grossMerchandiseValue, this.props.isCNY ? 'CNY' : undefined) : '-'} </td>
                </tr>
                <tr>
                  <td style={leftTd}>{`${i18n('project.operating_cash_flow')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`} </td>
                  <td style={rightTd}>{item.operationalCashFlow ? formatMoney(item.operationalCashFlow, this.props.isCNY ? 'CNY' : undefined) : '-'} </td>
                </tr>
                <tr>
                  <td style={leftTd}>{`${i18n('project.EBITDA')}(${i18n(this.props.isCNY ? 'cny' : 'common.USD')})`} </td>
                  <td style={rightTd}>{item.EBITDA ? formatMoney(item.EBITDA, this.props.isCNY ? 'CNY' : undefined) : '-'} </td>
                </tr>
              </tbody>
              </table>
            </div>
          )
        }
      </div>
    ) : null
  }

}
ProjectFinanceYear = connect()(ProjectFinanceYear)


class ProjectDetail extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      id: Number(props.match.params.id),
      project: {},
      isFavorite: false,
      favorId: null,
      traderOptions: [],
      trader: null,
      userListWithInterest: [],
      hasPublicDataroom: false,
      investor: null,
      investorOptions: [],
      dataroomId: null,
      isClose: null,
      visible: false,
      loading: false,
      imageHeight: 0,
      activeKey: 1,
      activeTabKey: 'details',
      progress: 0,
      loadingPdf: false,  // PDF 下载 loading 状态
    }
  }

  getFavorProject = () => {
    var param = {
      favoritetype: 4,
      proj: this.state.id,
    }
    if (hasPerm('usersys.as_admin')) {
      param['user'] = isLogin() && isLogin().id
    }
    api.getFavoriteProj(param).then(result => {
      const data = result.data.data
      const isFavorite = data.length == 1
      const favorId = data[0] && data[0].id
      this.setState({ isFavorite, favorId }, this.updateDimensions)
    })
    .catch(handleError);
  }

  favorProject = () => {
    const param = {
      favoritetype: 4,
      user: isLogin() && isLogin().id,
      projs: [this.state.id],
    }
    api.projFavorite(param).then(result => {
      this.setState({ isFavorite: true })
      message.success(i18n('project.message.favor_success'), 2)
      this.getFavorProject()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  unfavorProject = () => {
    const param = {
      favoriteids: [this.state.favorId],
    }
    api.projCancelFavorite(param).then(result => {
      this.setState({ isFavorite: false, favorId: null })
      message.success(i18n('project.message.unfavor_success'), 2)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleTraderChange = (trader) => {
    this.setState({ trader })
  }
  handleInvestorChange = investor => this.setState({ investor });

  haveInterest = () => {
    if (this.state.traderOptions.length === 0) {
      Modal.error({
        title: i18n('user.no_trader')
      });
    } else {
      this.setState({ visible: true })
    }
  }

  handleOk = () => {
    this.setState({ loading: true })
    const { id, trader } = this.state
    const params = {
      favoritetype: 5,
      projs: [id],
      user: isLogin() && isLogin().id,
      trader: trader,
    }
    api.projFavorite(params).then(result => {
      this.setState({ visible: false, loading: false })
      message.success(i18n('project.message.interest_success'), 2)
    }, error => {
      this.setState({ visible: false, loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }
  handleCancel = () => {
    this.setState({ visible: false, loading: false })
  }

  recommendToInvestor = () => {
    if (!this.state.isFavorite) {
      Modal.error({
        title: i18n('not_favorite_yet')
      });
      return;
    }
    window.open("/app/projects/recommend/" + this.state.id);
  }



  handleClickDataRoom = () => {
    Modal.error({ title: i18n('dataroom.message.no_dataroom_permission') })
  }

  updateDimensions = () => setTimeout(() => this.setState({ imageHeight: this.header.clientHeight }), 100);

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.props.dispatch({ type: 'app/getSource', payload: 'projstatus' })
    this.props.dispatch({ type: 'app/getSource', payload: 'country' });
    const { id } = this.state

    api.getProjLangDetail(id).then(result => {
      const project = result.data
      this.setState({ project }, () => this.getAndSetProjectPercentage(id))
    }).catch( handleError);

    this.getFavorProject()

    // 获取投资人的交易师
    if (hasPerm('usersys.as_investor')) {
      api.getUserRelation({ investoruser: isLogin() && isLogin().id }).then(result => {
        const data = result.data.data
        const relation = data.filter(item => item.relationtype)[0]
        const trader = relation && relation.traderuser.id
        const traderOptions = data.map(item => ({ value: item.traderuser.id, label: item.traderuser.username }))
        this.setState({ traderOptions, trader }, this.updateDimensions)
      })
    }

    if (hasPerm('usersys.as_trader')) {
      api.getUserRelation({ traderuser: isLogin() && isLogin().id }).then(result => {
        const data = result.data.data
        const relation = data.filter(item => item.relationtype)[0]
        const investor = relation && relation.investoruser.id
        const investorOptions = data.map(item => ({ value: item.investoruser.id, label: item.investoruser.username }))
        this.setState({ investorOptions, investor }, this.updateDimensions)
      })
    }
  }

  getAndSetProjectPercentage = async projID => {
    const reqBdRes = await api.getSource('orgbdres');
    const { data: orgBDResList } = reqBdRes;

    const paramsForPercentage = { proj: projID };
    const projPercentageCount = await api.getOrgBDCountNew(paramsForPercentage);
    let { response_count: resCount } = projPercentageCount.data;
    resCount = resCount.map(m => {
      const relatedRes = orgBDResList.filter(f => f.id === m.response);
      let resIndex = 0;
      if (relatedRes.length > 0) {
        resIndex = relatedRes[0].sort;
      }
      return { ...m, resIndex };
    });
    const maxRes = Math.max(...resCount.map(m => m.resIndex));
    let percentage = 0;
    if (maxRes > 3) {
      // 计算方法是从正在看前期资料开始到交易完成一共11步，取百分比
      percentage = Math.round((maxRes - 3) / 11 * 100);
    }
    if (this.state.project.projstatus) {
      if (this.state.project.projstatus.name.includes('已完成') || this.state.project.projstatus.name.includes('Completed')) {
        percentage = 100;
      }
    }
    this.setState({ progress: percentage });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  handleTabChange = key => {
    this.setState({ activeTabKey: key });
  }

  setHeader = node => this.header = this.header || node;

  handleDownloadPDFBtnClick = async id => {
    try {
      this.setState({ loadingPdf: true });
      const url = getPdfUrlWithoutBase(id);
      const res = await api.getCustomizedUrl(url);
      window.location.href = res.data;
    } catch (error) {
      handleError(error);
    } finally {
      this.setState({ loadingPdf: false });
    }
  }

  render() {
    const { id, project, isFavorite, trader, traderOptions, dataroomId, isClose } = this.state
    return (
      <LeftRightLayoutPure location={this.props.location}>

        <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
          <Breadcrumb.Item>
            <Link to="/app">首页</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>项目管理</Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/app/projects/list">平台项目</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>项目详情</Breadcrumb.Item>
        </Breadcrumb>

        <Card style={{ marginBottom: 20 }} bodyStyle={{ padding: '0 20px', paddingTop: 20 }}>
          <div style={{ display: 'flex' }}>
            <ProjectImage project={project} />

            <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} ref={this.setHeader}>
              <ProjectHead project={project} allCountries={this.props.country} progress={this.state.progress} />

              <div className="another-btn">
                {/* {isFavorite ?
                  <Button icon={<HeartFilled />} type="primary" style={{ marginRight: 24, marginTop: 8 }} onClick={this.unfavorProject}>{i18n('project.unfavor')}</Button>
                  : <Button icon={<HeartOutlined />} type="primary" style={{ marginRight: 24, marginTop: 8 }} onClick={this.favorProject}>{i18n('project.favor')}</Button>}

                {project.projstatus && project.projstatus.id >= 4 && project.projstatus.id < 7 && hasPerm('usersys.as_investor') ?
                  <Button style={{ marginRight: 24, marginTop: 8 }} onClick={this.haveInterest}>{i18n('project.contact_transaction')}</Button>
                  : null} */}

                {project.projstatus && project.projstatus.id >= 4 && project.projstatus.id < 7 && (hasPerm('proj.admin_addfavorite') || hasPerm('usersys.as_trader')) ?
                  <Button style={{ marginRight: 24, marginTop: 8 }} onClick={this.recommendToInvestor}>{i18n('recommend_to_investor')}</Button>
                  : null}

                {/* <a href={getPdfUrl(id)}> */}
                  <Button loading={this.state.loadingPdf} onClick={this.handleDownloadPDFBtnClick.bind(this, id)}>{i18n('project.project_pdf_download')}</Button>
                {/* </a> */}
              </div>
            </div>
          </div>

          <Tabs
            style={{ marginTop: 20 }}
            className="project-details-tab"
            defaultActiveKey="details"
            activeKey={this.state.activeTabKey}
            tabBarGutter={50}
            onChange={this.handleTabChange}
          >
            <TabPane tab="详情" key="details" />
            <TabPane tab="项目进程" key="progress" />
          </Tabs>

        </Card>

        {this.state.activeTabKey === 'details' &&
          <div>
            <Card title={i18n('project.privacy_infomation')} style={{ marginBottom: 20 }}>
              <SecretInfo project={project} />
            </Card>

            {/* {hasPerm('proj.admin_getfavorite') ? <InterestedPeople projId={id} /> : null} */}

            <Card title={i18n('project.profile')} style={{ marginBottom: 20 }}>
              <ProjectIntro project={project} />
            </Card>

            <Card title={i18n('project.financials')} style={{ marginBottom: 20 }}>
              {project.country === undefined ? null : <ProjectFinanceYear projId={id} isCNY={isShowCNY(project, this.props.country)} />}
            </Card>

            <Card title={i18n('project.details')} style={{ marginBottom: 20 }}>
              <Detail project={project} />
            </Card>

            <Card title={i18n('project.file_download')} style={{ marginBottom: 20 }}>
              <DownloadFiles projectId={id} />
            </Card>
          </div>
        }

        {this.state.activeTabKey === 'progress' &&
          <Card title={i18n('project.project_process_timeline')}>
            <div style={{ width: '50%' }}><TimelineViewNew projID={id} /></div>
          </Card>
        }

        <Modal
          visible={this.state.visible}
          title={i18n('project.connect_trader')}
          onCancel={this.handleCancel}
          footer={[
            <Button key="1" onClick={this.handleCancel}>{i18n('common.cancel')}</Button>,
            <Button key="2" type="primary" loading={this.state.loading} onClick={this.handleOk}>{i18n('common.confirm')}</Button>
          ]}
        >
          {i18n('project.select_trader')}
          <SelectNumber
            style={{minWidth:150}}
            options={traderOptions}
            value={trader}
            onChange={this.handleTraderChange}
            notFoundContent={i18n('user.no_trader')} />
        </Modal>
      </LeftRightLayoutPure>
    )
  }
}

function mapStateToProps(state) {
  var { projstatus, country } = state.app
  projstatus = projstatus.filter(item => item.id >= 2)
  return { projstatus, country }
}

export default connect(mapStateToProps)(ProjectDetail)


// style
const subtitleStyle = {
  paddingTop: 8,
  fontSize: 14,
  textTransform: 'uppercase',
  color: '#f4b348',
}
const subtitleStyle2 = {
  marginBottom: 10,
  fontSize: 14,
  textTransform: 'uppercase',
  color: '#656565',
}
const iconStyle = {
  width: 16,
  marginRight: 8,
  textAlign: 'center',
}



function ProjectImage({ project }) {
  const src = (project.industries && project.industries[0]) ? project.industries[0].url : 'defaultUrl'
  return (
    <div style={{ position:'relative' }}>
      <img style={{ width: 280, height: 210, borderRadius: 4 }} src={src} />
      { project.projstatus && project.projstatus.id == 7 ?
        <div style={{position:'absolute',top:0,right:0,bottom:0,left:0,margin:'auto',width:60,height:60,borderRadius:'50%',backgroundColor:'rgba(255,255,255,.85)',textAlign:'center',lineHeight:'60px',fontSize:13,color:'#666',boxShadow:'0 0 3px 1px rgba(0,0,0,.3)'}}>{i18n('project.finished')}</div>
      : null }
    </div>
  )
}

class InterestedPeople1 extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      userListWithInterest: [],
    }
  }

  componentDidMount() {
    api.getFavoriteProj({ favoritetype: 5, proj: this.props.projId })
      .then(data => {
        const allUsers = data.data.data.map(m => m.user);
        const allUserIds = allUsers.map(m => m.id);
        const allUniqueUserIds = allUserIds.filter((f, i) => allUserIds.indexOf(f) === i);
        const userListWithInterest = allUniqueUserIds.map(m => allUsers.filter(f => f.id === m)[0]);
        this.setState({ userListWithInterest });
      })
      .catch(error => {
        this.props.dispatch({ type: 'app/findError', payload: error })
      })
  }

  render() {
    const { userListWithInterest } = this.state
    return (
      <Row style={blockStyle2}>
        <Col span={3}>
        <div style={subtitleStyle}>{i18n('project.investors_interested')}</div>
        </Col>
        <Col span={21}>
        <div>
          {userListWithInterest.length > 0 ? (
              userListWithInterest.map(m =>
                <Link key={m.id} to={'/app/user/' + m.id}>
                  <img style={{ width: 40, height: 40, verticalAlign: 'top', marginRight: 16, marginBottom: 16 }} src={m.photourl} />
                </Link>
              )
            ) : (
              <p>{i18n('common.none')}</p>
            )
          }
          </div>
          </Col>
      </Row>
    )
  }
}

const InterestedPeople = connect()(InterestedPeople1)

function Icon2(props) {
  return <i style={props.style || iconStyle} className={'fa fa-' + props.type} aria-hidden="true"></i>
}

function SecretInfo({ project }) {
  let takeUsersName = '';
  let makeUsersName = '';
  if (project.projTraders) {
    const takeUsers = project.projTraders.filter(f => f.type === 0);
    const makeUsers = project.projTraders.filter(f => f.type === 1);
    if (takeUsers.length > 0) {
      takeUsersName = takeUsers.map(m => m.user.username).join('、');
    }
    if (makeUsers.length > 0) {
      makeUsersName = makeUsers.map(m => m.user.username).join('、');
    }
  }
  return (
    <div>
      { project.contactPerson !== undefined ? (
        <div style={{ padding: 30, fontSize: 14, color: '#595959', backgroundColor: '#f0f6fb', borderRadius: 4 }}>
          <div style={{ marginBottom: 16 }}><span style={{ color: '#262626' }}>{i18n('project.project_real_name')}：</span>{project.realname}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 16 }}><span style={{ color: '#262626' }}>{i18n('project.contact_person')}：</span>{project.contactPerson}</div>
              <div><span style={{ color: '#262626' }}>{i18n('project.uploader')}：</span>{project.supportUser ? project.supportUser.username : i18n('common.none')}</div>
            </div>
            <div>
              <div style={{ marginBottom: 16 }}><span style={{ color: '#262626' }}>{i18n('project.phone')}：</span>{project.phoneNumber}</div>
              <div><span style={{ color: '#262626' }}>{i18n('project.take_user')}：</span>{takeUsersName || i18n('common.none')}</div>
            </div>
            <div>
              <div style={{ marginBottom: 16 }}><span style={{ color: '#262626' }}>{i18n('project.email')}：</span>{project.email}</div>
              <div><span style={{ color: '#262626' }}>{i18n('project.make_user')}：</span>{makeUsersName || i18n('common.none')}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ height:130, backgroundColor: 'rgb(233, 241, 243)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div><img src="/images/lock.png" /></div>
        </div>
      )}
    </div>
  )
}

function ProjectHead({ project, allCountries, progress }) {
  const tagStyle = {
    flexShrink:0,
    marginLeft: 8,
    marginTop: 3,
    backgroundColor: '#fff',
    boxShadow: 'none',
    height: 28,
    lineHeight: '28px',
    cursor: 'default',
    fontSize: 12,
    color: '#656565'
  }

  function displayCountry() {
    if (!project.country) return null;
    const country = project.country
    const countryName = country ? country.country : ''
    let imgUrl = country && country.key && country.url
    if (country && !imgUrl) {
      const parentCountry = allCountries.filter(f => f.id === country.parent.id)[0]
      if (parentCountry && parentCountry.url) {
        imgUrl = parentCountry.url
      }
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ minWidth: 68 }}>{i18n('project.country')}：</div>
        {imgUrl ? <img src={imgUrl} style={{ width: '20px', height: '14px', marginRight: '4px' }} /> : null}
        <div style={{ color: '#595959' }}>{countryName}</div>
      </div>
    )
  }

  function displayTranscationAmount() {
    if (!project.country) return null;
    if (isShowCNY(project, allCountries)) {
      return project.financeAmount ? formatMoney(project.financeAmount, 'CNY') : 'N/A'
    } else {
      return project.financeAmount_USD ? formatMoney(project.financeAmount_USD) : 'N/A'
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: 10, color: '#282828', fontWeight: 'bold', fontSize: 20 }}>{project.projtitle}</div>
        <div style={{ border: '1px solid #339bd2', borderRadius: 4, width: 72, height: 24, fontSize: 14, color: '#339bd2', background: '#f0f6fb', display: 'flex', justifyContent: 'center', alignItems: 'center' }} color="blue">
          {project.projstatus && project.projstatus.name}
        </div>
      </div>
      <div style={{ marginBottom: 30, fontSize: 14, color: '#262626', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 250, margin: '8px 0' }}>{displayCountry()}</div>
        <div style={{ minWidth: 250, margin: '8px 0' }}>{i18n('project.transaction_size')}：<span style={{ color: '#339bd2' }}>{displayTranscationAmount()}</span></div>
        <div style={{ display: 'flex', minWidth: 250, margin: '8px 0' }}>项目进度：<div style={{ width: 180 }}><Progress percent={progress} size="small" strokeColor="#339bd2" /></div></div>
        <div style={{ minWidth: 250, margin: '8px 0' }}>{i18n('project_bd.created_time')}：<span style={{ color: '#595959' }}>{project.createdtime && project.createdtime.substr(0, 10)}</span></div>
        <div style={{ minWidth: 250, margin: '8px 0' }}>{i18n('industry_type')}：<span style={{ color: '#595959' }}>{project.industries && project.industries[0] && project.industries[0].name}</span></div>
      </div>
    </div>
  )
}
function showMoneyRelatedInfo(project, type, allArea) {
  if (isShowCNY(project, allArea)) {
    return project[type] && formatMoney(project[type], 'CNY');
  } else {
    return project[type + '_USD'] && formatMoney(project[type + '_USD']);
  }
}

function ProjectIntro({ project, country }) {
  if (project.currency === undefined) return null;
  const trStyle={border:'1px solid #eee',height: 50,borderLeft:'none',borderRight:'none'}
  const tagStyle = {backgroundColor:'#18D8BC',borderRadius:'4px',paddingRight:'20px',color:'white',width:'100px',textAlign:'center'}
  const introduce={__html:project.p_introducte}

  return (
    <div style={blockStyle}>

      <div style={{marginBottom: 16}}>
        {project.tags && project.tags.map(item =>
          <Tag key={item.id} style={{ color: '#595959', fontSize: 14 }}>{item.name}</Tag>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div dangerouslySetInnerHTML={introduce} style={{ flex: 1, marginRight: 40 }} />

        <table style={{ flex: 1, textAlign: 'center' }}>
          <tbody>
            <tr style={{ ...trStyle, backgroundColor: '#eee', color: '#262626', fontWeight: 'bold' }}>
              <td>{i18n('project.transaction_type')}</td>
              <td>{i18n('project.engagement_in_transaction')}</td>
              <td>{i18n('project.transaction_size')}</td>
              <td>{i18n('project.company_valuation')}</td>
            </tr>
            <tr style={trStyle}>
              <td>{project.transactionType && project.transactionType[0] && project.transactionType[0].name}</td>
              <td>{project.character && project.character.character}</td>
              <td>{showMoneyRelatedInfo(project, 'financeAmount', country) || '-'}</td>
              <td>{showMoneyRelatedInfo(project, 'companyValuation', country) || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  )
}
ProjectIntro = connect(mapStateToProps)(ProjectIntro);

function Detail({ project }) {
  const containerStyle = {
    width: '70%', 
  }
  const style = {
  }
  const titleStyle = {
    padding: '14px 20px',
    backgroundColor: '#f4f4f4',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: '22px',
    color: '#262626',
    borderBottom: '1px solid #e6e6e6',
  }
  const paraStyle = {
    padding: '14px 20px',
    fontSize: 14,
    wordBreak: 'break-word',
    lineHeight: '24px',
    color: '#595959',
  }

  function createMarkup(str) {
    str = str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--')
    str = str.replace(/\n/g, '<br/>')
    return { __html: str }
  }

  function DetailItem({ label, content }) {
    return content&&content!='暂无' ? (
      <div style={style}>
        <div style={titleStyle}>{label}</div>
        <div style={paraStyle} dangerouslySetInnerHTML={createMarkup(content)} />
      </div>
    ) : null
  }
  return (

    <div style={containerStyle}>
      <DetailItem label={i18n('project.target_market')} content={project.targetMarket} />
      <DetailItem label={i18n('project.product_technology')} content={project.productTechnology} />
      <DetailItem label={i18n('project.business_model')} content={project.businessModel} />
      <DetailItem label={i18n('project.brand_channel')} content={project.brandChannel} />
      <DetailItem label={i18n('project.management_team')} content={project.managementTeam} />
      <DetailItem label={i18n('project.business_partners')} content={project.Businesspartners} />
      <DetailItem label={i18n('project.use_of_proceed')} content={project.useOfProceed} />
      <DetailItem label={i18n('project.financing_history')} content={project.financingHistory} />
      <DetailItem label={i18n('project.operational_data')} content={project.operationalData} />
    </div>
  )
}

class DownloadFiles extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      attachments: [],
    }
  }

  componentDidMount() {
    const id = this.props.projectId
    requestAllData(api.getProjAttachment, { proj: id, page_size: 10000 }, 10000).then(result => {
      const { data: attachments } = result.data
      this.setState({ attachments })

      const q = attachments.map(item => {
        let { bucket, key } = item;
        key = key + '?attname=' + encodeURIComponent(key);
        return api.downloadUrl(bucket, key).then(result => {
          return result.data
        })
      })
      Promise.all(q).then(urls => {
        const list = attachments.map((item, index) => {
          return { ...item, url: urls[index] }
        })
        this.setState({ attachments: list })
      })
    })
  }

  render() {
    const containerStyle = {
      width: '70%',
    }
    const sectionStyle = {
    }

    const titleStyle = {
      width: 200,
      marginRight: 20,
    }
    const listStyle = {
      flexGrow: 1,
    }
    const headerStyle = {
      padding: '14px 20px',
      backgroundColor: '#f4f4f4',
      fontSize: 14,
      fontWeight: 'bold',
      lineHeight: '22px',
      color: '#262626',
      borderBottom: '1px solid #e6e6e6',
    }
    const imgContainer={
      width:30,
      height:25,
      position:'relative',
    }
    const cloudStyle={
      width:'100%',
      height:'100%',
    }
    const arrowStyle={
      position:'absolute',
      zIndex:1,
      right:'35%',
      top:'20%',
      width:'30%',
      height:'40%',
    }
    const liStyle={
      display:'flex',
      justifyContent:'space-between',
      minHeight:30,
      fontSize: 14,
      lineHeight: '22px',
      padding: '14px 20px',
      borderBottom: '1px solid #e6e6e6',
      color: '#595959', 
      alignItems: 'center',
    }
    const dirs = Array.from(new Set(this.state.attachments.map(item=>item.filetype)))

    return (
      <div style={containerStyle}>

        {dirs.length?<div style={headerStyle}>{i18n('project.material_download')}</div>:
        <div style={headerStyle}>{i18n('project.no_materials')}</div>}

        {dirs.map((dir, index) => {
          const files = this.state.attachments.filter(item => item.filetype == dir)
          const isLast = index == dirs.length - 1

          return files.map(file => {
            return (
              <div key={file.key} style={liStyle}>
                <div style={titleStyle}>{dir}</div>
                <div title={file.filename} style={{ wordWrap: 'word-break:break-all', flex: 1, marginRight: 20 }}>
                  {file.filename}
                </div>
                <a
                  disabled={!file.url}
                  download={file.filename}
                  href={file.url}
                >
                  <Button type="link" icon={<CloudDownloadOutlined />}>下载</Button>
                </a>
              </div>
            )
          })
        })}
      </div>
    )
  }
}
