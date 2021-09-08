import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col, Tooltip, Empty, Tabs } from 'antd';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import {
  getUserInfo,
  i18n,
  trimTextIfExceedMaximumCount,
  getFilenameWithoutExt,
  formatBytes,
  getFileTypeByName,
  hasPerm,
  handleError,
} from '../utils/util';
import ProjectCard from '../components/ProjectCard';
import * as api from '../api';
import { connect } from 'dva';
import { Link } from 'dva/router';
import ProjectBdTable from '../components/ProjectBdTable';
import OrgBdTable from '../components/OrgBdTable';
import {
  FilePdfFilled,
  FileWordFilled,
  FileFilled,
  FileImageFilled,
  FilePptFilled,
  FileExcelFilled,
  AudioFilled,
  VideoCameraFilled,
} from '@ant-design/icons';
import MySchedule from '../components/MySchedule';

const { TabPane } = Tabs;

function Dashboard(props) {

  const userInfo = getUserInfo();

  const [projList, setProjList] = useState([]);
  const [news, setNews] = useState();
  const [files, setFiles] = useState([]);
  const [projNum, setProjNum] = useState(0);
  const [loadingOnGoingProjects, setLoadingOnGoingProjects] = useState(false);

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'country' });

    if (userInfo.indGroup) {
      async function fetchProjNum() {
        const params = {
          indGroup: userInfo.indGroup.id,
        }
        const req = await api.getProjBDList(params);
        setProjNum(req.data.count);
      }
      fetchProjNum();
    }

    async function fetchData() {
      const reqProjStatus = await api.getSource('projstatus');
      const { data: statusList } = reqProjStatus;
      const ongoingStatus = statusList.filter(f => ['终审发布', '交易中', 'Published', 'Contacting'].includes(f.name));

      const params = {
        max_size: 4,
        projstatus: ongoingStatus.map(m => m.id),
        sort: 'publishDate',
        desc: 1,
      }
      if (!hasPerm('proj.admin_getproj')) {
        params['user'] = userInfo.id;
      }
      const reqProj = await api.getProj(params);
      const { data: projList } = reqProj.data;
      setProjList(projList);
      
      setLoadingOnGoingProjects(false);

      const reqBdRes = await api.getSource('orgbdres');
      const { data: orgBDResList } = reqBdRes;
      const projPercentage = [];
      for (let index = 0; index < projList.length; index++) {
        const element = projList[index];
        const paramsForPercentage = { proj: element.id };
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
        let percentage = 0;
        if (maxRes > 3) {
          // 计算方法是从正在看前期资料开始到交易完成一共11步，取百分比
          percentage = Math.round((maxRes - 3) / 11 * 100);
        }
        projPercentage.push({ id: element.id, percentage });
      }
      setProjList(projList.map(m => {
        const percentageList = projPercentage.filter(f => f.id === m.id);
        if (percentageList.length > 0) {
          return { ...m, percentage: percentageList[0].percentage };
        }
        return { ...m, percentage: 0 };
      }));
    }

    setLoadingOnGoingProjects(true);

    async function fetchDataAndCatchError() {
      try {
        await fetchData();
      } catch (error) {
        handleError(error);
      }
    }
    fetchDataAndCatchError();


    async function fetchNewsData() {
      const reqNews = await api.getWxMsg({ isShow: true });
      if (reqNews.data.count > 0) {
        setNews(reqNews.data.data[0]);
      }
      // else {
      //   setNews({
      //     createtime: '2018-06-26T17:18:24.086778',
      //     content: '兴旺投资创始合伙人黎媛菲：主要看消费、教育和科技。消费主要是包装食品、宠物、互联网餐饮、内衣、直播电商等新消费新零售赛道都很积极。科技主要是5G 半导体，大数据云计算、工业互联网。',
      //   });
      // }
    }
    fetchNewsData();

    async function fetchCompanyFile() {
      const reqComDataroom = await api.queryDataRoom({ isCompanyFile: 1 });
      const { count, data: companyDataroom } = reqComDataroom.data;
      if (count == 0) return;
      const dataroomId = companyDataroom[0].id;
      const params = {
        dataroom: dataroomId,
        isFile: true,
        page_size: 4, // not working
        sort: 'createdtime',
        desc: 1,
      }
      const reqComFile = await api.queryDataRoomFile(params);
      setFiles(reqComFile.data.data.slice(0, 4))
    }
    fetchCompanyFile();

  }, []);

  function getFileIconByType(fileType) {
    switch (fileType) {
      case 'PDF':
        return <FilePdfFilled style={{ fontSize: 36, color: '#989898' }} />;
      case 'IMAGE':
        return <FileImageFilled style={{ fontSize: 36, color: '#989898' }} />;
      case 'WORD':
        return <FileWordFilled style={{ fontSize: 36, color: '#989898' }} />;
      case 'PPT':
        return <FilePptFilled style={{ fontSize: 36, color: '#989898' }} />;
      case 'EXCEL':
        return <FileExcelFilled style={{ fontSize: 36, color: '#989898' }} />;
      case 'VIDEO':
        return <VideoCameraFilled style={{ fontSize: 36, color: '#989898' }} />; 
      case 'AUDIO':
        return <AudioFilled style={{ fontSize: 36, color: '#989898' }} />;
      default:
        return <FileFilled style={{ fontSize: 36, color: '#989898' }} />;
    }
  }

  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>工作台</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
        <img style={{ display: 'block', height: 80, width: 80, borderRadius: '50%' }} src={userInfo.photourl} />
        <div style={{ marginLeft: 20 }}>
          <div style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'bold' }}>{userInfo.username} 祝您开心每一天！</div>
          {userInfo.indGroup && <div style={{ fontSize: 16, lineHeight: '24px', marginTop: 8, color: '#595959' }}>{userInfo.indGroup.name} |  项目数 {projNum}</div>}
        </div>
      </div>

      <Card title="进行中的项目" extra={<Link to="/app/projects/list">全部项目</Link>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-18px 0 0 -18px' }}>
          {loadingOnGoingProjects && [1, 2, 3, 4].map(m => <div key={m} style={{ margin: '18px 0 0 18px' }}>
            <Card loading style={{ width: 250 }} />
          </div>)}
          {!loadingOnGoingProjects && projList.map(m => <div key={m.id} style={{ margin: '18px 0 0 18px' }}>
            <ProjectCard record={m} country={props.country} />
          </div>)}
          {!loadingOnGoingProjects && projList.length === 0 && <Empty style={{ margin: '20px auto' }} />}
        </div>
      </Card>

      <div className="site-card-wrapper" style={{ margin: '20px 0' }}>
        <Row gutter={20}>

          <Col span={16}>
            <div className="card-container">
              <Tabs type="card" size="large">
                <TabPane tab="当前任务" key="1">
                  <OrgBdTable />
                </TabPane>
                <TabPane tab="项目BD" key="2">
                  <ProjectBdTable />
                </TabPane>
              </Tabs>
            </div>
          </Col>

          <Col span={8}>

            <Card title="市场消息" bordered={false} style={{ marginBottom: 20, fontSize: 14, lineHeight: '22px', minHeight: 210 }} extra={<Link to="/app/wxmsg">查看更多</Link>}>
              <div style={{ color: '#262626' }}>{news ? trimTextIfExceedMaximumCount(news.content, 60) : i18n('no_news')}</div>
              {news && <div style={{ marginTop: 10, color: '#989898' }}>发布时间：{news.createtime.slice(0, 10)}</div>}
            </Card>

            <Card title="公司培训文件" bordered={false} extra={<Link to="/app/dataroom/company/list">全部文件</Link>} bodyStyle={{ padding: 0, paddingBottom: 20 }} style={{ minHeight: 400 }}>
              {files.map(m => (
                <a key={m.id} href="/app" target="_blank">
                  <div style={{ height: 80, padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e6e6e6' }}>
                    {getFileIconByType(getFileTypeByName(m.filename))} 
                    <div style={{ marginLeft: 8 }}>
                      <Tooltip title={getFilenameWithoutExt(m.filename)}>
                        <div style={{ fontSize: 14, lineHeight: '20px', color: '#262626' }}>
                          {trimTextIfExceedMaximumCount(getFilenameWithoutExt(m.filename), 20)}
                        </div>
                      </Tooltip>
                      <div style={{ fontSize: 12, lineHeight: '18px', color: '#989898' }}>
                        {formatBytes(m.size)} / {getFileTypeByName(m.filename)} / {m.createdtime.slice(0, 10)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </Card>

          </Col>

        </Row>
      </div>

      <Card title="工作日程">
        <MySchedule />
      </Card>

    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { country } = state.app
  return { country };
}

export default connect(mapStateToProps)(Dashboard);
