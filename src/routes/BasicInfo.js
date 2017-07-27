import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Form, message } from 'antd'
import { Group, Org, FullName, Position, Tags, Submit, UploadAvatar } from '../components/Form'
import { connect } from 'dva'
import { editUser } from '../api'
import { routerRedux } from 'dva/router'

function BasicInfo(props) {

  function getChildContext() {
    return {
      form: props.form
    }   
  }
  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        if (values.tags.length === 0) {
          message.error('请至少选择一个标签')
          return
        }
        editUser([props.currentUser.id], {tags: values.tags}).then(data => {
          const tags = data.data[0].tags
          const userInfo = {...props.currentUser, tags}
          localStorage.setItem('user_info', JSON.stringify(userInfo))
          props.dispatch({
            type: 'currentUser/save',
            userInfo
          })
          message.success('个人信息修改成功')
          props.dispatch(routerRedux.replace('/app'))
        })
      }
    })
  }
  return (
    <LeftRightLayout
      location={props.location}
      title={i18n("modify_profile")}>

      <Form style={{ width: 500, margin: '0 auto' }} onSubmit={handleSubmit}>
        <UploadAvatar />
        <Group disabled />
        <Org disabled />
        <FullName disabled />
        <Position disabled title={props.title} />
        <Tags tag={props.tag} />
        <Submit />
      </Form>

    </LeftRightLayout>
  )
}

function mapStateToProps(state) {
  const { tag, title } = state.app
  const { currentUser } = state
  return { tag, title, currentUser }
}

function mapPropsToFields(props) {
  return {
    readOnlyGroup: { value: props.currentUser.groups[0].name },
    organization: { value:  props.currentUser.org.orgname},
    username: { value: props.currentUser.username },
    title: { value: props.currentUser.title.id + ''},
    tags: { value: props.currentUser.tags.map(m => '' + m.id) },
  }
}

export default connect(mapStateToProps)(Form.create({mapPropsToFields})(BasicInfo))
