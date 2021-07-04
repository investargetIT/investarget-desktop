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
  getURLParamValue,
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
    fetchData();

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
      const reqComDataroom = await api.getCompanyDataRoom();
      const { count, data: companyDataroom } = reqComDataroom.data;
      if (count == 0) return;
      const dataroomId = companyDataroom[0].id;
      const params = {
        dataroom: dataroomId,
        isFile: true,
        page_size: 4, // not working
        sort: 'createdtime', // not working
        desc: 1, // not working
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
            <Col span={12}><Card style={{ flex: 1 }} title="机构BD数量" /></Col>
            <Col span={12}><Card style={{ flex: 1 }} title="项目进度" /></Col>
          </Row>
          <Card style={{ marginTop: 16 }} title="项目成本占比" extra={<Link to="/app/projects/list">全部项目</Link>} />
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
