import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n, isLogin, hasPerm } from '../utils/util';
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

  const [form] = Form.useForm();

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        modifyPassword(props.currentUserID, values.old_password, values.password)
        .then(data => {
          message.success(i18n('account.password_updated'))
          let url = '/app';
          if (!isLogin().is_superuser && hasPerm('usersys.as_investor')) {
            url = '/app/dataroom/project/list';
          }
          props.dispatch(routerRedux.replace(url))
        })
        .catch(err => {
          props.dispatch({
            type: 'app/findError',
            payload: err
          })
        })
      }
    })
  }

  return (
    <LeftRightLayout
      location={props.location}
      title={i18n("account.change_password")}>

      <Form form={form} style={{ width: 500, margin: '0 auto' }} onSubmit={handleSubmit}>
        <OldPassword />
        <Password label={i18n("account.new_password")} />
        <ConfirmPassword formRef={form} />
        <Submit />
      </Form>

    </LeftRightLayout>
  )
}

function mapStateToProps(state) {
  const currentUserID = state.currentUser.id
  return { currentUserID }
}

export default connect(mapStateToProps)(ModifyPwd);
