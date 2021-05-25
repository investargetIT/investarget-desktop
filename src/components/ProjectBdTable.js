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
