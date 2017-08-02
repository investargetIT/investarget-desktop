import React from 'react'
import { connect } from 'dva'
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


function toFormData(data) {
  let formData ={}

  for (let prop in data) {
    if (prop == 'industries') {
      // 转换形式 industries: [{}, {}] 为 industriesKeys: [1,2] industries-1: {}  industries-2: {}
      let value = data['industries']
      let keys = _.range(1, 1 + value.length)
      formData['industriesKeys'] = { 'value': keys }
      keys.forEach((key, index) => {
        formData['industries-' + key] = { 'value': value[index] }
      })
    } else {
      formData[prop] = { 'value': data[prop] }
    }
  }

  return formData
}


function onValuesChange(props, values) {
  console.log(values)
}

function mapPropsToFields(props) {
  return props.data
}

const EditMarketPlaceForm = Form.create({ onValuesChange, mapPropsToFields })(MarketPlaceForm)


class EditMarketPlace extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      marketPlace: {}
    }
  }

  goBack = () => {
    this.props.router.goBack()
  }

  getMarketPlace = () => {
    const id = Number(this.props.params.id)
    api.getProjDetail(id).then(result => {
      let data = result.data
      data.country = data.country && data.country.id
      data.industries = data.industries ? data.industries.map(item => item.id) : []
      data.supportUser = data.supportUser && data.supportUser.id
      data.tags = data.tags ? data.tags.map(item => item.id) : []
      this.setState({
        marketPlace: data
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  editMarketPlace = () => {
    const id = Number(this.props.params.id)
    this.form.validateFields((err, values) => {
      if (!err) {
        let params = toData(values)
        api.editProj(id, params).then(result => {
          message.success('Market Place 已更新')
          this.props.router.goBack()
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
      window.form = this.form
    }
  }

  componentDidMount() {
    this.getMarketPlace()
  }

  render() {
    const data = toFormData(this.state.marketPlace)

    return (
      <MainLayout location={this.props.location}>
        <PageTitle title="修改 Market Place" />
        <div>
          <EditMarketPlaceForm wrappedComponentRef={this.handleRef} data={data} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>取消</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.editMarketPlace}>提交</Button>
          </div>
        </div>
      </MainLayout>
    )
  }
}

export default connect()(withRouter(EditMarketPlace))
