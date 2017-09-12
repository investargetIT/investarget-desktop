import React from 'react'
import { connect } from 'dva'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import FavoriteProjectList from '../components/FavoriteProjectList'
import { i18n } from '../utils/util'

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      favoritetype: 4,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getProjectList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProjectList)
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

  render() {
    const { location } = this.props
    const { page, pageSize, total, list, loading } = this.state
    const props = { page, pageSize, total, list, loading, onPageChange: this.handlePageChange, onPageSizeChange: this.handlePageSizeChange }

    return (
      <MainLayout location={location}>
        <PageTitle title={i18n('project.favorite_projects')} />
          <FavoriteProjectList {...props} />
      </MainLayout>
    )
  }
}



export default connect()(ProjectListRecommend)
