import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col, Radio, Progress, Steps, Tag } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import {
  getURLParamValue,
  hasPerm,
  getCurrentUser,
  requestAllData,
  handleError,
  formatMoney,
  trimTextIfExceedMaximumCount,
} from '../utils/util';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { PieChart, Pie, Cell } from 'recharts';
import * as api from '../api';
import OrgBDListComponent from '../components/OrgBDListComponent';
import _ from 'lodash';

const { Step } = Steps;

const statStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};
const statLabelStyle = {
  marginBottom: 10,
  fontSize: 14,
  color: '#989898',
  lineHeight: '22px',
};
const statValueStyle = {
  fontSize: 14,
  color: '#262626',
  lineHeight: '32px',
};
const statValueNumStyle = {
  fontSize: 24,
}

const pieChartLabelContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const pieChartLabelColorStyle = {
  marginRight: 10,
  width: 10,
  height: 10,
  opacity: 0.7,
  background: '#339bd2',
  borderRadius: '50%',
};
const pieChartLabelTextStyle = {
  marginRight: 8,
  color: '#595959',
};
const pieChartPercentageStyle = {
  color: '#989889'
};

function ProjectCostDetail(props) {

  let projName = '';
  const name = getURLParamValue(props, 'name'); 
  if (name) {
    projName = name;
  }
  const [orgbdres, setOrgbdres] = useState([]);
  const [projectDetails, setProjectDetails] = useState({
    id: props.match.params.id,
    projtitle: projName,
    percentage: 0,
    step: 0, // 项目进程时间轴所在的步骤
  });
  const [allOrgBD, setAllOrgBD] = useState([]);
  const [showInvestorStep, setShowInvestorStep] = useState()

  const [costPercentageExtraValue, setPercentageExtraValue] = useState('总金额');
  const [cost, setCost] = useState([
    // { id: 1, color: '#0088FE', name: '类别名称一', percentage: '25%', amount: '¥ 50,000,000' },
    // { id: 2, color: '#00C49F', name: '类别名称二', percentage: '25%', amount: '¥ 50,000,000' },
    // { id: 3, color: '#FFBB28', name: '类别名称三', percentage: '25%', amount: '¥ 50,000,000' },
    // { id: 4, color: '#FF8042', name: '类别名称四', percentage: '25%', amount: '¥ 50,000,000' },
  ]);
  const [totalCost, setTotalCost] = useState(0);
  const [pieChartData, setPieChartData] = useState([]);

  const [totalOrgBdNum, setTotalOrgBdNum] = useState(0);
  const [orgBdOrgName, setOrgBdOrgName] = useState('');

  useEffect(() => {
    props.dispatch({ type: 'app/getSourceList', payload: ['transactionStatus'] });
    // props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    
    async function getAndSetProjectWithProgress() {
      const res = await api.getProjDetail(projectDetails.id);
      const reqBdRes = await api.getSource('orgbdres');
      const { data: orgBDResList } = reqBdRes;
      setOrgbdres(orgBDResList);
      const paramsForPercentage = { proj: projectDetails.id };
      const projPercentageCount = await api.getOrgBDCountNew(paramsForPercentage);
      let { response_count: resCount } = projPercentageCount.data;
      resCount = resCount.map(m => {
        const relatedRes = orgBDResList.filter(f => f.id === m.response);
        let resIndex = 0;
        if (relatedRes.length > 0) {
          resIndex = relatedRes[0].sort;
        }
        return { ...m, resIndex };
      });
      const maxRes = Math.max(...resCount.map(m => m.resIndex));
      let percentage = 0, step = 0;
      if (maxRes > 3) {
        // 计算方法是从正在看前期资料开始到交易完成一共11步，取百分比
        percentage = Math.round((maxRes - 3) / 11 * 100);
        step = maxRes - 4;
      }
      setProjectDetails({ ...projectDetails, ...res.data, percentage, step });
    }

    async function getAllOrgBD() {
      const params = {
        proj: projectDetails.id,
        page_size: 1000,
        response: orgbdres.map(m => m.id)
      };
      if (!hasPerm('BD.manageOrgBD')) {
        params.manager = getCurrentUser();
      }
      const res = await requestAllData(api.getOrgBdList, params, 1000);
      const { data: list } = res.data;
      setAllOrgBD(list);
    }

    async function requestdata() {
      try {
        await getAndSetProjectWithProgress();
        await getAllOrgBD();
      } catch (error) {
        handleError(error);
      }
    }
    requestdata();

    async function getProjDidiInfo() {
      const params = {
        proj: projectDetails.id,
      };
      const res = await requestAllData(api.getProjDidi, params, 100);
      const allDidiTypes = res.data.data.map(m => m.orderType);
      const uniqueDidiTypes = _.uniqBy(allDidiTypes, 'id');
      uniqueDidiTypes.forEach(element => {
        const relatedData = res.data.data.filter(f => f.orderType.id === element.id);
        const amount = relatedData.reduce((prev, curr) => curr.money+ prev, 0);
        element.value = amount;
        element.amount = formatMoney(Math.round(amount), 'CNY');
      });
      const totalCost = uniqueDidiTypes.reduce((prev, curr) => curr.value + prev, 0);
      setTotalCost(Math.round(totalCost));
      const overallCost = uniqueDidiTypes.map((m, i) => {
        const color = getCellColor(m, i);
        return { ...m, color, percentage: `${Math.round(m.value/ totalCost * 100)}%` };
      });
      setCost(overallCost);
      setPieChartData(overallCost);
    }
    getProjDidiInfo();

    async function getOrgBDNum() {
      const params = {
        proj: projectDetails.id,
      };
      const res = await api.getOrgBdList(params);
      setTotalOrgBdNum(res.data.count);
      const allOrg = res.data.data.map(m => m.org);
      const uniqueOrg = _.uniqBy(allOrg, 'id');
      const orgNameStr = uniqueOrg.filter(f => f.orgname).map(m => m.orgname).join('-');
      const displayStr = trimTextIfExceedMaximumCount(orgNameStr, 10);
      setOrgBdOrgName(displayStr);
    }
    getOrgBDNum();
   
  }, []);

  function getCellColor(entry, i) {
    const findColor = options.filter(f => f.value === entry.name);
    let color = COLORS[i % COLORS.length];
    if (findColor.length > 0) {
      color = findColor[0].color;
    }
    return color;
  }

  const options = [
    { label: '总金额', value: '总金额' },
    { label: '商务', value: '商务', color: '#00C49F' },
    { label: '加班', value: '加班', color: '#FFBB28' },
    { label: '出差', value: '出差', color: '#0088FE' },
  ];

  const onChange3 = e => {
    const filter = cost.filter(f => f.name === e.target.value);
    if (filter.length > 0) {
      setPercentageExtraValue(e.target.value);
      setPieChartData([]);
      setTimeout(() => setPieChartData(cost.filter(f => f.name === e.target.value)), 200);
    } else {
      setPercentageExtraValue('总金额');
      setPieChartData([]);
      setTimeout(() => setPieChartData(cost), 200);
    }
  };

  function getCostPercentageExtra() {
    return (
      <Radio.Group
        options={options}
        onChange={onChange3}
        value={costPercentageExtraValue}
        optionType="button"
      />
    );
  }

  function getInvestorGroupByOrg(allInvestors) {
    const allOrgs = allInvestors.map(m => m.org ? m.org : { id: 0, orgname: '暂无机构' });
    const uniqueOrgs = _.uniqBy(allOrgs, 'id');
    uniqueOrgs.forEach(element => {
      let investors = [];
      if (element.id === 0) {
        investors = allInvestors.filter(f => !f.org);
      } else {
        investors = allInvestors.filter(f => f.org && (f.org.id == element.id));
      }
      element.investors = investors;
    });
    return uniqueOrgs;
  }

  function handleShowInvestorsIconClick(step) {
    if (showInvestorStep === step) {
      setShowInvestorStep();
      return;
    }
    setShowInvestorStep(step);
  }

  const findRelatedStatusName = tranStatusName => {
    switch (tranStatusName) {
      case '获取项目概要':
        return '正在看前期资料';
      case '获取投资备忘录':
        return '已见面';
      case '签署保密协议':
        return '已签NDA';
      case 'Teaser Received':
        return 'Received';
      case 'CIM Received':
        return 'Teaser Received';
      default:
        return tranStatusName;
    }
  }

  const data = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 }
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>项目管理</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/app/projects/list">平台项目</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>项目成本中心</Breadcrumb.Item>
      </Breadcrumb>


      <div style={{ marginTop: 20, marginBottom: 30, marginLeft: 20, fontSize: 20, lineHeight: '28px', fontWeight: 'bold' }}>
        {projectDetails.projtitle}&nbsp;&nbsp;
        <Link to={`/app/projects/${projectDetails.id}`} style={{ fontSize: 14, lineHeight: '22px', fontWeight: 'normal' }}>查看项目详情</Link>
      </div>

      <Row gutter={16}>

        <Col span={14}>
          <Row gutter={16}>
            <Col span={12}>
              <Card style={{ flex: 1 }} title="机构看板数量">
                <div style={statStyle}>
                  <div style={statLabelStyle}>{orgBdOrgName}</div>
                  <div style={statValueStyle}><span style={statValueNumStyle}>{totalOrgBdNum}</span>个投资人</div>
                  <Link to={`/app/org/bd?projId=${projectDetails.id}`} style={{ marginTop: 10, fontSize: 14, lineHeight: '22px', fontWeight: 'normal' }}>查看机构看板详情</Link>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ flex: 1 }} title="项目进度">
                <div style={statStyle}>
                  <div style={statLabelStyle}>{projectDetails.projstatus && projectDetails.projstatus.nameC}</div>
                  <div style={statValueStyle}><span style={statValueNumStyle}>{projectDetails.percentage}%</span></div>
                  <Progress style={{ marginTop: 10, marginBottom: 4 }} size="small" strokeColor="#339bd2" percent={projectDetails.percentage} showInfo={false} />
                </div>
              </Card>
            </Col>
          </Row>
          <Card
            style={{ marginTop: 16 }}
            title="项目成本占比"
            extra={getCostPercentageExtra()}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PieChart width={300} height={300}>
                <Pie
                  data={pieChartData}
                  cx={120}
                  cy={150}
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCellColor(entry, index)} />
                  ))}
                </Pie>
                <text x={125} y={130} dy={8} textAnchor="middle" fill="#989898" fontSize="14px">
                  总成本
                </text>
                <text x={125} y={170} dy={8} textAnchor="middle" fill="#262626" fontSize="24px">
                  {pieChartData.length === 1 ? pieChartData[0].amount : (pieChartData.length === 0 ? '' : formatMoney(totalCost, 'CNY'))} 
                </text>
              </PieChart>
              <div style={{ flex: 1 }}>
                {cost.map(m => (
                  <div key={m.id} style={{ ...pieChartLabelContainerStyle, justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={pieChartLabelContainerStyle}>
                      <div style={{ ...pieChartLabelColorStyle, background: m.color }} />
                      <div style={pieChartLabelTextStyle}>{m.name}</div>
                      <div style={pieChartPercentageStyle}>{m.percentage}</div>
                    </div>
                    <div style={pieChartLabelTextStyle}>{m.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        <Col span={10}>
          <Card title="机构看板" bodyStyle={{ padding: 0 }}>
          <OrgBDListComponent
            allManager
            location={props.location}
            pageSize={10}
            pagination
            fromProjectCostCenter
          />
            {/* <Steps style={{ marginBottom: 7 }} className="timeline-steps" direction="vertical" current={projectDetails.step} size="small">
              {
                orgbdres.slice(3).map((status, index) => {
                  const list = allOrgBD.filter(item => {
                    const response = orgbdres.filter(f => f.id === item.response);
                    if (response.length === 0) return false;
                    const curRes = response[0];
                    return curRes.name === status.name;
                  });
                  const investorGroupByOrg = getInvestorGroupByOrg(list);
                  const step = index + 1;
                  return (
                    <Step key={status.id} title={
                      <div style={{ marginBottom: 16, padding: '5px 10px', background: '#f5f5f5', borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ color: showInvestorStep === step ? '#000000' : '#595959' }}>{status.name}</div>
                          <div>
                            {list.length ? <ViewInvestorsInTimeline
                              isShowInvestor={showInvestorStep === step}
                              investors={list}
                              onShowInvestorBtnClicked={() => handleShowInvestorsIconClick(step)}
                            /> : null}
                          </div>
                        </div>
                        <div style={{ marginTop: 6, display: showInvestorStep === step ? 'block' : 'none' }}>
                          {investorGroupByOrg.map(m => <Tag key={m.id} style={{ color: '#595959', marginBottom: 6 }}>
                            {m.orgname}：{m.investors.map(n => n.username).join('、')}
                          </Tag>)}
                        </div>
                      </div>
                    } />
                  );
                })
              }
            </Steps> */}
          </Card>
        </Col>
      </Row>

    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { transactionStatus, orgbdres } = state.app;
  return { transactionStatus, orgbdres };
}

export default connect(mapStateToProps)(ProjectCostDetail);
