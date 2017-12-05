import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Form, message } from 'antd'
import { Group, Org, FullName, Position, Tags, Submit, UploadAvatar } from '../components/Form'
import { connect } from 'dva'
import { editUser } from '../api'
import { routerRedux } from 'dva/router'
import PropTypes from 'prop-types'

class BasicInfo extends React.Component {

  state = {
    avatarUrl: this.props.currentUser.photourl
  }
  getChildContext() {
    return {
      form: this.props.form
    }
  }
  handleSubmit(e) {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        if (values.tags.length === 0) {
          message.error(i18n('personal_info.message.tag_required'))
          return
        }
        editUser([this.props.currentUser.id], {tags: values.tags}).then(data => {
          const tags = data.data[0].tags
          const userInfo = {...this.props.currentUser, tags}
          localStorage.setItem('user_info', JSON.stringify(userInfo))
          this.props.dispatch({
            type: 'currentUser/save',
            userInfo
          })
          message.success(i18n('personal_info.message.update_success'))
          this.props.dispatch(routerRedux.replace('/app'))
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      }
    })
  }

  handleUploaded(response) {
    this.setState({ avatarUrl: response.url })
    if (this.props.currentUser.photoKey) {
      message.success(i18n('personal_info.message.avatar_cache_tip'))
      return
    }
    editUser([this.props.currentUser.id], { photoBucket: 'image', photoKey: response.key }).then(data => {
      const photoKey = data.data[0].photoKey
      const photourl = data.data[0].photourl
      const photoBucket = data.data[0].photoBucket
      const userInfo = { ...this.props.currentUser, photoKey, photourl, photoBucket }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      this.props.dispatch({
        type: 'currentUser/save',
        userInfo
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['title', 'tag'] })
  }

  render() {
  return (
    <LeftRightLayout
      location={this.props.location}
      title={i18n("menu.profile")}>

      <Form style={{ width: 500, margin: '0 auto' }} onSubmit={this.handleSubmit.bind(this)}>
        <UploadAvatar photoKey={this.props.currentUser.photoKey} avatarUrl={this.state.avatarUrl} onUploaded={this.handleUploaded.bind(this)} />
        <Group disabled />
        <Org disabled />
        <FullName disabled />
        <Position disabled title={this.props.title} />
        <Tags tag={this.props.tag} />
        <Submit />
      </Form>

    </LeftRightLayout>
  )
  }
}

function mapStateToProps(state) {
  const { tag, title } = state.app
  const { currentUser } = state
  return { tag, title, currentUser }
}

function mapPropsToFields(props) {
  return {
    readOnlyGroup: { value: props.currentUser.groups.length > 0 ? props.currentUser.groups[0].name : '' },
    organization: { value:  props.currentUser.org.orgname},
    username: { value: props.currentUser.username },
    title: { value: props.currentUser.title && props.currentUser.title.id + ''},
    tags: { value: props.currentUser.tags ? props.currentUser.tags.map(m => '' + m.id) : [] },
  }
}

BasicInfo.childContextTypes = {
  form: PropTypes.object
}

export default connect(mapStateToProps)(Form.create({mapPropsToFields})(BasicInfo))
