import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, intersection, subtracting, hasPerm } from '../utils/util'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'
import { routerRedux } from 'dva/router'
import * as api from '../api'

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
    this.majorRelation = {}
    this.minorRelation = []
  }

  handleSubmit = e => {
    const userId = Number(this.props.params.id)
    this.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values, this.majorRelation, this.minorRelation)
        const addRelationArr = [], delRelationArr = []
        if (this.majorRelation.traderuser && this.majorRelation.traderuser.id !== parseInt(values.major_trader, 10)) {
          addRelationArr.push({
            investoruser: this.props.params.id,
            traderuser: values.major_trader,
            relationtype: true
          })
          delRelationArr.push(this.majorRelation.id)
        } else if (!this.majorRelation && values.major_trader) {
          addRelationArr.push({
            investoruser: this.props.params.id,
            traderuser: values.major_trader,
            relationtype: true
          })
        } else if (this.majorRelation && !values.major_trader) {
          delRelationArr.push(this.majorRelation.id)
        }

        subtracting(
          this.minorRelation.map(m => m.traderuser.id), 
          values.minor_traders.map(m => parseInt(m, 10))
        )
        .map(m => this.minorRelation.filter(f => f.traderuser.id === m)[0])
        .map(m => delRelationArr.push(m.id))

        subtracting(
          values.minor_traders.map(m => parseInt(m, 10)),
          this.minorRelation.map(m => m.traderuser.id)
        ).map(m => {
          addRelationArr.push({
            investoruser: this.props.params.id,
            traderuser: m,
            relationtype: false
          })
        })


        let body = values
        if (!hasPerm('usersys.admin_changeuser')) {
          body = { ...values, IR: undefined}
        }

        Promise.all(delRelationArr.map(m => api.deleteUserRelation([m])))
        .then(() => Promise.all(addRelationArr.map(m => api.addUserRelation(m))))
        .then(() => api.editUser([userId], body))
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
    // {
    //   'usernameC'
    //   'usernameE'
    //   'email'
    //   'mobile'
    //   'mobileAreaCode'
    //   'title'
    //   'wechat'
    //   'org'
    //   // 区域
    //   'country'
    //   'tags'
    //   // 交易师
    //   // 负责人
    //   'userstatus'
    // }

    let _data = {
      groups: data.groups && data.groups.map(item => item.id),
      usernameC: data.usernameC,
      usernameE: data.usernameE,
      email: data.email,
      mobile: data.mobile,
      mobileAreaCode: data.mobileAreaCode,
      title: data.title && data.title.id,
      wechat: data.wechat,
      org: data.org && data.org.id,
      tags: data.tags && data.tags.map(item => item.id),
      userstatus: data.userstatus && data.userstatus.id,
      country: data.country && data.country.id,
      major_trader: data.majorTraderID,
      minor_traders: data.minorTraderIDArr || [],
      ishasfundorplan: data.ishasfundorplan,
      mergedynamic: data.mergedynamic,
      targetdemand: data.targetdemand,
      IR: data.IR && data.IR.id + "",
    }
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
    console.log('abcdefg', type, value)
    const isSelectMajorTrader = type === 'major'
    const body = {
      investoruser: this.props.params.id,
      traderuser: value,
      relationtype: isSelectMajorTrader
    }
    if (isSelectMajorTrader && this.majorRelation) {
      api.editUserRelation([this.majorRelation.id], body)
      .then(data => console.log('ddddd', data))
      return
    }

    api.addUserRelation(body)
    .then(data => {
      console.log('abcdefg', data)
      console.log('adddd', this.minorRelation)
      this.minorRelation.push(data.data)
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

      </LeftRightLayout>
    )
  }
}

export default connect()(EditUser)
