import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col, Tooltip, Empty, Tabs, Carousel, Button } from 'antd';
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
  isLogin,
  getURLParamValue,
  requestAllData2,
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
  FullscreenOutlined,
} from '@ant-design/icons';
import MySchedule from '../components/MySchedule';
import Fullscreen from 'react-full-screen';
import { PieChart, Pie, Cell } from 'recharts';
import moment from 'moment';

const { TabPane } = Tabs;
const iframeStyle = {
  border: 'none',
  width: '100%',
  height: '800px',
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
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const PieChartDataName = ['线索项目次数', '机构信息分享次数', '所属行业组行研报告'];

function Dashboard(props) {
  const userInfo = getUserInfo();
  
  const [projList, setProjList] = useState([]);
  const [news, setNews] = useState([]);
  const [files, setFiles] = useState([]);
  const [projNum, setProjNum] = useState(0);
  const [loadingOnGoingProjects, setLoadingOnGoingProjects] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(null);
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'country' });
    props.dispatch({ type: 'app/getIndustryGroup' });

    if (userInfo && userInfo.indGroup) {
      async function fetchProjNum() {
        const params = {
          indGroup: userInfo.indGroup.id,
        }
        const req = await api.getProjCount(params);
        setProjNum(req.data.count);
      }
      fetchProjNum();
    }

    async function fetchData() {
      const reqProjStatus = await api.getSource('projstatus');
      const { data: statusList } = reqProjStatus;
      const ongoingStatus = statusList.filter(f => ['终审发布', '交易中', 'Published', 'Contacting'].includes(f.name));

      const params = {
        projstatus: ongoingStatus.map(m => m.id),
        sort: 'publishDate',
        desc: 1,
        user: userInfo && userInfo.id, // dashboard 应该显示当前用户参与的项目，无论他是否有投前项目管理权限
        iscomproj: 0,
      }
      const reqProj = await requestAllData2(api.getProj, params, 10);
      let { data: projList } = reqProj.data;
      if (projList.length > 0) {
        const reqDataroom = await api.queryDataRoom({
          proj: projList.map(m => m.id).join(','),
          page_size: projList.length,
        });
        projList = projList.map(m => {
          const dataroom = reqDataroom.data.data.filter(f => f.proj && f.proj.id === m.id)[0];
          return { ...m, dataroom };
        });
      }
      setProjList(projList);
      
      setLoadingOnGoingProjects(false);

      const reqBdRes = await api.getSource('orgbdres');
      const { data: orgBDResList } = reqBdRes;
      const projPercentage = [];
      for (let index = 0; index < projList.length; index++) {
        const element = projList[index];
        const paramsForPercentage = { proj: element.id, filter: 0 };
        if (!hasPerm('BD.manageOrgBD')) {
          paramsForPercentage.filter = 1;
        }
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
          // 计算方法是从正在看前期资料开始到交易完成一共9步，取百分比
          percentage = Math.round((maxRes - 3) / 9 * 100);
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
      setNews(reqNews.data.data);
    }
    fetchNewsData();

    async function fetchCompanyFile() {
      // const reqComDataroom = await api.queryDataRoom({ isCompanyFile: 1 });
      // const { count, data: companyDataroom } = reqComDataroom.data;
      // if (count == 0) return;
      // const dataroomId = companyDataroom[0].id;
      // Hard-coded dataroom ID because there are other company datarooms for different industry groups which is not what we need
      const params = {
        dataroom: 214,
        isFile: true,
        page_size: 4, // not working
        sort: 'createdtime',
        desc: 1,
      }
      const reqComFile = await api.queryDataRoomFile(params);
      setFiles(reqComFile.data.data.slice(0, 4))
    }
    fetchCompanyFile();

    async function fetchAndRenderPieChartData() {
      const startMoment = moment().startOf('year');
      const endMoment = moment().endOf('year');
      
      const startTime = startMoment.format('YYYY-MM-DDTHH:mm:ss');
      const endTime = `${endMoment.format('YYYY-MM-DD')}T23:59:59`;

      const stime = startTime;
      const etime = endTime;
      const stimeM = startTime;
      const etimeM = endTime;

      const params = { stime, etime, stimeM, etimeM, createuser: userInfo.id, page_size: 1 };
      const req = await Promise.all([
        api.getProjBDCom(params),
        getOrgStatics(params),
        getCompanyFileStatics(params),
      ]);
      setPieChartData(req.map((m, i) => {
        return {
          name: PieChartDataName[i],
          value: m.data.count,
        };
      }));
    }
    async function getCompanyFileStatics(params) {
      const allGroups = await props.dispatch({ type: 'app/getIndustryGroup' });
      const indGroupDetails = getUserIndustryGroupDetails(userInfo.indGroups, allGroups);
      const userIndDataroomID = indGroupDetails.map(m => m.dataroom_id).filter(f => f != null);
      if (userIndDataroomID.length === 0) return { data: { count: 0 } };
      const req = await Promise.all(userIndDataroomID.map(m => api.queryDataRoomFile({ ...params, dataroom: m })));
      const count = req.reduce((prev, curr) => {
        return prev + curr.data.count;
      }, 0);
      return { data: { count } };
    }

    async function getOrgStatics(params) {
      const req = await Promise.all([
        api.getOrgRemark(params),
        api.getOrgAttachment(params),
      ]);
      const count = req.reduce((prev, curr) => {
        return prev + curr.data.count;
      }, 0);
      return { data: { count } };
    }

    fetchAndRenderPieChartData();
  }, []);

  function handleCompanyFileClick(file) {
    if (/\.pdf$/i.test(file.filename)) {
      const { dataroom: dataroomId, id: fileId } = file;
      const originalEmail = isLogin().email || 'Investarget'
      const watermark = originalEmail.replace('@', '[at]');
      const org = isLogin().org ? isLogin().org.orgfullname : 'Investarget';
      const url = '/pdf_viewer.html?file=' + btoa(encodeURIComponent(file.fileurl)) +
        '&dataroomId=' + encodeURIComponent(dataroomId) + '&fileId=' + encodeURIComponent(fileId) +
        '&watermark=' + encodeURIComponent(watermark) + '&org=' + encodeURIComponent(org) + '&locale=' + encodeURIComponent(window.LANG)
      window.open(url, '_blank', 'noopener')
    } else if ((/\.(doc|docx|xls|xlsx|ppt|pptx)$/i).test(file.filename)) {
      api.downloadUrl(file.bucket, file.realfilekey)
        .then(result => {
          setDownloadUrl(result.data);
          setTimeout(() => setDownloadUrl(null), 1000);
        })
    } else {
      window.open(file.fileurl, '_blank', 'noopener');
    }
  }

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

  function getUserIndGroupDetails(indGroups) {
    if (props.industryGroup.length > 0) {
      const result = indGroups.map(m => {
        const group = props.industryGroup.find(f => f.id === m);
        return group;
      });
      return result;
    }
    return [];
  }

  function getUserIndustryGroupDetails(indGroups, allGroups) {
    if (indGroups && allGroups) {
      const result = indGroups.map(m => {
        const group = allGroups.find(f => f.id === m);
        return group;
      });
      return result;
    }
    return [];
  }

  function getOngoingProjectsFeishuUrl(indGroups) {
    const indGroupsDetails = getUserIndGroupDetails(indGroups);
    return indGroupsDetails.filter(f => f.ongongingurl);
  }

  function generateUserDescription() {
    if (!userInfo) return '';
    const arr = [];
    if (userInfo.indGroup) {
      const indGroups = getUserIndGroupDetails(userInfo.indGroups);
      arr.push('项目组 ' + indGroups.map(m => m.name).join('、'));
    }
    // if (userInfo.title) {
    //   arr.push('职位: ' + userInfo.title.name);
    // }
    if (userInfo.entryTime) {
      arr.push('入职时间: ' + userInfo.entryTime.slice(0, 10));
    }
    if (userInfo.indGroup) {
      arr.push('进行中的项目数' + projNum);
    }
    return arr.join('&nbsp;&nbsp;');
  }

  // function displayPieChartLabel({
  //   cx,
  //   cy,
  //   midAngle,
  //   innerRadius,
  //   outerRadius,
  //   value,
  //   index
  // }) {
  //   const RADIAN = Math.PI / 180;
  //   const radius = 25 + innerRadius + (outerRadius - innerRadius);
  //   const x = cx + radius * Math.cos(-midAngle * RADIAN);
  //   const y = cy + radius * Math.sin(-midAngle * RADIAN);

  //   return (
  //     <text
  //       x={x}
  //       y={y}
  //       fill={COLORS[index]}
  //       textAnchor={x > cx ? "start" : "end"}
  //       dominantBaseline="central"
  //     >
  //       {pieChartData[index].name} ({value})
  //     </text>
  //   );
  // }

  function generateTrainingDocsTitle() {
    const titleArr = [
      { name: '协议\n模板', link: '/app/dataroom/company/detail?id=214&isClose=false&projectID=499&projectTitle=多维海拓&key=78560' },
      { name: '系统\n手册', link: '/app/dataroom/company/detail?id=214&isClose=false&projectID=499&projectTitle=多维海拓&key=76081' },
      { name: '员工\n手册', link: '/app/dataroom/company/detail?id=214&isClose=false&projectID=499&projectTitle=多维海拓&key=59751' },
    ];
    const elements = titleArr.map((m, i) => (
      <div key={i} style={{ marginRight: 10, border: '1px solid #339bd2', borderRadius: 4, fontSize: 10, width: 30, height: 40, whiteSpace: 'pre-wrap', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Link to={m.link}>{m.name}</Link>
      </div>
    ));
    return (
      <div style={{ display: 'flex' }}>{elements}</div>
    );
  }

  function generateShortcutOperation() {
    const titleArr = [
      { name: '新增\n线索\n项目', link: '/app/projects/bd/add' },
      { name: '新增\n投前\n项目', link: '/app/projects/add' },
      { name: '新增\n投资人', link: `/app/user/add?redirect=${encodeURIComponent('/app')}` },
      { name: '投资人\n管理', link: '/app/organization/list' },
      { name: '日程管理', link: '/app/schedule' },
    ];
    const elements = titleArr.map((m, i) => (
      <div key={i} style={{ lineHeight: 1.2, border: '1px solid #339bd2', borderRadius: 4, fontSize: 11, width: 50, height: 50, whiteSpace: 'pre-wrap', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Link to={m.link}>{m.name}</Link>
      </div>
    ));
    return (
      <div style={{ display: 'flex', gap: 10 }}>{elements}</div>
    );
  }

  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>工作台</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img style={{ display: 'block', height: 80, width: 80, borderRadius: '50%' }} src={userInfo && userInfo.photourl} />
          <div style={{ marginLeft: 20 }}>
            <div style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'bold' }}>{userInfo && userInfo.username} 祝您开心每一天！</div>
            <div style={{ fontSize: 16, lineHeight: '24px', marginTop: 8, color: '#595959' }} dangerouslySetInnerHTML={{ __html: generateUserDescription() }} />
          </div>
        </div>
        {generateShortcutOperation()}
      </div>

      <Card title="进行中的项目" extra={<Link to="/app/projects/list">全部项目</Link>} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: 18, display: 'flex', overflowX: 'scroll', gap: 18  }}>
          {loadingOnGoingProjects && [1, 2, 3, 4].map(m => <div key={m}>
            <Card loading style={{ width: 250 }} />
          </div>)}
          {!loadingOnGoingProjects && projList.map(m => <div key={m.id}>
            <ProjectCard record={m} country={props.country} />
          </div>)}
          {!loadingOnGoingProjects && projList.length === 0 && <Empty style={{ margin: '20px auto' }} />}
        </div>
      </Card>

      <div className="site-card-wrapper" style={{ margin: '20px 0' }}>
        <Row gutter={20}>

          <Col span={16}>
            <div className="card-container min-height">
              <Tabs type="card" size="large" activeKey={activeTabKey} onChange={key => setActiveTabKey(key)}>
                <TabPane tab="线索项目" key="0">
                  <ProjectBdTable />
                </TabPane>
                <TabPane tab="业务数据" key="-1">
                  <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PieChart width={400} height={400}>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        // label={displayPieChartLabel}
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                    </PieChart>

                    <div style={{ width: 250 }}>
                      <div style={{ ...pieChartLabelTextStyle, textAlign: 'center', marginBottom: 20 }}>{moment().startOf('year').format('YYYY-MM-DD')} 至今</div>
                      {pieChartData.map((m, i) => (
                        <div key={i} style={{ ...pieChartLabelContainerStyle, justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={pieChartLabelContainerStyle}>
                            <div style={{ ...pieChartLabelColorStyle, background: COLORS[i] }} />
                            <div style={pieChartLabelTextStyle}>{m.name}</div>
                            {/* <div style={pieChartPercentageStyle}>{m.percentage}</div> */}
                          </div>
                          <div style={pieChartLabelTextStyle}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                  </div>
                </TabPane>
                {userInfo && userInfo.indGroups && userInfo.thirdUnionID && getOngoingProjectsFeishuUrl(userInfo.indGroups).map(m => (
                  <TabPane tab={<span>{m.name}任务<Button style={{ marginLeft: 10 }} disabled={parseInt(activeTabKey) !== m.id} type="text" size="small" onClick={() => setIsFullScreen(m.id)} icon={<FullscreenOutlined />}></Button></span>} key={m.id}>
                    <Fullscreen enabled={isFullScreen === m.id} onChange={isFullScreen => { window.echo('if', isFullScreen); setIsFullScreen(isFullScreen ? m.id : null) }}>
                      <iframe key={m.id} src={m.ongongingurl} style={{ ...iframeStyle, height: isFullScreen === m.id ? '100%' : 552 }} />
                    </Fullscreen>
                  </TabPane>
                ))}
              </Tabs>
            </div>
          </Col>

          <Col span={8}>

            <Card title="市场消息" bordered={false} style={{ marginBottom: 20, fontSize: 14, lineHeight: '22px', minHeight: 210 }} extra={<Link to="/app/wxmsg">查看更多</Link>}>
              <Carousel autoplay dots={false}>
                {news.map(item => {
                  return (
                    <div key={item.id}>
                      <div style={{ color: '#262626' }}>{trimTextIfExceedMaximumCount(item.content, 60)}</div>
                      {news && <div style={{ marginTop: 10, color: '#989898' }}>发布时间：{item.createtime.slice(0, 10)}</div>}
                    </div>
                  );
                })}
                {news.length === 0 && <div style={{ color: '#262626' }}>{i18n('no_news')}</div>}
              </Carousel>
            </Card>

            <Card title={generateTrainingDocsTitle()} bordered={false} extra={<Link to="/app/dataroom/company/list">全部文件</Link>} bodyStyle={{ padding: 0, paddingBottom: 20 }} style={{ minHeight: 400 }}>
              {files.map(m => (
                <div key={m.id} onClick={() => handleCompanyFileClick(m)} style={{ cursor: 'pointer', height: 80, padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e6e6e6' }}>
                  {getFileIconByType(getFileTypeByName(m.filename))}
                  <div style={{ marginLeft: 8 }}>
                    <Tooltip title={getFilenameWithoutExt(m.filename)}>
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#262626' }}>
                        {trimTextIfExceedMaximumCount(getFilenameWithoutExt(m.filename), 20)}
                      </div>
                    </Tooltip>
                    <div style={{ fontSize: 12, lineHeight: '18px', color: '#989898' }}>
                      {m.size && formatBytes(m.size) + ' / '}{getFileTypeByName(m.filename)} / {m.createdtime.slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
            </Card>

          </Col>

        </Row>
      </div>

      <Card title="工作日程">
        <MySchedule />
      </Card>

      <iframe style={{display: 'none' }} src={downloadUrl}></iframe>
    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { country, industryGroup } = state.app;
  return { country, industryGroup };
}

export default connect(mapStateToProps)(Dashboard);
