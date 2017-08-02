import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router'
import _ from 'lodash'
import * as api from '../api'
import { hasPerm, i18n, isLogin } from '../utils/util'
import LeftRightLayout from '../components/LeftRightLayout'
import { message, Progress, Icon, Checkbox, Radio, Select, Button, Input, Row, Col, Table, Pagination, Popconfirm, Dropdown, Menu, Modal } from 'antd'
import { UserListFilter } from '../components/Filter'
import UserRelationModal from '../components/UserRelationModal'
import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'

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
      selectedUsers: [],
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
        .catch(error => console.error(error))
    }
  }

  handleSelectUser = selectedUsers => this.setState({ selectedUsers })

  handleCreate = () => {
    const projectID = this.props.location.query.projectID
    const react = this
    confirm({
      title: '你确定为这些交易师或投资人创建Dataroom吗?',
      onOk() {

        Promise.all(react.state.selectedUsers.map(m => {
          const body = {
            proj: parseInt(projectID, 10),
            isPublic: false,
            investor: m.investor,
            trader: m.trader || isLogin().id
          }
          return api.createDataRoom(body)
        }))
        .then(data => {
          react.props.dispatch(routerRedux.replace('/app/dataroom/list'))
        })
        .catch(e => react.props.dispatch({ type: 'app/findError', payload: e }))
      }
    })
  }

  render () {
    const { currentUser, location, page, pageSize, dispatch, loading } = this.props

    return (
      <LeftRightLayout location={location} title={i18n("create_dataroom")}>


        <div style={{ fontSize: 16, marginBottom: 24 }}>项目名称: {this.state.projectName}</div>

        <SelectInvestorAndTrader value={this.state.selectedUsers} onChange={this.handleSelectUser} />

        <div style={{ textAlign: 'center', padding: '0 16px', marginTop: '-16px' }}>
          <Button style={{ marginRight: 10 }} onClick={window.close}>取消</Button>
          <Button disabled={this.state.selectedUsers.length == 0} type="primary" onClick={this.handleCreate}>创建</Button>
        </div>

      </LeftRightLayout>
    )
}
}

export default connect()(AddDataRoom)
