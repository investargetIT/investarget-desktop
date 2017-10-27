import React from 'react'
import PropTypes from 'prop-types'

import { Form, Input, Radio, Checkbox } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item
const TextArea = Input.TextArea

import { BasicFormItem } from './Form'
import {
  SelectBDStatus,
  SelectBDSource,
  SelectTitle,
  SelectArea,
  SelectOrgUser,
} from './ExtraInput'
import { i18n } from '../utils/util'


class ProjectBDForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  getChildContext() {
    return { form: this.props.form }
  }

  render() {
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <BasicFormItem label={i18n('project_bd.project_name')} name="com_name" required initialValue={this.props.comName}>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.bd_status')} name="bd_status" required valueType="number">
          <SelectBDStatus />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.import_methods')} name="source_type" required valueType="number">
          <SelectBDSource />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.area')} name="location" required valueType="number">
          <SelectArea />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.contact')} name="username" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.title')} name="usertitle" required valueType="number">
          <SelectTitle />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.mobile')} name="usermobile" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem label={i18n('project_bd.manager')} name="manager" valueType="number" required>
          <SelectOrgUser type="trader" org={2585} />
        </BasicFormItem>

        {'isAdd' in this.props ? (
          <BasicFormItem label={i18n('remark.comment')} name="comments">
            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
          </BasicFormItem>
        ) : null}
      </Form>
    )
  }
}

export default ProjectBDForm
