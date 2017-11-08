import React from 'react'
import { Pagination } from 'antd'

import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { i18n, handleError } from '../utils/util'
import * as api from '../api'
import { LibProjRemarkList } from '../components/RemarkList'

const divStyle = {marginBottom: 16}
const titleStyle = {lineHeight: 2,fontSize: 16}
const paraStyle = {fontSize: 13}

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
    const { proj, events } = this.state
    return (
      <MainLayout location={this.props.location}>
        <PageTitle title={proj.com_name} />

        <div>
          <div style={divStyle}>
            <h3 style={titleStyle}>{i18n('project_library.intro')}</h3>
            <p style={paraStyle}>{proj.com_des}</p>
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
                        <span style={{display:'inline-block', width:'24%'}}>{event.round}</span>
                        <span style={{display:'inline-block', width:'24%'}}>{event.money}</span>
                      </div>
                      <div style={{}}>
                        {event.invsest_with.map((item,index) => <span key={index} style={{marginRight:'4px'}}>{item}</span>)}
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

          {proj.com_id ? <LibProjRemarkList com_id={proj.com_id} com_name={proj.com_name} /> : null}

        </div>
      </MainLayout>
    )
  }
}

export default ProjectLibraryItem


const itemStyle = {
  lineHeight: 2,
  fontSize: 13,
}
const linkStyle = {
  color: 'rgba(0, 0, 0, 0.65)',
}

class News extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      list: [],
      loading: false,
      page: 1,
      pageSize: 10,
    }
  }

  handleChangePage = (page) => {
    this.setState({ page }, this.getNews)
  }

  getNews = ()  => {
    const { com_id } = this.props
    const { page, pageSize } = this.state
    const param = { page_index: page, page_size: pageSize, com_id }
    this.setState({ loading: true })
    api.getLibProjNews(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }).catch(error => {
      handleError(error)
    })
  }

  componentDidMount() {
    this.getNews()
  }

  render() {
    const { page, pageSize, total, list } = this.state

    if (list.length) {
      return (
        <div>
          <ul>
            {list.map(item => (
              <li key={item.id} style={itemStyle}>
                <a className={styles['link']} style={linkStyle} href={item.linkurl} target="_blank">
                  {item.title}({item.newsdate})
                </a>
              </li>
            ))}
          </ul>
          <div style={{marginTop:8}}>
            <Pagination size="small" current={page} total={total} pageSize={pageSize} onChange={this.handleChangePage} />
          </div>
        </div>
      )
    } else {
      return <p>{i18n('project_library.none')}</p>
    }
  }
}
