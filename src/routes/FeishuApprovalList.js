import React, { useState, useEffect } from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo, requestAllData } from '../utils/util';
import { Table, Button, Popconfirm } from 'antd';

function FeishuApprovalList(props) {

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  
  useEffect(() => {
    getApprovalList();
  }, []);

  async function getApprovalList() {
    setLoading(true);
    const currentUser = getUserInfo();
    const { thirdUnionID: user_id } = currentUser;
    if (!user_id) return;
    const req = await requestAllData(api.getFeishuApprovalTaskList, { user_id, user_id_type: 'union_id' }, 10);
    let { task_list } = req.data.data;
    task_list = task_list.filter(f => f.task.status === 'pending');
    const reqTaskDetails = await Promise.all(task_list.map(m => api.getFeishuApprovalDetails({ instance_id: m.instance.code })));
    const allTasks = reqTaskDetails.reduce((prev, curr, currIdx) => {
      const current = { ...task_list[currIdx], details: curr.data.data };
      return prev.concat(current);
    }, []);
    setList(allTasks);
    setLoading(false);
  }

  async function handleOperationBtnClicked(type, record) {
    const { code: approval_code } = record.approval;
    const { code: instance_code } = record.instance;
    const { task_id } = record.task;
    const currentUser = getUserInfo();
    const { thirdUnionID: user_id } = currentUser;
    const body = { approval_code, instance_code, user_id, user_id_type: 'union_id', task_id };
    await api.editFeishuApproval(type, body);
    getApprovalList();
  }

  const columns = [
    {
      title: '名称',
      dataIndex: ['details', 'approval_name'],
      key: 'name',
    },
    {
      title: '详情',
      dataIndex: ['details', 'form'],
      key: 'details',
      render: text => {
        const obj = JSON.parse(text);
        if (obj.length > 0) {
          let newStr = '';
          for (const key in obj[0].value) {
            if (Object.hasOwnProperty.call(obj[0].value, key)) {
              const value = obj[0]['value'][key];
              if (typeof value == 'object' || !value) continue;
              newStr += `${key}: ${value}\n`;
            }
          }
          return <div dangerouslySetInnerHTML={{ __html: newStr.replace(/\n/g, '<br>') }}></div>;
        }
      },
    },
    {
      title: '状态',
      dataIndex: ['details', 'status'],
      key: 'status'
    },
    {
      title: '操作',
      key: 'operation',
      width: 200,
      align: 'center',
      render: record => {
        return (
          <div>
            <Popconfirm title="确认同意？" onConfirm={() => handleOperationBtnClicked('approve', record)}>
              <Button type="link" size="small">同意</Button>
            </Popconfirm>
            <Popconfirm title="确认同意？" onConfirm={() => handleOperationBtnClicked('reject', record)}>
              <Button type="link" size="small">拒绝</Button>
            </Popconfirm>
            <Popconfirm title="确认同意？" onConfirm={() => handleOperationBtnClicked('specified_rollback', record)}>
              <Button type="link" size="small">退回</Button>
            </Popconfirm>
          </div>
        );
      },
    }
  ];

  return (
    <LeftRightLayout location={props.location} title="飞书审批任务列表">
      <Table
        columns={columns}
        dataSource={list}
        rowKey={record => record.details.uuid}
        loading={loading}
        pagination={false}
      />
    </LeftRightLayout>
  );
}
export default FeishuApprovalList;
