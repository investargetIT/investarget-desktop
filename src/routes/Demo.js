import React, { useState } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { withRouter } from 'dva/router';
import { Table, Tag, Cascader, Button } from 'antd';

function Demo(props) {

  const [isEdit, setIsEdit] = useState(false);

  function handleEditBtnClick() {
    setIsEdit(true);
  }

  function handleConfirmBtnClick() {
    setIsEdit(false);
  }

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
      render: (text, record) => {
        return isEdit ? <Cascader options={options} onChange={onChange} placeholder="Please select" /> : <Tag>预沟通</Tag>;
      },
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
      align: 'center',
      key: 'action',
      render: (text, record) => isEdit ? <Button type="link" onClick={handleConfirmBtnClick}>确定</Button> : <Button type="link" onClick={handleEditBtnClick}>编辑</Button>,
    },
  ];
  
  const data = [
    {
      key: '1',
      name: 'Avenue',
      age: '预沟通',
      address: 'Teaser',
      datetime: '2021/07/15',
      feedback: '对公司长期看好，但内部推动项目投决需要有一两个云上的客户才有机会，pingcap是凭借其在北美已经获取的2个云客户获得的投资',
      strategy: '本轮机会较小，保持交流，snowflak第二任ceo是由arena推荐进入，长期战略价值高​',
      tags: ['低'],
    },
  ];

  const options = [
    {
      value: '暂未联系',
      label: '暂未联系',
    },
    {
      value: '预沟通',
      label: '预沟通',
      children: [
        {
          value: '无材料',
          label: '无材料',
        },
        {
          value: 'Teaser',
          label: 'Teaser',
        },
        {
          value: 'BP',
          label: 'BP',
        },
        {
          value: 'DP',
          label: 'DP',
        },
        {
          value: '补充材料',
          label: '补充材料',
        },
      ],
    },
    {
      value: 'jiangsu',
      label: 'Jiangsu',
      children: [
        {
          value: 'nanjing',
          label: 'Nanjing',
          children: [
            {
              value: 'zhonghuamen',
              label: 'Zhong Hua Men',
            },
          ],
        },
      ],
    },
  ];

  function onChange(value) {
    console.log(value);
  }

	return (
    <LeftRightLayoutPure location={props.location}>
      <Table columns={columns} dataSource={data} />
    </LeftRightLayoutPure>
  );
}

export default withRouter(Demo);
