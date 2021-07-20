import React from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { withRouter } from 'dva/router';
import { Table, Tag, Space } from 'antd';

function Demo(props) {

  const columns = [
    {
      title: '机构名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <a>{text}</a>,
    },
    {
      title: '机构进度',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '材料情况',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '联系时间',
      dataIndex: 'datetime',
      key: 'datetime',
    },
    {
      title: '机构反馈',
      dataIndex: 'feedback',
      key: 'feedback',
      width: 200,
    },
    {
      title: '应对策略',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 200,
    },
    {
      title: '优先级',
      key: 'tags',
      dataIndex: 'tags',
      render: tags => (
        <div>
          {tags.map(tag => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'loser') {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <a>编辑</a>
        </Space>
      ),
    },
  ];
  
  const data = [
    {
      key: '1',
      name: 'Arena',
      age: 32,
      datetime: '2021/07/15',
      feedback: '对公司长期看好，但内部推动项目投决需要有一两个云上的客户才有机会，pingcap是凭借其在北美已经获取的2个云客户获得的投资',
      strategy: '本轮机会较小，保持交流，snowflak第二任ceo是由arena推荐进入，长期战略价值高​',
      address: 'New York No. 1 Lake Park',
      tags: ['低'],
    },
  ];

	return (
    <LeftRightLayoutPure location={props.location}>
      <Table columns={columns} dataSource={data} />
    </LeftRightLayoutPure>
  );
}

export default withRouter(Demo);
