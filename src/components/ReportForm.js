import React from 'react'
import PropTypes from 'prop-types'
import { i18n, getCurrentUser, hasPerm } from '../utils/util'
import { connect } from 'dva'
import { Link } from 'dva/router'
import styles from './ProjectForm.css'
import moment from 'moment';
import { Form, Input, Radio, Checkbox, DatePicker } from 'antd'
const RadioGroup = Radio.Group
const FormItem = Form.Item
const { RangePicker } = DatePicker;
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
  SelectNewBDStatus,
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

let uuid = 0;
let ppid = 0;
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

  addOrgFormItem = () => {
    uuid++;
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('org_keys');
    const nextKeys = keys.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      org_keys: nextKeys,
    });
  }

  removeFormItem = (key, value) => {
    const { form } = this.props;
    const keyValues = form.getFieldValue(key);
    const body = {};
    body[key] = keyValues.filter(k => k !== value);
    form.setFieldsValue(body);
  }

  addProjFormItem = () => {
    ppid++;
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('proj_keys');
    const nextKeys = keys.concat(ppid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      proj_keys: nextKeys,
    });
  }

  addProjOrgBdFormItem = (key) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue(key);
    const nextKeys = keys.concat(keys.length + 1);
    // can use data-binding to set
    // important! notify form to detect changes
    const obj = {};
    obj[key] = nextKeys;
    form.setFieldsValue(obj);
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

    getFieldDecorator('org_keys', { initialValue: [] });
    const orgKeys = getFieldValue('org_keys');
    const orgFormItems = orgKeys.map((m, i) => (
      <div key={m}>
        <hr style={{ borderTop: '2px dashed #ccc' }} />
        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>

          <div style={{ width: 200 }}>
            <BasicFormItem name={`org_new_org_${i}`} layout valueType="number">
              <SelectExistOrganization placeholder="选择机构" />
            </BasicFormItem>
          </div>

          <div style={{ flex: 1, marginLeft: 40 }}>
            <BasicFormItem name={`org_new_remark_${i}`} layout>
              <Input.TextArea autosize={{ minRows: 4 }} placeholder="机构备注" />
            </BasicFormItem>
          </div>

          <div style={{ width: 100, textAlign: 'center' }}>
            <img onClick={() => this.removeFormItem('org_keys', m)} style={{ width: 16, curso: 'pointer' }} src="/images/delete.png" />
          </div>

        </div>
      </div>
    ));

    getFieldDecorator('proj_1_orgbd_keys', { initialValue: [] });
    const proj1OrgBDKeys = getFieldValue('proj_1_orgbd_keys');
    const proj1OrgBDFormItems = proj1OrgBDKeys.map((m, i) => (
      <div key={m} style={{ display: 'flex' }}>

        <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex' }}>
            <div>机构：</div>
            <div style={{ flex: 1 }}>
              <BasicFormItem name={`proj_existing_org_${i}`} layout valueType="number">
                <SelectExistOrganization />
              </BasicFormItem>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex' }}>
            <div>投资人：</div>
            <div style={{ flex: 1 }}>
              <BasicFormItem name={`proj_existing_bduser_${i}`} valueType="number" layout>
                <SelectExistUser />
              </BasicFormItem>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex' }}>
            <div>状态：</div>
            <div style={{ flex: 1 }}>
              <BasicFormItem name={`proj_existing_bdstatus_${i}`} valueType="number" layout>
                <SelectNewBDStatus />
              </BasicFormItem>
            </div>
          </div>
        </div>

        <div style={{ width: 50, textAlign: 'center' }}>
          <img onClick={() => this.removeFormItem('proj_1_orgbd_keys', m)} style={{ width: 16, curso: 'pointer' }} src="/images/delete.png" />
        </div>

      </div>
    ));

    getFieldDecorator('proj_keys', { initialValue: [] });
    const projKeys = getFieldValue('proj_keys');
    const projFormItems = projKeys.map((m, i) => {
      const orgBDKeys = `proj_keys_orgbd_${i}`;
      getFieldDecorator(orgBDKeys, { initialValue: [] });
      const projOrgBDKeys = getFieldValue(orgBDKeys);
      const orgBdFormItems = projOrgBDKeys.map((m, i1) => (
        <div key={m} style={{ display: 'flex' }}>

          <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>机构：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`proj_new_org_${i}_${i1}`} layout valueType="number">
                  <SelectExistOrganization />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>投资人：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`proj_new_bduser_${i}_${i1}`} valueType="number" layout>
                  <SelectExistUser />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>状态：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`proj_new_bdstatus_${i}_${i1}`} valueType="number" layout>
                  <SelectNewBDStatus />
                </BasicFormItem>
              </div>
            </div>
          </div>

        </div>
      ));

      return (<div key={m}>
        <hr style={{ borderTop: '2px dashed #ccc' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>

          <div style={{ width: 200 }}>
            <BasicFormItem name="proj" valueType="number" layout>
              <SelectExistProject placeholder="选择项目" />
            </BasicFormItem>
          </div>

          <div style={{ flex: 1 }}>
            <div>

              <div style={{ lineHeight: 3 }}>
                <span style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold' }}>本周工作</span>
                <span onClick={() => this.addProjOrgBdFormItem(orgBDKeys)} style={{ marginLeft: 10, fontWeight: 'normal', color: '#10458F', cursor: 'pointer' }}>添加机构BD</span>
              </div>

              {orgBdFormItems}

              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>
                    <div>其他：</div>
                    <div style={{ flex: 1 }}>
                      <BasicFormItem name="others" layout>
                        <Input.TextArea autosize={{ minRows: 4 }} placeholder="本周其他与项目相关的工作" />
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
                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="下周与项目相关的工作计划" />
                </BasicFormItem>
              </div>
            </div>

          </div>

          <div style={{ width: 100, textAlign: 'center' }}>
            <img onClick={() => this.removeFormItem('proj_keys', m)} style={{ width: 16, curso: 'pointer' }} src="/images/delete.png" />
          </div>

        </div>
      </div>);
  });

    return (
      <Form>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <BasicFormItem name="time" valueType="array" layout>
            <RangePicker disabled />
          </BasicFormItem>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>进行中项目工作汇报</div>
            <div onClick={this.addProjFormItem} style={{ color: '#10458F', textDecoration: 'underline', cursor: 'pointer' }}>添加项目</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200 }}>测试项目</div>

            <div style={{ flex: 1 }}>
              <div>
                <div style={{ lineHeight: 3 }}>
                  <span style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold' }}>本周工作</span>
                  <span onClick={() => this.addProjOrgBdFormItem('proj_1_orgbd_keys')} style={{ marginLeft: 10, fontWeight: 'normal', color: '#10458F', cursor: 'pointer' }}>添加机构BD</span>
                </div>

                <div style={{ display: 'flex' }}>

                  <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div>机构：</div>
                      <div style={{ flex: 1 }}>
                        测试机构
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div>投资人：</div>
                      <div style={{ flex: 1 }}>
                        测试投资人
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div>状态：</div>
                      <div style={{ flex: 1 }}>
                        已见面
                      </div>
                    </div>
                  </div>

                </div>

                {proj1OrgBDFormItems}

                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>
                      <div>其他：</div>
                      <div style={{ flex: 1 }}>
                        <BasicFormItem name="others" layout>
                          <Input.TextArea autosize={{ minRows: 4 }} placeholder="本周其他与项目相关的工作" />
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
                    <Input.TextArea autosize={{ minRows: 4 }} placeholder="下周与项目相关的工作计划" />
                  </BasicFormItem>
                </div>
              </div>
            </div>
          </div>

          {projFormItems}

        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>投资机构日常沟通汇报</div>
            <div style={{ color: '#10458F', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.addOrgFormItem}>添加机构</div>
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
                    <Input.TextArea autosize={{ minRows: 4 }} placeholder="添加新的机构备注" />
                  </BasicFormItem>
                </div>
              </div>
            </div>

          </div>

          {orgFormItems}

        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 10, padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>市场信息和项目信息汇报</div>
          </div>
          <BasicFormItem name="summary" layout>
            <Input.TextArea autosize={{ minRows: 6 }} placeholder="市场信息和项目信息汇报" />
          </BasicFormItem>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 10, padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>其他事项/工作建议（如果有）</div>
          </div>
          <BasicFormItem name="suggestion" layout>
            <Input.TextArea autosize={{ minRows: 6 }} placeholder="其他事项/工作建议（如果有）" />
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
