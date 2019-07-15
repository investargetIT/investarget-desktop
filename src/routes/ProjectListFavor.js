import React from 'react'
import { connect } from 'dva'
import LeftRightLayout from '../components/LeftRightLayout'
import { withRouter } from 'dva/router';
import FavoriteProjectList from '../components/FavoriteProjectList'
import { 
  i18n, 
  getUserInfo, 
} from '../utils/util';
import qs from 'qs';

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)
    
    const { page, pageSize } = props.location.query;

    this.state = {
      favoritetype: 4,
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
    this.props.router.push(`/app/projects/list/favor?${qs.stringify(parameters)}`);
    // this.setState({ page }, this.getProjectList)
  }

  handlePageSizeChange = (current, pageSize) => {
    const parameters = { page: 1, pageSize };
    this.props.router.push(`/app/projects/list/favor?${qs.stringify(parameters)}`);
    // this.setState({ pageSize, page: 1 }, this.getProjectList)
  }

  getProjectList = () => {
    const { favoritetype, page, pageSize } = this.state
    const params = { favoritetype, page_index: page, page_size: pageSize }
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
    const { page, pageSize, total, list, loading } = this.state
    const props = { page, pageSize, total, list, loading, onPageChange: this.handlePageChange, onPageSizeChange: this.handlePageSizeChange }

    return (
      <LeftRightLayout location={location} title={i18n('project.favorite_projects')}>
          <FavoriteProjectList {...props} />
      </LeftRightLayout>
    )
  }
}



export default connect()(withRouter(ProjectListRecommend));
