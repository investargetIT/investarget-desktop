import React from 'react'
import { connect } from 'dva'
import { i18n, showError, isLogin, hasPerm } from '../utils/util'

import { Radio } from 'antd'
const RadioGroup = Radio.Group
import LeftRightLayout from '../components/LeftRightLayout'

import FavoriteProjectList from '../components/FavoriteProjectList'

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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

export default connect()(ProjectListRecommend)
