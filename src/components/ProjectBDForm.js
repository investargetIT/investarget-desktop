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
        <BasicFormItem label="项目名称" name="com_name" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem label="BD状态" name="bd_status" required valueType="number">
          <SelectBDStatus />
        </BasicFormItem>

        <BasicFormItem label="导入方式" name="source" required>
          <SelectBDSource />
        </BasicFormItem>

        <BasicFormItem label="地区" name="location" required valueType="number">
          <SelectArea />
        </BasicFormItem>

        <BasicFormItem label="联系人" name="username" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem label="联系人职位" name="usertitle" required valueType="number">
          <SelectTitle />
        </BasicFormItem>

        <BasicFormItem label="联系电话" name="usermobile" required>
          <Input />
        </BasicFormItem>

        <BasicFormItem label="负责人" name="manager" valueType="number" required>
          <SelectOrgUser type="trader" org={2585} />
        </BasicFormItem>

        {'isAdd' in this.props ? (
          <BasicFormItem label="备注" name="comments">
            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
          </BasicFormItem>
        ) : null}
      </Form>
    )
  }
}

export default ProjectBDForm
