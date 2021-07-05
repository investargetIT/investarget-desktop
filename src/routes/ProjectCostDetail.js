import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col, Radio, Progress, Steps } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import {
  getURLParamValue,
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
  const [projectDetails, setProjectDetails] = useState({
    id: props.match.params.id,
    projtitle: projName,
  });

  const [costPercentageExtraValue, setPercentageExtraValue] = useState('all');

  useEffect(() => {
    props.dispatch({ type: 'app/getSourceList', payload: ['transactionStatus'] });
    props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    async function getProjectDetails() {
      const res = await api.getProjDetail(projectDetails.id);
      setProjectDetails(res.data);
    }
    getProjectDetails();
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
              <Card style={{ flex: 1 }} title="机构BD数量">
                <div style={statStyle}>
                  <div style={statLabelStyle}>机构名称-TODO</div>
                  <div style={statValueStyle}><span style={statValueNumStyle}>12</span>个项目</div>
                  <Link to={`/app/org/bd?projId=${projectDetails.id}`} style={{ marginTop: 10, fontSize: 14, lineHeight: '22px', fontWeight: 'normal' }}>查看机构BD详情</Link>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ flex: 1 }} title="项目进度">
                <div style={statStyle}>
                  <div style={statLabelStyle}>{projectDetails.projstatus && projectDetails.projstatus.nameC}</div>
                  <div style={statValueStyle}><span style={statValueNumStyle}>85%</span></div>
                  <Progress style={{ marginTop: 10 }} percent={50} showInfo={false} />
                </div>
              </Card>
            </Col>
          </Row>
          <Card
            style={{ marginTop: 16 }}
            title="项目成本占比"
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
            <Steps className="timeline-steps" direction="vertical" current={8} size="small">
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
