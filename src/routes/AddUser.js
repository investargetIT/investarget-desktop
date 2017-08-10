import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, isLogin, hasPerm } from '../utils/util'
import * as api from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'
import { routerRedux } from 'dva/router'
import { URI_12 } from '../constants'


function onValuesChange(props, values) {
  console.log(values)
}
const AddUserForm = Form.create({ onValuesChange })(UserForm)


class AddUser extends React.Component {

  state = {
    visible: false,
    confirmLoading: false,
  }

  isTraderAddInvestor = this.props.location.query.redirect === URI_12

  

  handleSubmit = e => {
    this.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values)
        if (hasPerm('usersys.user_adduser') && !hasPerm('usersys.admin_adduser')) {
          // values.groups = undefined
        }
        if (this.isTraderAddInvestor) {
          values.userstatus = 2
        }
        let isUserExist
        Promise.all([
          api.checkUserExist(values.mobile),
          api.checkUserExist(values.email)
        ]).then(data => {
          const isMobileExist = data[0].data.result 
          const isEmailExist = data[1].data.result
          if (isMobileExist || isEmailExist) {
            isUserExist = true
            if (!this.isTraderAddInvestor) {
              Modal.warning({ title: '该用户已经存在' })
            } else {
              if (isMobileExist) return api.getUser({ search: values.mobile })
              if (isEmailExist) return api.getUser({ search: values.email })
            }
          }
        }).then(data => {
          if (isUserExist && data) {
            const user = data.data.data[0]
            this.setState({ visible: true, user })
          } else if (!isUserExist) {
            return api.addUser(values)
          }
        })
        .then(result => {
          if (this.isTraderAddInvestor && result) {
            const body = {
              relationtype: false,
              investoruser: result.data.id,
              traderuser: isLogin().id
            }
            return api.addUserRelation(body)
          }
        })
        .then(data => {
          if (!data && this.isTraderAddInvestor) return
          this.props.dispatch(
            routerRedux.replace(this.props.location.query.redirect || '/app/user/list')
          )
        })
        .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
      }
    })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form
    }
  }

  handleOnBlur(accountType, evt) {
    const account = evt.target.value
    if (!account) return
    api.checkUserExist(account)
    .then(data => {
      const isExist = data.data.result
      if (isExist) {
        if (!this.isTraderAddInvestor) {
          Modal.warning({ title: '该用户已经存在' })
        } else {
          return api.getUser({ search: account })
        }
      }
    })
    .then(data => {
      if (!data) return
      const user = data.data.data[0]
      this.setState({ visible: true, user })
    })
  }

  handleAddRelation = () => {
    this.setState({ confirmLoading: true })
    const body = {
      relationtype: false,
      investoruser: this.state.user.id,
      traderuser: isLogin().id
    }
    api.addUserRelation(body)
    .then(data => {
      this.setState({ visible: false, confirmLoading: false })
      this.props.dispatch(routerRedux.replace(this.props.location.query.redirect))
    })
    .catch(err => {
      this.setState({ visible: false, confirmLoading: false })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  handleCancel = () => this.setState({ visible: false })

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n(this.isTraderAddInvestor ? "add_investor" : "create_user")}>

        <AddUserForm type="add"
          wrappedComponentRef={this.handleRef}
          mobileOnBlur={this.handleOnBlur.bind(this, 'mobile')}
          emailOnBlur={this.handleOnBlur.bind(this, 'email')} />

        <div style={{textAlign: 'center'}}>
          <Button type="primary" size="large" onClick={this.handleSubmit}>{i18n("submit")}</Button>
        </div>

        <Modal title="用户已存在"
          visible={this.state.visible}
          onOk={this.handleAddRelation}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}>
          <p>{'是否要和用户 '  + (this.state.user && this.state.user.username) + ' 建立联系？'}</p>
        </Modal>

      </LeftRightLayout>
    )
  }
}

export default connect()(AddUser)
