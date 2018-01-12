import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { formatMoney, isLogin, hasPerm, i18n, getPdfUrl, handleError } from '../utils/util'
import { Link, routerRedux } from 'dva/router'
import { Timeline, Icon, Tag, Button, message, Steps, Modal, Row, Col, Tabs } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectNumber } from '../components/ExtraInput'
import TimelineView from '../components/TimelineView'

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
  marginBottom: 20,
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
      padding: 10,
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
      marginLeft: 120,
      height:320,
      width:510,
      borderCollapse:'collapse',
      marginBottom:60
    }
    const labelStyle = {
      width: 250,
    }
    const leftTd={
      border:'1px solid #eee',
      borderRight:'none',
      borderLeft:'none',
      width:'255px',
    }
    const rightTd={
      border:'1px solid #eee',
      borderLeft:'none',
      borderRight:'none',
      width:'255px',
      paddingLeft:'15%'
    }

    return finance.length > 0 ? (
      <div>
        {
          finance.map(item =>
            <div key={item.fYear} style={containerStyle}>
              <h3 style={titleStyle}>
              <b> {i18n('project.fiscal_year')}
                {item.fYear}</b>
              </h3>
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
      id: Number(this.props.params.id),
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
    const { id } = this.state

    api.getProjLangDetail(id).then(result => {
      const project = result.data
      this.setState({ project }, this.updateDimensions)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })

    this.getFavorProject()

    if (hasPerm('proj.admin_getfavorite')) {
      api.getFavoriteProj({ favoritetype: 5, proj: this.state.id })
      .then(data => this.setState({ userListWithInterest: data.data.data }, this.updateDimensions))
      .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
    }

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

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  setHeader = node => this.header = this.header || node;

  render() {
    const { id, project, isFavorite, trader, traderOptions, dataroomId, isClose } = this.state
    if (project.country === undefined) return null;
    return (
      <LeftRightLayout location={this.props.location} title={i18n('project.project_detail')}>

        <Row gutter={24}>
          <Col span={10} style={{ height: '100%' }}>
              <ProjectImage project={project} height={this.state.imageHeight}/>
          </Col>
          <Col span={14}>
          <div ref={this.setHeader}>
              <ProjectHead project={project} />
              <SecretInfo project={project} />
              <div style={blockStyle}>
                { isFavorite ?
                    <Button icon="heart" className="success" size="large" style={{marginRight: 24, marginBottom: 8, backgroundColor: '#237ccc'}} onClick={this.unfavorProject}>{i18n('project.unfavor')}</Button>
                  : <Button icon="heart-o" className="success" size="large" style={{marginRight: 24, marginBottom: 8, backgroundColor: '#237ccc'}} onClick={this.favorProject}>{i18n('project.favor')}</Button> }

                { project.projstatus && project.projstatus.id >= 4 && project.projstatus.id < 7 && hasPerm('usersys.as_investor') ?
                  <Button className="white" size="large" style={{marginRight: 24, marginBottom: 8, backgroundColor: '#f2f2f2', border: 'none'}} onClick={this.haveInterest}>{i18n('project.contact_transaction')}</Button>
                : null }

                { project.projstatus && project.projstatus.id >= 4 && project.projstatus.id < 7 && (hasPerm('proj.admin_addfavorite') || hasPerm('usersys.as_trader')) ?
                  <Button className="white" size="large" style={{marginRight: 24, marginBottom: 8, backgroundColor: '#f2f2f2', border: 'none'}} onClick={this.recommendToInvestor}>{i18n('recommend_to_investor')}</Button>
                : null }

                <a href={getPdfUrl(id)}>
                  <Button  className="white" size="large" style={{backgroundColor: '#f2f2f2', border: 'none'}}>{i18n('project.project_pdf_download')}</Button>
                </a>
              </div>
              </div>
          </Col>
        </Row>
{ hasPerm('proj.admin_getfavorite') ? <InterestedPeople projId={id} /> : null }

              <Tabs animated={false}>
                <TabPane tab={i18n('project.profile')} key="1">
                  <div style={{paddingLeft:120,paddingRight:120}}>
                    <ProjectIntro project={project} />
                    <div style={{marginTop:60}}>
                      <h2 style={{fontSize:14,fontWeight: 600,marginBottom:20,color:'#656565'}}>
                        {i18n('project.project_process_timeline')}
                      </h2>
                      <TimelineView projId={id} />
                    </div>
                  </div>
                </TabPane>
                <TabPane tab={i18n('project.financials')} key="2">
                  <ProjectFinanceYear projId={id} isCNY={['中国', 'China'].includes(project.country.country) && project.currency.id === 1} />
                </TabPane>
                <TabPane tab={i18n('project.details')} key="3">
                  <Detail project={project} />
                </TabPane>
                <TabPane tab={i18n('project.file_download')} key="4">
                  <DownloadFiles projectId={id} />
                </TabPane>
              </Tabs>

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
      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  var { projstatus } = state.app
  projstatus = projstatus.filter(item => item.id >= 2)
  return { projstatus }
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



function ProjectImage({ project, height }) {
  const src = (project.industries && project.industries[0]) ? project.industries[0].url : 'defaultUrl'
  return (
    <div style={{position:'relative'}}>
      <img style={{width:'100%', height: height}} src={src} />
      { project.projstatus && project.projstatus.id == 7 ?
        <div style={{position:'absolute',top:0,right:0,bottom:0,left:0,margin:'auto',width:60,height:60,borderRadius:'50%',backgroundColor:'rgba(255,255,255,.85)',textAlign:'center',lineHeight:'60px',fontSize:13,color:'#666',boxShadow:'0 0 3px 1px rgba(0,0,0,.3)'}}>{i18n('project.finished')}</div>
      : null }
    </div>
  )
}

class InterestedPeople extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      userListWithInterest: [],
    }
  }

  componentDidMount() {
    api.getFavoriteProj({ favoritetype: 5, proj: this.props.projId })
      .then(data => this.setState({ userListWithInterest: data.data.data }))
      .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
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
                <Link key={m.id} to={'/app/user/' + m.user.id}>
                  <img style={{ width: 40, height: 40, verticalAlign: 'top', marginRight: 16, marginBottom: 16 }} src={m.user.photourl} />
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

function Icon2(props) {
  return <i style={props.style || iconStyle} className={'fa fa-' + props.type} aria-hidden="true"></i>
}

function SecretInfo({ project }) {
  const spanStyle={width:'40%',minWidth:120,marginRight:16,display:'inline-block',verticalAlign:'top'}
  const contentStyle={verticalAlign:'top'}
  return (
    <div style={blockStyle}>
      <h2 style={subtitleStyle2}>{i18n('project.privacy_infomation')}</h2>
      { project.contactPerson !== undefined ? (
        <div style={{padding: '20px 24px', fontSize: 14, color: '#656565', backgroundColor: 'rgb(233, 241, 243)'}}>
          <div>
            <span style={spanStyle}>{i18n('project.project_real_name')}：{project.realname}</span>
            <span style={contentStyle}>{i18n('project.contact_person')}：{project.contactPerson}</span>
          </div>
          <div>
            <span style={spanStyle}>{i18n('project.phone')}：{project.phoneNumber}</span>
            <span style={contentStyle}>{i18n('project.email')}：{project.email}</span>
          </div>
          <div>
            <span style={spanStyle}>{i18n('project.uploader')}：{project.supportUser ? project.supportUser.username : i18n('common.none')}</span>
            <span style={contentStyle}>{i18n('project.take_user')}：{project.takeUser ? project.takeUser.username : i18n('common.none')}</span>
          </div>
          <div>
            <span style={spanStyle}>{i18n('project.make_user')}：{project.makeUser ? project.makeUser.username : i18n('common.none')}</span>
            <span style={contentStyle}></span>
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

function ProjectHead({ project }) {
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
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <h2 style={{ margin: 0, marginBottom: 10, color: '#282828', flexGrow: 1, fontSize: 20, lineHeight: '23px' }}>{project.projtitle}</h2>
        <div style={tagStyle}><img style={{lineHeight: '12px', marginRight: 10}} src="/images/label.png" />{project.projstatus && project.projstatus.name}</div>
      </div>
      <p style={{ marginBottom: 30, fontSize: 12, color: '#989898' }}>
        <span>{i18n('project.release_time')}：{project.createdtime && project.createdtime.substr(0, 10)}</span>
        <span style={{ marginLeft: 20 }}>{i18n('address')}：{project.country && project.country.country}</span>
        <span style={{ marginLeft: 20 }}>{i18n('industry_type')}：{project.industries && project.industries[0] && project.industries[0].name}</span>
      </p>
    </div>
  )
}
function showMoneyRelatedInfo(project, type) {
  if (['中国', 'China'].includes(project.country.country) && project.currency.id === 1) {
    return project[type] && formatMoney(project[type], 'CNY');
  } else {
    return project[type + '_USD'] && formatMoney(project[type + '_USD']);
  }
}

function ProjectIntro({ project }) {
  if (project.currency === undefined) return null;
  const trStyle={border:'1px solid #eee',height:'40px',borderLeft:'none',borderRight:'none'}
  const tagStyle = {backgroundColor:'#18D8BC',borderRadius:'4px',paddingRight:'20px',color:'white',width:'100px',textAlign:'center'}
  const introduce={__html:project.p_introducte}

  return (
    <div style={blockStyle}>
      <p dangerouslySetInnerHTML={introduce} style={{marginBottom: 60}}>
      </p>
      <div style={{marginBottom: 60}}>
        {project.tags && project.tags.map(item =>
          <Tag key={item.id} style={tagStyle}>{item.name}</Tag>
        )}
      </div>
      <table style={{width:'380px', textAlign:'center'}}>
      <tbody>
        <tr style={{...trStyle, backgroundColor:'#eee'}}>
          <td>{i18n('project.transaction_type')}</td>
          <td>{i18n('project.engagement_in_transaction')}</td>
          <td>{i18n('project.transaction_size')}</td>
          <td>{i18n('project.company_valuation')}</td>
        </tr>
        <tr style={trStyle}>
          <td>{project.transactionType && project.transactionType[0] && project.transactionType[0].name}</td>
          <td>{project.character && project.character.character}</td>
          <td>{showMoneyRelatedInfo(project, 'financeAmount') || '-'}</td>
          <td>{showMoneyRelatedInfo(project, 'companyValuation') || '-'}</td>
        </tr>
      </tbody>
      </table>
      
    </div>
  )
}

function Detail({ project }) {
  const containerStyle = {
    
  }
  const style = {
    marginBottom: 30,
  }
  const titleStyle = {
    backgroundColor: '#f4f4f4',
    fontSize: 14,
    fontWeight: 400,
    paddingLeft: 120,
    height: 24,
    lineHeight: '28px',
    marginTop: 16,
    color: '#656565',
  }
  const paraStyle = {
    paddingLeft: 120,
    paddingRight:120,
    fontSize: 14,
    wordBreak: 'break-word',
    lineHeight: '24px',
    marginTop:20
  }

  function createMarkup(str) {
    str = str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--')
    str = str.replace(/\n/g, '<br/>')
    return { __html: str }
  }

  function DetailItem({ label, content }) {
    return content&&content!='暂无' ? (
      <div style={style}>
        <h3 style={titleStyle}>{label}</h3>
        <p style={paraStyle} dangerouslySetInnerHTML={createMarkup(content)}></p>
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
    api.getProjAttachment({ proj: id, page_size: 10000 }).then(result => {
      const { data: attachments } = result.data
      this.setState({ attachments })

      const q = attachments.map(item => {
        let { bucket, key, filename } = item
        key = key + '?attname=' + encodeURIComponent(filename)
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
      padding: 10,
    }
    const sectionStyle = {
      padding: '0px 20px',
      paddingTop:'10px',
      marginLeft:120,
      marginBottom:10,
      width:620,
      display: 'flex',
      backgroundColor:'rgb(233, 241, 243)'
    }

    const titleStyle = {
      flexShrink: 0,
      width: 150,
      paddingRight: 15,
    }
    const listStyle = {
      flexGrow: 1,
    }
    const headerStyle={
      fontSize: 14,
      fontWeight: 400,
      paddingLeft: 120,
      color: '#656565',
      marginBottom:20,
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
      zIndex:10,
      right:'35%',
      top:'20%',
      width:'30%',
      height:'40%',
    }
    const liStyle={
      display:'flex',
      justifyContent:'space-between',
      height:30,
    }
    const dirs = Array.from(new Set(this.state.attachments.map(item=>item.filetype)))

    return (
      <div style={containerStyle}>
        {dirs.length?<div style={headerStyle}>{i18n('project.material_download')}</div>:
        <div style={headerStyle}>{i18n('project.no_materials')}</div>}
        {dirs.map((dir, index) => {
          const files = this.state.attachments.filter(item => item.filetype == dir)
          const isLast = index == dirs.length - 1

          return (
            <div key={index} style={sectionStyle}>
              <div style={titleStyle}>{dir}</div>
              <ul style={listStyle}>
                {files.map(file => {
                  return (
                    <li key={file.key} style={liStyle}>
                      <div title={file.filename} style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>
                        {file.filename}
                      </div>
                      <a
                        disabled={!file.url}
                        download={file.filename}
                        href={file.url}
                      >
                      <div style={imgContainer}>
                        <img style={cloudStyle} src="/images/cloud.png" />
                        <img style={arrowStyle} src="/images/arrow.png" />
                      </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    )
  }
}
