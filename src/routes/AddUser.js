import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Form } from 'antd'
import { Status, Leader, Trader, Country, Area, Department, Wechat, EnglishFullName, Company, Role, Submit, ChineseFullName, Email, Position, Org, Mobile, Tags } from '../components/Form'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { createUser, getOrg } from '../api'
import { mapStateToPropsForAudit } from '../components/Filter'

class AddUser extends React.Component {

  state = {
    org: []
  }

  getChildContext() {
    return {
      form: this.props.form
    }
  }

  handleOrgChange = value => {

    if (value === '') {
      this.setState({ org: [] })
      return
    } else if (value.length < 2) {
      this.setState({ org: [] })
      return
    } else if (this.state.org.map(i => i.name).includes(value)) {
      return
    }

    getOrg({search: value}).then(data => {
      const org = data.data.data.map(item => {
        return { id: item.id, name: item.orgname }
      })
      this.setState({ org: org })
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values)
        this.props.dispatch({
          type: 'users/create',
          payload: values
        })
      }   
    })  
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("create_user")}>

        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Role />
          <ChineseFullName />
          <EnglishFullName />
          <Email />
          <Mobile country={this.props.country} />
          <Company />
          <Department />
          <Position title={this.props.title} />
          <Wechat />
          <Org org={this.state.org} onChange={this.handleOrgChange.bind(this)} />
          <Area />
          <Country />
          <Tags tag={this.props.tag} />
          <Trader />
          <Leader />
          <Status options={this.props.auditOptions} />
          <Submit />
        </Form>

      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { title, tag, country } = state.app
  const { auditOptions } = mapStateToPropsForAudit(state)
  return { title, tag, country, auditOptions }
}

AddUser.childContextTypes = {
  form: PropTypes.object
}

export default connect(mapStateToProps)(Form.create()(AddUser))
