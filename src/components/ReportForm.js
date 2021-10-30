import React from 'react'
import PropTypes from 'prop-types'
import { i18n, getCurrentUser, hasPerm, handleError, requestAllData } from '../utils/util'
import { connect } from 'dva'
import { Link } from 'dva/router'
import styles from './ProjectForm.css'
import moment from 'moment';
import { Form, Input, Radio, Checkbox, DatePicker, Button, message, Modal, Icon } from 'antd'
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
  SelectExistOrganizationWithID,
  SelectNewBDStatus,
  SelectOrgInvestor,
} from './ExtraInput'
import _ from 'lodash';

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
let summaryFormItemId = 0;
class ReportForm extends React.Component {

  constructor(props) {
    super(props)

    const [ start, end ] = this.props.time;
    this.startDate = `${start.format('YYYY-MM-DD')}T00:00:00`;
    this.endDate = `${end.format('YYYY-MM-DD')}T23:59:59`;

    this.state = {
      orgRemarks: [],
      projOrgBds: [],
    };
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

    // const params = { createuser, stimeM, etimeM, stime, etime, page_size };
    // const resRemark = await api.getOrgRemark(params);
    // let { data: remarks } = resRemark.data;

    const params1 = { createuser, stimeM, etimeM, page_size };
    const params2 = { createuser, stime, etime, page_size };
    const res = await Promise.all([
      requestAllData(api.getOrgRemark, params1, 1000),
      requestAllData(api.getOrgRemark, params2, 1000),
    ]);
    const allOrgRemarks = res.reduce((pre, cur) => pre.concat(cur.data.data), []);
    let remarks =  _.uniqBy(allOrgRemarks, 'id');

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

    const params1 = { manager, stimeM, etimeM, page_size };
    const params2 = { manager, stime, etime, page_size };
    const res = await Promise.all([
      requestAllData(api.getOrgBdList, params1, 1000),
      requestAllData(api.getOrgBdList, params2, 1000),
    ]);
    const allOrgBds = res.reduce((pre, cur) => pre.concat(cur.data.data), []);
    const orgBds =  _.uniqBy(allOrgBds, 'id');

    const { setFieldsValue } = this.props.forwardedRef.current;
    orgBds.forEach(element => {
      const { id, response, BDComments, material } = element;
      setFieldsValue({ [`oldorgbd-bdstatus_${id}`]: { response, material } });
      if (BDComments) {
        BDComments.forEach(element => {
          const { id: commentId, comments } = element;
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
    const { current: form } = this.props.forwardedRef;
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

  addSummaryFormItem = () => {
    summaryFormItemId++;
    const { current: form } = this.props.forwardedRef;
    const keys = form.getFieldValue('market_keys');
    const nextKeys = keys.concat(summaryFormItemId);
    form.setFieldsValue({
      market_keys: nextKeys,
    });
    setTimeout(() => {
      document.getElementById(`summary-form-items-${summaryFormItemId}`).scrollIntoView();
    }, 100);
  }

  removeFormItem = (key, value) => {
    const { current: form } = this.props.forwardedRef;
    const keyValues = form.getFieldValue(key);
    const body = {};
    body[key] = keyValues.filter(k => k !== value);
    form.setFieldsValue(body);
  }

  addProjFormItem = () => {
    ppid++;
    const { current: form } = this.props.forwardedRef;
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
    const { current: form } = this.props.forwardedRef;
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
    const { current: form } = this.props.forwardedRef;
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
    this.props.forwardedRef.current.validateFields().then(values => {
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
              const { setFieldsValue } = this.props.forwardedRef.current;
              const { id, response, BDComments, material } = newOrgBd;
              setFieldsValue({ [`oldorgbd-bdstatus_${id}`]: { response, material } });
              if (BDComments) {
                BDComments.forEach(element => {
                  const { id: commentId, comments } = element;
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
    this.props.forwardedRef.current.validateFields().then(values => {
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
      const bdstatus = values[`neworgbd_${projIndex}_bdstatus_${orgBdIndex}`].response;
      const material = values[`neworgbd_${projIndex}_bdstatus_${orgBdIndex}`].material;
      const comments = values[`neworgbd_${projIndex}_comments_${orgBdIndex}`];
      const orgbd = { bduser, org, proj: projId, bdstatus, material, comments };
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
          const { setFieldsValue } = this.props.forwardedRef.current;
          const { id, response, BDComments, material } = newOrgBd;
          setFieldsValue({ [`oldorgbd-bdstatus_${id}`]: { response, material } });
          if (BDComments) {
            BDComments.forEach(element => {
              const { id: commentId, comments } = element;
              setFieldsValue({ [`oldorgbd-comments_${id}_${commentId}`]: comments });
            });
          }
        })
        .then(() => this.removeFormItem(`proj_keys_orgbd_${projIndex}`, orgBdIndex))
        .catch(handleError);
    });
  }

  handleConfirmAddOrgBdBtnClick = (projId, index) => {
    this.props.forwardedRef.current.validateFields().then(values => {
      const org = values[`orgbd_${projId}_org_${index}`];
      const bduser = values[`orgbd_${projId}_bduser_${index}`];
      if (!org || !bduser) {
        Modal.warning({ title: '机构和投资人不能为空' });
        return;
      }
      const bdstatus = values[`orgbd_${projId}_bdstatus_${index}`].response;
      const material = values[`orgbd_${projId}_bdstatus_${index}`].material;
      const comments = values[`orgbd_${projId}_comments_${index}`];
      const orgbd = { bduser, org, proj: projId, bdstatus, material, comments };
      this.addOrgBd(orgbd)
        .then(newOrgBd => {
          const projIds = this.state.projOrgBds.map(m => m.proj.id);
          const projIndex = projIds.indexOf(newOrgBd.proj.id);
          if (projIndex > -1) {
            const newProjOrgBds = [...this.state.projOrgBds];
            newProjOrgBds[projIndex].orgBds.push(newOrgBd);
            this.setState({ projOrgBds: newProjOrgBds });

            // Set form data
            const { setFieldsValue } = this.props.forwardedRef.current;
            const { id, response, BDComments, material } = newOrgBd;
            setFieldsValue({ [`oldorgbd-bdstatus_${id}`]: { response, material } });
            if (BDComments) {
              BDComments.forEach(element => {
                const { id: commentId, comments } = element;
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
      const { bduser, org, proj, bdstatus: response, material, comments } = element;
      const body = {
        bduser,
        org,
        proj,
        response,
        material,
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
            res = await api.modifyOrgBD(orgBd.id, { response, lastmodifytime: this.startDate, createdtime: this.startDate });
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
      title: '是否确定删除该机构看板',
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

  handleDeleteCommentBtnClick = (orgBdId, commentId) => {
    Modal.confirm({
      title: '是否确定删除该机构看板备注',
      content: '一旦确定，无法撤回',
      onOk: this.handleConfirmDeleteComment.bind(this, orgBdId, commentId),
    });
  }

  handleConfirmDeleteComment = async (orgBdId, commentId) => {
    try {
      await api.deleteOrgBDComment(commentId);
      let projIndex = -1;
      let orgBdIndex = -1;
      let commentIndex = -1;
      this.state.projOrgBds.forEach((e, i) => {
        const orgBdIds = e.orgBds.map(m => m.id);
        const index = orgBdIds.indexOf(orgBdId);
        if (index > -1) {
          projIndex = i;
          orgBdIndex = index;
          const orgBdCommentsIds = e.orgBds[orgBdIndex].BDComments.map(m => m.id);
          const comIndex = orgBdCommentsIds.indexOf(commentId);
          if (comIndex > -1) {
            commentIndex = comIndex;
          }
        }
      });
      if (projIndex > -1 && orgBdIndex > -1 && commentIndex > -1) {
        const newProjOrgBds = [...this.state.projOrgBds];
        newProjOrgBds[projIndex].orgBds[orgBdIndex].BDComments.splice(commentIndex, 1);
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
    const newBdStatus = values[`oldorgbd-bdstatus_${orgBdId}`].response;
    const material = values[`oldorgbd-bdstatus_${orgBdId}`].material;
    const orgBdRes = await api.modifyOrgBD(orgBdId, { response: newBdStatus, material });
    const { data: updatedOrgBd } = orgBdRes;
    const comments = this.getOldOrgBdComments(values, orgBdId);
    const bdComments = await this.updateOrgBdComments(comments);
    updatedOrgBd.BDComments = bdComments;
    message.success('机构看板已更新');
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

  handleFormValuesChange = (changedValues, allValues) => {
    window.echo('changed value', changedValues);
    window.echo('all values', allValues);
  }

  render() {
    const orgFormItems = (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const orgKeys = getFieldValue('org_keys');
          return orgKeys.map(m => (
            <div key={m} id={`org-form-items-${m}`}>
              <hr style={{ borderTop: '2px dashed #ccc' }} />
              <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 200 }}>
                  <BasicFormItem name={`org_new_org_${m}`} layout valueType="number">
                    <SelectExistOrganizationWithID placeholder="选择机构" />
                  </BasicFormItem>
                </div>
                <div style={{ flex: 1, marginLeft: 40 }}>
                  <BasicFormItem name={`org_new_remark_${m}`} layout>
                    <Input.TextArea autosize={{ minRows: 4 }} placeholder="机构备注" />
                  </BasicFormItem>
                </div>
                <div style={{ width: 100, textAlign: 'center' }}>
                  <img onClick={() => this.removeFormItem('org_keys', m)} style={{ width: 16, cursor: 'pointer' }} src="/images/delete.png" />
                </div>
              </div>
            </div>
          ));
        }}
      </Form.Item>
    );

    const summaryFormItems = (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const summaryKeys = getFieldValue('market_keys');
          return summaryKeys.map((m, i) => (
            <div key={m} id={`summary-form-items-${m}`}>
              {i !== 0 && <hr style={{ borderTop: '2px dashed #ccc' }} />}
              <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, marginLeft: 40 }}>
                  <BasicFormItem name={`summary_${m}`} layout>
                    <Input.TextArea autosize={{ minRows: 6 }} placeholder="市场信息和项目信息汇报" />
                  </BasicFormItem>
                </div>
                <div style={{ width: 100, textAlign: 'center' }}>
                  <img onClick={() => this.removeFormItem('market_keys', m)} style={{ width: 16, cursor: 'pointer' }} src="/images/delete.png" />
                </div>
              </div>
            </div>
          ));
        }}
      </Form.Item>
    );

    const projFormItems = (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const projKeys = getFieldValue('proj_keys');
          return projKeys.map((m, i) => {
            const orgBDKeys = `proj_keys_orgbd_${m}`;

            const orgBdFormItems = (
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const projOrgBDKeys = getFieldValue(orgBDKeys);
                  return projOrgBDKeys.map((m1, i) => (
                    <div key={m1} style={{ display: 'flex' }}>

                      <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <div>机构：</div>
                          <div style={{ flex: 1 }}>
                            <BasicFormItem name={`neworgbd_${m}_org_${m1}`} layout valueType="number">
                              <SelectExistOrganizationWithID />
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
                            <BasicFormItem name={`neworgbd_${m}_bdstatus_${m1}`} valueType="object" layout>
                              <SelectNewBDStatus size="large" />
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
                }}
              </Form.Item>
            );

            return (
              <div key={m} id={`project-form-items-${m}`}>
                <Form.Item
                  name={orgBDKeys}
                  initialValue={[]}
                  hidden
                >
                  <Input />
                </Form.Item>

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
                        <span onClick={() => this.addProjOrgBdFormItem(orgBDKeys)} style={{ marginLeft: 10, fontWeight: 'normal', color: '#10458F', cursor: 'pointer' }}>添加机构看板</span>
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
              </div>
            );

          });
        }}
      </Form.Item>
    );

    const newProjFormItems = (
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const newProjKeys = getFieldValue('textproject_keys');
          return newProjKeys.map((m, i) => {
            return (
              <div key={m} id={`textproject-form-items-${m}`}>
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
              </div>
            );
          });
        }}
      </Form.Item>
    );

    const projExistingOrgBds = this.state.projOrgBds.map((m, i) => {

      const newOrgBdKey = `proj_existing_${m.proj.id}`;
      const proj1OrgBDFormItems = (
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const proj1OrgBDKeys = getFieldValue(newOrgBdKey);
            return proj1OrgBDKeys.map((m1, i) => (
              <div key={m1} style={{ display: 'flex' }}>

                <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex' }}>
                    <div>机构：</div>
                    <div style={{ flex: 1 }}>
                      <BasicFormItem name={`orgbd_${m.proj.id}_org_${m1}`} layout valueType="number">
                        <SelectExistOrganizationWithID />
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
                      <BasicFormItem name={`orgbd_${m.proj.id}_bdstatus_${m1}`} valueType="object" layout>
                        <SelectNewBDStatus size="large" />
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
          }}
        </Form.Item>
      );

      return (
        <div key={m.proj.id}>

          <Form.Item
            name={newOrgBdKey}
            initialValue={[]}
            hidden
          >
            <Input />
          </Form.Item>

          {i !== 0 && <hr style={{ borderTop: '2px dashed #ccc' }} />}

          <div style={{ display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200 }}>{m.proj.projtitle}</div>

            <div style={{ flex: 1 }}>
              <div>
                <div style={{ lineHeight: 3 }}>
                  <span style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold' }}>本周工作</span>
                  <span onClick={() => this.addProjOrgBdFormItem(newOrgBdKey)} style={{ marginLeft: 10, fontWeight: 'normal', color: '#10458F', cursor: 'pointer' }}>添加机构看板</span>
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
                            <BasicFormItem name={`oldorgbd-bdstatus_${m.id}`} valueType="object" layout>
                              <SelectNewBDStatus size="large" />
                            </BasicFormItem>
                          </div>
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <div>备注：</div>
                          <div style={{ flex: 1 }}>
                            {m.BDComments && m.BDComments.length > 0 ? m.BDComments.map(m1 => (
                              <div key={m1.id} style={{ display: 'flex', alignItems: 'center' }}>
                                <BasicFormItem name={`oldorgbd-comments_${m.id}_${m1.id}`} layout>
                                  <Input.TextArea autosize={{ minRows: 4 }} placeholder="备注" />
                                </BasicFormItem>
                                <Icon style={{ marginLeft: 4, cursor: 'pointer' }} onClick={() => this.handleDeleteCommentBtnClick(m.id, m1.id)} type="delete" />
                              </div>
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
      <Form ref={this.props.forwardedRef} onValuesChange={this.handleFormValuesChange}>

        <Form.Item
          name="org_keys"
          initialValue={[]}
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="market_keys"
          initialValue={[]}
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="proj_keys"
          initialValue={[]}
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="textproject_keys"
          initialValue={[]}
          hidden
        >
          <Input />
        </Form.Item>


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
            <div style={{ color: '#10458F', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.addSummaryFormItem}>添加市场信息和项目信息</div>
          </div>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              if (getFieldValue('summary')) {
                return (
                  <BasicFormItem name="summary" layout>
                    <Input.TextArea autosize={{ minRows: 6 }} placeholder="其他事项/工作建议（如果有）" />
                  </BasicFormItem>
                );
              }
            }}
          </Form.Item>

          {summaryFormItems}
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

const ConnectedReportForm = connect(mapStateToProps)(ReportForm);
export default React.forwardRef((props, ref) => <ConnectedReportForm {...props} forwardedRef={ref} />);
