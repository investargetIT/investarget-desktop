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
    const currentUser = getUserInfo();
    const { thirdUnionID: user_id } = currentUser;
    if (!user_id) return;
    setLoading(true);
    const req = await requestAllData(api.getFeishuApprovalTaskList, { user_id, user_id_type: 'union_id' }, 10);
    let { task_list } = req.data.data;
    // task_list = task_list.filter(f => f.task.status === 'pending');

    const reqTaskDetails = await Promise.all(task_list.map(m => api.getFeishuApprovalDetails({ instance_id: m.instance.code })));
    const allTasks = reqTaskDetails.reduce((prev, curr, currIdx) => {
      const { approval_code, form } = curr.data.data;
      const summary = getSummaryFromJSON(approval_code, form);
      const current = { ...task_list[currIdx], details: curr.data.data, summary };
      return prev.concat(current);
    }, []);
    setList(allTasks);
    setLoading(false);

    const allTaskUser = allTasks.map(m => m.details.open_id);
    const reqUserDetails = await Promise.all(allTaskUser.map(m => api.getFeishuUser({
      user_id: m,
      user_id_type: 'open_id',
      department_id_type: 'open_department_id',
    })));
    const allTasksWithInitiator = reqUserDetails.reduce((prev, curr, currIdx) => {
      const { user: initiator } = curr.data.data;
      const current = { ...allTasks[currIdx], initiator };
      return prev.concat(current);
    }, []);
    setList(allTasksWithInitiator);
  }

  function getSummaryFromJSON(approvalCode, formStr) {
    const formData = JSON.parse(formStr);
    let formValue, keyToLabel;
    const result = [];
    switch (approvalCode) {
      // 外出
      case 'E7093406-FA36-4CFD-9A06-FC36EEB68063':
        formValue = formData[0].value;
        keyToLabel = {
          name: '外出类型',
          start: '开始时间',
          end: '结束时间',
          interval: '时长',
          reason: '理由',
        };
        for (const key in keyToLabel) {
          if (Object.hasOwnProperty.call(keyToLabel, key)) {
            const label = keyToLabel[key];
            let value = formValue[key];
            if (key === 'start' || key === 'end') {
              value = value.slice(0, 19).replace('T', ' ');
            } else if (key === 'interval') {
              value = value + ' ' + formValue['unit'];
            }
            result.push(label + '：' + value);
          }
        }
        break;
      
      case '0AEF151F-E4DD-4911-8F4E-CD97F655F0A9':
        window.echo('form data', formData);
        formValue = formData[0].value;
        keyToLabel = {
          name: '假期类型',
          start: '开始时间',
          end: '结束时间',
          interval: '时长',
          reason: '理由',
        };
        for (const key in keyToLabel) {
          if (Object.hasOwnProperty.call(keyToLabel, key)) {
            const label = keyToLabel[key];
            let value = formValue[key];
            if (key === 'start' || key === 'end') {
              value = value.slice(0, 19).replace('T', ' ');
            } else if (key === 'interval') {
              value = value + ' ' + formValue['unit'];
            }
            result.push(label + '：' + value);
          }
        }
        break;
    
      case '2B9684C1-A57B-4063-8CE2-BCA12D0217BC':
        result.push('FA合同申请');
        break;

      case '931E322C-3050-49E7-B7FD-E6821F8A9607':
        result.push('活动经费申请');
        break;

      case '0C219E32-27DC-40BE-AFF9-C42FE403A06A':
        result.push('出差申请');
        break;

      default:
        result.push('获取失败，请联系系统管理员');
        break;
    }
    return result.join('，');
  }

  async function handleOperationBtnClicked(type, record) {
    const { code: approval_code } = record.approval;
    const { code: instance_code } = record.instance;
    const { task_id } = record.task;
    const currentUser = getUserInfo();
    const { thirdUnionID: user_id } = currentUser;
    const body = { user_id, user_id_type: 'union_id', task_id };
    if (type == 'specified_rollback') {
      body.task_def_key_list = ['START'];
    } else {
      body.approval_code = approval_code;
      body.instance_code = instance_code;
    }
    await api.editFeishuApproval(type, body);
    getApprovalList();
  }

  const columns = [
    {
      title: '类型',
      dataIndex: ['details', 'approval_name'],
      key: 'name',
    },
    {
      title: '申请人',
      dataIndex: ['initiator', 'name'],
    },
    {
      title: '概要',
      dataIndex: ['summary'],
      key: 'summary',
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
        if (!record.details || record.details.status !== 'PENDING') return null;
        return (
          <div>
            <Popconfirm title="确认同意？" onConfirm={() => handleOperationBtnClicked('approve', record)}>
              <Button type="link" size="small">同意</Button>
            </Popconfirm>
            <Popconfirm title="确认拒绝？" onConfirm={() => handleOperationBtnClicked('reject', record)}>
              <Button type="link" size="small">拒绝</Button>
            </Popconfirm>
            <Popconfirm title="确认退回？" onConfirm={() => handleOperationBtnClicked('specified_rollback', record)}>
              <Button type="link" size="small">退回</Button>
            </Popconfirm>
          </div>
        );
      },
    }
  ];

  return (
    <LeftRightLayout location={props.location} title="行政审批">
      <Table
        columns={columns}
        dataSource={list}
        rowKey={record => record.task.task_id}
        loading={loading}
        pagination={false}
      />
    </LeftRightLayout>
  );
}
export default FeishuApprovalList;
