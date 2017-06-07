import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Form } from 'antd'
import { Role, Org, FullName, Position, Tags, Submit, UploadAvatar } from '../components/Form'
import { connect } from 'dva'

function BasicInfo(props) {

  function getChildContext() {
    return {
      form: props.form
    }   
  }

  return (
    <LeftRightLayout
      location={props.location}
      title={i18n("modify_profile")}>

      <Form style={{ width: 500, margin: '0 auto' }}>
        <UploadAvatar />
        <Role disabled />
        <Org disabled />
        <FullName disabled />
        <Position disabled />
        <Tags tag={props.tag} />
        <Submit />
      </Form>

    </LeftRightLayout>
  )
}

function mapStateToProps(state) {
  const { tag } = state.app
  return { tag }
}

function mapPropsToFields(props) {
  return {
    role: { value: 1 },
    organization: { value: '海图' },
    username: { value: 'HAItu' },
    position: { value: '总经理' },
    tags: { value: ["33", "34", "35", "36", "37", "38", "39"] },
  }
}

export default connect(mapStateToProps)(Form.create({mapPropsToFields})(BasicInfo))
