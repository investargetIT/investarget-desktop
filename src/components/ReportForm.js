import React from 'react'
import PropTypes from 'prop-types'
import { i18n, getCurrentUser, hasPerm } from '../utils/util'
import { connect } from 'dva'
import { Link } from 'dva/router'
import styles from './ProjectForm.css'

import { Form, Input, Radio, Checkbox } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item

import {
  BasicFormItem,
  IndustryDynamicFormItem,
} from './Form'

import {
  TreeSelectTag,
  SelectRole,
  SelectTransactionType,
  CascaderCountry,
  CascaderIndustry,
  RadioTrueOrFalse,
  SelectService, 
  SelectExistUser, 
  SelectExistProject,
  SelectExistOrganization,
} from './ExtraInput'

const paraStyle = {lineHeight: 2, marginBottom: '8px'}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14, offset: 6 },
  }
}

class ProjectBaseForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  constructor(props) {
    super(props)
    window.form = props.form
  }

  getChildContext() {
    return { form: this.props.form }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form>
        <div style={{ border: '1px solid #CCCCCC' }}>
          <div style={{ backgroundColor: '#F8F8F8' }}>进行中项目工作汇报</div>

          <div style={{ display: 'flex' }}>

            <div style={{ width: 200 }}>
              <BasicFormItem label={i18n('schedule.project')} name="proj" valueType="number">
                <SelectExistProject />
              </BasicFormItem>
            </div>

            <div style={{ flex: 1 }}>
              <div>
                <div>本周工作</div>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div>机构：</div>
                      <div style={{ flex: 1 }}>
                        <BasicFormItem label="" name="org" layout="formItemLayoutWithOutLabel" >
                          <SelectExistOrganization allowCreate formName="userform" />
                        </BasicFormItem>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <BasicFormItem label="投资人" name="bduser" valueType="number">
                      <SelectExistUser />
                    </BasicFormItem>
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    <BasicFormItem label="其他" name="others" layout={formItemLayout}>
                      <Input.TextArea />
                    </BasicFormItem>
                  </div>
                </div>
              </div>

              <div>
                <div>下周计划</div>
                <BasicFormItem label="下周计划" name="next_plan" whitespace>
                  <Input.TextArea />
                </BasicFormItem>
              </div>
            </div>
          </div>

        </div>
      </Form>
    )
  }

}

function mapStateToPropsIndustry(state) {
  const { industry } = state.app
  return { industry }
}

export default connect(mapStateToPropsIndustry)(ProjectBaseForm)
