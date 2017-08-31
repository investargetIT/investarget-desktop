import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { formatMoney, isLogin, hasPerm, i18n } from '../utils/util'
import { Link, routerRedux } from 'dva/router'
import { Timeline, Icon, Tag, Button, message, Steps } from 'antd'
import MainLayout from '../components/MainLayout'
import { SelectNumber } from '../components/ExtraInput'
import TimelineView from '../components/TimelineView'


const Step = Steps.Step

function Field (props) {
  return (
    <div style={{display: 'flex'}}>
      <span style={{width: '150px'}}>{props.label}</span>
      <span>{props.value}</span>
    </div>
  )
}


const blockStyle = {
  marginBottom: '24px',
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
    return finance.length > 0 ? (
      <div>
        <h2>{i18n('project.financials')}</h2>
        <div>
          {
            finance.map(item =>
              <div key={item.fYear}>
                <h3>{i18n('project.fiscal_year')} {item.fYear}</h3>
                <div>
                  <Field label={`${i18n('project.revenue')}(${i18n('common.USD')})`} value={item.revenue_USD ? formatMoney(item.revenue_USD) : 'N/A'} />
                  <Field label={`${i18n('project.profits')}(${i18n('common.USD')})`} value={item.netIncome_USD ? formatMoney(item.netIncome_USD) : 'N/A'} />
                  <Field label={`${i18n('project.gross_profits')}(${i18n('common.USD')})`} value={item.grossProfit ? formatMoney(item.grossProfit) : 'N/A'} />
                  <Field label={`${i18n('project.total_assets')}(${i18n('common.USD')})`} value={item.totalAsset ? formatMoney(item.totalAsset) : 'N/A'} />
                  <Field label={`${i18n('project.net_assets')}(${i18n('common.USD')})`} value={item.stockholdersEquity ? formatMoney(item.stockholdersEquity) : 'N/A'} />
                  <Field label={`${i18n('project.net_cash_flow')}(${i18n('common.USD')})`} value={item.grossMerchandiseValue ? formatMoney(item.grossMerchandiseValue) : 'N/A'} />
                  <Field label={`${i18n('project.operating_cash_flow')}(${i18n('common.USD')})`} value={item.operationalCashFlow ? formatMoney(item.operationalCashFlow) : 'N/A'} />
                  <Field label={`${i18n('project.EBITDA')}(${i18n('common.USD')})`} value={item.EBITDA ? formatMoney(item.EBITDA) : 'N/A'} />
                </div>
              </div>
            )
          }
        </div>
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
      teaserUrl: null,
    }
  }

  getFavorProject = () => {
    const param = {
      favoritetype: 4,
      user: isLogin() && isLogin().id,
      proj: this.state.id,
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

  haveInterest = () => {
    const { id, trader } = this.state
    const params = {
      favoritetype: 5,
      projs: [id],
      user: isLogin() && isLogin().id,
      trader: trader,
    }
    api.projFavorite(params).then(result => {
      message.success(i18n('project.message.interest_success'), 2)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    const { id } = this.state

    api.getProjLangDetail(id).then(result => {
      const project = result.data
      this.setState({ project })
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
    api.getUserRelation({ investoruser: isLogin() && isLogin().id }).then(result => {
      const data = result.data.data
      const relation = data.filter(item => item.relationtype)[0]
      const trader = relation && relation.traderuser.id
      const traderOptions = data.map(item => ({ value: item.traderuser.id, label: item.traderuser.username }))
      this.setState({ traderOptions, trader })
    })

    this.props.dispatch({ type: 'app/getSource', payload: 'projstatus' })

    // download Teaser
    api.getProjAttachment(id).then(result => {
      const { data: attachments } = result.data
      const teaser = attachments.filter(item => item.filetype == 'Teaser')[0]
      if (teaser) {
        let { bucket, key, filename } = teaser
        key = key + '?attname=' + encodeURIComponent(filename)
        api.downloadUrl(bucket, key).then(result => {
          this.setState({ teaser: result.data })
        })
      }
    })
  }

  render() {
    const { id, project, isFavorite, trader, traderOptions, teaser } = this.state
    
    return (
      <MainLayout location={this.props.location}>
        <h1>{project.projtitle}</h1>

        <div style={blockStyle}>
          <span>{i18n('project.release_time')} {project.createdtime && project.createdtime.substr(0,10)}</span>
        </div>

        <div style={blockStyle}>
          <h2 style={blockTitleStyle}>{i18n('project.deal_audit_process')}</h2>
          <div>
            {
              this.props.projstatus.map(item =>
                <Tag key={item.id} color={project.projstatus && project.projstatus.id == item.id ? 'pink' : null}>{item.name}</Tag>
              )
            }
          </div>
        </div>

        <div style={blockStyle}>
          <img style={{width: 400}} src={(project.industries && project.industries[0]) ? project.industries[0].url : 'defaultUrl' } />
        </div>

        <div style={blockStyle}>
          <h2 style={blockTitleStyle}>{i18n('project.profile')}</h2>
          <div>
            <div>
              {project.p_introducte}
            </div>
            <div>
              {
                project.tags && project.tags.map(item =>
                  <Tag key={item.id} color="orange">{item.name}</Tag>
                )
              }
            </div>
            <div>
              <Field label={i18n('project.region') + ' : '} value={project.country && project.country.country} />
              <Field label={i18n('project.industry') + ' : '} value={project.industries && project.industries[0] && project.industries[0].industry} />
              <Field label={i18n('project.transaction_type') + ' : '} value={project.transactionType && project.transactionType[0] && project.transactionType[0].name} />
              <Field label={i18n('project.engagement_in_transaction') + ' : '} value={project.character && project.character.character} />
              <Field label={i18n('project.transaction_size') + ' : '} value={project.financeAmount_USD ? formatMoney(project.financeAmount_USD) : 'N/A'} />
              <Field label={i18n('project.company_valuation') + ' : '} value={project.companyValuation_USD ? formatMoney(project.companyValuation_USD) : 'N/A'} />
            </div>
          </div>
        </div>

        {
          hasPerm('proj.get_secretinfo') ? (
            <div style={blockStyle}>
              <h2 style={blockTitleStyle}>{i18n('project.privacy_infomation')}</h2>
              <div>
                <Field label={i18n('project.name') + ' : '} value={project.contactPerson} />
                <Field label={i18n('project.phone') + ' : '} value={project.phoneNumber} />
                <Field label={i18n('project.email') + ' : '} value={project.email} />
                {/* <Field label={i18n('project.uploader') + ' : '} value={project.supportUser && project.supportUser.username} />
                <Field label={i18n('project.manager') + ' : '} value={project.makeUser && project.makeUser.username} /> */}
              </div>
            </div>
          ) : null
        }

        <div style={blockStyle}>
          <ProjectFinanceYear projId={id} />
        </div>

        <div style={blockStyle}>
          <h2 style={blockTitleStyle}>{i18n('project.details')}</h2>
          <div>
            {
              project.targetMarket ? (
                <div>
                  <h3>{i18n('project.target_market')}</h3>
                  <p>{project.targetMarket}</p>
                </div>
              ) : null
            }
            {
              project.productTechnology ? (
                <div>
                  <h3>{i18n('project.product_technology')}</h3>
                  <p>{project.productTechnology}</p>
                </div>
              ): null
            }
            {
              project.businessModel ? (
                <div>
                  <h3>{i18n('project.business_model')}</h3>
                  <p>{project.businessModel}</p>
                </div>
              ) : null
            }
            {
              project.brandChannel ? (
                <div>
                  <h3>{i18n('project.brand_channel')}</h3>
                  <p>{project.brandChannel}</p>
                </div>
              ) : null
            }
            {
              project.managementTeam ? (
                <div>
                  <h3>{i18n('project.management_team')}</h3>
                  <p>{project.managementTeam}</p>
                </div>
              ) : null
            }
            {
              project.Businesspartners ? (
                <div>
                  <h3>{i18n('project.business_partners')}</h3>
                  <p>{project.Businesspartners}</p>
                </div>
              ) : null
            }
            {
              project.useOfProceed ? (
                <div>
                  <h3>{i18n('project.use_of_proceed')}</h3>
                  <p>{project.useOfProceed}</p>
                </div>
              ) : null
            }
            {
              project.financingHistory ? (
                <div>
                  <h3>{i18n('project.financing_history')}</h3>
                  <p>{project.financingHistory}</p>
                </div>
              ) : null
            }
            {
              project.operationalData ? (
                <div>
                  <h3>{i18n('project.operational_data')}</h3>
                  <p>{project.operationalData}</p>
                </div>
              ) : null
            }
          </div>
        </div>

        <div style={blockStyle}>
          <h2 style={blockTitleStyle}>{i18n('project.favor_project')}</h2>
          {
            isFavorite ? (
              <Button icon="heart" onClick={this.unfavorProject}>
                {i18n('project.unfavor')}
              </Button>
            ) : (
              <Button icon="heart-o" onClick={this.favorProject}>
                {i18n('project.favor')}
              </Button>
            )
          }
        </div>

        {
          hasPerm('proj.admin_getfavorite') ?
            <div style={blockStyle}>
              <h2 style={blockTitleStyle}>{i18n('project.investors_interested')}</h2>
              <div>
                {
                  this.state.userListWithInterest.map(m =>
                    <Link key={m.id} to={'/app/user/' + m.user.id}>
                      <img style={{ width: 48, height: 48, borderRadius: '50%' }} src={m.user.photourl} />
                    </Link>
                  )
                }
                </div>
            </div>
          : null
        }

        <div style={blockStyle}>
          <h2 style={blockTitleStyle}>{i18n('project.contact_transaction')}</h2>
          <div>
            <SelectNumber style={{minWidth: 100}} options={traderOptions} value={trader} onChange={this.handleTraderChange} notFoundContent={i18n('user.no_trader')} />
            <Button onClick={this.haveInterest} disabled={traderOptions.length == 0}>{i18n('project.contact_transaction')}</Button>
          </div>
        </div>

        {
          teaser ? (
            <div style={blockStyle}>
              <h2 style={blockTitleStyle}>{i18n('project.download_teaser')}</h2>
              <a href={teaser}>
                <Button icon="file-pdf">{i18n('project.download_teaser')}</Button>
              </a>
            </div>
          ) : null
        }

        { project.projstatus && project.projstatus.id >= 4 ?
        <div style={blockStyle}>
          <h2 style={blockTitleStyle}>{i18n('project.public_dataroom')}</h2>
          <Link to={`/app/dataroom/detail?projectID=${project.id}&projectTitle=${project.projtitle}`}>
            <Button disabled={project.projstatus && project.projstatus.id < 4} icon="folder">{i18n('project.public_dataroom')}</Button>
          </Link>
        </div> 
        : null }

        <div style={blockStyle}>
          <h2 style={blockTitleStyle}>{i18n('project.deal_process')}</h2>
          <TimelineView projId={id} />
        </div>

      </MainLayout>
    )
  }
}

function mapStateToProps(state) {
  var { projstatus } = state.app
  projstatus = projstatus.filter(item => item.id >= 2)
  return { projstatus }
}

export default connect(mapStateToProps)(ProjectDetail)
