import React from 'react'
import PropTypes from 'prop-types'
import { requestAllData } from '../utils/util';
import { connect } from 'dva'
import { Form, Input, DatePicker, Menu } from 'antd'
const { RangePicker } = DatePicker;
import {
  BasicFormItem,
} from '../components/Form'
import * as api from '../api';
import {
  SelectExistUser, 
  SelectExistProject,
  SelectExistOrganization,
  SelectNewBDStatus,
} from '../components/ExtraInput'
import LeftRightLayout from '../components/LeftRightLayout';
import moment from 'moment';
import _ from 'lodash';

let uuid = 0;
let ppid = 0;
class ReportDetail extends React.Component {

  static childContextTypes = {
    form: PropTypes.object
  }

  constructor(props) {
    super(props)

    window.echo('report detail', props.params);

    // const time = this.props.form.getFieldValue('time');
    // const [ start, end ] = time;
    // this.startDate = start.format('YYYY-MM-DD');
    // this.endDate = end.format('YYYY-MM-DD');
    
    this.state = {
      report: null,
      orgRemarks: [],
      projOrgBds: [],
      photourl: null,
      current: null,
      marketMsg: [],
    };
    this.reportId = Number(props.params.id);
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getReportDetail();
  }

  getReportDetail = async () => {
    const res = await api.getWorkReportDetail(this.reportId);
    this.setState({ report: res.data });
    const { startTime, endTime, user } = res.data;

    const resUser = await api.getUserInfo(user.id);
    const { photourl } = resUser.data;
    this.setState({ photourl });

    this.getOrgRemark(startTime, endTime);
    await this.getOrgBd(startTime, endTime);
    this.getReportProj();
    this.getMarketMsg();
  }

  getReportProj = async () => {
    const params = {
      report: this.reportId,
      page_size: 1000,
    };
    const res = await requestAllData(api.getWorkReportProjInfo, params, 1000);
    const { data: reportProj } = res.data;
    const orgBds = [...this.state.projOrgBds];
    reportProj.forEach((element, index) => {
      if (element.proj) {
        const index = orgBds.map(m => m.proj.id).indexOf(element.proj.id);
        if (index > -1) {
          orgBds[index].thisPlan = element.thisPlan;
          orgBds[index].nextPlan = element.nextPlan;
        } else {
          orgBds.push({ ...element, orgBds: [] });
        }
      } else {
        orgBds.push({ ...element, orgBds: [], proj: { projtitle: element.projTitle, id: `-${index}` }})
      }
    });
    this.setState({ projOrgBds: orgBds });
  }

  getMarketMsg = async () => {
    const params = {
      report: this.reportId,
      page_size: 1000,
    };
    const res = await requestAllData(api.getWorkReportMarketMsg, params, 1000);
    const { data: marketMsg } = res.data;
    this.setState({
      marketMsg,
    });
  }

