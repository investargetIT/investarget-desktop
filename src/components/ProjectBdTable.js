import React, { useState, useEffect } from 'react';
import { i18n } from '../utils/util';
import { Table, Popover } from 'antd';

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

  function showPhoneNumber(item) {
    const { usermobile } = item;
    if (!usermobile) return '暂无';
    const { bduser } = item;
    if (bduser || usermobile.startsWith('+')) return usermobile;
    return `+${usermobile}`;
  }

  const columns = [
    {
      title: i18n('project_bd.project_name'),
      dataIndex: 'com_name',
      key: 'com_name',
      render: (text, record) => (
        <div style={{ position: 'relative', lineHeight: '27px' }}>
          {record.isimportant ? <img style={{ position: 'absolute', height: '10px', width: '10px', marginTop: '-5px', marginLeft: '-5px' }} src="/images/important.png" /> : null}
          {record.source_type === 0 ?
            <Popover title="项目方联系方式" content={
              <div>
                <div>{`姓名：${record.username || '暂无'}`}</div>
                <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                <div>{`电话：${showPhoneNumber(record)}`}</div>
                <div>{`邮箱：${record.useremail || '暂无'}`}</div>
              </div>
            }>
              <a target="_blank" href={"/app/projects/library/" + encodeURIComponent(text)} style={{ color: '#339bd2' }}>{text}</a>
            </Popover>
            :
            <Popover title="项目方联系方式" content={
              <div>
                <div>{`姓名：${record.username || '暂无'}`}</div>
                <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                <div>{`电话：${showPhoneNumber(record)}`}</div>
                <div>{`邮箱：${record.useremail || '暂无'}`}</div>
              </div>
            }>
              <div style={{ color: "#339bd2" }}>{text}</div>
            </Popover>
          }
        </div>
      ),
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
