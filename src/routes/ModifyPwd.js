import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n, isLogin, hasPerm, getURLParamValue } from '../utils/util';
import { Form, message } from 'antd'
import { Password, ConfirmPassword, OldPassword, Submit } from '../components/Form'
import { modifyPassword } from '../api'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'

function ModifyPwd(props) {

  const reset = getURLParamValue(props, 'reset');
  const [form] = Form.useForm();

  function handleSubmit(values) {
    modifyPassword(props.currentUserID, values.old_password, values.password)
      .then(_ => {
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

  return (
    <LeftRightLayout
      location={props.location}
      title={i18n("account.change_password")}
      name={!!reset && '为了您的账户安全，请勿使用默认密码'}
      hideHeader={!!reset}
      hideSider={!!reset}
    >

      <Form form={form} style={{ width: 500, margin: '0 auto' }} onFinish={handleSubmit}>
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
