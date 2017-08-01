import React from 'react'
import { Link } from 'dva/router'
import { i18n, showError } from '../utils/util'

import { Input, Icon, Button, Radio } from 'antd'

import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import FavoriteProjectList from '../components/FavoriteProjectList'

const RadioGroup = Radio.Group

const userInfo = JSON.parse(localStorage.getItem('user_info'))
const currentUser = userInfo ? userInfo.id : null


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
      this.state.type = 3
    } else if (hasPerm('usersys.as_trader')) {
      this.state.type = 4
    } else {
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
      params['favoritetype'] = 1
      params['user'] = currentUser
    } else if (type == 2) {
      params['favoritetype'] = 2
      params['user'] = currentUser
    } else if (type == 3) {
      params['favoritetype'] = 3
      params['user'] = currentUser
    } else if (type == 4) {
      params['favoritetype'] = 3
      params['trader'] = currentUser
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
      1: '系统推荐项目',
      2: '后台推荐项目',
      3: '交易师推荐项目',
      4: '推荐给投资人的项目',
    }

    return (
      <MainLayout location={location}>
        <PageTitle title="推荐项目" />
          <div style={{ marginBottom: '24px' }}>
            <RadioGroup onChange={this.handleFavorChange} value={type}>
              <Radio value={1}>{map[1]}</Radio>
              <Radio value={2}>{map[2]}</Radio>
              { hasPerm('usersys.as_investor') ? <Radio value={3}>{map[3]}</Radio> : null }
              { hasPerm('usersys.as_trader') ? <Radio value={4}>{map[4]}</Radio> : null }
            </RadioGroup>
          </div>
          <FavoriteProjectList {...props} />
      </MainLayout>
    )
  }
}

export default ProjectListRecommend
