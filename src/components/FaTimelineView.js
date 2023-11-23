import React, { useState, useRef } from 'react';
import { Steps, Card } from 'antd';
import {
  FormProjectBasicInfo,
  FormKickoffMeeting,
  FormKickoffDocs,
  FormProjectBasicInfoDocs,
} from './FormPreInvest';

const { Step } = Steps;

function FaTimelineView() {
  
  const [current, setCurrent] = useState(0);

  const kickoffMeetingformRef = useRef(null);

  const onChange = (value) => {
    setCurrent(value);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: 250, padding: 20 }}>
        <Steps className="fa-timeline-steps" current={current} onChange={onChange} direction="vertical">
          <Step title="项目基础信息" description={current > 0 ? '2022-10-01' : undefined} subTitle={current === 0 ? '进行中' : undefined} />
          <Step title="立项" description={current > 1 ? '2022-10-01' : undefined} subTitle={current === 1 ? '进行中' : undefined} />
          <Step title="尽职调查" description={current > 2 ? '2022-10-01' : undefined} subTitle={current === 2 ? '进行中' : undefined} />
          <Step title="投资决策" description={current > 3 ? '2022-10-01' : undefined} subTitle={current === 3 ? '进行中' : undefined} />
          <Step title="协议签署" description={current > 4 ? '2022-10-01' : undefined} subTitle={current === 4 ? '进行中' : undefined} />
          <Step title="付款交割" description={current > 5 ? '2022-10-01' : undefined} subTitle={current === 5 ? '进行中' : undefined} />
        </Steps>
      </div>
      <div style={{ flex: 1 }}>
        {current === 0 && (
          <div>
            <Card title="项目信息" style={{ marginBottom: 20 }}>
              <FormProjectBasicInfo />
            </Card>
            <Card title="项目材料" style={{ marginBottom: 20 }}>
              <FormProjectBasicInfoDocs />
            </Card>
          </div>
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

      </div>
    </div>
  );
}

export default FaTimelineView;
