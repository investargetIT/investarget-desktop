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
  marginBottom: 30,
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

  render() {
    const { finance } = this.state

    const containerStyle = {
      padding: 10,
    }
    const titleStyle = {
      fontWeight: 400,
      fontSize: 14,
      color: '#333',
      paddingBottom: 10,
      lineHeight: 1.4,
    }
    const yearStyle = {
      marginLeft: 10,
      color: '#ff6900',
    }
    const contentStyle = {
      paddingLeft: 10,
    }
    const labelStyle = {
      width: 250,
    }

    return finance.length > 0 ? (
      <div>
        {
          finance.map(item =>
            <div key={item.fYear} style={containerStyle}>
              <h3 style={titleStyle}>
                {i18n('project.fiscal_year')}
                <span style={yearStyle}>{item.fYear}</span>
              </h3>
              <div style={contentStyle}>
                <Field labelStyle={labelStyle} label={`${i18n('project.revenue')}(${i18n('common.USD')})`} value={item.revenue_USD ? formatMoney(item.revenue_USD) : 'N/A'} />
                <Field labelStyle={labelStyle} label={`${i18n('project.profits')}(${i18n('common.USD')})`} value={item.netIncome_USD ? formatMoney(item.netIncome_USD) : 'N/A'} />
                <Field labelStyle={labelStyle} label={`${i18n('project.gross_profits')}(${i18n('common.USD')})`} value={item.grossProfit ? formatMoney(item.grossProfit) : 'N/A'} />
                <Field labelStyle={labelStyle} label={`${i18n('project.total_assets')}(${i18n('common.USD')})`} value={item.totalAsset ? formatMoney(item.totalAsset) : 'N/A'} />
                <Field labelStyle={labelStyle} label={`${i18n('project.net_assets')}(${i18n('common.USD')})`} value={item.stockholdersEquity ? formatMoney(item.stockholdersEquity) : 'N/A'} />
                <Field labelStyle={labelStyle} label={`${i18n('project.net_cash_flow')}(${i18n('common.USD')})`} value={item.grossMerchandiseValue ? formatMoney(item.grossMerchandiseValue) : 'N/A'} />
                <Field labelStyle={labelStyle} label={`${i18n('project.operating_cash_flow')}(${i18n('common.USD')})`} value={item.operationalCashFlow ? formatMoney(item.operationalCashFlow) : 'N/A'} />
                <Field labelStyle={labelStyle} label={`${i18n('project.EBITDA')}(${i18n('common.USD')})`} value={item.EBITDA ? formatMoney(item.EBITDA) : 'N/A'} />
              </div>
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
      this.setState({ isFavorite, favorId })
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

  componentDidMount() {
    const { id } = this.state

    api.getProjLangDetail(id).then(result => {
      const project = result.data
      this.setState({ project }, this.getDataroom)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })

    this.getFavorProject()

    if (hasPerm('proj.admin_getfavorite')) {
      api.getFavoriteProj({ favoritetype: 5, proj: this.state.id })
      .then(data => this.setState({ userListWithInterest: data.data.data }))
      .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
    }

    // 获取投资人的交易师
    if (hasPerm('usersys.as_investor')) {
      api.getUserRelation({ investoruser: isLogin() && isLogin().id }).then(result => {
        const data = result.data.data
        const relation = data.filter(item => item.relationtype)[0]
        const trader = relation && relation.traderuser.id
        const traderOptions = data.map(item => ({ value: item.traderuser.id, label: item.traderuser.username }))
        this.setState({ traderOptions, trader })
      })
    }

    if (hasPerm('usersys.as_trader')) {
      api.getUserRelation({ traderuser: isLogin() && isLogin().id }).then(result => {
        const data = result.data.data
        const relation = data.filter(item => item.relationtype)[0]
        const investor = relation && relation.investoruser.id
        const investorOptions = data.map(item => ({ value: item.investoruser.id, label: item.investoruser.username }))
        this.setState({ investorOptions, investor })
      })
    }

    this.props.dispatch({ type: 'app/getSource', payload: 'projstatus' })

  }

  render() {
    const { id, project, isFavorite, trader, traderOptions, dataroomId, isClose } = this.state

    return (
      <LeftRightLayout location={this.props.location} title="项目详情">

        <Row gutter={24}>
          <Col span={8}>
            <div>
              <ProjectImage project={project} />
              { hasPerm('proj.admin_getfavorite') ? <InterestedPeople projId={id} /> : null }
              <SecretInfo project={project} />
            </div>
          </Col>
          <Col span={16}>
            <div>
              <ProjectHead project={project} />
              <div style={blockStyle}>
                { isFavorite ?
                    <Button icon="heart" className="success" size="large" style={{marginRight: 8}} onClick={this.unfavorProject}>{i18n('project.unfavor')}</Button>
                  : <Button icon="heart-o" className="success" size="large" style={{marginRight: 8}} onClick={this.favorProject}>{i18n('project.favor')}</Button> }

                { project.projstatus && project.projstatus.id >= 4 && project.projstatus.id < 7 && hasPerm('usersys.as_investor') ?
                  <Button className="white" size="large" style={{marginRight: 8}} onClick={this.haveInterest}>{i18n('project.contact_transaction')}</Button>
                : null }

                { project.projstatus && project.projstatus.id >= 4 && project.projstatus.id < 7 && (hasPerm('proj.admin_addfavorite') || hasPerm('usersys.as_trader')) ?
                  <Button className="white" size="large" style={{marginRight: 8}} onClick={this.recommendToInvestor}>{i18n('recommend_to_investor')}</Button>
                : null }

                <a href={getPdfUrl(id)}>
                  <Button  className="white" size="large" icon="file-pdf">项目PDF下载</Button>
                </a>
              </div>

              <Tabs animated={false}>
                <TabPane tab="项目简介" key="1">
                  <div style={{padding:10}}>
                    <ProjectIntro project={project} />
                    <div style={blockStyle}>
                      <h2 style={{fontSize:14,paddingLeft: 10,fontWeight: 600,borderLeft: '4px solid #ff6900',marginBottom:20}}>
                        {i18n('project.deal_process')}
                      </h2>
                      <TimelineView projId={id} />
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="财务信息" key="2">
                  <ProjectFinanceYear projId={id} />
                </TabPane>
                <TabPane tab="项目详情" key="3">
                  <Detail project={project} />
                </TabPane>
                <TabPane tab="文件下载" key="4">
                  <DownloadFiles projectId={id} />
                </TabPane>
              </Tabs>
            </div>
          </Col>
        </Row>

        <Modal
          visible={this.state.visible}
          title="联系交易师"
          onCancel={this.handleCancel}
          footer={[
            <Button key="1" onClick={this.handleCancel}>取消</Button>,
            <Button key="2" type="primary" loading={this.state.loading} onClick={this.handleOk}>确定</Button>
          ]}
        >
          选择你的交易师：
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
  fontSize: 14,
  textTransform: 'uppercase',
  color: '#333',
  marginBottom: 15,
  marginTop: 0,
}
const iconStyle = {
  width: 16,
  marginRight: 8,
  textAlign: 'center',
}



function ProjectImage({ project }) {
  const src = (project.industries && project.industries[0]) ? project.industries[0].url : 'defaultUrl'
  return (
    <div style={{marginBottom:30,position:'relative'}}>
      <img style={{width:'100%',padding: 5, backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 3}} src={src} />
      { project.projstatus && project.projstatus.id == 7 ?
        <div style={{position:'absolute',top:0,right:0,bottom:0,left:0,margin:'auto',width:60,height:60,borderRadius:'50%',backgroundColor:'rgba(255,255,255,.85)',textAlign:'center',lineHeight:'60px',fontSize:13,color:'#666',boxShadow:'0 0 3px 1px rgba(0,0,0,.3)'}}>已完成</div>
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
      <div style={blockStyle}>
        <h2 style={subtitleStyle}>{i18n('project.investors_interested')}</h2>
        <div>
          {userListWithInterest.length > 0 ? (
              userListWithInterest.map(m =>
                <Link key={m.id} to={'/app/user/' + m.user.id}>
                  <img style={{ width: 48, height: 48, borderRadius: '50%', verticalAlign: 'top', marginRight: 4, marginBottom: 4 }} src={m.user.photourl} />
                </Link>
              )
            ) : (
              <p>暂无</p>
            )
          }
          </div>
      </div>
    )
  }
}

function Icon2(props) {
  return <i style={props.style || iconStyle} className={'fa fa-' + props.type} aria-hidden="true"></i>
}

function SecretInfo({ project }) {
  const spanStyle={width:100,display:'inline-block'}
  return (
    <div style={blockStyle}>
      <h2 style={subtitleStyle}>{i18n('project.privacy_infomation')}</h2>
      { hasPerm('proj.get_secretinfo') ? (
        <div>
          <div>
            <span style={spanStyle}>联系人</span>{project.contactPerson}
          </div>
          <div>
            <span style={spanStyle}>电话</span>{project.phoneNumber}
          </div>
          <div>
            <span style={spanStyle}>邮箱</span>{project.email}
          </div>
          <div>
            <span style={spanStyle}>{i18n('project.uploader')}</span>{project.supportUser ? project.supportUser.username : '暂无'}
          </div>
          <div>
            <span style={spanStyle}>{i18n('project.manager')}</span>{project.makeUser ? project.makeUser.username : '暂无'}
          </div>
        </div>
      ) : (
        <div style={{position:'relative'}}>
          <div style={{position:'absolute',left:0,right:0,top:0,bottom:0,margin:'auto',width:'100%',textAlign:'center',height:28,lineHeight:'28px',color:'#616161',fontSize:13}}>
            <span style={{padding:'5px 10px',border:'1px dashed #9e9e9e',borderRadius:3}}>您没有查看权限</span>
          </div>
          <div style={{filter:'blur(10px)',userSelect:'none'}}>
            <div>
              <span style={spanStyle}>联系人</span>unknown
            </div>
            <div>
              <span style={spanStyle}>电话</span>unknown
            </div>
            <div>
              <span style={spanStyle}>邮箱</span>unknown
            </div>
            <div>
              <span style={spanStyle}>{i18n('project.uploader')}</span>unknown
            </div>
            <div>
              <span style={spanStyle}>{i18n('project.manager')}</span>unknown
            </div>
          </div>
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
    border: '1px solid #ccc',
    boxShadow: 'none',
    height: 28,
    lineHeight: '28px',
    cursor: 'default',
  }
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:'flex'}}>
        <h2 style={{margin: 0,marginBottom: 10,color: '#333',flexGrow: 1}}>{project.projtitle}</h2>
        <Tag style={tagStyle}>{project.projstatus && project.projstatus.name}</Tag>
      </div>
      <p style={{marginBottom: 8}}>{i18n('project.release_time')} {project.createdtime && project.createdtime.substr(0,10)}</p>
      <div style={{fontSize:13,marginBottom:3}}>
        <Icon2 type="map-marker" />{project.country && project.country.country}
      </div>
      <div style={{fontSize:13,marginBottom:3}}>
        <Icon2 type="industry" />{project.industries && project.industries[0] && project.industries[0].name}
      </div>
    </div>
  )
}

function ProjectIntro({ project }) {
  const labelStyle = {display: 'inline-block', width: 250}
  return (
    <div style={blockStyle}>
      <p style={{marginBottom: 20}}>{project.p_introducte}</p>
      <div style={{marginBottom: 20}}>
        {project.tags && project.tags.map(item =>
          <Tag key={item.id} color="orange">{item.name}</Tag>
        )}
      </div>
      <div>
        <div>
          <span style={labelStyle}>{i18n('project.transaction_type') + ' : '}</span>{project.transactionType && project.transactionType[0] && project.transactionType[0].name}
        </div>
        <div>
          <span style={labelStyle}>{i18n('project.engagement_in_transaction') + ' : '}</span>{project.character && project.character.character}
        </div>
        <div>
          <span style={labelStyle}>{i18n('project.transaction_size') + ' : '}</span>{project.financeAmount_USD ? formatMoney(project.financeAmount_USD) : 'N/A'}
        </div>
        <div>
          <span style={labelStyle}>{i18n('project.company_valuation') + ' : '}</span>{project.companyValuation_USD ? formatMoney(project.companyValuation_USD) : 'N/A'}
        </div>
      </div>
    </div>
  )
}

function Detail({ project }) {
  const containerStyle = {
    padding: 10,
    paddingTop: 0,
  }
  const style = {
    paddingBottom: 10,
    borderBottom: '1px dashed #e0e0e0',
  }
  const titleStyle = {
    backgroundColor: '#f4f4f4',
    fontSize: 14,
    fontWeight: 400,
    paddingLeft: 20,
    height: 28,
    lineHeight: '28px',
    marginTop: 16,
    color: '#0e0e0e',
  }
  const paraStyle = {
    paddingTop: 10,
    paddingLeft: 20,
    fontSize: 13,
    wordBreak: 'break-word',
    lineHeight: '22px',
  }

  return (
    <div style={containerStyle}>
      {
        project.targetMarket ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.target_market')}</h3>
            <p style={paraStyle}>{project.targetMarket}</p>
          </div>
        ) : null
      }
      {
        project.productTechnology ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.product_technology')}</h3>
            <p style={paraStyle}>{project.productTechnology}</p>
          </div>
        ): null
      }
      {
        project.businessModel ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.business_model')}</h3>
            <p style={paraStyle}>{project.businessModel}</p>
          </div>
        ) : null
      }
      {
        project.brandChannel ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.brand_channel')}</h3>
            <p style={paraStyle}>{project.brandChannel}</p>
          </div>
        ) : null
      }
      {
        project.managementTeam ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.management_team')}</h3>
            <p style={paraStyle}>{project.managementTeam}</p>
          </div>
        ) : null
      }
      {
        project.Businesspartners ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.business_partners')}</h3>
            <p style={paraStyle}>{project.Businesspartners}</p>
          </div>
        ) : null
      }
      {
        project.useOfProceed ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.use_of_proceed')}</h3>
            <p style={paraStyle}>{project.useOfProceed}</p>
          </div>
        ) : null
      }
      {
        project.financingHistory ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.financing_history')}</h3>
            <p style={paraStyle}>{project.financingHistory}</p>
          </div>
        ) : null
      }
      {
        project.operationalData ? (
          <div style={style}>
            <h3 style={titleStyle}>{i18n('project.operational_data')}</h3>
            <p style={paraStyle}>{project.operationalData}</p>
          </div>
        ) : null
      }
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
    api.getProjAttachment(id).then(result => {
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
      borderBottom: '1px dashed #e0e0e0',
      padding: '10px 0',
      display: 'flex',
    }
    const lastSectionStyle = {
      padding: '10px 0',
      display: 'flex',
    }
    const titleStyle = {
      flexShrink: 0,
      width: 150,
      paddingRight: 15,
    }
    const listStyle = {
      flexGrow: 1,
    }

    const dirs = this.state.attachments.map(item => item.filetype)

    return (
      <div style={containerStyle}>
        {dirs.map((dir, index) => {
          const files = this.state.attachments.filter(item => item.filetype == dir)
          const isLast = index == dirs.length - 1

          return (
            <div key={dir} style={isLast ? lastSectionStyle : sectionStyle}>
              <div style={titleStyle}>{dir}</div>
              <ul style={listStyle}>
                {files.map(file => {
                  return (
                    <li key={file.key}>
                      <a
                        disabled={!file.url}
                        download={file.filename}
                        href={file.url}
                      >
                        {file.filename}
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
