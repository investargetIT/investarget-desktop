import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { getUserInfo, i18n } from '../utils/util';
import ProjectCard from '../components/ProjectCard';
import * as api from '../api';
import { connect } from 'dva';
import ProjectBdTable from '../components/ProjectBdTable';

function Dashboard(props) {

  const userInfo = getUserInfo();

  const [projList, setProjList] = useState([]);
  const [news, setNews] = useState();

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'country' });

    async function fetchData() {
      const params = {
        max_size: 3,
        skip_count: 8,
      }
      const reqProj = await api.getProj(params);
      const { data: projList } = reqProj.data;
      setProjList(projList);
    }
    fetchData();

    async function fetchNewsData() {
      const reqNews = await api.getWxMsg({ isShow: true });
      if (reqNews.data.count > 0) {
        setNews(reqNews.data.data[0]);
      } else {
        setNews({
          createtime: '2018-06-26T17:18:24.086778',
          content: '兴旺投资创始合伙人黎媛菲：主要看消费、教育和科技。消费主要是包装食品、宠物、互联网餐饮、内衣、直播电商等新消费新零售赛道都很积极。科技主要是5G 半导体，大数据云计算、工业互联网。',
        });
      }
    }
    fetchNewsData();

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
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {projList.map(m => <div key={m.id} style={{ marginLeft: 24, marginBottom: 24 }}>
            <ProjectCard record={m} country={props.country} />
          </div>)}
        </div>
      </Card>

      <div className="site-card-wrapper" style={{ margin: '20px 0' }}>
        <Row gutter={20}>

          <Col span={16}>
            <Card title="项目BD" extra={<a href="#">全部项目</a>}>
              <ProjectBdTable />
            </Card>
          </Col>

          <Col span={8}>

            <Card title="市场消息" style={{ marginBottom: 20, fontSize: 14, lineHeight: '22px' }} extra={<a href="#">查看更多</a>}>
              <div style={{ color: '#262626' }}>{news ? news.content : i18n('no_news')}</div>
              {news && <div style={{ marginTop: 10, color: '#989898' }}>发布时间：{news.createtime.slice(0, 10)}</div>}
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

function mapStateToProps(state) {
  const { country } = state.app
  return { country };
}

export default connect(mapStateToProps)(Dashboard);
