import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n, getCurrentUser } from '../utils/util'
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

    this.initialFormData = {
      time: {
        value: [moment().startOf('week'), moment().startOf('week').add('days', 4)]
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
        // window.echo('values', values);

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
        this.addOrgBd(allOrgBds);
        
        const existingOrgRemark = this.getExistingOrgRemark(values);
        const newOrgRemark = this.getNewOrgRemark(values);
        const allOrgRemarks = existingOrgRemark.concat(newOrgRemark);
        this.addOrgRemark(allOrgRemarks);

        this.addReport(values);
      }
    })
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
    this.props.router.replace('/app/report/list');
  }

  addReportProjInfo = (reportId, data) => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      api.addWorkReportProjInfo({ ...element, report: reportId });
    }
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
      api.addOrgRemark({ ...element, lastmodifytime: this.startTime });
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
      const { bduser, org, proj, bdstatus: response } = element;
      const body = {
        bduser,
        org,
        proj,
        response,
        manager: getCurrentUser(),
        lastmodifytime: this.startTime,

      };
      try {
        await api.getUserSession();
        await api.addOrgBD(body);
      } catch (e) {
        console.error(e);
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
        const bdstatus = thisProj.filter(f => f.key === 'bdstatus')[0].value;
        result.push({ proj, org, bduser, bdstatus });
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
        const bdstatus = thisProj.filter(f => f.key === 'bdstatus')[0].value;
        result.push({ proj, org, bduser, bdstatus });
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
      <LeftRightLayout location={this.props.location} title="投行业务岗位工作周报">
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
