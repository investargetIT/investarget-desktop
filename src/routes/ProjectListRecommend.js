import React from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router';
import { 
  i18n,
  showError, 
  getUserInfo, 
  hasPerm, 
} from '../utils/util';
import qs from 'qs';

import { Input, Icon, Button, Radio } from 'antd'

import LeftRightLayout from '../components/LeftRightLayout'

import FavoriteProjectList from '../components/FavoriteProjectList'

const RadioGroup = Radio.Group

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)

    const { page, type } = props.location.query;

    this.state = {
      favoritetype: parseInt(type, 10) || 3, // default 交易师推荐
      page: parseInt(page, 10) || 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handlePageChange = (page) => {
    const { type } = this.props.location.query;
    const parameters = { type, page };
    this.props.router.push(`/app/projects/list/recommend?${qs.stringify(parameters)}`);
    // this.setState({ page }, this.getProjectList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProjectList)
  }

  handleFavorChange = (e) => {
    const favoritetype = e.target.value
    // this.setState({ favoritetype }, this.getProjectList)
    this.props.router.push(`/app/projects/list/recommend?type=${favoritetype}`);
  }
 
  getProjectList = () => {
    const { favoritetype, page, pageSize } = this.state
    var params = { page_index: page, page_size: pageSize, favoritetype }

    this.setState({ loading: true })
    api.getFavoriteProj(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    this.getProjectList()
  }

  componentWillReceiveProps(nextProps) {
    const { page: nextPage, type: nextType } = nextProps.location.query;
    const { page: currentPage, type: currentType } = this.props.location.query;
    if (nextType !== currentType) {
      this.setState({ favoritetype: parseInt(nextType, 10) || 3, page: 1 }, this.getProjectList);
    } else if (nextPage !== currentPage) {
      this.setState({ page: parseInt(nextPage, 10) || 1 }, this.getProjectList);
    }
  }

  render() {
    const { location } = this.props
    const { favoritetype, page, pageSize, total, list, loading } = this.state
    const props = { page, pageSize, total, list, loading, onPageChange: this.handlePageChange, onPageSizeChange: this.handlePageSizeChange }

    const map = {
      1: i18n('project.recommended_by_system'),
      2: i18n('project.recommended_by_admin'),
      3: i18n('project.recommended_by_trader'),
    }

    return (
      <LeftRightLayout location={location} title={i18n('project.recommended_projects')}>
          <div style={{ marginBottom: '24px' }}>
            <RadioGroup onChange={this.handleFavorChange} value={favoritetype}>
              <Radio value={1}>{map[1]}</Radio>
              <Radio value={2}>{map[2]}</Radio>
              <Radio value={3}>{map[3]}</Radio>
            </RadioGroup>
          </div>
          {
            favoritetype == 3 ? <FavoriteProjectList showInvestor showTrader {...props} />
                              : <FavoriteProjectList {...props} />
          }
      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(ProjectListRecommend));
