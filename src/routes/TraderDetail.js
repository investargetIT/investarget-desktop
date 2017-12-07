import React from 'react'
import { Link } from 'dva/router'
import LeftRightLayout from '../components/LeftRightLayout'
import * as api from '../api'
import { i18n, handleError } from '../utils/util'


class TraderDetail extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      username: '',
      org: '',
      mobile: '',
      email: '',
      wechat: '',
      photourl: '',
    }
  }

  componentDidMount() {
    const traderId = Number(this.props.params.id)

    api.getUserRelation({traderuser: traderId}).then(result => {
      const relation = result.data.data[0]
      if (relation) {
        let { username, org, mobile, email, wechat, photourl } = relation.traderuser
        this.setState({
          username: username || i18n('common.none'),
          org: org ? org.orgname : i18n('common.none'),
          mobile: mobile || i18n('common.none'),
          email: email || i18n('common.none'),
          wechat: wechat || i18n('common.none'),
          photourl: photourl || i18n('common.none'),
        })
      }
    }).catch(error => {
      handleError(error)
    })
  }

  render() {
    const traderId = Number(this.props.params.id)
    const { username, org, mobile, email, wechat, photourl } = this.state
    const containerStyle = {}
    const titleStyle = {margin:'20px 0 20px 8px',fontSize:18,fontWeight:'bold',color:'#000'}
    const photoStyle = {marginRight:54,width:126,height:170,backgroundColor:'#fff',backgroundRepeat:'no-repeat',backgroundPosition:'center',backgroundSize:'cover',backgroundImage:`url("${photourl}")`}

    return (
      <LeftRightLayout location={this.props.location} title={i18n('user.mytrader')} name={i18n('user.detail')} innerStyle={{padding:0}}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>{i18n('user.detail') + ' :'}</h1>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div style={{marginLeft:74}}>
              <Entry label={i18n('user.name')} content={username} />
              <Entry label={i18n('user.institution')} content={org} />
              <Entry label={i18n('user.mobile')} content={mobile} />
              <Entry label={i18n('user.email')} content={email} />
              <Entry label={i18n('user.wechat')} content={wechat} />
              <Entry
                label={i18n('project.recommended_projects')}
                content={traderId ? <RecommendProjects traderId={traderId} /> : i18n('common.none')}
              />
            </div>
            <div style={photoStyle}></div>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}

export default TraderDetail



function Entry(props) {
  const style = {display:'flex',marginBottom:14,...props.style}
  const labelStyle = {flexShrink:0,width:110,fontSize:16,color:'#000',fontWeight:'bold'}
  const contentStyle = {flexGrow:1,fontSize:14,color:'#333'}
  return (
    <div style={style}>
      <div style={labelStyle}>{props.label}</div>
      <div style={contentStyle}>{props.content}</div>
    </div>
  )
}

class RecommendProjects extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      pageSize: 4,
      total: 0,
      list: [],
    }
  }

  handleChangePage = () => {
    const { page, pageSize, total } = this.state
    if (page * pageSize < total) {
      this.setState({ page: page + 1 }, this.getFavoriteProj)
    } else {
      // 已经到最后一页，【换一批】跳到第一页
      this.setState({ page: 1 }, this.getFavoriteProj)
    }
  }

  getFavoriteProj = () => {
    const { traderId } = this.props
    const { page, pageSize } = this.state
    const param = { page_index: page, page_size: pageSize, favoritetype: 3, trader: traderId }
    api.getFavoriteProj(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list })
    }).catch(error => {
      handleError(error)
    })
  }

  componentDidMount() {
    this.getFavoriteProj()
  }

  render() {
    const { total, list, pageSize } = this.state

    const itemStyle = {marginBottom:14}
    const linkStyle = {color:'#237ccc',textDecoration:'underline'}
    const btnWrapStyle = {textAlign:'center',marginTop:26}
    const btnStyle = {border: '1px solid #237ccc',padding: '0 16px',height: 30,lineHeight: '30px',fontSize: 14,textAlign: 'center',color: '#fff',backgroundColor: '#237ccc',outline:'none',cursor: 'pointer'}
    const iconStyle = {marginRight:8,marginTop:4,verticalAlign:'top'}

    if (list.length > 0) {
      return (
        <div>
          <ul style={{}}>
            {list.map(item => {
              const { id, projtitle } = item.proj
              return (
                <li key={item.id} style={itemStyle}>
                  <Link style={linkStyle} to={'/app/projects/' + id}>{projtitle}</Link>
                </li>
              )
            })}
          </ul>
          {total > pageSize ? (
            <div style={btnWrapStyle}>
              <button style={btnStyle} onClick={this.handleChangePage}>
                <img style={iconStyle} src="/images/refresh.png" />换一批
              </button>
            </div>
          ) : null}
        </div>
      )
    } else {
      return <span>{i18n('common.none')}</span>
    }
  }
}
