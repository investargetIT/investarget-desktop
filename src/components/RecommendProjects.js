import React from 'react';
import styles from './RecommendProjects.css';
import { Card, Icon, Tag, Button } from 'antd';
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
    }

    this.onProjectsSkip = this.onProjectsSkip.bind(this);
    this.onProjectsSubmit = this.onProjectsSubmit.bind(this);
  }

  componentDidMount() {
    const tagIds = this.props.tags ? this.props.tags.map(item => item.id) : []
    const param = { tags: tagIds, projstatus: [4] }
    api.getProj(param)
    .then(result => this.setState({ projects: result.data.data }));
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
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>收藏项目</h3>

      <div className="clearfix" className={styles.content}>
        {
          this.state.projects.map(item => {

            const cardBodyStyle = { padding: 0 }
            const cardContentStyle ={ backgroundImage: 'url(' + item.industries[0].url + ')' }

            const isSelected = this.state.selectedProjects.includes(item.id)
            const cardCoverStyle = isSelected ? { display: 'flex' } : { display : 'none' }


            const country = item.country ? item.country.country : ''
            const tags = item.tags || []


            return (
                <Card key={item.id} className={styles.card} bordered={false} bodyStyle={cardBodyStyle} onClick={this.onProjectToggle.bind(this, item.id)}>
                  <div className={styles.cardContent} style={cardContentStyle}>
                    <div className={styles.cardDetail}>
                      <h3 className={styles.cardTitle}>{item.projtitle}</h3>
                      <div style={{textAlign: 'left'}}>
                        <Tag color="pink" style={tagStyle}>{country}</Tag>
                        {
                          tags.map(tag => <Tag key={tag.id} color="red" style={tagStyle}>{tag.name}</Tag>)
                        }
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardCover} style={cardCoverStyle}>
                    <div className={styles.cardCoverWrap}>
                      <Icon type="check" className={styles.cardCoverIcon} />
                    </div>
                  </div>
                </Card>
            )
          })
        }
      </div>

      <div className={styles.actions}>
        <Button className={styles.action} onClick={this.onProjectsSkip}>跳过</Button>
        <Button
          className={styles.action}
          disabled={this.state.selectedProjects.length == 0}
          type="primary"
          onClick={this.onProjectsSubmit}
        >完成选择</Button>
      </div>

    </div>
  )
}
}

function mapStateToProps(state) {
  const { tags, id } = state.currentUser;
  return { tags, id };
}

export default connect(mapStateToProps)(RecommendProjects)
