import React from 'react';
import styles from './RecommendProjects.css';
import { Icon, Tag, Button } from 'antd';
import * as api from '../api';
import { connect } from 'dva';

const tagStyle = {
  marginBottom: '8px',
}


class RecommendProjects extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      selectedProjects: [],
      total: 0,
      page: 1,
      pageSize: 6,
      maxPages: 0,
    }

    this.onProjectsSkip = this.onProjectsSkip.bind(this);
    this.onProjectsSubmit = this.onProjectsSubmit.bind(this);
  }

  getProjects = () => {
    const { page, pageSize } = this.state
    const tagIds = this.props.tags ? this.props.tags.map(item => item.id) : []
    const param = { tags: tagIds, projstatus: [4], skip_count: (page-1)*pageSize, max_size: pageSize }
    api.getProj(param)
    .then(result => {
      const { count, data } = result.data
      const maxPages = Math.ceil(count / pageSize)
      this.setState({ projects: data, total: count, maxPages })
    });
  }

  handleChangePage = (page) => {
    this.setState({ page }, this.getProjects)
  }

  handleClickPrev = () => {
    this.handleChangePage(this.state.page - 1)
  }

  handleClickNext = () => {
    this.handleChangePage(this.state.page + 1)
  }

  componentDidMount() {
    this.getProjects()
  }

  onProjectToggle(project) {
    var selectedProjects = this.state.selectedProjects.slice()
    var index = selectedProjects.indexOf(project)
    if(index > -1) {
      selectedProjects.splice(index, 1)
    } else {
      selectedProjects.push(project)
    }

    this.setState({ selectedProjects });
  }

  onProjectsSkip() {
    this.props.history.push('/app');
  }

  onProjectsSubmit() {
    const params = {
      favoritetype: 4,
      user: this.props.id,
      projs: this.state.selectedProjects
    }
    api.favoriteProj(params)
    .then(result => {
      this.props.history.push('/app');
    });
  }

  render () {
    const props = this.props;

    const btnStyle = {position:'relative',width: 120,height: 42,lineHeight: '42px',textAlign: 'center',fontSize: 20,backgroundColor: '#047bd1',color: '#fff',border: 'none',borderRadius: 4}
    const arrowStyle = {position: 'absolute',top: '50%',marginTop: -41,cursor: 'pointer'}


  return (
    <div style={{backgroundColor:'#fff'}}>
      <div style={{margin:'0 auto',width:1180,height:120,padding:'0 178px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:36}}>点击收藏项目</span>
        <span>
          <Button style={{...btnStyle,marginRight:10}} onClick={this.onProjectsSkip}>跳过</Button>
          <Button style={btnStyle} onClick={this.onProjectsSubmit}>完成选择</Button>
        </span>
      </div>

      <div style={{width:1180,height:636,padding:'0 178px',margin:'0 auto',backgroundColor:'#f2f2f2',position:'relative'}}>
        {this.state.projects.length > 0 ? (
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:35}}>
            {this.state.projects.slice(0,3).map(item => {
              const isSelected = this.state.selectedProjects.includes(item.id)
              return (
                <Card key={item.id} {...item} selected={isSelected} onClick={this.onProjectToggle.bind(this, item.id)} />
              )
            })}
          </div>
        ) : null}

        {this.state.projects.length > 3 ? (
          <div style={{display:'flex',justifyContent:'space-between'}}>
            {this.state.projects.slice(3,6).map(item => {
              const isSelected = this.state.selectedProjects.includes(item.id)
              return (
                <Card key={item.id} {...item} selected={isSelected} onClick={this.onProjectToggle.bind(this, item.id)} />
              )
            })}
          </div>
        ) : null}

        {this.state.page > 1 ? (
          <img src="/images/arrow-left.jpg" style={{...arrowStyle, left: 50}} onClick={this.handleClickPrev} />
        ) : null}

        {this.state.page < this.state.maxPages ? (
          <img src="/images/arrow-right.jpg" style={{...arrowStyle, right: 50}} onClick={this.handleClickNext} />
        ) : null}
      </div>

      <div style={{height:100}}></div>
    </div>
  )
}
}

function mapStateToProps(state) {
  const { tags, id } = state.currentUser;
  return { tags, id };
}

export default connect(mapStateToProps)(RecommendProjects)

function Card(props) {
  const tagStyle = {display:'inline-block',fontSize:14,padding:'0 6px',color:'#999',marginRight:10,marginBottom:5,lineHeight:'14px',backgroundColor:'#d2e5f4',borderRadius:2}
  const imgUrl = props.industries[0] && props.industries[0].url
  const tags = props.tags || []
  return (
    <div className={styles['card']} style={{width:260,height:300,backgroundColor:'#fff',cursor:'pointer',position:'relative'}} onClick={props.onClick}>
      <div style={{height:186,backgroundSize:'cover',backgroundPosition:'center',backgroundImage:`url("${imgUrl}")`}}></div>
      <div style={{margin: '10px 8px 6px',height:44,overflow:'hidden'}}>
        {tags.map(tag => (
          <span key={tag.id} style={tagStyle}>{tag.name}</span>
        ))}
      </div>
      <p style={{fontSize:16,color:'#232323',padding:'0 8px',lineHeight:1.1}}>{props.projtitle}</p>
      <div style={{display:props.selected ? 'block':'none',position:'absolute',zIndex:1,top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,.3)'}}>
        <img src="/images/check.png" style={{position:'absolute',zIndex:1,top:0,bottom:0,left:0,right:0,margin:'auto'}} />
      </div>
    </div>
  )
}
