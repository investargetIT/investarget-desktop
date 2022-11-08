import React from 'react'
import { connect } from 'dva'
import * as api from '../api'
import { formatMoney, isLogin, hasPerm, i18n, getPdfUrl, handleError, isShowCNY, requestAllData, getPdfUrlWithoutBase, checkUploadStatus, downloadFile } from '../utils/util'
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


const blockStyle = {
  color: '#595959',
}


class GovernmentProjectDetail extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      id: Number(props.match.params.id),
      project: {},
      isFavorite: false,
      favorId: null,
      userListWithInterest: [],
      dataroomId: null,
      isClose: null,
      visible: false,
      loading: false,
      imageHeight: 0,
      activeKey: 1,
      activeTabKey: 'details',
    }
  }


  updateDimensions = () => setTimeout(() => this.setState({ imageHeight: this.header.clientHeight }), 100);

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.props.dispatch({ type: 'app/getSource', payload: 'projstatus' })
    this.props.dispatch({ type: 'app/getSource', payload: 'country' });
    
    const { id } = this.state
    api.getGovernmentProjectDetails(id)
      .then(result => {
        const project = result.data;
        window.echo('project', project);
        this.setState({ project });
      })
      .catch(handleError);
  }


  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  handleTabChange = key => {
    this.setState({ activeTabKey: key });
  }

  setHeader = node => this.header = this.header || node;

  findProjectProgress = () => {
    const currentProjectProgress = this.props.projectProgress.find( f=> f.id === this.state.id);
    if (!currentProjectProgress) return 0;
    return currentProjectProgress.percentage;
  }

  render() {
    const { id, project, isFavorite, trader, traderOptions, dataroomId, isClose } = this.state
    return (
      <LeftRightLayoutPure location={this.props.location}>

        <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
          <Breadcrumb.Item>
            <Link to="/app">首页</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>政府项目管理</Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/app/government-projects/list">政府项目</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>项目详情</Breadcrumb.Item>
        </Breadcrumb>

        <Card style={{ marginBottom: 20 }} bodyStyle={{ padding: '0 20px', paddingTop: 20 }}>
          <div style={{ display: 'flex' }}>
            <ProjectImage project={project} />

            <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} ref={this.setHeader}>
              <ProjectHead project={project} allCountries={this.props.country} progress={this.findProjectProgress()} />
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
            <TabPane tab="文件下载" key="downloads" />
          </Tabs>

        </Card>

      </LeftRightLayoutPure>
    )
  }
}

function mapStateToProps(state) {
  var { projstatus, country, projectProgress } = state.app;
  projstatus = projstatus.filter(item => item.id >= 2)
  return { projstatus, country, projectProgress };
}

export default connect(mapStateToProps)(GovernmentProjectDetail)

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

function ProjectHead({ project, allCountries, progress }) {

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

  return (
    <div>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: 10, color: '#282828', fontWeight: 'bold', fontSize: 20 }}>{project.realname}</div>
        <div style={{ border: '1px solid #339bd2', borderRadius: 4, width: 72, height: 24, fontSize: 14, color: '#339bd2', background: '#f0f6fb', display: 'flex', justifyContent: 'center', alignItems: 'center' }} color="blue">
          {project.projstatus && project.projstatus.name}
        </div>
      </div>
      <div style={{ marginBottom: 30, fontSize: 14, color: '#262626', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 250, margin: '8px 0' }}>{displayCountry()}</div>
        <div style={{ minWidth: 250, margin: '8px 0' }}>{i18n('project_bd.created_time')}：<span style={{ color: '#595959' }}>{project.createdtime && project.createdtime.substr(0, 10)}</span></div>
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

      <div style={{ display: 'flex' }}>
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

  handleClickLink = async (file) => {
    const result = await checkUploadStatus(file.key);
    if (result) {
      downloadFile(file.url, file.filename);
    }
  }

  componentDidMount() {
    const id = this.props.projectId
    requestAllData(api.getProjAttachment, { proj: id, page_size: 100 }, 100).then(result => {
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

        {dirs.sort().map((dir, index) => {
          const files = this.state.attachments.filter(item => item.filetype == dir)
          const isLast = index == dirs.length - 1

          return files.map((file, idx) => {
            return (
              <div key={idx} style={liStyle}>
                <div style={titleStyle}><Tag>{dir}</Tag></div>
                <div title={file.filename} style={{ wordWrap: 'word-break:break-all', flex: 1, marginRight: 20 }}>
                  {file.filename}
                </div>
                <Button
                  type="link"
                  icon={<CloudDownloadOutlined />}
                  disabled={!file.url}
                  onClick={() => this.handleClickLink(file)}
                >
                  下载
                </Button>
              </div>
            )
          })
        })}
      </div>
    )
  }
}
