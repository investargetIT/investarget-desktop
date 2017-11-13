import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, showError, isLogin, hasPerm } from '../utils/util'

import { Input, Icon, Button, Radio } from 'antd'

import LeftRightLayout from '../components/LeftRightLayout'

import FavoriteProjectList from '../components/FavoriteProjectList'

const RadioGroup = Radio.Group

class ProjectListRecommend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      favoritetype: 3, // default 交易师推荐
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

export default connect()(ProjectListRecommend)
