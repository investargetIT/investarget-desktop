import React from 'react'
import PropTypes from 'prop-types'
import { i18n, getCurrentUser, hasPerm, handleError} from '../utils/util'
import { connect } from 'dva'
import { Link } from 'dva/router'
import styles from './ProjectForm.css'
import moment from 'moment';
import { Form, Input, Radio, Checkbox, DatePicker, Button, message, Modal } from 'antd'
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
let uuid2 = 0;
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
    const stime = this.startDate;
    const etime = this.endDate;
    const stimeM = this.startDate;
    const etimeM = this.endDate;
    const page_size = 1000;
    const params = { createuser, stimeM, etimeM, stime, etime, page_size };
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
    const stime = this.startDate;
    const etime = this.endDate;
    const stimeM = this.startDate;
    const etimeM = this.endDate;
    const page_size = 1000;
    const params = { manager, stimeM, etimeM, stime, etime, page_size };
    const res = await api.getOrgBdList(params);
    const { data: orgBds } = res.data;

    const { getFieldDecorator, setFieldsValue } = this.props.form;
    orgBds.forEach(element => {
      const { id, response, BDComments } = element;
      getFieldDecorator(`oldorgbd-bdstatus_${id}`, { initialValue: undefined });
      setFieldsValue({ [`oldorgbd-bdstatus_${id}`] : response });
      if (BDComments) {
        BDComments.forEach(element => {
          const { id: commentId, comments } = element;
          getFieldDecorator(`oldorgbd-comments_${id}_${commentId}`, { initialValue: ''});
          setFieldsValue({ [`oldorgbd-comments_${id}_${commentId}`]: comments });
        });
      }
    });

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
    setTimeout(() => {
      document.getElementById(`org-form-items-${uuid}`).scrollIntoView();
    }, 100);
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
    setTimeout(() => {
      document.getElementById(`project-form-items-${ppid}`).scrollIntoView();
    }, 100);
  }

  addNewProjFormItem = () => {
    ppid2++;
    const { form } = this.props;
    const keys = form.getFieldValue('textproject_keys');
    const nextKeys = keys.concat(ppid2);
    form.setFieldsValue({
      textproject_keys: nextKeys,
    });
    setTimeout(() => {
      document.getElementById(`textproject-form-items-${ppid2}`).scrollIntoView();
    }, 100);
  }

  addProjOrgBdFormItem = (key) => {
    uuid2++;
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue(key);
    const nextKeys = keys.concat(uuid2);
    // can use data-binding to set
    // important! notify form to detect changes
    const obj = {};
    obj[key] = nextKeys;
    form.setFieldsValue(obj);
  }

  handleConfirmBtnClick = orgBdId => {
    this.props.form.validateFields((err, values) => {
      this.updateOrgBd(values, orgBdId)
        .then(newOrgBd => {
          const projIds = this.state.projOrgBds.map(m => m.proj.id);
          const projIndex = projIds.indexOf(newOrgBd.proj.id);
          if (projIndex > -1) {
            const newProjOrgBds = [...this.state.projOrgBds];
            const orgBdIndex = newProjOrgBds[projIndex].orgBds.map(m => m.id).indexOf(newOrgBd.id);
            if (orgBdIndex > -1) {
              newProjOrgBds[projIndex].orgBds[orgBdIndex] = newOrgBd;
              this.setState({ projOrgBds: newProjOrgBds });

              // Set form data
              const { getFieldDecorator, setFieldsValue } = this.props.form;
              const { id, response, BDComments } = newOrgBd;
              getFieldDecorator(`oldorgbd-bdstatus_${id}`, { initialValue: undefined });
              setFieldsValue({ [`oldorgbd-bdstatus_${id}`]: response });
              if (BDComments) {
                BDComments.forEach(element => {
                  const { id: commentId, comments } = element;
                  getFieldDecorator(`oldorgbd-comments_${id}_${commentId}`, { initialValue: '' });
                  setFieldsValue({ [`oldorgbd-comments_${id}_${commentId}`]: comments });
                });
              }
            }
          }
        })
        .catch(handleError);
    });
  }

  handleConfirmAddNewOrgBdFBtnClick = (projIndex, orgBdIndex) => {
    this.props.form.validateFields((err, values) => {
      const projId = values[`newproj_${projIndex}`];
      if (!projId) {
        Modal.warning({ title: '项目不能为空' });
        return;
      }
      const org = values[`neworgbd_${projIndex}_org_${orgBdIndex}`];
      const bduser = values[`neworgbd_${projIndex}_bduser_${orgBdIndex}`];
      if (!org || !bduser) {
        Modal.warning({ title: '机构和投资人不能为空' });
        return;
      }
      const bdstatus = values[`neworgbd_${projIndex}_bdstatus_${orgBdIndex}`];
      const comments = values[`neworgbd_${projIndex}_comments_${orgBdIndex}`];
      const orgbd = { bduser, org, proj: projId, bdstatus, comments };
      this.addOrgBd(orgbd)
        .then(newOrgBd => {
          const projIds = this.state.projOrgBds.map(m => m.proj.id);
          const projIndex1 = projIds.indexOf(newOrgBd.proj.id);
          if (projIndex1 > -1) {
            const newProjOrgBds = [...this.state.projOrgBds];
            newProjOrgBds[projIndex1].orgBds.push(newOrgBd);
            this.setState({ projOrgBds: newProjOrgBds });
          } else {
            const { proj } = newOrgBd;
            const newProjOrgBds = [...this.state.projOrgBds];
            newProjOrgBds.push({ proj, orgBds: [newOrgBd] });
            this.setState({ projOrgBds: newProjOrgBds });
          }
          // Set form data
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          const { id, response, BDComments } = newOrgBd;
          getFieldDecorator(`oldorgbd-bdstatus_${id}`, { initialValue: undefined });
          setFieldsValue({ [`oldorgbd-bdstatus_${id}`]: response });
          if (BDComments) {
            BDComments.forEach(element => {
              const { id: commentId, comments } = element;
              getFieldDecorator(`oldorgbd-comments_${id}_${commentId}`, { initialValue: '' });
              setFieldsValue({ [`oldorgbd-comments_${id}_${commentId}`]: comments });
            });
          }
        })
        .then(() => this.removeFormItem(`proj_keys_orgbd_${projIndex}`, orgBdIndex))
        .catch(handleError);
    });
  }

  handleConfirmAddOrgBdBtnClick = (projId, index) => {
    this.props.form.validateFields((err, values) => {
      const org = values[`orgbd_${projId}_org_${index}`];
      const bduser = values[`orgbd_${projId}_bduser_${index}`];
      if (!org || !bduser) {
        Modal.warning({ title: '机构和投资人不能为空' });
        return;
      }
      const bdstatus = values[`orgbd_${projId}_bdstatus_${index}`];
      const comments = values[`orgbd_${projId}_comments_${index}`];
      const orgbd = { bduser, org, proj: projId, bdstatus, comments };
      this.addOrgBd(orgbd)
        .then(newOrgBd => {
          const projIds = this.state.projOrgBds.map(m => m.proj.id);
          const projIndex = projIds.indexOf(newOrgBd.proj.id);
          if (projIndex > -1) {
            const newProjOrgBds = [...this.state.projOrgBds];
            newProjOrgBds[projIndex].orgBds.push(newOrgBd);
            this.setState({ projOrgBds: newProjOrgBds });

            // Set form data
            const { getFieldDecorator, setFieldsValue } = this.props.form;
            const { id, response, BDComments } = newOrgBd;
            getFieldDecorator(`oldorgbd-bdstatus_${id}`, { initialValue: undefined });
            setFieldsValue({ [`oldorgbd-bdstatus_${id}`]: response });
            if (BDComments) {
              BDComments.forEach(element => {
                const { id: commentId, comments } = element;
                getFieldDecorator(`oldorgbd-comments_${id}_${commentId}`, { initialValue: '' });
                setFieldsValue({ [`oldorgbd-comments_${id}_${commentId}`]: comments });
              });
            }
          }
        })
        .then(() => this.removeFormItem(`proj_existing_${projId}`, index))
        .catch(handleError);
    });
  }

  addOrgBd = async element => {
      const { bduser, org, proj, bdstatus: response, comments } = element;
      const body = {
        bduser,
        org,
        proj,
        response,
        manager: getCurrentUser(),
        lastmodifytime: this.startDate,
        createdtime: this.startDate,
      };
      await api.getUserSession();

      let res = null;
      try {
        res = await api.addOrgBD(body);
      } catch (error) {
        if (error.code === 5006) {
          const getOrgBdRes = await api.getOrgBdList({
            bduser,
            org,
            proj,
            manager: getCurrentUser(),
          });
          window.echo('get org bd res', getOrgBdRes);
          const { data: orgBdList } = getOrgBdRes.data;
          if (orgBdList.length > 0) {
            const orgBd = orgBdList[0];
            res = await api.modifyOrgBD(orgBd.id, { response });
            window.echo('update org bd', res);
          } else {
            console.error('OrgBd Not Found!');
          }
        } else {
          throw error;
        }
      }
      const { data: newOrgBd } = res;
      const { id: orgBD, BDComments } = newOrgBd;
      window.echo('bd comments', BDComments);
      if (comments && comments.length > 0) {
        const resCom = await api.addOrgBDComment({ orgBD, comments });
        if (BDComments) {
          newOrgBd.BDComments = [resCom.data].concat(BDComments);
        } else {
          newOrgBd.BDComments = [resCom.data];
        }
      }
      return newOrgBd;
  }

  handleDeleteBtnClick = orgBdId => {
    Modal.confirm({
      title: '是否确定删除该机构BD',
      content: '一旦确定，无法撤回',
      onOk: this.handleConfirmRemoveOrgBd.bind(this, orgBdId),
    });
  }

  handleConfirmRemoveOrgBd = async orgBdId => {
    try {
      await api.deleteOrgBD(orgBdId);
      let projIndex = -1;
      let orgBdIndex = -1;
      this.state.projOrgBds.forEach((e, i) => {
        const orgBdIds = e.orgBds.map(m => m.id);
        const index = orgBdIds.indexOf(orgBdId);
        if (index > -1) {
          projIndex = i;
          orgBdIndex = index;
        }
      });
      if (projIndex > -1 && orgBdIndex > -1) {
        const newProjOrgBds = [...this.state.projOrgBds];
        newProjOrgBds[projIndex].orgBds.splice(orgBdIndex, 1);
        this.setState({ projOrgBds: newProjOrgBds });
      }
    } catch (err) {
      handleError(err);
    }
  }

  updateOrgBdComments = async data => {
    const result = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const { id, comments, orgBD } = element;
      if (id !== 0) {
        const updateCommentRes = await api.editOrgBDComment(id, { comments });
        result.push(updateCommentRes.data);
      } else {
        if (comments) {
          const newCommentRes = await api.addOrgBDComment({ orgBD, comments });
          result.push(newCommentRes.data);
        }
      }
    }
    return result;
  }

  updateOrgBd = async (values, orgBdId) => {
    const newBdStatus = values[`oldorgbd-bdstatus_${orgBdId}`];
    const orgBdRes = await api.modifyOrgBD(orgBdId, { response: newBdStatus });
    const { data: updatedOrgBd } = orgBdRes;
    const comments = this.getOldOrgBdComments(values, orgBdId);
    const bdComments = await this.updateOrgBdComments(comments);
    updatedOrgBd.BDComments = bdComments;
    message.success('机构BD已更新');
    return updatedOrgBd;
  }

  getOldOrgBdComments = (values, orgBdId) => {
    const result = [];
    for (const property in values) {
      if (property.startsWith(`oldorgbd-comments_${orgBdId}`)) {
        const value = values[property];
        const infos = property.split('_');
        const commentId = infos[2];
        const o = { id: parseInt(commentId), comments: value, orgBD: orgBdId };
        result.push(o);
      }
    }
    return result;
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

    getFieldDecorator('org_keys', { initialValue: [] });
    const orgKeys = getFieldValue('org_keys');
    const orgFormItems = orgKeys.map(m => (
      <div key={m} id={`org-form-items-${m}`}>
        <hr style={{ borderTop: '2px dashed #ccc' }} />
        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>

          <div style={{ width: 200 }}>
            <BasicFormItem name={`org_new_org_${m}`} layout valueType="number">
              <SelectExistOrganization placeholder="选择机构" />
            </BasicFormItem>
          </div>

          <div style={{ flex: 1, marginLeft: 40 }}>
            <BasicFormItem name={`org_new_remark_${m}`} layout>
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
      const orgBDKeys = `proj_keys_orgbd_${m}`;
      getFieldDecorator(orgBDKeys, { initialValue: [] });
      const projOrgBDKeys = getFieldValue(orgBDKeys);
      const orgBdFormItems = projOrgBDKeys.map((m1, i1) => (
        <div key={m1} style={{ display: 'flex' }}>

          <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>机构：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`neworgbd_${m}_org_${m1}`} layout valueType="number">
                  <SelectExistOrganization />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>投资人：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`neworgbd_${m}_bduser_${m1}`} valueType="number" layout>
                  <SelectOrgInvestor
                    allStatus
                    onjob
                    style={{ width: "100%" }}
                    type="investor"
                    mode="single"
                    optionFilterProp="children"
                    org={getFieldValue(`neworgbd_${m}_org_${m1}`)}
                  />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>状态：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`neworgbd_${m}_bdstatus_${m1}`} valueType="number" layout>
                  <SelectNewBDStatus />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>备注：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`neworgbd_${m}_comments_${m1}`} layout>
                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="备注" />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <Button
            style={{ margin: '0 10px' }}
            size="small"
            onClick={() => this.handleConfirmAddNewOrgBdFBtnClick(m, m1)}
          >
            确定
          </Button>

          <div style={{ width: 50, textAlign: 'center' }}>
            <img onClick={() => this.removeFormItem(orgBDKeys, m1)} style={{ width: 16, curso: 'pointer' }} src="/images/delete.png" />
          </div>

        </div>
      ));

      return (<div key={m} id={`project-form-items-${m}`}>
        <hr style={{ borderTop: '2px dashed #ccc' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>

          <div style={{ width: 200 }}>
            <BasicFormItem name={`newproj_${m}`} valueType="number" layout>
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
                      <BasicFormItem name={`newreport_${m}_thisplan`} layout>
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
                <BasicFormItem name={`newreport_${m}_nextplan`} layout>
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

    getFieldDecorator('textproject_keys', { initialValue: [] });
    const newProjKeys = getFieldValue('textproject_keys');
    const newProjFormItems = newProjKeys.map((m, i) => {

      return (<div key={m} id={`textproject-form-items-${m}`}>
        <hr style={{ borderTop: '2px dashed #ccc' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>

          <div style={{ width: 200 }}>
            <BasicFormItem name={`text_project_${m}`} layout>
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
                      <BasicFormItem name={`newproject_${m}_thisplan`} layout>
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
                <BasicFormItem name={`newproject_${m}_nextplan`} layout>
                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="下周与项目相关的工作计划" />
                </BasicFormItem>
              </div>
            </div>

          </div>

          <div style={{ width: 100, textAlign: 'center' }}>
            <img onClick={() => this.removeFormItem('textproject_keys', m)} style={{ width: 16, curso: 'pointer' }} src="/images/delete.png" />
          </div>

        </div>
      </div>);
    });

    const projExistingOrgBds = this.state.projOrgBds.map((m, i) => {

      const newOrgBdKey = `proj_existing_${m.proj.id}`;
      getFieldDecorator(newOrgBdKey, { initialValue: [] });
      const proj1OrgBDKeys = getFieldValue(newOrgBdKey);
      const proj1OrgBDFormItems = proj1OrgBDKeys.map((m1, i1) => (
        <div key={m1} style={{ display: 'flex' }}>

          <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>机构：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_org_${m1}`} layout valueType="number">
                  <SelectExistOrganization />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>投资人：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_bduser_${m1}`} valueType="number" layout>
                  <SelectOrgInvestor
                    allStatus
                    onjob
                    style={{ width: "100%" }}
                    type="investor"
                    mode="single"
                    optionFilterProp="children"
                    org={getFieldValue(`orgbd_${m.proj.id}_org_${m1}`)}
                  />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>状态：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_bdstatus_${m1}`} valueType="number" layout>
                  <SelectNewBDStatus />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex' }}>
              <div>备注：</div>
              <div style={{ flex: 1 }}>
                <BasicFormItem name={`orgbd_${m.proj.id}_comments_${m1}`} layout>
                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="备注" />
                </BasicFormItem>
              </div>
            </div>
          </div>

          <Button
            style={{ margin: '0 10px' }}
            size="small"
            onClick={() => this.handleConfirmAddOrgBdBtnClick(m.proj.id, m1)}
          >
            确定
          </Button>

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
                            <BasicFormItem name={`oldorgbd-bdstatus_${m.id}`} valueType="number" layout>
                              <SelectNewBDStatus />
                            </BasicFormItem>
                          </div>
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <div>备注：</div>
                          <div style={{ flex: 1 }}>
                            {m.BDComments ? m.BDComments.map(m1 => (
                              <BasicFormItem key={m1.id} name={`oldorgbd-comments_${m.id}_${m1.id}`} layout>
                                <Input.TextArea autosize={{ minRows: 4 }} placeholder="备注" />
                              </BasicFormItem>
                            )) : (
                              <BasicFormItem name={`oldorgbd-comments_${m.id}_0`} layout>
                                <Input.TextArea autosize={{ minRows: 4 }} placeholder="备注" />
                              </BasicFormItem>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        style={{ margin: '0 10px' }}
                        size="small"
                        onClick={() => this.handleConfirmBtnClick(m.id)}
                      >
                        确定
                      </Button>

                      <Button
                        style={{ margin: '0 10px' }}
                        size="small"
                        type="danger"
                        onClick={() => this.handleDeleteBtnClick(m.id)}
                      >
                        删除 
                      </Button>

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
