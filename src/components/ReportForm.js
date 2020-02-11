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
        <div>
          <div style={{ paddingLeft: 10, lineHeight: '48px', backgroundColor: 'rgb(225, 239, 216' }}>进行中项目工作汇报</div>

          <div style={{ display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200 }}>
              <BasicFormItem label={i18n('schedule.project')} name="proj" valueType="number">
                <SelectExistProject />
              </BasicFormItem>
            </div>

            <div style={{ flex: 1 }}>
              <div>
                <div>本周工作</div>

                <div style={{ display: 'flex' }}>
                  <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div>机构：</div>
                      <div style={{ flex: 1 }}>
                        <BasicFormItem name="org" layout>
                          <SelectExistOrganization formName="userform" />
                        </BasicFormItem>
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div>投资人：</div>
                      <div style={{ flex: 1 }}>
                        <BasicFormItem name="bduser" valueType="number" layout>
                          <SelectExistUser />
                        </BasicFormItem>
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>
                      <div>其他：</div>
                      <div style={{ flex: 1 }}>
                        <BasicFormItem name="others" layout>
                          <Input.TextArea />
                        </BasicFormItem>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div>
                <div>下周计划</div>
                <div style={{ marginLeft: 82 }}>
                  <BasicFormItem name="next_plan" layout>
                    <Input.TextArea />
                  </BasicFormItem>
                </div>
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
