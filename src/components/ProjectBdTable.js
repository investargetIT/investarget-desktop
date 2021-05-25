import React, { useState, useEffect } from 'react';
import { i18n, timeWithoutHour } from '../utils/util';
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
    },
    {
      title: i18n('project_bd.status'),
      dataIndex: ['bd_status', 'name'],
      key: 'bd_status',
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
        return allManagers.join('、');
      },
    },
    {
      title: i18n('project_bd.created_time'),
      key: 'createdtime',
      render: (_, record) => {
        return timeWithoutHour(record.createdtime + record.timezone)
      }
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
