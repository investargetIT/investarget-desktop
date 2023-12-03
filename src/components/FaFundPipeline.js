import React, { useState, useRef } from 'react';
import { Steps, Card, Table } from 'antd';
import {
  FormFundInfo,
  FormFundFiling,
  FormFundEst,
  FormFundBankInfo,
} from './FormFund';

const { Step } = Steps;

function FaFundPipeline() {
  
  const [current, setCurrent] = useState(0);

  const kickoffMeetingformRef = useRef(null);

  const onChange = (value) => {
    setCurrent(value);
  };
  
  const columns = [
    {
      title: '提款批次',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '提款金额',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '提款日期',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '截止日期',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'call款方式',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'call款类型',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '备注',
      dataIndex: 'address',
      key: 'address',
    },
  ];

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
              {/* <Card title="立项材料" style={{ marginBottom: 20 }}>
              </Card>
              <Card title="立项会" style={{ marginBottom: 20 }}>
              </Card> */}
            </div>
          )}
          {current === 2 && (
            <div>
              <Card title="基金协议" style={{ marginBottom: 20 }}>
              </Card>
            </div>
          )}
          {current === 3 && (
            <div>
              <Card title="相关文档" style={{ marginBottom: 20 }}>
                <FormFundEst />
              </Card>
              <Card title="托管银行" style={{ marginBottom: 20 }}>
                <FormFundBankInfo />
              </Card>
            </div>
          )}
          {current === 4 && (
            <Card title="提款信息" style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 20 }}>累计提款：0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;累计实缴：0</div>
              <Table size="small" style={{ border: '1px solid #f0f0f0', borderBottomWidth: 0 }} dataSource={[]} columns={columns} />
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