  getOrgRemark = async (startDate, endDate) => {
    const createuser = this.state.report.user.id;
    const stime = startDate;
    const etime = endDate;
    const stimeM = startDate;
    const etimeM = endDate;
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

  getOrgBd = async (startDate, endDate) => {
    const manager = this.state.report.user.id;
    const stime = startDate;
    const etime = endDate;
    const stimeM = startDate;
    const etimeM = endDate;
    const page_size = 1000;

    const params1 = { manager, stimeM, etimeM, page_size };
    const params2 = { manager, stime, etime, page_size };
    const res = await Promise.all([
      requestAllData(api.getOrgBdList, params1, 1000),
      requestAllData(api.getOrgBdList, params2, 1000),
    ]);
    const allOrgBds = res.reduce((pre, cur) => pre.concat(cur.data.data), []);
    const orgBds =  _.uniqBy(allOrgBds, 'id');

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

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
    document.getElementById(e.key).scrollIntoView();
  }

  render() {

    const projExistingOrgBds = this.state.projOrgBds.map((m, i) => {

      return (
        <div style={{ marginBottom: 20 }} key={m.proj.id}>

          {i !== 0 && <hr style={{ borderTop: '2px dashed #ccc' }} />}

          <div style={{ display: 'flex', alignItems: 'center' }}>

            <div style={{ width: 200 }}>{m.proj.projtitle}</div>

            <div style={{ flex: 1 }}>
              <div>
                <div style={{ lineHeight: 3 }}>
                  <span style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold' }}>本周工作</span>
                </div>

                {m.orgBds.map(m => (
                  <div key={m.id} style={{ display: 'flex' }}>

                    <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>

                    <div style={{ width: 160 }}>
                      <div style={{ display: 'flex' }}>
                        <div>机构：</div>
                        <div style={{ flex: 1 }}>{m.org ? m.org.orgname : '暂无'}</div>
                      </div>
                    </div>

                    <div style={{ width: 150 }}>
                      <div style={{ display: 'flex' }}>
                        <div>投资人：</div>
                        <div style={{ flex: 1 }}>{m.username}</div>
                      </div>
                    </div>

                    <div style={{ width: 180 }}>
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
                ))}

                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: 10, marginLeft: 20, marginRight: 10 }}>•</div>
                      <div>其他：</div>
                      <div style={{ flex: 1 }}>
                        {m.thisPlan}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div>
                <div style={{ color: 'black', textDecoration: 'underline', fontWeight: 'bold', lineHeight: 3 }}>下周计划</div>
                <div style={{ marginLeft: 82 }}>
                  {m.nextPlan}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });

    return (
      <LeftRightLayout location={this.props.location} title="工作周报">
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {this.state.photourl && <img style={{ marginRight: 10, width: 26, height: 26 }} src={this.state.photourl} />}
            {this.state.report && this.state.report.user.username}
          </div>

          <div>
            <Menu
              onClick={this.handleClick}
              selectedKeys={[this.state.current]}
              mode="horizontal"
            >
              <Menu.Item key="mail">
                投资机构日常沟通汇报
              </Menu.Item>
              <Menu.Item key="app">
                市场信息和项目信息汇报 
              </Menu.Item>
              <Menu.Item key="alipay">
                其他事项/工作建议
              </Menu.Item>
            </Menu>
          </div>

          {this.state.report &&
            <RangePicker disabled value={[moment(this.state.report.startTime), moment(this.state.report.endTime)]} />
          }
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>进行中项目工作汇报</div>
          </div>

          {projExistingOrgBds}

        </div>

        <div id="mail" style={{ marginBottom: 40 }}>

          <div style={{ padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>投资机构日常沟通汇报</div>
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
                </div>

              </div>
            </div>
          ))}

        </div>

        <div id="app" style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 10, padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>市场信息和项目信息汇报</div>
          </div>
          <div
            style={{ padding: '0 10px' }}
            dangerouslySetInnerHTML={{ __html: this.state.report && this.state.report.marketMsg && this.state.report.marketMsg.replace(/\n/g, '<br/>') || '' }}
          />
          {this.state.marketMsg.map(m => (
            <div
              key={m.id}
              style={{ padding: '0 10px' }}
              dangerouslySetInnerHTML={{ __html: m.marketMsg.replace(/\n/g, '<br/>') || '' }}
            />
          ))}
        </div>

        <div id="alipay" style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 10, padding: '0 10px', lineHeight: '48px', backgroundColor: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', color: 'black', fontSize: '16px' }}>其他事项/工作建议（如果有）</div>
          </div>
          <div
            style={{ padding: '0 10px' }}
            dangerouslySetInnerHTML={{ __html: this.state.report && this.state.report.others && this.state.report.others.replace(/\n/g, '<br/>') || '未填写' }}
          />
        </div>

      </LeftRightLayout>
    )
  }

}

function mapStateToProps(state) {
  const { orgbdres } = state.app;
  return { orgbdres }
}

export default connect(mapStateToProps)(ReportDetail)
