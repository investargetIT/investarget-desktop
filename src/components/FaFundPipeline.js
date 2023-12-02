import React, { useState, useRef } from 'react';
import { Steps, Card } from 'antd';
import {
  FormProjectBasicInfo,
  FormProjectBasicInfoDocs,
  FormKickoffMeeting,
  FormKickoffDocs,
  FormInvestigationInfo,
  FormInvestigationDocs,
  FormDecisionMeeting,
  FormInvestmentDocs,
  FormPaymentDocs,
  FormFundInfo,
  FormFundFiling,
} from './FormFund';

const { Step } = Steps;

function FaFundPipeline() {
  
  const [current, setCurrent] = useState(0);

  const kickoffMeetingformRef = useRef(null);

  const onChange = (value) => {
    setCurrent(value);
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 250, padding: 20 }}>
          <Steps className="fa-timeline-steps" current={current} onChange={onChange} direction="vertical">
            <Step title="筹备" description={current > 0 ? '2022-10-01' : undefined} subTitle={current === 0 ? '进行中' : undefined} />
            <Step title="募集" description={current > 1 ? '2022-10-01' : undefined} subTitle={current === 1 ? '进行中' : undefined} />
            <Step title="协议签署" description={current > 2 ? '2022-10-01' : undefined} subTitle={current === 2 ? '进行中' : undefined} />
            <Step title="设立" description={current > 3 ? '2022-10-01' : undefined} subTitle={current === 3 ? '进行中' : undefined} />
            <Step title="提款" description={current > 4 ? '2022-10-01' : undefined} subTitle={current === 4 ? '进行中' : undefined} />
            <Step title="备案" description={current > 5 ? '2022-10-01' : undefined} subTitle={current === 5 ? '进行中' : undefined} />
          </Steps>
        </div>
        <div style={{ flex: 1 }}>
          {current === 0 && (
            <Card title="基金信息" style={{ marginBottom: 20 }}>
              <FormFundInfo />
            </Card>
          )}
          {current === 1 && (
            <div>
              <Card title="立项材料" style={{ marginBottom: 20 }}>
                <FormKickoffDocs />
              </Card>
              <Card title="立项会" style={{ marginBottom: 20 }}>
                <FormKickoffMeeting ref={kickoffMeetingformRef} />
              </Card>
            </div>
          )}
          {current === 2 && (
            <div>
              <Card title="尽调机构" style={{ marginBottom: 20 }}>
                <FormInvestigationInfo />
              </Card>
              <Card title="尽调文档" style={{ marginBottom: 20 }}>
                <FormInvestigationDocs />
              </Card>
            </div>
          )}
          {current === 3 && (
            <div>
              <Card title="预沟通会" style={{ marginBottom: 20 }}>
              </Card>
              <Card title="投决会" style={{ marginBottom: 20 }}>
                <FormDecisionMeeting />
              </Card>
            </div>
          )}
          {current === 4 && (
            <Card title="协议信息" style={{ marginBottom: 20 }}>
              <FormInvestmentDocs />
            </Card>
          )}
          {current === 5 && (
            <Card title="基金备案" style={{ marginBottom: 20 }}>
              <FormFundFiling />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default FaFundPipeline;
