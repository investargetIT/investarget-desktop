import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import { i18n } from '../utils/util'
import * as api from '../api'
import { hasPerm } from '../utils/util'
import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { UserListFilter } from '../components/Filter'
import UserRelationModal from '../components/UserRelationModal'

const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const Search = Input.Search
const confirm = Modal.confirm

class AddDataRoom extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      projectName: null,
      relation: []
    }
  }

  componentDidMount() {
    if (!hasPerm('dataroom.admin_adddataroom') && !hasPerm('dataroom.user_adddataroom')) {
      this.props.dispatch(routerRedux.replace('/403'))
      return
    }
    const projectID = this.props.location.query.projectID
    if (projectID) {
      api.getProjLangDetail(projectID)
        .then(data => this.setState({ projectName: data.data.projtitle }))
        .catch(error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      api.getUserRelation().then(data => this.setState({ relation: data.data.data }), error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }
  }

  handleConfirmCreateDataRoom(investorID, traderID) {
    const projectID = this.props.location.query.projectID
    const relation = this.state.relation.filter(f => f.investoruser.id === investorID && f.traderuser.id === traderID)[0]
    const react = this
    confirm({
      title: `你确定要为 ${relation.investoruser.username} 和 ${relation.traderuser.username} 创建DataRoom吗？`,
      onOk() {
        const body = {
          proj: parseInt(projectID, 10),
          isPublic: false,
          investor: investorID,
          trader: traderID
        }
        api.createDataRoom(body).then(data =>
          react.props.dispatch(routerRedux.replace('/app/dataroom/list'))
        ).catch(e => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      }
    })
  }

 handleSearchChange = (e) => {
    const search = e.target.value
    dispatch({ type: 'userList/setField', payload: { search } })
  }

   handleSearch = (search) => {
    dispatch({ type: 'userList/search' })
  }

   handlePageChange = (page, pageSize) => {
    dispatch({ type: 'userList/changePage', payload: page })
  }

   handleShowSizeChange = (current, pageSize) => {
    dispatch({ type: 'userList/changePageSize', payload: pageSize })
  }

 columns = [
    {
      title: i18n("username"),
      dataIndex: 'investoruser.username',
      key: 'username'
    },
    {
      title: i18n("tag"),
      dataIndex: 'investoruser.tags',
      key: 'tags',
      render: tags => tags ? tags.map(t => t.name).join(' ') : null
    },
    {
      title: i18n("trader_relation"),
      dataIndex: 'traderuser.username',
      key: 'trader_relation',
    },
    {
      title: i18n("action"),
      key: 'create_dataroom',
      render: (text, record) => <Button size="small"
        onClick={this.handleConfirmCreateDataRoom.bind(this, record.investoruser.id, record.traderuser.id)}>创建</Button>
    }
  ]
  render () {
    const { currentUser, location, page, pageSize, dispatch, loading } = this.props




  return (
    <LeftRightLayout location={location} title={i18n("create_dataroom")}>

      <div style={{ fontSize: 16, marginBottom: 24 }}>项目名称: {this.state.projectName}</div>

      <div style={{ marginBottom: '24px' }}>
        <Search
          onChange={this.handleSearchChange.bind(this)}
          placeholder="搜索用户"
          style={{ width: 200 }}
          onSearch={this.handleSearch.bind(this)} />
      </div>

      <Table
        columns={this.columns}
        dataSource={this.state.relation}
        loading={loading}
        rowKey={record => record.id}
        pagination={false} />

      <Pagination
        className="ant-table-pagination"
        total={10}
        current={1}
        pageSize={10}
        onChange={this.handlePageChange.bind(this)}
        onShowSizeChange={this.handleShowSizeChange.bind(this)}
        showSizeChanger
        showQuickJumper />

    </LeftRightLayout>
  )
}
}

export default connect()(AddDataRoom)
