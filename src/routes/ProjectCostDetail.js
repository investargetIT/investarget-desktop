import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col, Radio, Progress, Steps } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import {
  getURLParamValue,
  hasPerm,
  getCurrentUser,
  requestAllData,
} from '../utils/util';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { PieChart, Pie, Cell } from 'recharts';
import * as api from '../api';

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

  const [costPercentageExtraValue, setPercentageExtraValue] = useState('all');

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
      window.echo('percentaget', percentage, projectDetails);
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
      window.echo('all org bd', list);
      setAllOrgBD(list);
    }

    async function requestdata() {
      await getAndSetProjectWithProgress();
      getAllOrgBD();
    }
    requestdata();
   
  }, []);

  const options = [
    { label: '全部渠道', value: 'all' },
    { label: '线上', value: 'online' },
    { label: '门店', value: 'store' },
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
        <Col span={12}>
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
            title="项目成本占比-TODO"
            extra={getCostPercentageExtra()}
          >
            <PieChart width={400} height={400}>
              <Pie
                data={data}
                cx={120}
                cy={200}
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text x={125} y={180} dy={8} textAnchor="middle" fill="#989898" fontSize="14px">
                总成本 
              </text>
              <text x={125} y={220} dy={8} textAnchor="middle" fill="#262626" fontSize="24px">
                ¥ 200M 
              </text>
            </PieChart>
          </Card>

        </Col>
        <Col span={12}>
          <Card title="项目进程时间轴">
            <Steps className="timeline-steps" direction="vertical" current={projectDetails.step} size="small">
              {
                props.transactionStatus.map((status, index) => {
                  return (
                    <Step key={status.id} title={
                      <div style={{ padding: '5px 10px', display: 'flex', justifyContent: 'space-between', background: '#f5f5f5', borderRadius: 4 }}>
                        <div>{status.name}</div>
                        <div>2021-04-18</div>
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
