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
        <div style={{ marginBottom: 40 }}>
          <div style={{ padding: '0 10px', lineHeight: '48px', backgroundColor: 'rgb(225, 239, 216', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>进行中项目工作汇报</div>
            <div style={{ color: '#10458F', textDecoration: 'underline', cursor: 'pointer' }}>添加项目</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200 }}>
              <div style={{ textAlign: 'center' }}>
                <span>选择已有项目</span>
                <span>或</span>
                <span>添加新项目</span>
              </div>
              <BasicFormItem name="proj" valueType="number" layout>
                <SelectExistProject />
              </BasicFormItem>
            </div>

            <div style={{ flex: 1 }}>
              <div>
                <div style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold', lineHeight: 3 }}>本周工作</div>

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
                <div style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold', lineHeight: 3 }}>下周计划</div>
                <div style={{ marginLeft: 82 }}>
                  <BasicFormItem name="next_plan" layout>
                    <Input.TextArea />
                  </BasicFormItem>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ padding: '0 10px', lineHeight: '48px', backgroundColor: 'rgb(225, 239, 216', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>投资机构日常沟通汇报</div>
            <div style={{ color: '#10458F', textDecoration: 'underline', cursor: 'pointer' }}>添加机构</div>
          </div>

          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200, paddingLeft: 8 }}>测试机构的机构名称</div>

            <div style={{ flex: 1, marginLeft: 40 }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: 20, fontSize: 16 }}>•</div>
                <div style={{ flex: 1 }}>测试第一条之前添加的机构备注</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: 20, fontSize: 16 }}>•</div>
                <div style={{ flex: 1 }}>测试第二条之前添加的机构备注</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: 20, fontSize: 16 }}>•</div>
                <div style={{ flex: 1 }}>
                  <BasicFormItem name="next_plan" layout>
                    <Input.TextArea placeholder="添加新的机构备注" />
                  </BasicFormItem>
                </div>
              </div>
            </div>

          </div>

         <hr style={{ borderTop: '2px dashed #ccc' }} /> 

          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200 }}>
              <BasicFormItem name="proj" valueType="number" layout>
                <SelectExistOrganization placeholder="选择机构" />
              </BasicFormItem>
            </div>

            <div style={{ flex: 1, marginLeft: 40 }}>
              <BasicFormItem name="next_plan" layout>
                <Input.TextArea placeholder="机构备注" />
              </BasicFormItem>
            </div>

          </div>

        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 10, padding: '0 10px', lineHeight: '48px', backgroundColor: 'rgb(225, 239, 216', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>市场信息和项目信息汇报</div>
          </div>
          <BasicFormItem name="summary" layout>
            <Input.TextArea />
          </BasicFormItem>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 10, padding: '0 10px', lineHeight: '48px', backgroundColor: 'rgb(225, 239, 216', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>其他事项/工作建议（如果有）</div>
          </div>
          <BasicFormItem name="suggestion" layout>
            <Input.TextArea />
          </BasicFormItem>
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
