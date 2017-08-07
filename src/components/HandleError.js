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
      case 'ApiError':
        this.handleApiError(error.code, error.message)
        break
      default:
        console.error(error)
    }
  }

  handleComError(error) {
    console.error(error)
  }

  handleApiError(code, msg) {
    const react = this
    switch (code) {
      case 3000:
        if (!HandleError.handleSessionExpiration) {
          HandleError.handleSessionExpiration = true
          Modal.error({
            title: '会话过期，请重新登录',
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
          title: '无法完成相关操作',
          content: msg,
        })
        break
      case 2009:
        react.props.dispatch(routerRedux.replace('/403'))
        break
      case 20041:
        Modal.error({ title: '手机号码已存在' })
        break
      case 20042:
        Modal.error({ title: '邮箱已存在' })
        break
      case 2001:
        Modal.error({ title: i18n('wrong_password') })
        break
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
