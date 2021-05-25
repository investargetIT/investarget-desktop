import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { getUserInfo } from '../utils/util';
import ProjectCard from '../components/ProjectCard';
import * as api from '../api';

export default function Dashboard(props) {

  const userInfo = getUserInfo();
  window.echo('user info', userInfo);

  const [projList, setProjList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const reqProj = await api.getProj();
      const { data: projList } = reqProj.data;
      // window.echo('proj list', projList);
      setProjList(projList);
    }
    fetchData();
  }, []);

  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>工作台</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
        <img style={{ display: 'block', height: 80, borderRadius: '50%' }} src={userInfo.photourl} />
        <div style={{ marginLeft: 20 }}>
          <div style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'bold' }}>{userInfo.username} 祝您开心每一天！</div>
          <div style={{ fontSize: 16, lineHeight: '24px', marginTop: 8, color: '#595959' }}>该用户行业组名称  |  项目数 15</div>
        </div>
      </div>

      <Card title="进行中的项目" extra={<a href="#">全部项目</a>}>
        { projList.map(m => <ProjectCard key={m.id} record={m} />) }
      </Card>

      <div className="site-card-wrapper" style={{ margin: '20px 0' }}>
        <Row gutter={20}>

          <Col span={16} style={{ height: 300 }}>
            <Card title="项目BD" extra={<a href="#">全部项目</a>}>
              <div style={{ height: 300 }}>Content</div>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="市场消息" style={{ marginBottom: 20 }} extra={<a href="#">查看更多</a>}>
              <div style={{ height: 100 }}>Card content</div>
            </Card>
            <Card title="公司培训文件" extra={<a href="#">全部文件</a>}>
              <div style={{ height: 73 }}>Card content</div>
            </Card>
          </Col>

        </Row>
      </div>

      <Card title="工作日程">
        <div style={{ height: 500 }}>Content</div>
      </Card>

    </LeftRightLayoutPure>
  );
}
