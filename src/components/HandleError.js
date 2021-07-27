import React from 'react'
import { message, Modal } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { i18n } from '../utils/util'

class HandleError extends React.Component {

  static handleSessionExpiration = false

  componentDidUpdate(prevProps, prevState) {
    if (this.props.error) {
      this.determineError(this.props.error)
      this.props.dispatch({ type: 'app/dismissError' })
    }
  }

  determineError(error) {
    switch (error.name) {
      case 'Error':
        this.handleComError(error)
        break
      case 'FormError':
        this.handleFormError(error)
        break;
      case 'ApiError':
        this.handleApiError(error.code, error.message, error.detail);
        break
      default:
        console.error(error)
        Modal.error({
          title: i18n('unknown_error'),
          content: i18n('contact_admin'),
        })
    }
  }

  handleComError(error) {
    console.error(error)
  }

  handleFormError(error) {
    Modal.error({
      title: error.message,
    })
  }

  handleApiError(code, msg, detail) {
    console.error(`name: ApiError, code: ${code}, message: ${msg}, detail: ${detail}`);
    const react = this
    switch (code) {
      case 3000:
        if (!HandleError.handleSessionExpiration) {
          HandleError.handleSessionExpiration = true
          Modal.error({
            // title: i18n('message.session_expire'),
            title: msg,
            onOk() {
              HandleError.handleSessionExpiration = false
              react.props.dispatch({
                type: 'currentUser/logout',
                payload: { redirect: react.props.pathname }
              })
            },
          })
        }
        break
      case 2010:
        Modal.error({
          // title: i18n('message.operation_fail'),
          title: msg,
          // content: msg,
        })
        break
      case 2009:
        react.props.dispatch(routerRedux.replace('/403'))
        break
      case 20041:
        // Modal.error({ title: i18n('message.mobile_exist') })
        Modal.error({ title: msg });
        break
      case 20042:
        // Modal.error({ title: i18n('message.email_exist') })
        Modal.error({ title: msg });
        break
      case 2001: // 用户可感知的错误已在相关页面处理了，登录密码错误
        break;
      case 2002: // 用户可感知的错误已在相关页面处理了，登录用户不存在
        break;
      case 1299:
        Modal.error({
          // title: i18n('message.choose_company'),
          title: msg,
          onOk() {
            react.props.dispatch(
             routerRedux.replace("/")
            )
          },
        })
        break
      case 4007:
        // Modal.error({ title: i18n('error'), content: i18n('project.message.project_message_missing') })
        Modal.error({ title: msg });
        break
      case 2005:
        // Modal.error({ title: i18n('wrong_verify_code')})
        Modal.error({ title: msg });
        break;
      case 2026:
        // Modal.error({ title: '该投资人名下已存在相同投资事件' });
        Modal.error({ title: msg });
        break;
      case 8006:
        // Modal.error({ title: '视频会议时间冲突', content: msg });
        Modal.error({ title: msg });
        break;
      case 2004:
        // Modal.error({ title: '保存模版失败', content: msg });
        Modal.error({ title: msg });
        break;
      case 5006:
        // Modal.error({ title: '机构看板创建失败', content: msg });
        Modal.error({ title: msg });
        break;
      case 3008:
        // Modal.error({ title: '系统繁忙，请稍后再试', content: msg });
        Modal.error({ title: msg });
        break;
      case 2007:
        // Modal.error({ title: '机构看板创建失败', content: msg });
        Modal.error({ title: msg });
        break;
      case 2051: // 修改密码时，原密码错误，修改失败
        Modal.error({ title: msg });
      case 50061:
        // Modal.error({ title: '已存在项目名称相同的BD任务，无法创建' });
        Modal.error({ title: msg });
        break;
      default:
        message.error(`Api Error, code: ${code}, message: ${msg}`, 2)
    }
  }

  render() {
    return null
  }

}

function mapStateToProps(state) {
  const { error } = state.app
  return { error }
}

export default connect(mapStateToProps)(HandleError)
