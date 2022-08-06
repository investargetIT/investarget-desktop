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

const { TabPane } = Tabs;
const iframeStyle = {
  border: 'none',
  width: '100%',
  height: '800px',
}

function Dashboard(props) {
  const userInfo = getUserInfo();
  
  const [projList, setProjList] = useState([]);
  const [news, setNews] = useState([]);
  const [files, setFiles] = useState([]);
  const [projNum, setProjNum] = useState(0);
  const [loadingOnGoingProjects, setLoadingOnGoingProjects] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'country' });

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
        max_size: 4,
        projstatus: ongoingStatus.map(m => m.id),
        sort: 'publishDate',
        desc: 1,
        user: userInfo && userInfo.id, // dashboard 应该显示当前用户参与的项目，无论他是否有平台项目管理权限
        iscomproj: 0,
      }
      const reqProj = await api.getProj(params);
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

    async function renderFeishu() {
      const app_id = 'cli_a298cb5f4c78d00b';
      const app_secret = 'M7TVsEt2i06Yx3pNQTHj4e7EAzTudqE1';

      // call endpoint to get app_access_token
      const reqAppAccessToken = await api.getAppAccessToken({ app_id, app_secret });
      const { data: { app_access_token } } = reqAppAccessToken;

      const redirect_url = 'http://localhost:8000/feishu.html';
      const auth_url = `https://open.feishu.cn/open-apis/authen/v1/index?app_id=${app_id}&redirect_uri=${encodeURIComponent(redirect_url)}&state=RANDOMSTATE`;
      console.log('auth url', auth_url);
      const code = '17h9IPP0t3G828xtmqhWtg4g73P1k5CHUO004kQaw8kh';

      const user_access_token = 'u-00HD.UVHp729eBA3652azz4g5zr1k5Kzr200ghAawdhg';

      // call endpoint to get jsapi_ticket
      const reqTicket = await api.getTicket({ Authorization: app_access_token });
      const { data: { data: { ticket: jsapi_ticket } } } = reqTicket;

      const timestamp = Date.now().toString();
      const noncestr = 'Y7a8KkqX041bsSwT';
      const url = 'http://localhost:8000/feishu.html1';
      const str = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
      console.log('sha', sha1(''), Date.now());
      window.webComponent.config({
        openId: '',    // 当前登录用户的open id，要确保与生成 signature 使用的 user_access_token 相对应，使用 app_access_token 时此项不填。注意：仅云文档组件可使用app_access_token
        signature: sha1(str), // 签名
        appId: app_id,     // 应用 appId
        timestamp: timestamp, // 时间戳（毫秒）
        nonceStr: noncestr,  // 随机字符串
        url,       // 第3步参与加密计算的url
        jsApiList: ['DocsComponent'], // 指定要使用的组件列表，请根据对应组件的开发文档填写。如云文档组件，填写['DocsComponent']
        lang: 'zh',      // 指定组件的国际化语言：en-英文、zh-中文、ja-日文
      }).then(res => {
        // 可以在这里进行组件动态渲染
        console.log('res', res);

        // window.addOpenDocDynamical = function () {
        // 动态渲染，返回组件实例。
        const myComponent = window.webComponent.render(
          'DocsComponent',
          { //组件参数
            src: 'https://t3ionjsf4i.feishu.cn/docs/doccnEQbSn23dEupsE0KapGd6Sh',
            // minHeight: window.innerHeight - 48,
            minHeight: 590,
            width: '100%',
          },
          document.querySelector('#feishu'), // 将组件挂在到哪个元素上
        )
        // }
        window.removeOpenDocDynamical = function () {
          // 销毁组件
          myComponent.unmount()
        }

      });

      window.webComponent.onAuthError(function (error) {
        console.error('auth error callback', error)
      });
    }
    // renderFeishu();
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

  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>工作台</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
        <img style={{ display: 'block', height: 80, width: 80, borderRadius: '50%' }} src={userInfo && userInfo.photourl} />
        <div style={{ marginLeft: 20 }}>
          <div style={{ fontSize: 24, lineHeight: '32px', fontWeight: 'bold' }}>{userInfo && userInfo.username} 祝您开心每一天！</div>
          {userInfo && userInfo.indGroup && <div style={{ fontSize: 16, lineHeight: '24px', marginTop: 8, color: '#595959' }}>{userInfo.indGroup.name} |  项目数 {projNum}</div>}
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
                <TabPane tab={<span>当前任务<Button style={{ marginLeft: 10 }} disabled={!userInfo || !userInfo.indGroup || !userInfo.indGroup.ongongingurl} type="text" size="small" onClick={() => setIsFullScreen(true)} icon={<FullscreenOutlined />}></Button></span>} key="1">
                  {userInfo && userInfo.indGroup && userInfo.indGroup.ongongingurl ? (
                    <Fullscreen enabled={isFullScreen} onChange={isFullScreen => setIsFullScreen(isFullScreen)}>
                      <iframe src={userInfo.indGroup.ongongingurl} style={{ ...iframeStyle, height: isFullScreen ? '100%': 800 }} />
                    </Fullscreen>
                  ) : '暂无'}
                </TabPane>
                <TabPane tab="项目BD" key="2">
                  <ProjectBdTable />
                </TabPane>
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

            <Card title="公司培训文件" bordered={false} extra={<Link to="/app/dataroom/company/list">全部文件</Link>} bodyStyle={{ padding: 0, paddingBottom: 20 }} style={{ minHeight: 400 }}>
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
  const { country } = state.app
  return { country };
}

export default connect(mapStateToProps)(Dashboard);
