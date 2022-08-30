import React from 'react'
import { Pagination, Tabs, Row, Col } from 'antd'
import { connect } from 'dva';
import LeftRightLayout from '../components/LeftRightLayout'
import { routerRedux } from 'dva/router';
import { i18n, handleError } from '../utils/util'
import * as api from '../api'
import { LibProjRemarkList } from '../components/RemarkList'

const divStyle = {marginBottom: 30}
const titleStyle = {marginBottom:20,fontSize: 16}
const paraStyle = {fontSize: 14,lineHeight:'24px'}
const desStyle={fontSize: 14,lineHeight:'24px',marginRight:'70px'}
const wholeStyle={marginLeft:70}
const veiwMoreStyle={marginTop:'30px',textAlign:'center',fontSize:'14px'}
const tableStyle={textAlign:'center', verticalAlign:'middle',borderCollapse:'collapse',border:'1px solid #eee',width:'100%'}
const tdStyle={border:'1px solid #eee',width:'20%'}
const TabPane = Tabs.TabPane;
import styles from './ProjectLibraryItem.css'

function BasicInfo (props){
  let info
  if(props.data){
    info = props.data
  }
  let companyName = info ? info['公司名称:'] : ''
  let money       = info ? info['注册资本:'] : ''
  let startTime   = info ? info['成立时间:'] : ''
  let representative = info ? info['法人代表:'] : ''
  let companyType = info ? info['公司类型:'] : ''
  let address     = info ? info['地址:']: ''
  return (
    info?<div style={{border:'1px solid #eee'}}>
      <h3 style={{fontSize: 16, color:'black', backgroundColor:'#f8f8f8',paddingLeft:20,height:30,lineHeight:'30px'}}>
      {companyName}</h3>
      <div style={{padding:'10px'}}>
      <Row style={{height:'40px'}}>
        <Col span={8}><b style={{color:'black'}}>{i18n('project.register_capital')}: </b>{money}</Col>
        <Col span={16}><b style={{color:'black'}}>{i18n('project.start_time')}: </b>{startTime}</Col>
      </Row>
      <Row>
        <Col span={8}><b style={{color:'black'}}>{i18n('project.representative')}: </b>{representative}</Col>
        <Col span={16}>
        <div style={{height:'40px'}}><b style={{color:'black'}}>{i18n('project.company_type')}: </b>{companyType}</div>
        <div ><b style={{color:'black'}}>{i18n('organization.address')}: </b>{address}</div>
        </Col>
      </Row>
      </div>
    </div> : <div>{i18n('project_library.none')}</div>)
}

function Shareholder (props){
  let info
  if(props.data){
    info = props.data
  }
  return(
    info?
    <table style={tableStyle}>
      <tbody>
      <tr style={{backgroundColor:'#f8f8f8', height:80}}>
        <td style={tdStyle}>{props.source=="shareholder" ? i18n('project.shareholder'): i18n('project.company_name')} </td>
        <td style={tdStyle}>{i18n('project.subscribed_capital')}</td>
        <td style={tdStyle}>{i18n('project.invest_percent')}</td>
        <td style={tdStyle}>{i18n('project.invest_method')}</td>
        <td style={tdStyle}>{i18n('project.invest_time')}</td>
      </tr>
      {info.map((item,index)=>{
        return (<tr key={index} style={{height:40}}>
                  <td style={tdStyle}>{(props.source=="shareholder" ?item['股东']:item['公司名称'])|| '' }</td>
                  <td style={tdStyle}>{item['认缴出资额'] || ''}</td>
                  <td style={tdStyle}>{item['出资比例'] || ''}</td>
                  <td style={tdStyle}>{item['出资方式'] || ''}</td>
                  <td style={tdStyle}>{item['出资日期'] || ''}</td>
                </tr>)
      })}
      </tbody>
    </table> 
    :<div>{i18n('project_library.none')}</div>)
}

