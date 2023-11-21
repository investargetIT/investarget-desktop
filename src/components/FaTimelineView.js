import React, { useState, useEffect } from 'react';
import { Steps, Card } from 'antd';

const { Step } = Steps;

function FaTimelineView() {
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {}, []);

  const onChange = (value) => {
    console.log('onChange:', current);
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
        <Card title="立项材料"></Card>
      </div>
    </div>
  );
}

export default FaTimelineView;
