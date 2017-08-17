import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, intersection, subtracting, hasPerm } from '../utils/util'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'
import { routerRedux } from 'dva/router'
import * as api from '../api'
import { UserRemarkList } from '../components/RemarkList'

const confirm = Modal.confirm

function onValuesChange(props, values) {
  // console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const EditUserForm = Form.create({ onValuesChange, mapPropsToFields })(UserForm)


class EditUser extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {}
    }
    this.majorRelation = null
    this.minorRelation = []
  }

  handleSubmit = e => {
    const userId = Number(this.props.params.id)
    this.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values, this.majorRelation, this.minorRelation)

        let body = values
        if (!hasPerm('usersys.admin_changeuser')) {
          body = { ...values, IR: undefined}
        }

        api.editUser([userId], body)
        .then(result => {
          let url = this.props.location.query.redirect || "/app/user/list"
          this.props.dispatch(routerRedux.replace(url))
        })
        .catch(error => {
          this.componentDidMount()
          this.props.dispatch({ type: 'app/findError', payload: error })
        })

      }
    })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form
    }
  }

  getData = (data) => {
    let _data = {  ...data }
    _data['groups'] = data.groups && data.groups.map(item => item.id)
    _data['title'] = data.title && data.title.id
    _data['org'] = data.org && data.org.id
    _data['orgarea'] = data.orgarea && data.orgarea.id
    _data['tags'] = data.tags ? data.tags.map(item => item.id) : []
    _data['userstatus'] = data.userstatus && data.userstatus.id
    _data['country'] = data.country && data.country.id
    _data['major_trader'] = data.majorTraderID
    _data['minor_traders'] = data.minorTraderIDArr || []
    _data['IR'] = data.IR && data.IR.id + ""

    for (let prop in _data) {
      _data[prop] = { value: _data[prop] }
    }
    _data['isInvestor'] = data.isInvestor
    return _data
  }


  componentDidMount() {
    const userId = Number(this.props.params.id)
    let userDetailInfo, investorGroup
    api.queryUserGroup({ type: 'investor', page_size: 100 })
    .then(data => {
      investorGroup = data.data.data.map(m => m.id)
      return api.getUserDetail(userId)
    })
    .then(result => {
      userDetailInfo = result.data
      if (intersection(result.data.groups.map(m => m.id), investorGroup).length > 0) {
        const param = { investoruser: userId }
        return api.getUserRelation(param)
      } else {
        return Promise.resolve()
      }
    }).then(result => {
      if (result) {
        const majorTraderArr = result.data.data.filter(f => f.relationtype)
        if (majorTraderArr.length > 0) {
          this.majorRelation = majorTraderArr[0]
          const majorTraderID = majorTraderArr[0].traderuser.id + ""
          userDetailInfo = { ...userDetailInfo, majorTraderID, isInvestor: true }
        }
        const minorTraderIDArr = result.data.data.filter( f => !f.relationtype).map(m => m.traderuser.id + "")
        this.minorRelation = result.data.data.filter(f => !f.relationtype)
        userDetailInfo = { ...userDetailInfo, minorTraderIDArr, isInvestor: true }
      }
      this.setState({ data: this.getData(userDetailInfo) })
    }).catch(error => console.error(error))
  }

  handleSelectTrader = (type, value) => {
    const isSelectMajorTrader = type === 'major'
    const body = {
      investoruser: this.props.params.id,
      traderuser: value,
      relationtype: isSelectMajorTrader
    }
    if (isSelectMajorTrader && this.majorRelation) {
      api.editUserRelation([{ ...body, id: this.majorRelation.id }])
      .then(data => {
        this.majorRelation = data.data[0]
      })
      .catch(err => {
        this.form.setFieldsValue({ major_trader: this.majorRelation.traderuser.id + "" })
        this.props.dispatch({ type: 'app/findError', payload: err })
      })
      return
    }

    api.addUserRelation(body)
    .then(data => this.minorRelation.push(data.data))
    .catch(err => {
      this.form.setFieldsValue({ minor_traders: this.minorRelation.map(m => m.traderuser.id + "") })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  handleDeselectTrader = value => {
    const index = this.minorRelation.map(m => m.traderuser.id).indexOf(parseInt(value, 10))
    if (index < 0) return
    const investor = this.minorRelation[index].investoruser.username
    const trader = this.minorRelation[index].traderuser.username
    const react = this
    confirm({
      title: `你确定要解除投资人 ${investor} 和交易师 ${trader} 的关系吗？`,
      onOk() {
        react.deleteUserRelation(index)
      },
      onCancel() {
        react.form.setFieldsValue({ minor_traders: react.minorRelation.map(m => m.traderuser.id + "") })
      }
    })
  }

  deleteUserRelation(index) {
    api.deleteUserRelation([this.minorRelation[index].id])
    .then(() => this.minorRelation.splice(index, 1))
    .catch(err => {
      this.form.setFieldsValue({ minor_traders: this.minorRelation.map(m => m.traderuser.id + "") })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  render () {
    const userId = Number(this.props.params.id)
    return (
      <LeftRightLayout
        location={this.props.location}
        title="修改用户">

        <EditUserForm
          wrappedComponentRef={this.handleRef}
          data={this.state.data}
          type="edit"
          onSelectMajorTrader={this.handleSelectTrader.bind(this, 'major')}
          onSelectMinorTrader={this.handleSelectTrader.bind(this, 'minor')}
          onDeselectMinorTrader={this.handleDeselectTrader} />

        <div style={{textAlign: 'center'}}>
          <Button type="primary" size="large" onClick={this.handleSubmit}>{i18n("submit")}</Button>
        </div>

        <UserRemarkList typeId={userId} />

      </LeftRightLayout>
    )
  }
}

export default connect()(EditUser)
