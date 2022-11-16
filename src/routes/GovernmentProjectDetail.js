import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva'
import * as api from '../api'
import { formatMoney, isLogin, hasPerm, i18n, getPdfUrl, handleError, isShowCNY, requestAllData, getPdfUrlWithoutBase, checkUploadStatus, downloadFile, getCurrentUser, findAllParentArea } from '../utils/util'
import { Link, routerRedux } from 'dva/router'
import { Timeline, Icon, Tag, Button, message, Steps, Modal, Row, Col, Tabs, Progress, Breadcrumb, Card, Empty, Image } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { SelectNumber } from '../components/ExtraInput'
import TimelineViewNew from '../components/TimelineViewNew';
import {
  HeartOutlined,
  HeartFilled,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import lodash from 'lodash';
import ProjectCardForUserCenter from '../components/ProjectCardForUserCenter';

const TabPane = Tabs.TabPane


const blockStyle = {
  color: '#595959',
}
const headerStyle = {
  padding: '14px 24px',
  backgroundColor: '#f4f4f4',
  fontSize: 14,
  fontWeight: 'bold',
  lineHeight: '22px',
  color: '#262626',
  borderBottom: '1px solid #e6e6e6',
}
const liStyle={
  display:'flex',
  justifyContent:'space-between',
  minHeight:30,
  fontSize: 14,
  lineHeight: '22px',
  padding: '14px 24px',
  borderBottom: '1px solid #e6e6e6',
  color: '#595959', 
  alignItems: 'center',
}

function GovernmentProjectDetail(props) {

  const [id, setId] = useState(Number(props.match.params.id));
  const [project, setProject] = useState({});
  const [imageHeight, setImageHeight] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState('historycases');
  const [projInfo, setProjInfo] = useState([]);
  const [historyCases, setHistoryCases] = useState([]);

  const header = useRef(null);

  function updateDimensions() {
    setTimeout(() => {
      setImageHeight(header.current.clientHeight);
    }, 100);
  }

  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    props.dispatch({ type: 'app/getSource', payload: 'goverInfoType' });
    props.dispatch({ type: 'app/getSource', payload: 'projstatus' });
    props.dispatch({ type: 'app/getSource', payload: 'country' });
  
    let project = {};
    api.getGovernmentProjectDetails(id)
      .then(result => {
        project = result.data;
        const { historycases } = project;
        if (historycases && historycases.length > 0) {
          getHistoryCases(historycases.map(m => m.proj));
        }
        project = { ...project, industries: project.industrys };
        return props.dispatch({ type: 'app/getSource', payload: 'projstatus' });
      })
      .then(allStatus => {
        let projstatus = null;
        if (project.status) {
          projstatus = allStatus.find(f => f.id == project.status);
        }
        project = { ...project, projstatus };
        return props.dispatch({ type: 'app/getSource', payload: 'country' });
      })
      .then(allCountries => {
        let location = [];
        if (project.location) {
          location = allCountries.find(f => f.id == project.location);
          location = findAllParentArea(location, allCountries);
        }
        project = { ...project, location };
        setProject(project);
      })
      .catch(handleError);
    
    async function getHistoryCases(projIDs) {
      const req = await Promise.all(projIDs.map(m => api.getProjLangDetail(m)));
      setHistoryCases(req.map(m => m.data));
    }

    async function getGovernmentProjectInfo() {
      const goverInfoType = await props.dispatch({ type: 'app/getSource', payload: 'goverInfoType' });
      const req = await api.getGovernmentProjectInfo({ govproj: id });
      let { data: projInfo } = req.data;
      projInfo = projInfo.sort((a, b) => a.type - b.type);
      projInfo = projInfo.map(m => {
        const infoType = goverInfoType.find(f => f.id == m.type);
        let name = m.type.toString();
        if (infoType) {
          name = infoType.label
        }
        return { ...m, name };
      });
      setProjInfo(projInfo);

      const newProjInfo = lodash.cloneDeep(projInfo);
      for (let index = 0; index < newProjInfo.length; index++) {
        const element = newProjInfo[index];
        if (element.attachments) {
          for (let index = 0; index < element.attachments.length; index++) {
            const atta = element.attachments[index];
            const reqDownload = await api.downloadUrl(atta.bucket, atta.realfilekey);
            atta.url = reqDownload.data;
          }
        }
      }
      setProjInfo(newProjInfo);
    }
    getGovernmentProjectInfo();

    return () => {
      window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  useEffect(() => {
    if (projInfo.length > 0) {
      setActiveTabKey(projInfo[0].type.toString());
    }
  }, [projInfo]);

  function handleTabChange(key) {
    setActiveTabKey(key);
    if (key !== 'historycases') {
      window.location.href = `#${key}`;
    }
  }

  return (
    <LeftRightLayoutPure location={props.location}>

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

          <div style={{ flex: 1, marginLeft: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} ref={header}>
            <ProjectHead project={project} allCountries={props.country} />
          </div>
        </div>

        <Tabs
          style={{ marginTop: 20 }}
          className="project-details-tab"
          activeKey={activeTabKey}
          tabBarGutter={50}
          onChange={handleTabChange}
        >
          {projInfo.map(m => <TabPane key={m.type} tab={m.name} />)}
          <TabPane tab="FA相关案例" key="historycases" />
        </Tabs>
      </Card>

      {activeTabKey != 'historycases' && projInfo.map(m => (
        <Card id={m.type} key={m.type} title={m.name} style={{ marginTop: 20 }} bodyStyle={{ padding: 0 }}>
          <div style={{ padding: 24 }} dangerouslySetInnerHTML={{ __html: m.info ? m.info.replace(/\n/g, '<br>') : '暂无内容' }} />
          
          {m.attachments && m.attachments.length > 0 ? <div style={headerStyle}>{i18n('project.material_download')}</div> :
            <div style={headerStyle}>{i18n('project.no_materials')}</div>}

          {m.attachments && m.attachments.map((file, idx) => {
            return (
              <div key={idx} style={liStyle}>
                <div title={file.filename} style={{ wordWrap: 'word-break:break-all', flex: 1, marginRight: 20 }}>
                  {file.filename}
                </div>
                <a href={file.url} target="_blank">
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                  >
                    下载
                  </Button>
                </a>
              </div>
            );
          })}
        </Card>
      ))}

      {activeTabKey == 'historycases' && (
        <Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-18px 0 20px -18px' }}>
            {historyCases.map(m => <div key={m.id} style={{ margin: '18px 0 0 18px' }}>
              <ProjectCardForUserCenter record={m} currentUser={getCurrentUser()} />
            </div>)}
            {historyCases.length === 0 && <Empty style={{ margin: '20px auto' }} />}
          </div>
        </Card>
      )}

    </LeftRightLayoutPure>
  );
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
      <Image
        style={{ width: 280, height: 210, borderRadius: 4 }}
        src={src}
        preview={false}
        fallback="data:image/png;base64,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"
      />
      { project.projstatus && project.projstatus.id == 7 ?
        <div style={{position:'absolute',top:0,right:0,bottom:0,left:0,margin:'auto',width:60,height:60,borderRadius:'50%',backgroundColor:'rgba(255,255,255,.85)',textAlign:'center',lineHeight:'60px',fontSize:13,color:'#666',boxShadow:'0 0 3px 1px rgba(0,0,0,.3)'}}>{i18n('project.finished')}</div>
      : null }
    </div>
  )
}

function ProjectHead({ project, allCountries }) {

  function displayCountry() {
    if (!project.location || project.location.length == 0) return null;
    const countryName = project.location.map(m => m.country).join('-');
    const country = project.location[0];
    let imgUrl = country && country.key && country.url
    if (country && !imgUrl) {
      const parentCountry = allCountries.find(f => f.id === country.parent);
      if (parentCountry && parentCountry.url) {
        imgUrl = parentCountry.url
      }
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        <div>{i18n('project.country')}：</div>
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
        {displayCountry() && <div style={{ minWidth: 250, margin: '8px 0' }}>{displayCountry()}</div>}
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