function IndusBusi (props){
  let info
  if(props.data){
    info = props.data
  }
  return(
    info?
    <table style={tableStyle}>
      <tbody>
      <tr style={{backgroundColor:'#f8f8f8', height:80}}>
        <td style={tdStyle}>{i18n('project.change_date')} </td>
        <td style={tdStyle}>{i18n('project.before_change')}</td>
        <td style={tdStyle}>{i18n('project.after_change')}</td>
      </tr>
      {info.map((item,index)=>{
        return (<tr key={index} style={{height:40}}>
                  <td style={tdStyle}>{item['变更日期'] || ''}</td>
                  <td style={tdStyle}>{item['变更前'] || ''}</td>
                  <td style={tdStyle}>{item['变更后'] || ''}</td>
                </tr>)
      })}
      </tbody>
    </table> 
    :<div>{i18n('project_library.none')}</div>)
}
class ProjectLibraryItem extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      proj: {},
      events: [],
      projInfo:{}
    }
  }
 
  componentDidMount() {
    let id = this.props.match.params.id;
    id = decodeURIComponent(id);
    const search = isNaN(id) ? { com_name: id } : { com_id: id };
    api.getLibProjSimple(search).then(result => {
      const proj = result.data.data[0]
      if (proj === undefined) {
        this.props.dispatch(routerRedux.replace('/app/projects/bd'));
        return;
      }
      this.setState({ proj })
      const { com_id } = proj;
      api.getLibProjInfo({ com_id }).then(result=>{
        if(result){
          this.setState({projInfo:result.data})
        }
      });
      return api.getLibEvent({ com_id }).then(result => {
        const { data } = result.data
        this.setState({ events: data })
      })

    }).catch(error => {
      handleError(error)
    })
  }


  render() {
    const { proj, events, projInfo} = this.state

    return (
      <LeftRightLayout location={this.props.location} title={i18n('project_library.project_library')} name={proj.com_name} >
        {proj.com_id ? <LibProjRemarkList com_id={proj.com_id} com_name={proj.com_name} /> : null}

        <h3 style={{fontSize:18,marginBottom:30,marginTop:50}}>{i18n('project_library.information_detail')}:</h3>

        <div style={wholeStyle}>

          <div style={divStyle}>
            <h3 style={titleStyle}>{i18n('project_library.intro')}</h3>
            <p style={desStyle}>{proj.com_des}</p>
          </div>
          <div style={divStyle}>
            <h3 style={titleStyle}>{i18n('project_library.web_address')}</h3>
            {proj.com_web?<a href={proj.com_web} target="_blank">{proj.com_web}</a>:<p style={paraStyle}>{i18n('project_library.none')}</p>}
          </div>

          <div style={divStyle}>
            <h3 style={titleStyle}>{i18n('project_library.contact')}</h3>
            <p style={paraStyle}>{i18n('project_library.mobile')}{proj.mobile || i18n('project_library.none')}</p>
            <p style={paraStyle}>{i18n('project_library.email')}{proj.email || i18n('project_library.none')}</p>
            <p style={paraStyle}>{i18n('project_library.address')}{proj.detailaddress || i18n('project_library.none')}</p>
          </div>

          <div style={divStyle}>
            <h3 style={titleStyle}>{i18n('project_library.financial_history')}</h3>
            <div>
              {events.length ? events.map(event => {
                return (
                  <div key={event.id} style={{padding:'8px 0',borderBottom:'1px dashed #e1e8ee',display:'flex',alignItems:'center'}}>
                    <div style={{width: '160px'}}>{event.date}</div>
                    <div style={{flex: 1}}>
                      <div style={{marginBottom:'4px'}}>
                        <span style={{display:'inline-block', width:'40%'}}>{event.round}</span>
                        <span style={{display:'inline-block', width:'40%'}}>{event.money}</span>
                      </div>
                      <div style={{}}>
                        { 
                          event.investormerge === 1 ? 
                          event.invsest_with ? event.invsest_with.map((item,index) => <span key={index} style={{marginRight:'4px'}}>{item.invst_name}</span>) : null
                          : (event.merger_with || '') + (event.merger_with && event.merger_equity_ratio ? '，并购股份：' + event.merger_equity_ratio : '')
                        }
                      </div>
                    </div>
                  </div>
                )
              }) : i18n('project_library.none')}
            </div>
          </div>

          <div style={divStyle}>
            <h3 style={titleStyle}>{i18n('project_library.news')}</h3>
            {proj.com_id ? <News com_id={proj.com_id} /> : null}
          </div>

          <div style={divStyle}>
            <h3 style={titleStyle}>{i18n('project.industry_commerce')}</h3>
            <Tabs defaultActiveKey="1" >
              <TabPane tab={i18n('project.basics')} key="1">
                <BasicInfo data={projInfo && projInfo.indus_base}/>
              </TabPane>
              <TabPane tab={i18n('project.shareholder_info')} key="2">
                <Shareholder data={projInfo && projInfo.indus_shareholder} source="shareholder" />
              </TabPane>
              <TabPane tab={i18n('project.industry_foreign_invest')} key="3">
                <Shareholder data={projInfo && projInfo.indus_foreign_invest} source="foreign" />
              </TabPane>
              <TabPane tab={i18n('project.industry_commerce_change')} key="4">
                <IndusBusi data={projInfo && projInfo.indus_busi_info} />
              </TabPane>
            </Tabs>
          </div>


        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(ProjectLibraryItem);


const itemStyle = {
  lineHeight: 2,
  fontSize: 13,
}
const linkStyle = {
  color: '#237CCC',
  lineHeight:'30px'
}


class News extends React.Component {
  constructor(props){
    super(props)
    this.state={
      list:[],
      currentList:[],
      initNum:5,
      displayMoreNum:5
    }
  }

  getNews = ()  => {
    const { com_id } = this.props

    api.getLibProjNews({com_id}).then(result => {
      const list = result.data.data
      this.setState({list})
      this.setState({currentList:this.state.list.slice(0,this.state.initNum)})
    }).catch(error => {
      handleError(error)
    })
  }

  componentDidMount() {
    this.getNews()
  }

  displayMore = () =>{ 
    const { currentList, list, initNum, displayMoreNum } = this.state 
    if(list.length-currentList.length>=displayMoreNum)
    {this.setState({currentList:list.slice(0,currentList.length+displayMoreNum)})
    }
    else{
    this.setState({currentList:list})
   }
  }

  collapseAll = () =>{
    const { currentList, list, initNum} = this.state 
    this.setState({currentList:list.slice(0,initNum)})
  }

  render(){
    const { currentList, list, initNum, displayMoreNum } = this.state
      if (list.length) {
      return (
        <div>
          <ul>
            {currentList.map(item => (
              <li key={item.id} style={itemStyle}>
                <a className={styles['link']} style={linkStyle} href={item.linkurl} target="_blank">
                  {item.title}({item.newsdate})
                </a>
              </li>
            ))}
          </ul>
          <div style={veiwMoreStyle}>
          {currentList.length===list.length?<a onClick={this.collapseAll}>{i18n('common.collapse')}</a>:
          <a onClick={this.displayMore}>{i18n('common.view_more')}</a>}
          </div>
        </div>
      )
    } else {
      return <p>{i18n('project_library.none')}</p>
    }
  }
  // constructor(props) {
  //   super(props)
  //   this.state = {
  //     total: 0,
  //     list: [],
  //     loading: false,
  //     page: 1,
  //     pageSize: 10,
  //   }
  // }

  // handleChangePage = (page) => {
  //   this.setState({ page }, this.getNews)
  // }

  // getNews = ()  => {
  //   const { com_id } = this.props
  //   const { page, pageSize } = this.state
  //   const param = { page_index: page, page_size: pageSize, com_id }
  //   this.setState({ loading: true })
  //   api.getLibProjNews(param).then(result => {
  //     const { count: total, data: list } = result.data
  //     this.setState({ total, list, loading: false })
  //   }).catch(error => {
  //     handleError(error)
  //   })
  // }

  // componentDidMount() {
  //   this.getNews()
  // }

  // render() {
  //   const { page, pageSize, total, list } = this.state

  //   if (list.length) {
  //     return (
  //       <div>
  //         <ul>
  //           {list.map(item => (
  //             <li key={item.id} style={itemStyle}>
  //               <a className={styles['link']} style={linkStyle} href={item.linkurl} target="_blank">
  //                 {item.title}({item.newsdate})
  //               </a>
  //             </li>
  //           ))}
  //         </ul>
  //         <div style={{marginTop:8}}>
  //           <Pagination size="small" current={page} total={total} pageSize={pageSize} onChange={this.handleChangePage} />
  //         </div>
  //       </div>
  //     )
  //   } else {
  //     return <p>{i18n('project_library.none')}</p>
  //   }
  // }
}
