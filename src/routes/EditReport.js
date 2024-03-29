import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n, handleError, subtracting, requestAllData } from '../utils/util';
import moment from 'moment';
import _ from 'lodash';
import { Form, Button, message, Spin, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import ReportForm from '../components/ReportForm'


const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


// function onValuesChange(props, values) {
//   console.log(values)
// }
// function mapPropsToFields(props) {
//   return props.data
// }
// const EditReportForm = Form.create({onValuesChange, mapPropsToFields})(ReportForm)


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


class EditReport extends React.Component {

  constructor(props) {
    super(props)

    this.startTime = null;
    this.endTime = null;
    this.reportId = Number(props.match.params.id);

    this.state = {
      report: null,
      allProj: [],
      textProj: [],
      existProj: [],
      newProj: [],
      marketMsg: [],
    };

    this.interval = setInterval(this.autoSave, 60 * 1000);
    this.editReportFormRef = React.createRef();
  }

  componentDidMount() {
    this.getReportDetail();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  autoSave = () => {
    this.editReportFormRef.current.validateFields()
      .then(values => {
        this.autoSaveWorkReport(values);
        this.autoSaveOrgBds(values);
        this.autoSaveTextProj(values);
        this.autoSaveNewProj(values);
      });
  }

  autoSaveNewProj = values => {
    const newProj = this.getAutoSaveNewProj(values);
    window.echo('autosave new proj', newProj);
    newProj.forEach(e => api.editWorkReportProjInfo(e.reportProjId, e));
  }

  getAutoSaveNewProj = values => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('newreport')) {
        const value = values[property];
        const infos = property.split('_');
        const projKey = `newproj_${infos[1]}`;
        const proj = values[projKey];
        const key = infos[2];
        let reportProjId = null;
        if (infos[1].startsWith('newsproj')) {
          reportProjId = infos[1].substring(8);
          window.echo('getAutoSaveNewProj', reportProjId);
        }
        const o = { proj, key, value, reportProjId };
        result1.push(o);
      }
    }

    result1 = result1.filter(f => f.reportProjId);

    const projTitles = result1.map(m => m.reportProjId);
    const uniqueProjTitles = projTitles.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjTitles.forEach(e => {
      const proj = result1.filter(f => f.reportProjId === e)[0].proj;
      const thisPlan = result1.filter(f => f.reportProjId === e && f.key === 'thisplan')[0].value;
      const nextPlan = result1.filter(f => f.reportProjId === e && f.key === 'nextplan')[0].value;
      result.push({ reportProjId: e, proj, thisPlan, nextPlan });
    });
    return result;
  }

  autoSaveTextProj = values => {
    const textProj = this.getAutoSaveTextProj(values);
    window.echo('autosave text proj', textProj);
    textProj.forEach(e => api.editWorkReportProjInfo(e.reportProjId, e));
  }

  getAutoSaveTextProj = values => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('newproject')) {
        const value = values[property];
        const infos = property.split('_');
        const projKey = `text_project_${infos[1]}`;
        const projTitle = values[projKey];
        const key = infos[2];
        let reportProjId = null;
        if (infos[1].startsWith('textproj')) {
          reportProjId = infos[1].substring(8);
          window.echo('find edit report text proj id', reportProjId);
        }
        const o = { projTitle, key, value, reportProjId };
        result1.push(o);
      }
    }

    result1 = result1.filter(f => f.reportProjId);

    const projTitles = result1.map(m => m.reportProjId);
    const uniqueProjTitles = projTitles.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjTitles.forEach(e => {
      const projTitle = result1.filter(f => f.reportProjId === e)[0].projTitle;
      const thisPlan = result1.filter(f => f.reportProjId === e && f.key === 'thisplan')[0].value;
      const nextPlan = result1.filter(f => f.reportProjId === e && f.key === 'nextplan')[0].value;
      result.push({ reportProjId: e, projTitle, thisPlan, nextPlan });
    });
    return result;
  }

  autoSaveWorkReport = (data) => {
    const { summary: marketMsg, suggestion: others } = data;
    const body = {
      marketMsg,
      others,
      user: this.state.report.user.id,
    };
    api.editWorkReport(this.reportId, body);
  }

  autoSaveOrgBds = async (values) => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('oldorgbd')) {
        const infos = property.split('_');
        const id = parseInt(infos[1]);
        result1.push(id);
      }
    }
    const uniqueIds = result1.filter((v, i, a) => a.indexOf(v) === i);
    await Promise.all(uniqueIds.map(m => this.updateOrgBd1(values, m)));
  }

  updateOrgBd1 = async (values, orgBdId) => {
    const newBdStatus = values[`oldorgbd-bdstatus_${orgBdId}`].response;
    const material = values[`oldorgbd-bdstatus_${orgBdId}`].material;
    await api.modifyOrgBD(orgBdId, { response: newBdStatus, material });
    const comments = this.getOldOrgBdComments1(values, orgBdId);
    await this.updateOrgBdComments1(comments);
  }

  getOldOrgBdComments1 = (values, orgBdId) => {
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

  updateOrgBdComments1 = async data => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const { id, comments, orgBD } = element;
      if (id !== 0) {
        await api.editOrgBDComment(id, { comments });
      }
    }
  }

  getFormData = () => {
    const { startTime, endTime, marketMsg, others } = this.state.report;
    const textProjKeys = this.state.textProj.map(m => `textproj${m.id}`);
    const newProjKeys = this.state.newProj.map(m => `newsproj${m.id}`);
    const summaryKeys = this.state.marketMsg.map(m => `market-${m.id}`);

    const formData = {
      time: [moment(startTime), moment(endTime)],
      summary: marketMsg,
      suggestion: others,
      textproject_keys: textProjKeys,
      proj_keys: newProjKeys,
      market_keys: summaryKeys,
    };

    this.state.textProj.forEach(element => {
      const m = `textproj${element.id}`;
      formData[`text_project_${m}`] = element.projTitle;
      formData[`newproject_${m}_thisplan`] = element.thisPlan;
      formData[`newproject_${m}_nextplan`] = element.nextPlan;
    });

    this.state.existProj.forEach(m => {
      formData[`existingproj_${m.proj.id}_thisplan`] = m.thisPlan;
      formData[`existingproj_${m.proj.id}_nextplan`] = m.nextPlan;
    });

    this.state.newProj.forEach(element => {
      const m = `newsproj${element.id}`;
      formData[`newproj_${m}`] = element.proj.id;
      formData[`newreport_${m}_thisplan`] = element.thisPlan;
      formData[`newreport_${m}_nextplan`] = element.nextPlan;
    });

    this.state.marketMsg.forEach(element => {
      const m = `market-${element.id}`;
      formData[`summary_${m}`] = element.marketMsg;
    });
    return formData;
  }

  getReportTime = () => {
    const { startTime, endTime } = this.state.report;
    return [moment(startTime), moment(endTime)];
  }

  getReportDetail = async () => {
    const res = await api.getWorkReportDetail(this.reportId);
    const { startTime, endTime, user } = res.data;
    this.startDate = startTime;
    this.endDate = endTime;
    this.userId = user.id;
    await this.getReportProj();
    await this.getMarketMsg();
    this.setState({ report: res.data }, this.setEditReportFormValues);
  }

  setEditReportFormValues = () => {
    this.editReportFormRef.current.setFieldsValue(this.getFormData());
  }

  getReportProj = async () => {
    const params = {
      report: this.reportId,
      page_size: 100,
    };
    const res = await requestAllData(api.getWorkReportProjInfo, params, 100);
    const { data: reportProj } = res.data;
    this.setState({
      allProj: reportProj,
      textProj: reportProj.filter(f => f.projTitle && !f.proj),
    });

    const projId = await this.getOrgBdProjId(this.userId);
    this.setState({
      existProj: reportProj.filter(f => f.proj && !f.projTitle && projId.includes(f.proj.id)),
      newProj: reportProj.filter(f => f.proj && !f.projTitle && !projId.includes(f.proj.id)),
    });
  }

  getMarketMsg = async () => {
    const params = {
      report: this.reportId,
      page_size: 100,
    };
    const res = await requestAllData(api.getWorkReportMarketMsg, params, 100);
    const { data: marketMsg } = res.data;
    this.setState({
      marketMsg,
    });
  }

  getOrgBdProjId = async manager => {
    const stime = this.startDate;
    const etime = this.endDate;
    const stimeM = this.startDate;
    const etimeM = this.endDate;
    const page_size = 100;


    const params1 = { manager, stimeM, etimeM, page_size };
    const params2 = { manager, stime, etime, page_size };
    const res = await Promise.all([
      requestAllData(api.getOrgBdList, params1, 100),
      requestAllData(api.getOrgBdList, params2, 100),
    ]);
    const allOrgBds = res.reduce((pre, cur) => pre.concat(cur.data.data), []);
    const orgBds =  _.uniqBy(allOrgBds, 'id');

    const projs = orgBds.map(m => m.proj);
    const projIds = projs.map(m => m.id);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    return uniqueProjIds;
  }

  goBack = () => {
    this.props.history.goBack()
  }

  handleSubmitBtnClick = () => {
    this.editReportFormRef.current.validateFields()
      .then(values => {
        const ref = Modal.info({
          title: '正在保存周报',
          content: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin />
            </div>
          ),
          okText: '保存中...',
        });
        this.addData(values).then(() => {
          ref.destroy();
          this.props.history.replace('/app/report/list');
        });
      });
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
   
    await this.updateOrgBds(values);

    const existingOrgRemark = this.getExistingOrgRemark(values);
    const newOrgRemark = this.getNewOrgRemark(values);
    const allOrgRemarks = existingOrgRemark.concat(newOrgRemark);
    await this.addOrgRemark(allOrgRemarks);

    await this.editReport(values).catch(handleError);
  }

  updateOrgBds = async (values) => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('oldorgbd')) {
        const infos = property.split('_');
        const id = parseInt(infos[1]);
        result1.push(id);
      }
    }
    const uniqueIds = result1.filter((v, i, a) => a.indexOf(v) === i);
    await Promise.all(uniqueIds.map(m => this.updateOrgBd(values, m)));
  }

  updateOrgBd = async (values, orgBdId) => {
    const newBdStatus = values[`oldorgbd-bdstatus_${orgBdId}`].response;
    const material = values[`oldorgbd-bdstatus_${orgBdId}`].material;
    await api.modifyOrgBD(orgBdId, { response: newBdStatus, material });
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

  editReport = async data => {
    const { summary: marketMsg, suggestion: others } = data;
    const body = {
      marketMsg,
      others,
      user: this.state.report.user.id,
    };
    const res = await api.editWorkReport(this.reportId, body);
    const { id: reportId } = res.data;

    await this.editMarketMsg(data);

    await Promise.all(this.state.allProj.map(m => api.deleteWorkReportProjInfo(m.id)));

    const existingProjInfo = this.getPlanForExistingProj(data);
    const newProjReportInfo = this.getPlanForNewProj(data);
    const textProjectInfo = this.getPlanForTextProj(data);
    const allProjReportInfos = existingProjInfo.concat(newProjReportInfo).concat(textProjectInfo);
    await Promise.all(allProjReportInfos.map(m => api.addWorkReportProjInfo({ ...m, report: reportId })));
    
  }

  editMarketMsg = async (values) => {
    let allMarketMsg = [];
    for (const property in values) {
      if (property.startsWith('summary')) {
        const value = values[property];
        const infos = property.split('_');
        const key = infos[1];
        const o = { key, value };
        allMarketMsg.push(o);
      }
    }
    allMarketMsg = allMarketMsg.filter(f => f.key && f.value);

    // 新增市场消息
    const newMarketMsg = allMarketMsg.filter(f => !f.key.startsWith('market'));
    await Promise.all(newMarketMsg.map(m => api.addWorkReportMarketMsg({
      report: this.reportId,
      marketMsg: m.value,
    })));

    // 编辑市场消息
    const oldMarketMsg = allMarketMsg.filter(f => f.key.startsWith('market'));
    await Promise.all(oldMarketMsg.map((m) => {
      const marketMsgId = parseInt(m.key.split('-')[1], 10);
      return api.editWorkReportMarketMsg(marketMsgId, { marketMsg: m.value });
    }));

    // 删除市场消息
    const oldMarketMsgIds = oldMarketMsg.map(m => parseInt(m.key.split('-')[1], 10));
    const originalMarketMsgIds = this.state.marketMsg.map(m => m.id);
    const toDeleteIds = subtracting(originalMarketMsgIds, oldMarketMsgIds);
    await Promise.all(toDeleteIds.map(m => api.deleteWorkReportMarketMsg(m)));
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

  addOrgRemark = async data => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      await api.addOrgRemark({ ...element, lastmodifytime: this.startTime });
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
        manager: this.state.report.user.id,
        lastmodifytime: this.startTime,
        createdtime: this.startTime,
      };
      try {
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
              manager: this.state.report.user.id,
            });
            const { data: orgBdList } = getOrgBdRes.data;
            if (orgBdList.length > 0) {
              const orgBd = orgBdList[0];
              res = await api.modifyOrgBD(orgBd.id, { response, lastmodifytime: this.startTime, createdtime: this.startTime });
            } else {
              console.error('OrgBd Not Found!');
            }
          } else {
            throw error;
          }
        }
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

  render() {
    return(
      <LeftRightLayout location={this.props.location} title="工作周报">
        <div>
          { this.state.report && <ReportForm ref={this.editReportFormRef} time={this.getReportTime()} />}
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.handleSubmitBtnClick}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }

}

export default connect()(withRouter(EditReport))
