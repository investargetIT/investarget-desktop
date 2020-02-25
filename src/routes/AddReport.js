import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n, getCurrentUser, handleError } from '../utils/util'
import moment from 'moment';

import { Form, Button, message } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import ReportForm from '../components/ReportForm'


const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


function onValuesChange(props, values) {
  console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const AddReportForm = Form.create({onValuesChange, mapPropsToFields})(ReportForm)


function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && !/industries-image-.*/.test(prop) && prop !== 'industriesKeys' && prop !== 'isAgreed') {
      data[prop] = formData[prop]
    }
  }
  data['industries'] = formData['industriesKeys'].map(key => {
    return {
      industry: formData['industries-' + key],
      bucket: 'image',
      key: formData['industries-image-' + key],
    }
  })
  return data
}


class AddReport extends React.Component {

  constructor(props) {
    super(props)

    const { date } = props.location.query;

    this.initialFormData = {
      time: {
        value: [moment(date).startOf('week'), moment(date).startOf('week').add('days', 6)],
        // value: [moment('2020-02-10'), moment('2020-02-16')],
      }
    };
    this.startTime = null;
    this.endTime = null;
  }

  goBack = () => {
    this.props.router.goBack()
  }

  handleSubmitBtnClick = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        this.addData(values);
      }
    })
  }

  addData = async values => {
    const { time: startEndMoment } = values;
    const [startMoment, endMoment] = startEndMoment;
    const startTime = startMoment.format('YYYY-MM-DDTHH:mm:ss');
    let endTime = endMoment.format('YYYY-MM-DD');
    endTime += 'T23:59:59';
    this.startTime = startTime;
    this.endTime = endTime;

    const existingOrgBd = this.getExistingOrgBdInfo(values);
    const newOrgBd = this.getNewOrgBdInfo(values);
    const allOrgBds = existingOrgBd.concat(newOrgBd);
    await this.addOrgBd(allOrgBds);

    this.updateOrgBds(values);
    
    const existingOrgRemark = this.getExistingOrgRemark(values);
    const newOrgRemark = this.getNewOrgRemark(values);
    const allOrgRemarks = existingOrgRemark.concat(newOrgRemark);
    this.addOrgRemark(allOrgRemarks);

    this.addReport(values).catch(handleError);
  }

  updateOrgBds = (values) => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('oldorgbd')) {
        const infos = property.split('_');
        const id = parseInt(infos[1]);
        result1.push(id);
      }
    }
    const uniqueIds = result1.filter((v, i, a) => a.indexOf(v) === i);
    uniqueIds.forEach(e => {
      this.updateOrgBd(values, e);
    });
  }

  updateOrgBd = async (values, orgBdId) => {
    const newBdStatus = values[`oldorgbd-bdstatus_${orgBdId}`];
    await api.modifyOrgBD(orgBdId, { response: newBdStatus });
    const comments = this.getOldOrgBdComments(values, orgBdId);
    await this.updateOrgBdComments(comments);
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

  updateOrgBdComments = async data => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const { id, comments, orgBD } = element;
      if (id !== 0) {
        await api.editOrgBDComment(id, { comments });
      } else {
        if (comments) {
          await api.addOrgBDComment({ orgBD, comments });
        }
      }
    }
  }

  addReport = async data => {
    const { summary: marketMsg, suggestion: others } = data;
    const body = {
      marketMsg,
      others,
      startTime: this.startTime,
      endTime: this.endTime,
      user: getCurrentUser(),
    };
    const res = await api.addWorkReport(body);
    const { id: reportId } = res.data;

    const existingProjInfo = this.getPlanForExistingProj(data);
    const newProjReportInfo = this.getPlanForNewProj(data);
    const allProjReportInfos = existingProjInfo.concat(newProjReportInfo);
    this.addReportProjInfo(reportId, allProjReportInfos);

    const textProjectInfo = this.getPlanForTextProj(data);
    this.addReportProjInfo(reportId, textProjectInfo);

    this.props.router.replace('/app/report/list');
  }

  addReportProjInfo = (reportId, data) => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      api.addWorkReportProjInfo({ ...element, report: reportId });
    }
  }

  getPlanForTextProj = values => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('newproject')) {
        const value = values[property];
        const infos = property.split('_');
        const projKey = `text_project_${infos[1]}`;
        const projTitle = values[projKey];
        const key = infos[2];
        const o = { projTitle, key, value };
        result1.push(o);
      }
    }

    result1 = result1.filter(f => f.projTitle);
    const projTitles = result1.map(m => m.projTitle);
    const uniqueProjTitles = projTitles.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjTitles.forEach(e => {
      const thisPlan = result1.filter(f => f.projTitle === e && f.key === 'thisplan')[0].value;
      const nextPlan = result1.filter(f => f.projTitle === e && f.key === 'nextplan')[0].value;
      result.push({ projTitle: e, thisPlan, nextPlan });
    });
    return result;
  }

  getPlanForNewProj = values => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('newreport')) {
        const value = values[property];
        const infos = property.split('_');
        const projKey = `newproj_${infos[1]}`;
        const proj = values[projKey];
        const key = infos[2];
        const o = { proj, key, value };
        result1.push(o);
      }
    }

    result1 = result1.filter(f => f.proj);

    const projIds = result1.map(m => m.proj);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjIds.forEach(e => {
      const thisPlan = result1.filter(f => f.proj === e && f.key === 'thisplan')[0].value;
      const nextPlan = result1.filter(f => f.proj === e && f.key === 'nextplan')[0].value;
      result.push({ proj: e, thisPlan, nextPlan });
    })
    return result;
  }

  getPlanForExistingProj = values => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('existingproj')) {
        const value = values[property];
        const infos = property.split('_');
        const proj = parseInt(infos[1]);
        const key = infos[2];
        const o = { proj, key, value };
        result1.push(o);
      }
    }

    const projIds = result1.map(m => m.proj);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjIds.forEach(e => {
      const thisPlan = result1.filter(f => f.proj === e && f.key === 'thisplan')[0].value;
      const nextPlan = result1.filter(f => f.proj === e && f.key === 'nextplan')[0].value;
      result.push({ proj: e, thisPlan, nextPlan });
    })
    return result;
  }

  addOrgRemark = data => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      api.addOrgRemark({ ...element, lastmodifytime: this.startTime, createdtime: this.startTime });
    }
  }

  getNewOrgRemark = values => {
    let result = [];
    for (const property in values) {
      if (property.startsWith('org_new_remark')) {
        const value = values[property];
        const infos = property.split('_');
        const orgIndex = parseInt(infos[3]);
        const orgValueKey = `org_new_org_${orgIndex}`;
        const org = values[orgValueKey];
        const o = { org, remark: value };
        result.push(o);
      }
    }
    result = result.filter(f => f.org && f.remark);
    return result;
  }

  getExistingOrgRemark = values => {
    let result = [];
    for (const property in values) {
      const value = values[property];
      if (property.startsWith('org_existing')) {
        const infos = property.split('_');
        const org = parseInt(infos[2]);
        const o = { org, remark: value };
        result.push(o);
      }
    }
    result = result.filter(f => f.org && f.remark);
    return result;
  }

  addOrgBd = async (data) => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const { bduser, org, proj, bdstatus: response, comments } = element;
      const body = {
        bduser,
        org,
        proj,
        response,
        manager: getCurrentUser(),
        lastmodifytime: this.startTime,
        createdtime: this.startTime,
      };
      try {
        await api.getUserSession();
        const res = await api.addOrgBD(body);
        const { id: orgBD} = res.data;
        if (comments && comments.length > 0) {
          await api.addOrgBDComment({ orgBD, comments });
        }
      } catch (e) {
        handleError(e);
      }
    }
  }

  getExistingOrgBdInfo = values => {
    const orgBdInfos = [];
    for (const property in values) {
      const value = values[property];
      if (property.startsWith('orgbd')) {
        const infos = property.split('_');
        const proj = parseInt(infos[1]);
        const key = infos[2];
        const index = infos[3];
        const o = { proj, key, index, value };
        orgBdInfos.push(o);
      }
    }
    const projIds = orgBdInfos.map(m => m.proj);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjIds.forEach(e => {
      const thisProj = orgBdInfos.filter(f => f.proj === e);
      const indexIds = thisProj.map(m => m.index);
      const uniqueKeyIds = indexIds.filter((v, i, a) => a.indexOf(v) === i);
      uniqueKeyIds.forEach(e1 => {
        const thisProjItem = thisProj.filter(f => f.index === e1);
        const proj = e;
        const org = thisProjItem.filter(f => f.key === 'org')[0].value;
        const bduser = thisProjItem.filter(f => f.key === 'bduser')[0].value;
        const bdstatus = thisProjItem.filter(f => f.key === 'bdstatus')[0].value;
        const comments = thisProjItem.filter(f => f.key === 'comments')[0].value;
        result.push({ proj, org, bduser, bdstatus, comments });
      })
    });
    return result;
  }

  getNewOrgBdInfo = values => {
    let orgBdInfos = [];
    for (const property in values) {
      if (property.startsWith('neworgbd')) {
        const value = values[property];
        const infos = property.split('_');
        const projIndex = parseInt(infos[1]);
        const projValueKey = `newproj_${projIndex}`;
        const proj = values[projValueKey];
        const key = infos[2];
        const index = `${infos[1]}_${infos[3]}`;
        const o = { proj, key, index, value };
        orgBdInfos.push(o);
      }
    }

    orgBdInfos = orgBdInfos.filter(f => f.proj);

    const projIds = orgBdInfos.map(m => m.proj);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjIds.forEach(e => {
      const thisProj = orgBdInfos.filter(f => f.proj === e);
      const indexIds = thisProj.map(m => m.index);
      const uniqueKeyIds = indexIds.filter((v, i, a) => a.indexOf(v) === i);
      uniqueKeyIds.forEach(e1 => {
        const thisProjItem = thisProj.filter(f => f.index === e1);
        const proj = e;
        const org = thisProjItem.filter(f => f.key === 'org')[0].value;
        const bduser = thisProjItem.filter(f => f.key === 'bduser')[0].value;
        const bdstatus = thisProjItem.filter(f => f.key === 'bdstatus')[0].value;
        const comments = thisProjItem.filter(f => f.key === 'comments')[0].value;
        result.push({ proj, org, bduser, bdstatus, comments });
      })
    });
    return result;
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  render() {
    return(
      <LeftRightLayout location={this.props.location} title="工作周报">
        <div>
          <AddReportForm wrappedComponentRef={this.handleRef} data={this.initialFormData} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.handleSubmitBtnClick}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }

}

export default connect()(withRouter(AddReport))
