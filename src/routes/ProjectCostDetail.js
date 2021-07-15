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
} from '../utils/util';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { PieChart, Pie, Cell } from 'recharts';
import * as api from '../api';
import ViewInvestorsInTimeline from '../components/ViewInvestorsInTimeline';
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

  const [costPercentageExtraValue, setPercentageExtraValue] = useState('all');
  const [cost, setCost] = useState([
    // { id: 1, color: '#0088FE', name: '类别名称一', percentage: '25%', amount: '¥ 50,000,000' },
    // { id: 2, color: '#00C49F', name: '类别名称二', percentage: '25%', amount: '¥ 50,000,000' },
    // { id: 3, color: '#FFBB28', name: '类别名称三', percentage: '25%', amount: '¥ 50,000,000' },
    // { id: 4, color: '#FF8042', name: '类别名称四', percentage: '25%', amount: '¥ 50,000,000' },
  ]);
  const [totalCost, setTotalCost] = useState(0);

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
      setCost(uniqueDidiTypes.map((m, i) => ({ ...m, color: COLORS[i % COLORS.length], percentage: `${Math.round(m.value/ totalCost * 100)}%` })));
    }
    getProjDidiInfo();
   
  }, []);

  const options = [
    { label: '总金额', value: 'all' },
    { label: '商务', value: 'business' },
    { label: '加班', value: 'overwork' },
    { label: '出差', value: 'trip' },
  ];

  const onChange3 = e => {
    setPercentageExtraValue(e.target.value);
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
              <Card style={{ flex: 1 }} title="机构BD数量-TODO">
                <div style={statStyle}>
                  <div style={statLabelStyle}>机构名称</div>
                  <div style={statValueStyle}><span style={statValueNumStyle}>12</span>个项目</div>
                  <Link to={`/app/org/bd?projId=${projectDetails.id}`} style={{ marginTop: 10, fontSize: 14, lineHeight: '22px', fontWeight: 'normal' }}>查看机构BD详情</Link>
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
                  data={cost}
                  cx={120}
                  cy={150}
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cost.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <text x={125} y={130} dy={8} textAnchor="middle" fill="#989898" fontSize="14px">
                  总成本
                </text>
                <text x={125} y={170} dy={8} textAnchor="middle" fill="#262626" fontSize="24px">
                  {formatMoney(totalCost, 'CNY')} 
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
          <Card title="项目进程时间轴">
            <Steps style={{ marginBottom: 7 }} className="timeline-steps" direction="vertical" current={projectDetails.step} size="small">
              {
                props.transactionStatus.map((status, index) => {
                  const list = allOrgBD.filter(item => {
                    const response = orgbdres.filter(f => f.id === item.response);
                    if (response.length === 0) return false;
                    const curRes = response[0];
                    return curRes.name === findRelatedStatusName(status.name);
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
                              onShowInvestorBtnClicked={() => setShowInvestorStep(step)}
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
            </Steps>
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
