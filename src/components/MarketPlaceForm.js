import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n } from '../utils/util'
import { Link } from 'dva/router'

import { Form, Input, Radio, Checkbox, Upload, Icon, Button, message, Modal } from 'antd'
const FormItem = Form.Item

import {
  BasicFormItem,
  IndustryDynamicFormItem,
} from '../components/Form'

import {
  SelectTag,
  CascaderCountry,
  CascaderIndustry,
} from '../components/ExtraInput'
import { UploadFile } from './Upload'

// currentUserId
const userInfo = localStorage.getItem('user_info')
const currentUserId = userInfo ? JSON.parse(userInfo).id : null







class MarketPlaceForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  constructor(props) {
    super(props)

    const { getFieldDecorator } = props.form

    getFieldDecorator('supportUser', {
      rules: [{required: true, type: 'number'}],
      initialValue: currentUserId,
    })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    return (
      <Form>
        <BasicFormItem label={i18n('project.chinese_name')} name="projtitleC" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.english_name')} name="projtitleE" required whitespace>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project.tags')} name="tags" valueType="array" required>
          <SelectTag mode="multiple" />
        </BasicFormItem>

        <IndustryDynamicFormItem industry={this.props.industry} />

        <BasicFormItem label={i18n('project.country')} name="country" required valueType="number">
          <CascaderCountry size="large" />
        </BasicFormItem>

        {/* TODO 上传者 */}

        <BasicFormItem label={i18n('project.attachment')} name="linkpdfkey" required>
          <UploadFile />
        </BasicFormItem>
      </Form>
    )
  }
}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

export default connect(mapStateToPropsIndustry)(MarketPlaceForm)
