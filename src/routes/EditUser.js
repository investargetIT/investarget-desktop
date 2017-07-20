import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'

function onValuesChange(props, values) {
  console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const EditUserForm = Form.create({ onValuesChange, mapPropsToFields })(UserForm)


class EditUser extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {}
    }
  }

  handleSubmit = e => {
    const userId = Number(this.props.params.id)
    this.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values)
        api.editUser(userId, values).then(result => {
          //
        }, error => {

        })
      }
    })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form
    }
  }

  getData = (data) => {
    // {
    //   'usernameC'
    //   'usernameE'
    //   'email'
    //   'mobile'
    //   'mobileAreaCode'
    //   'title'
    //   'wechat'
    //   'org'
    //   // 区域
    //   'country'
    //   'tags'
    //   // 交易师
    //   // 负责人
    //   'userstatus'
    // }

    let _data = {
      groups: data.groups && data.groups.map(item => item.id),
      usernameC: data.usernameC,
      usernameE: data.usernameE,
      email: data.email,
      mobile: data.mobile,
      mobileAreaCode: data.mobileAreaCode,
      title: data.title.id,
      wechat: data.wechat,
      org: data.org && data.org.id,
      tags: data.tags && data.tags.map(item => item.id),
      userstatus: data.userstatus.id,
      country: data.country && data.country.id,
    }
    for (let prop in _data) {
      _data[prop] = { value: _data[prop] }
    }
    return _data
  }


  componentDidMount() {
    const userId = Number(this.props.params.id)
    // TODO// getUserDetail
    api.getUserDetail(userId).then(result => {
      console.log(result.data)

      const data = this.getData(result.data)
      this.setState({ data })
    }, error => {
      Modal.error({ title: '错误', content: error.message })
    })
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title="修改用户">

        <EditUserForm wrappedComponentRef={this.handleRef} data={this.state.data} />

        <div style={{textAlign: 'center'}}>
          <Button type="primary" size="large" onClick={this.handleSubmit}>{i18n("submit")}</Button>
        </div>

      </LeftRightLayout>
    )
  }
}

export default connect()(EditUser)
