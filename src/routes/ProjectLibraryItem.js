import React from 'react'
import { Pagination } from 'antd'

import LeftRightLayout from '../components/LeftRightLayout'

import { i18n, handleError } from '../utils/util'
import * as api from '../api'
import { LibProjRemarkList } from '../components/RemarkList'

const divStyle = {marginBottom: 30}
const titleStyle = {marginBottom:20,fontSize: 16}
const paraStyle = {fontSize: 14,lineHeight:'24px'}
const desStyle={fontSize: 14,lineHeight:'24px',marginRight:'70px'}
const wholeStyle={marginLeft:70}
const veiwMoreStyle={marginTop:'30px',textAlign:'center',fontSize:'14px'}
import styles from './ProjectLibraryItem.css'


class ProjectLibraryItem extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      proj: {},
      events: [],
    }
  }

  componentDidMount() {
    const com_id = this.props.params.id
    api.getLibProj({ com_id }).then(result => {
      const proj = result.data.data[0]
      this.setState({ proj })

      return api.getLibEvent({ com_id }).then(result => {
        const { data } = result.data
        this.setState({ events: data })
      })

    }).catch(error => {
      handleError(error)
    })

  }

  render() {
    const { proj, events} = this.state
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
                  <div key={event.invse_id} style={{padding:'8px 0',borderBottom:'1px dashed #e1e8ee',display:'flex',alignItems:'center'}}>
                    <div style={{width: '160px'}}>{event.date}</div>
                    <div style={{flex: 1}}>
                      <div style={{marginBottom:'4px'}}>
                        <span style={{display:'inline-block', width:'40%'}}>{event.round}</span>
                        <span style={{display:'inline-block', width:'40%'}}>{event.money}</span>
                      </div>
                      <div style={{}}>
                        {event.invsest_with.map((item,index) => <span key={index} style={{marginRight:'4px'}}>{item.invst_name}</span>)}
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


        </div>
      </LeftRightLayout>
    )
  }
}

export default ProjectLibraryItem


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
