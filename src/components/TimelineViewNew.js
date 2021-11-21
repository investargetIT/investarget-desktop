import React, { useState, useEffect } from 'react';
import { Steps, Tag } from 'antd';
import * as api from '../api';
import {
  hasPerm,
  getCurrentUser,
  requestAllData,
} from '../utils/util';
import ViewInvestorsInTimeline from './ViewInvestorsInTimeline';

const { Step } = Steps;

function TimelineViewNew({ projID }) {

  const [orgbdres, setOrgbdres] = useState([]);
  const [projectDetails, setProjectDetails] = useState({
    id: projID,
    projtitle: '',
    percentage: 0,
    step: 0, // 项目进程时间轴所在的步骤
  });
  const [allOrgBD, setAllOrgBD] = useState([]);
  const [showInvestorStep, setShowInvestorStep] = useState();

  useEffect(() => {

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
        page_size: 100,
        response: orgbdres.map(m => m.id)
      };
      if (!hasPerm('BD.manageOrgBD')) {
        params.manager = getCurrentUser();
      }
      const res = await requestAllData(api.getOrgBdList, params, 100);
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

  }, []);

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

  function handleShowInvestorsIconClick(step) {
    if (showInvestorStep === step) {
      setShowInvestorStep();
      return;
    }
    setShowInvestorStep(step);
  }

  return (
    <Steps style={{ marginBottom: 7 }} className="timeline-steps" direction="vertical" current={projectDetails.step} size="small">
      {
        orgbdres.slice(3).map((status, index) => {
          const list = allOrgBD.filter(item => {
            const response = orgbdres.filter(f => f.id === item.response);
            if (response.length === 0) return false;
            const curRes = response[0];
            return curRes.name === status.name;
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
                      onShowInvestorBtnClicked={() => handleShowInvestorsIconClick(step)}
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
  );
}

export default TimelineViewNew;
