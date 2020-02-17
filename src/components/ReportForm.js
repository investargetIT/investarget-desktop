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
import * as api from '../api';
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
  SelectOrgInvestor,
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
let ppid2 = 0;
class ReportForm extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  constructor(props) {
    super(props)
    window.form = props.form
    const time = this.props.form.getFieldValue('time');
    const [ start, end ] = time;
    this.startDate = `${start.format('YYYY-MM-DD')}T00:00:00`;
    this.endDate = `${end.format('YYYY-MM-DD')}T23:59:59`;

    this.state = {
      orgRemarks: [],
      projOrgBds: [],
    };
  }

  getChildContext() {
    return { form: this.props.form }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getOrgBd();
    this.getOrgRemark();
  }

  getOrgRemark = async () => {
    const createuser = getCurrentUser();
    const stimeM = this.startDate;
    const etimeM = this.endDate;
    const page_size = 1000;
    const params = { createuser, stimeM, etimeM, page_size };
    const resRemark = await api.getOrgRemark(params);
    let { data: remarks } = resRemark.data;
    remarks = remarks.filter(f => f.org && f.remark);
    const orgIds = remarks.map(m => m.org);
    const uniqueOrgIds = orgIds.filter((v, i, a) => a.indexOf(v) === i);
    let orgWithRemarks = []; 
    if (uniqueOrgIds.length > 0) {
      const orgsRes = await api.getOrg({ ids: uniqueOrgIds });
      const { data: orgs } = orgsRes.data;
      orgWithRemarks = orgs.map(m => {
        const orgRemarks = remarks.filter(f => f.org === m.id);
        return { ...m, remarks: orgRemarks };
      });
    }
    this.setState({ orgRemarks: orgWithRemarks });
  }

  getOrgBd = async () => {
    const manager = getCurrentUser();
    const stimeM = this.startDate;
    const etimeM = this.endDate;
    const page_size = 1000;
    const params = { manager, stimeM, etimeM, page_size };
    const res = await api.getOrgBdList(params);
    const { data: orgBds } = res.data;
    const projs = orgBds.map(m => m.proj);
    const projIds = projs.map(m => m.id);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    const projOrgBds = uniqueProjIds.map(m => {
      const proj = projs.filter(f => f.id === m)[0];
      const bds = orgBds.filter(f => f.proj.id === m);
      return { proj, orgBds: bds };
    });
    this.setState({ projOrgBds });
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

  addNewProjFormItem = () => {
    ppid2++;
    const { form } = this.props;
    const keys = form.getFieldValue('newproject_keys');
    const nextKeys = keys.concat(ppid2);
    form.setFieldsValue({
      newproject_keys: nextKeys,
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
                <BasicFormItem name={`neworgbd_${i}_org_${i1}`} layout valueType="number">
                  <SelectExistOrganization />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>投资人：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`neworgbd_${i}_bduser_${i1}`} valueType="number" layout>
                  <SelectOrgInvestor
                    allStatus
                    onjob
                    style={{ width: "100%" }}
                    type="investor"
                    mode="single"
                    optionFilterProp="children"
                    org={getFieldValue(`neworgbd_${i}_org_${i1}`)}
                  />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>状态：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`neworgbd_${i}_bdstatus_${i1}`} valueType="number" layout>
                  <SelectNewBDStatus />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>备注：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`neworgbd_${i}_comments_${i1}`} layout>
                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="备注" />
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
            <BasicFormItem name={`newproj_${i}`} valueType="number" layout>
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
                      <BasicFormItem name={`newreport_${i}_thisplan`} layout>
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
                <BasicFormItem name={`newreport_${i}_nextplan`} layout>
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

    getFieldDecorator('newproject_keys', { initialValue: [] });
    const newProjKeys = getFieldValue('newproject_keys');
    const newProjFormItems = newProjKeys.map((m, i) => {

      return (<div key={m}>
        <hr style={{ borderTop: '2px dashed #ccc' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>

          <div style={{ width: 200 }}>
            <BasicFormItem name={`newproj_${i}`} layout>
              <Input placeholder="项目名称" />
            </BasicFormItem>
          </div>

          <div style={{ flex: 1 }}>
            <div>

              <div style={{ lineHeight: 3 }}>
                <span style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold' }}>本周工作</span>
              </div>

              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>
                    <div>其他：</div>
                    <div style={{ flex: 1 }}>
                      <BasicFormItem name={`newreport_${i}_thisplan`} layout>
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
                <BasicFormItem name={`newreport_${i}_nextplan`} layout>
                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="下周与项目相关的工作计划" />
                </BasicFormItem>
              </div>
            </div>

          </div>

          <div style={{ width: 100, textAlign: 'center' }}>
            <img onClick={() => this.removeFormItem('newproject_keys', m)} style={{ width: 16, curso: 'pointer' }} src="/images/delete.png" />
          </div>

        </div>
      </div>);
    });

    const projExistingOrgBds = this.state.projOrgBds.map((m, i) => {

      const newOrgBdKey = `proj_existing_${i}`;
      getFieldDecorator(newOrgBdKey, { initialValue: [] });
      const proj1OrgBDKeys = getFieldValue(newOrgBdKey);
      const proj1OrgBDFormItems = proj1OrgBDKeys.map((m1, i1) => (
        <div key={m1} style={{ display: 'flex' }}>

          <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>机构：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_org_${i1}`} layout valueType="number">
                  <SelectExistOrganization />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>投资人：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_bduser_${i1}`} valueType="number" layout>
                  <SelectOrgInvestor
                    allStatus
                    onjob
                    style={{ width: "100%" }}
                    type="investor"
                    mode="single"
                    optionFilterProp="children"
                    org={getFieldValue(`orgbd_${m.proj.id}_org_${i1}`)}
                  />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>状态：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_bdstatus_${i1}`} valueType="number" layout>
                  <SelectNewBDStatus />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>备注：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_comments_${i1}`} layout>
                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="备注" />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ width: 50, textAlign: 'center' }}>
            <img onClick={() => this.removeFormItem(newOrgBdKey, m1)} style={{ width: 16, curso: 'pointer' }} src="/images/delete.png" />
          </div>

        </div>
      ));

      return (
        <div key={m.proj.id}>

          {i !== 0 && <hr style={{ borderTop: '2px dashed #ccc' }} />}

          <div style={{ display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200 }}>{m.proj.projtitle}</div>

            <div style={{ flex: 1 }}>
              <div>
                <div style={{ lineHeight: 3 }}>
                  <span style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold' }}>本周工作</span>
                  <span onClick={() => this.addProjOrgBdFormItem(newOrgBdKey)} style={{ marginLeft: 10, fontWeight: 'normal', color: '#10458F', cursor: 'pointer' }}>添加机构BD</span>
                </div>

                {m.orgBds.map(m => {
                  return (
                    <div key={m.id} style={{ display: 'flex' }}>

                      <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <div>机构：</div>
                          <div style={{ flex: 1 }}>{m.org ? m.org.orgname : '暂无'}</div>
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <div>投资人：</div>
                          <div style={{ flex: 1 }}>{m.username}</div>
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <div>状态：</div>
                          <div style={{ flex: 1 }}>
                            {m.response && this.props.orgbdres.length > 0 ? this.props.orgbdres.filter(f => f.id === m.response)[0].name : '暂无'}
                          </div>
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <div>备注：</div>
                          <div style={{ flex: 1 }}>
                            {m.BDComments ? m.BDComments.map(m => m.comments).join('；') : '暂无'}
                          </div>
                        </div>
                      </div>

                    </div>
                  )
                })}

                {proj1OrgBDFormItems}

                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>
                      <div>其他：</div>
                      <div style={{ flex: 1 }}>
                        <BasicFormItem name={`existingproj_${m.proj.id}_thisplan`} layout>
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
                  <BasicFormItem name={`existingproj_${m.proj.id}_nextplan`} layout>
                    <Input.TextArea autosize={{ minRows: 4 }} placeholder="下周与项目相关的工作计划" />
                  </BasicFormItem>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
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
            <div style={{ color: '#10458F', textDecoration: 'underline', cursor: 'pointer' }}>
              <span onClick={this.addProjFormItem}>添加已有项目</span>
              <span onClick={this.addNewProjFormItem} style={{ marginLeft: 10 }}>添加新项目</span>
            </div>
          </div>

          {projExistingOrgBds}
          {projFormItems}
          {newProjFormItems}

        </div>

        <div style={{ marginBottom: 40 }}>

          <div style={{ padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>投资机构日常沟通汇报</div>
            <div style={{ color: '#10458F', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.addOrgFormItem}>添加机构</div>
          </div>

          {this.state.orgRemarks.map((m, i) => (
            <div key={m.id}>

              {i !== 0 && <hr style={{ borderTop: '2px dashed #ccc' }} />}

              <div key={m.id} style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>

                <div style={{ width: 200, paddingLeft: 8 }}>{m.orgname}</div>

                <div style={{ flex: 1, marginLeft: 40 }}>
                  {m.remarks.map(m => (
                    <div key={m.id} style={{ display: 'flex' }}>
                      <div style={{ width: 20, fontSize: 16 }}>•</div>
                      <div style={{ flex: 1 }}>{m.remark}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 20, fontSize: 16 }}>•</div>
                    <div style={{ flex: 1 }}>
                      <BasicFormItem name={`org_existing_${m.id}`} layout>
                        <Input.TextArea autosize={{ minRows: 4 }} placeholder="添加新的机构备注" />
                      </BasicFormItem>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}

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

function mapStateToProps(state) {
  const { orgbdres } = state.app;
  return { orgbdres }
}

export default connect(mapStateToProps)(ReportForm)
