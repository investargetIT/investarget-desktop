import React from 'react'

import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'

import { i18n, handleError } from '../utils/util'
import * as api from '../api'
import { LibProjRemarkList } from '../components/RemarkList'



class ProjectLibraryItem extends React.Component {

  constructor(props) {
    super(props)
    const { id } = this.props.params
    this.state = {
      com_id: id,
      com_name: '',
      com_des: '',
      events: [],
    }
  }

  componentDidMount() {
    const { com_id } = this.state
    api.getLibProj({ com_id }).then(result => {
      const proj = result.data.data[0]
      this.setState({
        com_name: proj.com_name,
        com_des: proj.com_des,
      })

      return api.getLibEvent({ com_id: com_id }).then(result => {
        const { data } = result.data
        this.setState({ events: data })
      })
    }).catch(error => {
      handleError(error.message)
    })

  }

  render() {
    const { com_id, com_name, com_des, events } = this.state
    return (
      <MainLayout location={location}>
        <PageTitle title={com_name} />

        <div>
          <div style={{marginBottom: 16}}>
            <h3 style={{lineHeight: 2,fontSize: 16}}>{i18n('project_library.intro')}</h3>
            <p style={{fontSize: 13}}>{com_des}</p>
          </div>

          <div style={{marginBottom: 16}}>
            <h3 style={{lineHeight: 2,fontSize: 16}}>{i18n('project_library.financial_history')}</h3>
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
              }) : i18n('remark.no_comments')}
            </div>
          </div>

          <LibProjRemarkList com_id={com_id} com_name={com_name} />
        </div>
      </MainLayout>
    )
  }
}

export default ProjectLibraryItem
