import React, { useState, useEffect, useRef } from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo, handleError, requestAllData } from '../utils/util';
import { Table, Button, Popconfirm, Spin } from 'antd';

const UNIT_TO_CN = {
  hour: '小时',
  day: '天',
}

function FeishuApprovalList(props) {

  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingContainerRef = useRef(null);

  let allTaskList = [];
  let currentTaskNum = 0;
  // let isLoadingDetails = false;

  const loadingSize = 10;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    // if (isLoadingDetails) return;
    if (currentTaskNum >= allTaskList.length) {
      observer.disconnect();
      return;
    }
    setLoadingMore(true);
    const task_list = allTaskList.slice(currentTaskNum, currentTaskNum + loadingSize);
    getApprovalDetails(task_list)
      .then(result => {
        currentTaskNum = currentTaskNum + result.length
        setTaskList(taskList => [...taskList, ...result]);
      })
      .finally(() => setLoadingMore(false));
  });  

  useEffect(() => {
    async function loadData() {
      await getApprovalList();
      if (allTaskList.length > 0) {
        observer.observe(loadingContainerRef.current);
      }
    }
    loadData();
    return () => {
      observer.disconnect();
    }
  }, []);

  async function getApprovalList() {
    const currentUser = getUserInfo();
    const { thirdUnionID: user_id } = currentUser;
    if (!user_id) return;
    setLoading(true);
    const req = await api.getFeishuApprovalTaskList({ user_id, user_id_type: 'union_id', page_size: 200 });
    let { task_list } = req.data.data;
    // task_list = task_list.filter(f => f.task.status === 'pending');
    allTaskList = task_list || [];
    const result = await getApprovalDetails(allTaskList.slice(0, loadingSize));
    currentTaskNum = result.length
    setTaskList(result);
    setLoading(false);
  }

  async function getApprovalDetails(task_list) {
    // isLoadingDetails = true;
    // TODO
    // const task_list = allTaskList.slice(currentTaskNum, currentTaskNum + 10);

    const reqTaskDetails = await Promise.all(task_list.map(m => api.getFeishuApprovalDetails({ instance_id: m.instance.code })));
    const allTasks = reqTaskDetails.reduce((prev, curr, currIdx) => {
      const { approval_code, form } = curr.data.data;
      const summary = getSummaryFromJSON(approval_code, form);
      const current = { ...task_list[currIdx], details: curr.data.data, summary };
      return prev.concat(current);
    }, []);

    // TODO
    // currentTaskNum = currentTaskNum + allTasks.length

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

    // TODO
    // setTaskList(taskList => [...taskList, ...allTasksWithInitiator]);

    // isLoadingDetails = false;
    return allTasksWithInitiator;
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
              let unit = formValue['unit'];
              if (UNIT_TO_CN[unit.toLowerCase()]) {
                unit = UNIT_TO_CN[unit.toLowerCase()];
              }
              value = value + '' + unit;
            }
            result.push(label + '：' + value);
          }
        }
        break;
      
      case '0AEF151F-E4DD-4911-8F4E-CD97F655F0A9':
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
              let unit = formValue['unit'];
              if (UNIT_TO_CN[unit.toLowerCase()]) {
                unit = UNIT_TO_CN[unit.toLowerCase()];
              }
              value = value + '' + unit;
            }
            result.push(label + '：' + value);
          }
        }
        break;
    
      case '2B9684C1-A57B-4063-8CE2-BCA12D0217BC':
        formValue = formData;
        keyToLabel = [{
          widgetID: 'widget16510690557470001',
          name: '合同名称',
        }, {
          widgetID: 'widget16510691337390001',
          name: '附件',
        }];
        keyToLabel.forEach(element => {
          const widget = formValue.find(f => f.id === element.widgetID || f.name === element.name);
          if (widget) {
            if (element.name === '合同名称') {
              result.push(element.name + '：' + widget.value);
            } else if (element.name === '附件') {
              const { ext, value } = widget;
              let atta = ext;
              if (value.length > 0) {
                atta = `<a target="_blank" href="${value[0]}">${atta}</a>`;
              }
              result.push('合同附件：' + atta);
            }
          }
        });
        break;

      case '931E322C-3050-49E7-B7FD-E6821F8A9607':
        formValue = formData;
        keyToLabel = [{
          widgetID: 'widget15995479976120001',
          name: '活动名称',
        }, {
          widgetID: 'widget15995480772980001',
          name: '参与人数',
        }, {
          widgetID: 'widget15995480273410001',
          name: '预算总金额',
        }];
        keyToLabel.forEach(element => {
          const widget = formValue.find(f => f.id === element.widgetID || f.name === element.name);
          if (widget) {
            result.push(element.name + '：' + widget.value);
          }
        });
        break;

      case '0C219E32-27DC-40BE-AFF9-C42FE403A06A':
        formValue = formData[0].value;
        keyToLabel = {
          reason: '项目',
          destination: '目的地',
          start: '开始时间',
          end: '结束时间',
          transport: '交通工具',
        };
        for (const key in keyToLabel) {
          if (Object.hasOwnProperty.call(keyToLabel, key)) {
            if (key === 'reason') {
              result.push('项目：' + formValue[key]);
            } else {
              let formValue1 = formValue.schedule;
              if (formValue1.length > 0) {
                formValue1 = formValue1[0];
                const label = keyToLabel[key];
                let value = formValue1[key];
                if (key === 'start' || key === 'end') {
                  value = value.slice(0, 19).replace('T', ' ');
                }
                result.push(label + '：' + value);
              }
            }
          }
        }
        break;

      default:
        result.push('获取失败，请联系系统管理员');
        break;
    }
    return result.join('，');
  }

  async function handleOperationBtnClicked(type, record) {
    // observer.disconnect();
    // await getApprovalList();
    // if (allTaskList.length > 0) {
    //   observer.observe(loadingContainerRef.current);
    // }

    try {
      await updateRecord(type, record);
      await loadRecord(record);
    } catch (err) {
      handleError(err);
    }
  }

  async function updateRecord(type, record) {
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
  }

  async function loadRecord(record) {
    setLoading(true);
    const result = await getApprovalDetails([record]);
    const newList = taskList.slice();
    const taskIndex = newList.map(m => m.task.task_id).indexOf(record.task.task_id);
    newList[taskIndex] = result[0];
    setTaskList(newList);
    setLoading(false);
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
      render: text => <div dangerouslySetInnerHTML={{ __html: text }}/>
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
        dataSource={taskList}
        rowKey={record => record.task.task_id}
        loading={loading}
        pagination={false}
      />
      <div ref={loadingContainerRef} style={{ paddingTop: 20, textAlign: 'center' }}>
        {loadingMore && <Spin />}
      </div>
    </LeftRightLayout>
  );
}
export default FeishuApprovalList;
