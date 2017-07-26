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
      favoritetype: 3, // 1,2,3
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

  handleFavorChange = (e) => {
    const favoritetype = e.target.value
    this.setState({ favoritetype }, this.getProjectList)
  }

  getProjectList = () => {
    const { favoritetype, page, pageSize } = this.state
    const params = { favoritetype, user: currentUser, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getFavoriteProj(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      showError(error.message)
    })
  }

  componentDidMount() {
    this.getProjectList()
  }

  render() {
    const { location } = this.props
    const { favoritetype, page, pageSize, total, list, loading } = this.state
    const props = { page, pageSize, total, list, loading, onPageChange: this.handlePageChange, onPageSizeChange: this.handlePageSizeChange }
    const map = {
      1: '系统推荐项目',
      2: '后台推荐项目',
      3: '交易师推荐项目',
    }
    const title = map[favoritetype]

    return (
      <MainLayout location={location}>
        <PageTitle title={title} />
          <div>
            <RadioGroup onChange={this.handleFavorChange} value={favoritetype}>
              <Radio value={1}>{map[1]}</Radio>
              <Radio value={2}>{map[2]}</Radio>
              <Radio value={3}>{map[3]}</Radio>
            </RadioGroup>
          </div>
          <FavoriteProjectList {...props} />
      </MainLayout>
    )
  }
}



export default ProjectListRecommend
