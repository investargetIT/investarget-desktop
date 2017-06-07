import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Form } from 'antd'
import { Password, ConfirmPassword, OldPassword, Submit } from '../components/Form'

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
        console.log('Received values of form: ', values)
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

export default Form.create()(ModifyPwd)
