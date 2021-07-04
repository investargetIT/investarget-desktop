import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col, Radio } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import {
  getURLParamValue,
} from '../utils/util';
import { connect } from 'dva';
import { Link } from 'dva/router';

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
                  <div style={statValueStyle}><span style={statValueNumStyle}>12</span>&nbsp;个项目</div>
                  <Link to={`/app/org/bd?projId=${projectDetails.id}`} style={{ marginTop: 10, fontSize: 14, lineHeight: '22px', fontWeight: 'normal' }}>查看机构BD详情</Link>
                </div>
              </Card>
            </Col>
            <Col span={12}><Card style={{ flex: 1 }} title="项目进度" /></Col>
          </Row>
          <Card
            style={{ marginTop: 16 }}
            title="项目成本占比"
            extra={getCostPercentageExtra()}
          />
        </Col>
        <Col span={12}>
          <Card title="项目进程时间轴"></Card>
        </Col>
      </Row>

    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { country } = state.app
  return { country };
}

export default connect(mapStateToProps)(ProjectCostDetail);
