import React from 'react'
import { message, Modal } from 'antd'
import { connect } from 'dva'

class HandleError extends React.Component {

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
        Modal.error({
          title: '会话过期，请重新登录',
          onOk() {
            react.props.dispatch({
              type: 'currentUser/logout'
            })
          },
        })
        break
      case 2010:
        Modal.error({
          title: '无法完成相关操作',
          content: msg,
        })
        break
      case 2009:
        Modal.error({
          title: '权限校验失败，请重新登录',
          onOk() {
            dispatch({
              type: 'currentUser/logout'
            })
          }
        })
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
