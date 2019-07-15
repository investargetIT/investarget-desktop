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
import { Radio } from 'antd'
const RadioGroup = Radio.Group
import LeftRightLayout from '../components/LeftRightLayout'

import FavoriteProjectList from '../components/FavoriteProjectList'

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)

    const { page, pageSize } = props.location.query;

    this.state = {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handlePageChange = (page) => {
    const { pageSize } = this.props.location.query;
    const parameters = { page, pageSize };
    this.props.router.push(`/app/projects/list/interest?${qs.stringify(parameters)}`);
    // this.setState({ page }, this.getProjectList)
  }

  handlePageSizeChange = (current, pageSize) => {
    const parameters = { page: 1, pageSize };
    this.props.router.push(`/app/projects/list/interest?${qs.stringify(parameters)}`);
    // this.setState({ pageSize, page: 1 }, this.getProjectList)
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
    const { search: nextSearch } = nextProps.location;
    const { search: currentSearch } = this.props.location;
    if (nextSearch !== currentSearch) {
      const { page, pageSize } = nextProps.location.query;
      this.setState({
        page: parseInt(page, 10) || 1,
        pageSize: parseInt(pageSize, 10) || getUserInfo().page || 10,
      }, this.getProjectList);
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
