import React from 'react'
import { Form, Button, message } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import MarketPlaceForm from '../components/MarketPlaceForm'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'

const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}

function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && prop !== 'industriesKeys' && prop !== 'isAgreed') {
      data[prop] = formData[prop]
    }
  }
  data['industries'] = formData['industriesKeys'].map(key => formData['industries-' + key])
  data['ismarketplace'] = true
  return data
}

function onValuesChange(props, values) {
  console.log(values)
}
const AddMarketPlaceForm = Form.create({ onValuesChange })(MarketPlaceForm)


class AddMarketPlace extends React.Component {
  constructor(props) {
    super(props)
  }

  goBack = () => {
    this.props.router.goBack()
  }

  addMarketPlace = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        api.createProj(param).then(result => {
          this.props.router.goBack()
        }, error => {
          message.error(error.message)
        })
      }
    })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  render() {
    return (
      <MainLayout location={this.props.location}>
        <PageTitle title="新增 Market Place" />
        <div>
          <AddMarketPlaceForm wrappedComponentRef={this.handleRef} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>取消</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.addMarketPlace}>提交</Button>
          </div>
        </div>
      </MainLayout>
    )
  }
}

export default withRouter(AddMarketPlace)
