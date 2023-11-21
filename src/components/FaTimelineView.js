import React, { useState, useEffect } from 'react';
import { Steps } from 'antd';

const { Step } = Steps;

function FaTimelineView() {
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {}, []);

  const onChange = (value) => {
    console.log('onChange:', current);
    setCurrent(value);
  };

  return (
    <Steps current={current} onChange={onChange} direction="vertical">
      <Step title="项目基础信息" subTitle={current === 0 ? '进行中' : undefined} />
      <Step title="立项" subTitle={current === 1 ? '进行中' : undefined} />
      <Step title="尽职调查" subTitle={current === 2 ? '进行中' : undefined} />
      <Step title="投资决策" subTitle={current === 3 ? '进行中' : undefined} />
      <Step title="协议签署" subTitle={current === 4 ? '进行中' : undefined} />
      <Step title="付款交割" subTitle={current === 5 ? '进行中' : undefined} />
    </Steps>
  );
}

export default FaTimelineView;
