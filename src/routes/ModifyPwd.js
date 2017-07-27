import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Form, message } from 'antd'
import { Password, ConfirmPassword, OldPassword, Submit } from '../components/Form'
import { modifyPassword } from '../api'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'

function ModifyPwd(props) {

  function getChildContext() {
    return {
      form: props.form
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        modifyPassword(props.currentUserID, values.old_password, values.password)
        .then(data => {
          message.success('密码修改成功')
          props.dispatch(routerRedux.replace('/app'))
        })
        .catch(err => message.error(err.message))
      }
    })  
  }

  return (
    <LeftRightLayout
      location={props.location}
      title={i18n("change_password")}>

      <Form style={{ width: 500, margin: '0 auto' }} onSubmit={handleSubmit}>
        <OldPassword />
        <Password label={i18n("new_password")} />
        <ConfirmPassword />
        <Submit />
      </Form>

    </LeftRightLayout>
  )
}

function mapStateToProps(state) {
  const currentUserID = state.currentUser.id
  return { currentUserID }
}

export default connect(mapStateToProps)(Form.create()(ModifyPwd))
