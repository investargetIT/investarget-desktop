import React from 'react'
import { i18n, showError, isLogin } from '../utils/util'

import { Radio } from 'antd'
const RadioGroup = Radio.Group
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import FavoriteProjectList from '../components/FavoriteProjectList'

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: null,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
    if (hasPerm('usersys.as_investor')) {
      this.state.type =  1
    } else if (hasPerm('usersys.as_trader')) {
      this.state.type = 2
    }
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getProjectList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProjectList)
  }

  handleFavorChange = (e) => {
    const type = e.target.value
    this.setState({ type }, this.getProjectList)
  }

  getProjectList = () => {
    const { type, page, pageSize } = this.state

    var params = { page_index: page, page_size: pageSize }
    if (type == 1) {
      params['favoritetype'] = 5
      params['user'] = isLogin().id
    } else if (type == 2) {
      params['favoritetype'] = 5
      params['trader'] = idLogin().id
    } else {
      return
    }

    this.setState({ loading: true })
    api.getFavoriteProj(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  componentDidMount() {
    this.getProjectList()
  }

  render() {
    const { location } = this.props
    const { type, page, pageSize, total, list, loading } = this.state
    const props = { page, pageSize, total, list, loading, onPageChange: this.handlePageChange, onPageSizeChange: this.handlePageSizeChange }


    const map = {
      1: '感兴趣项目',
      2: '投资人感兴趣项目',
    }

    return (
      <MainLayout location={location}>
        <PageTitle title="感兴趣项目" />
          <div style={{ marginBottom: '24px' }}>
            <RadioGroup onChange={this.handleFavorChange} value={type}>
              { hasPerm('usersys.as_investor') ? <Radio value={1}>{map[1]}</Radio> : null }
              { hasPerm('usersys.as_trader') ? <Radio value={2}>{map[2]}</Radio> : null }
            </RadioGroup>
          </div>
          <FavoriteProjectList {...props} />
      </MainLayout>
    )
  }
}

export default ProjectListRecommend
