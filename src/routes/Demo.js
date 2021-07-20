import React, { useState } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { withRouter } from 'dva/router';
import { Table, Tag, Tree, Button } from 'antd';

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
        return isEdit ? (
          <Tree
            checkable
            defaultExpandedKeys={['0-0-0', '0-0-1']}
            defaultSelectedKeys={['0-0-0', '0-0-1']}
            defaultCheckedKeys={['0-0-0', '0-0-1']}
            onSelect={onSelect}
            onCheck={onCheck}
            treeData={treeData}
          />
        ) : <Tag>预沟通</Tag>;
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

  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
              disableCheckbox: true,
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [{ title: <span style={{ color: '#1890ff' }}>sss</span>, key: '0-0-1-0' }],
        },
      ],
    },
  ];

  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  const onCheck = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };

	return (
    <LeftRightLayoutPure location={props.location}>
      <Table columns={columns} dataSource={data} />
    </LeftRightLayoutPure>
  );
}

export default withRouter(Demo);
