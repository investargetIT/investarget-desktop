import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import * as api from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'


function onValuesChange(props, values) {
  console.log(values)
}
const AddUserForm = Form.create({ onValuesChange })(UserForm)


class AddUser extends React.Component {

  handleSubmit = e => {
    this.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values)

        api.addUser(values).then(result => {
          // TODO// redirect to list ?
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
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

  handleOnBlur(accountType, evt) {
    const account = evt.target.value
    if (!account) return
    api.checkUserExist(account)
    .then(data => {
      const isExist = data.data.result
      // TODO: query the exist user
    })
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("create_user")}>

        <AddUserForm
          wrappedComponentRef={this.handleRef}
          mobileOnBlur={this.handleOnBlur.bind(this, 'mobile')}
          emailOnBlur={this.handleOnBlur.bind(this, 'email')} />

        <div style={{textAlign: 'center'}}>
          <Button type="primary" size="large" onClick={this.handleSubmit}>{i18n("submit")}</Button>
        </div>

      </LeftRightLayout>
    )
  }
}

export default connect()(AddUser)
