import React from 'react'
import { connect } from 'dva'
import { Form, Button, message } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import MarketPlaceForm from '../components/MarketPlaceForm'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'

const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}

function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && !/industries-image-.*/.test(prop) && prop !== 'industriesKeys' && prop !== 'isAgreed') {
      data[prop] = formData[prop]
    }
  }
  data['industries'] = formData['industriesKeys'].map(key => {
    return {
      industry: formData['industries-' + key],
      bucket: 'image',
      key: formData['industries-image-' + key],
    }
  })
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
          this.props.router.push('/app/projects/list')
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
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
      <LeftRightLayout location={this.props.location} title={i18n('project.upload_marketplace')}>
        <div>
          <AddMarketPlaceForm wrappedComponentRef={this.handleRef} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.addMarketPlace}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}

export default connect()(withRouter(AddMarketPlace))
