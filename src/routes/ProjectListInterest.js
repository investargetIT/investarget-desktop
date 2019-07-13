import React from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router';
import { 
  i18n, 
  showError, 
  getUserInfo, 
  hasPerm, 
} from '../utils/util';

import { Radio } from 'antd'
const RadioGroup = Radio.Group
import LeftRightLayout from '../components/LeftRightLayout'

import FavoriteProjectList from '../components/FavoriteProjectList'

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)

    const { page } = props.location.query;

    this.state = {
      page: parseInt(page, 10) || 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handlePageChange = (page) => {
    this.props.router.push(`/app/projects/list/interest?page=${page}`);
    // this.setState({ page }, this.getProjectList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProjectList)
  }

  getProjectList = () => {
    const { page, pageSize } = this.state

    var params = { page_index: page, page_size: pageSize, favoritetype: 5 }

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
    const { page: nextPage } = nextProps.location.query;
    const { page: currentPage } = this.props.location.query;
    if (nextPage !== currentPage) {
      this.setState({ page: parseInt(nextPage, 10) || 1 }, this.getProjectList);
    }
  }

  render() {
    const { location } = this.props
    const { favoritetype, page, pageSize, total, list, loading } = this.state
    const props = { page, pageSize, total, list, loading, onPageChange: this.handlePageChange, onPageSizeChange: this.handlePageSizeChange }

    return (
      <LeftRightLayout location={location} title={i18n('project.interested_projects')}>
          <FavoriteProjectList showInvestor showTrader {...props} />
      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(ProjectListRecommend));
