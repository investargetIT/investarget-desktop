import React, { useState, useEffect } from 'react';
import { i18n } from '../utils/util';
import { Table } from 'antd';

export default function() {

  const [projBdList, setProjBdList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const params = {
        page_index: 3,
        page_size: 8,
      }
      const req = await api.getProjBDList(params);
      setProjBdList(req.data.data);
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: i18n('project_bd.project_name'),
      dataIndex: 'com_name',
      key: 'com_name',
      render: text => <span style={{ color: '#339bd2' }}>{text}</span>
    },
    {
      title: i18n('project_bd.status'),
      dataIndex: ['bd_status', 'name'],
      key: 'bd_status',
      render: text => <span style={{ color: '#595959' }}>{text}</span>
    },
    {
      title: i18n('project_bd.manager'),
      key: 'manager',
      render: (_, record) => {
        const { main, normal } = record.manager;
        let allManagers = [];
        if (main) {
          allManagers.push(main.username);
        }
        if (normal) {
          allManagers = allManagers.concat(normal.map(m => m.manager.username));
        }
        return <span style={{ color: '#595959' }}>{allManagers.join('、')}</span>;
      },
    },
    {
      title: i18n('project_bd.created_time'),
      key: 'createdtime',
      render: (_, record) => (
        <span style={{ color: '#595959' }}>
          {record.createdtime.slice(0, 10)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={projBdList}
        rowKey={record => record.id}
        pagination={false}
      />
    </div>
  );
}
