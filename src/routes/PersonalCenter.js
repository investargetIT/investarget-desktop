import React, { useEffect, useState } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Breadcrumb, Card, Tabs, Table, Empty, Popover, Button, Modal, Form, Input, DatePicker, Radio, Upload } from 'antd';
import {
  ManOutlined,
  WomanOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import ProjectCardForUserCenter from '../components/ProjectCardForUserCenter';
import {
  hasPerm,
  getUserInfo,
  requestAllData,
  handleError,
} from '../utils/util';
import { SelectIndustryGroup, SelectTitle, SelectTrader, SelectTraingStatus, SelectTraingType } from '../components/ExtraInput';
import moment from 'moment';
import { baseUrl } from '../utils/request';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

function PersonalCenter(props) {
  const userInfo = getUserInfo();

  let userID = 1;
  if (userInfo) {
    userID = userInfo.id;
  }
  if (props.match.params.id) {
    userID = parseInt(props.match.params.id);
  }

  const [currentActiveTab, setCurrentActiveTab] = useState('1');

  const [userInfoDetails, setUserInfoDetails] = useState(null);
  const [projList, setProjList] = useState([]);
  const [allEmployeesWithGroups, setAllEmployeesWithGroups] = useState([]);
  
  const [displayPromotionHistoryModal, setDisplayPromotionHistoryModal] = useState(false);
  const [promotionHistoryForm] = Form.useForm();
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [currentEditPromotionHistory, setCurrentEditPromotionHistory] = useState(null);

  const [displayAssessmentHistoryModal, setDisplayAssessmentHistoryModal] = useState(false);
  const [KPIForm] = Form.useForm();
  const [KPIRecordList, setKPIRecordList] = useState([]);
  const [currentEditKPIRecord, setCurrentEditKPIRecord] = useState(null);

  const [displayMentorTrackModal, setDisplayMentorTrackModal] = useState(false);
  const [mentorTrackForm] = Form.useForm();
  const [mentorTrackList, setMentorTrackList] = useState([]);
  const [currentEditMentorTrackRecord, setCurrentEditMentorTrackRecord] = useState(null);

  const [displayTrainingRecordModal, setDisplayTrainingRecordModal] = useState(false);
  const [trainingRecordForm] = Form.useForm();
  const [trainingRecordList, setTrainingRecordList] = useState([]);
  const [currentEditTrainingRecord, setCurrentEditTrainingRecord] = useState(null);

  async function getPromotionHistory() {
    try {
      const res = await requestAllData(
        api.getPromotionHistory,
        { user: userID },
        10,
      );
      setPromotionHistory(res.data.data);
    } catch (error) {
      handleError(error);
    }
  }

  async function getKPIRecordList() {
    const res = await requestAllData(
      api.getKPIRecord,
      { user: userID },
      10,
    );
    setKPIRecordList(res.data.data);
  }

  async function getMentorTrackList() {
    const res = await requestAllData(
      api.getMentorTrack,
      { user: userID },
      10,
    );
    setMentorTrackList(res.data.data);
  }

  async function getTrainingRecordList() {
    const res = await requestAllData(
      api.getTrainingRecord,
      { user: userID },
      10,
    );
    setTrainingRecordList(res.data.data);
  }

  async function loadUserInfo() {
    const reqUser = await api.getUserInfo(userID);
    setUserInfoDetails(reqUser.data)
  }

  async function loadWorkingProjects() {
    const params = {
      max_size: 10,
      sort: 'publishDate',
      desc: 1,
    }
    if (!hasPerm('proj.admin_getproj')) {
      params['user'] = userID;
    }
    const reqProj = await api.getProj(params);
    const { data: projList } = reqProj.data;
    setProjList(projList);

    // 请求项目详情获取所有承揽承做
    const reqAllProjDetails = await Promise.all(projList.map(m => api.getProjLangDetail(m.id)));
    setProjList(reqAllProjDetails.map(m => m.data));
  }

  async function loadEmployees() {
    const allGroups = await api.getSource('industryGroup');
    const allEmployees = await requestAllData(api.getUser, { indGroup: allGroups.data.map(m => m.id) }, 10);
    const emplyeesWithGroups = allGroups.data.map(m => {
      const employees = allEmployees.data.data.filter(f => f.indGroup === m.id);
      return { ...m, employees };
    });
    setAllEmployeesWithGroups(emplyeesWithGroups);
  }

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'title' });
    
    loadUserInfo();
    getPromotionHistory();
    getKPIRecordList();
    getMentorTrackList();
    loadWorkingProjects();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (props.match.params.id) {
      userID = parseInt(props.match.params.id);
      setCurrentActiveTab('1');
      loadUserInfo();
      getPromotionHistory();
      getKPIRecordList();
      getMentorTrackList();
      loadWorkingProjects();
      loadEmployees();
    }
  }, [props.match]);

  function tabChange(key) {
    console.log(key);
    setCurrentActiveTab(key);
  }

  function handleEditPromotionHistoryBtnClick(record) {
    setCurrentEditPromotionHistory(record);
    const { startDate, endDate, indGroup, title } = record;
    const duration = [moment(startDate), moment(endDate)];
    promotionHistoryForm.setFieldsValue({ duration, indGroup: indGroup.id, title: title.id });
    setDisplayPromotionHistoryModal(true);
  }

  function handleEditKPIRecordBtnClick(record) {
    setCurrentEditKPIRecord(record);
    const { startDate, endDate, level, remark } = record;
    const duration = [moment(startDate), moment(endDate)];
    KPIForm.setFieldsValue({ duration, level, remark });
    setDisplayAssessmentHistoryModal(true);
  }

  function handleEditMentorTrackRecordBtnClick(record) {
    setCurrentEditMentorTrackRecord(record);
    const { communicateDate: date, communicateType, communicateUser, communicateContent } = record;
    const communicateDate = moment(date);
    mentorTrackForm.setFieldsValue({ communicateDate, communicateType, communicateUser: communicateUser && communicateUser.id.toString(), communicateContent });
    setDisplayMentorTrackModal(true);
  }

  function handleEditTrainingRecordBtnClick(record) {
    setCurrentEditTrainingRecord(record);
    const { trainingDate: date, trainingType, trainingContent, trainingStatus } = record;
    const trainingDate = moment(date);
    trainingRecordForm.setFieldsValue({ trainingDate, trainingType: trainingType && trainingType.id , trainingStatus: trainingStatus && trainingStatus.id, trainingContent });
    setDisplayTrainingRecordModal(true);
  }

  function handleDeletePromotionHistoryBtnClick(record) {
    Modal.confirm({
      title: '删除',
      content: '确认删除该条记录吗？',
      onOk() {
        console.log('OK');
        handleDeletePromotionHistory(record);
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  }

  function handleDeleteKPIRecordBtnClick(record) {
    Modal.confirm({
      title: '删除',
      content: '确认删除该条记录吗？',
      onOk() {
        console.log('OK');
        handleDeleteKPIRecord(record);
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  }

  function handleDeleteMentorTrackBtnClick(record) {
    Modal.confirm({
      title: '删除',
      content: '确认删除该条记录吗？',
      onOk() {
        console.log('OK');
        handleDeleteMentorTrackRecord(record);
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  }

  function handleDeleteTrainingRecordBtnClick(record) {
    Modal.confirm({
      title: '删除',
      content: '确认删除该条记录吗？',
      onOk() {
        console.log('OK');
        handleDeleteTrainingRecord(record);
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  }

  async function handleDeletePromotionHistory(record) {
    try {
      await api.deletePromotionHistory(record.id);
      await getPromotionHistory();
    } catch (error) {
      handleError(error);
    }
  }

  async function handleDeleteKPIRecord(record) {
    try {
      await api.deleteKPIRecord(record.id);
      await getKPIRecordList();
    } catch (error) {
      handleError(error);
    }
  }

  async function handleDeleteMentorTrackRecord(record) {
    try {
      await api.deleteMentorTrack(record.id);
      await getMentorTrackList();
    } catch (error) {
      handleError(error);
    }
  }

  async function handleDeleteTrainingRecord(record) {
    try {
      await api.deleteTrainingRecord(record.id);
      await getTrainingRecordList();
    } catch (error) {
      handleError(error);
    }
  }

  const promotionHistoryColumn = [
    {
      title: '起止时间',
      key: 'duration',
      render: (_, record) => {
        const { startDate, endDate } = record;
        return `${startDate.slice(0, 10).replaceAll('-', '.')} - ${endDate.slice(0, 10).replaceAll('-', '.')}`;
      },
    },
    {
      title: '任职部门',
      dataIndex: ['indGroup', 'name'],
      key: 'indGroup',
    },
    {
      title: '任职岗位',
      dataIndex: ['title', 'name'],
      key: 'title',
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => handleEditPromotionHistoryBtnClick(record)}>编辑</Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeletePromotionHistoryBtnClick(record)}>删除</Button>
        </div>
      ),
    },
  ];

  const KPIRecordColumns = [
    {
      title: '年度',
      key: 'duration',
      render: (_, record) => {
        const { startDate, endDate } = record;
        return `${startDate.slice(0, 10).replaceAll('-', '.')} - ${endDate.slice(0, 10).replaceAll('-', '.')}`;
      },
    },
    {
      title: '绩效考核结果',
      dataIndex: ['level', 'name'],
      key: 'level',
      render: text => text || '暂无',
    },
    {
      title: '附件',
      dataIndex: 'performanceTableUrl',
      key: 'attachment',
      render: text => text ? <a target="_blank" href={text}>查看附件</a> : '暂无',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => handleEditKPIRecordBtnClick(record)}>编辑</Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteKPIRecordBtnClick(record)}>删除</Button>
        </div>
      ),
    },
  ];

  // const columns3 = [
  //   {
  //     title: '时间',
  //     dataIndex: 'name',
  //     key: 'name',
  //   },
  //   {
  //     title: '工作单位',
  //     dataIndex: 'age',
  //     key: 'age',
  //   },
  //   {
  //     title: '职位',
  //     dataIndex: 'address',
  //     key: 'address',
  //     render: text => <a href="#">{text}</a>,
  //   },
  //   {
  //     title: '主要职责',
  //     dataIndex: 'remark',
  //     key: 'remark',
  //   },
  //   {
  //     title: '操作',
  //     align: 'center',
  //     key: 'operation',
  //     render: () => (
  //       <div>
  //         <Button type="link">编辑</Button>
  //         <Button type="link" icon={<DeleteOutlined />}>删除</Button>
  //       </div>
  //     ),
  //   },
  // ];

  // const data3 = [
  // ];

  // const columns4 = [
  //   {
  //     title: '招聘方式',
  //     dataIndex: 'name',
  //     key: 'name',
  //   },
  //   {
  //     title: '劳动合同签订/续签日期',
  //     dataIndex: 'age',
  //     key: 'age',
  //   },
  //   {
  //     title: '劳动合同期限',
  //     dataIndex: 'address',
  //     key: 'address',
  //   },
  //   {
  //     title: '附件',
  //     dataIndex: 'remark',
  //     key: 'remark',
  //     render: text => <a href="#">{text}</a>,
  //   },
  //   {
  //     title: '操作',
  //     align: 'center',
  //     key: 'operation',
  //     render: () => (
  //       <div>
  //         <Button type="link">编辑</Button>
  //         <Button type="link" icon={<DeleteOutlined />}>删除</Button>
  //       </div>
  //     ),
  //   },
  // ];

  // const data4 = [
  //   {
  //     key: '1',
  //     name: '公开招聘',
  //     age: '2020.10.01 - 2023.09.30',
  //     address: '三年',
  //     remark: '劳动合同.doc',
  //   },
  // ];

  const mentorTrackColumns = [
    {
      title: '日期',
      dataIndex: 'communicateDate',
      key: 'date',
      render: text => text.slice(0, 10).replaceAll('-', '.'),
    },
    {
      title: '沟通方式',
      dataIndex: 'communicateType',
      key: 'type',
      render: text => text || '暂无',
    },
    {
      title: '沟通人',
      dataIndex: ['communicateUser', 'username'],
      key: 'mentor',
      render: text => text || '暂无',
    },
    {
      title: '沟通主要内容',
      dataIndex: 'communicateContent',
      key: 'content',
      render: text => text || '暂无',
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => handleEditMentorTrackRecordBtnClick(record)}>编辑</Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteMentorTrackBtnClick(record)}>删除</Button>
        </div>
      ),
    },
  ];

  const trainingRecordColumns = [
    {
      title: '日期',
      dataIndex: 'trainingDate',
      key: 'date',
      render: text => text.slice(0, 10).replaceAll('-', '.'),
    },
    {
      title: '培训形式',
      dataIndex: ['trainingType', 'name'],
      key: 'type',
    },
    {
      title: '培训内容',
      dataIndex: 'trainingContent',
      key: 'content',
      render: text => text || '暂无',
    },
    {
      title: '状态',
      dataIndex: ['trainingStatus', 'name'],
      key: 'status',
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: () => (
        <div>
          <Button type="link" onClick={() => handleEditTrainingRecordBtnClick(record)}>编辑</Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteTrainingRecordBtnClick(record)}>删除</Button>
        </div>
      ),
    },
  ];

  const data6 = [
    {
      key: '1',
      name: '2020.10.30',
      age: '线下',
      address: '新人入职注意事项',
      remark: '已完成',
    },
  ];

  function popoverContent(user, indGroup) {
    return (
      <div>
        <img style={{ width: 240, height: 240 }} src={user.photourl || "/images/avatar2.png"} />
        <div style={{ padding: '30px 20px' }}>
          <div style={{ fontSize: 20, lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>{user.username}</div>
          <div style={{ marginTop: 20, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>职位：</span>{getTitleName(user.title)}</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门：</span>{indGroup.name}</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门主管：</span>Eric Shen</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>直属上级：</span>Amy Zhao</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>入职日期：</span>2020.10.01</div>
        </div>
      </div>
    );
  }

  function handlePromtionHistoryFormSubmit() {
    promotionHistoryForm
      .validateFields()
      .then((values) => {
        promotionHistoryForm.resetFields();
        updatePromotionHistory(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  }

  function handleKPIFormSubmit() {
    KPIForm
      .validateFields()
      .then((values) => {
        KPIForm.resetFields();
        updateKPIRecords(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  }

  function handleMentorTrackFormSubmit() {
    mentorTrackForm
      .validateFields()
      .then((values) => {
        mentorTrackForm.resetFields();
        updateMentorTrackRecord(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  }

  function handleTrainingRecordFormSubmit() {
    trainingRecordForm
      .validateFields()
      .then((values) => {
        trainingRecordForm.resetFields();
        updateTrainingRecord(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  }

  async function updatePromotionHistory(values) {
    const { duration, indGroup, title } = values;
    const [ start, end ] = duration;
    const startDate = `${start.format('YYYY-MM-DD')}T00:00:00`;
    const endDate = `${end.format('YYYY-MM-DD')}T23:59:59`;
    const body = {
      user: userID,
      indGroup,
      title,
      startDate,
      endDate,
    };
    try {
      if (currentEditPromotionHistory) {
        // Edit promotion history
        const { id } = currentEditPromotionHistory;
        await api.editPromotionHistory(id, body);
        setCurrentEditPromotionHistory(null);
      } else {
        await api.addPromotionHistory(body);
      }
    } catch (error) {
      handleError(error);
    }
    getPromotionHistory();
    setDisplayPromotionHistoryModal(false);
  }

  async function updateKPIRecords(values) {
    const { duration, level, performanceTableKey: performanceTableKeyObj, remark } = values;
    const [ start, end ] = duration;
    const startDate = `${start.format('YYYY-MM-DD')}T00:00:00`;
    const endDate = `${end.format('YYYY-MM-DD')}T23:59:59`;
    const performanceTableKey = performanceTableKeyObj && performanceTableKeyObj.length > 0 && performanceTableKeyObj[0].response ? performanceTableKeyObj[0].response.result.key : undefined;
    const body = {
      user: userID,
      // level,
      startDate,
      endDate,
      performanceTableBucket: performanceTableKey ? 'file' : undefined,
      performanceTableKey,
      remark,
    };
    try {
      if (currentEditKPIRecord) {
        const { id } = currentEditKPIRecord;
        await api.editKPIRecord(id, body);
        setCurrentEditKPIRecord(null);
      } else {
        await api.addKPIRecord(body);
      }
    } catch (error) {
      handleError(error);
    }
    getKPIRecordList();
    setDisplayAssessmentHistoryModal(false);
  }

  async function updateMentorTrackRecord(values) {
    const {
      communicateDate: communicateDateMoment,
      communicateType,
      communicateUser,
      communicateContent,
    } = values;
    const communicateDate = `${communicateDateMoment.format('YYYY-MM-DD')}T00:00:00`;
    const body = {
      user: userID,
      communicateDate,
      communicateType,
      communicateUser,
      communicateContent,
    };
    try {
      if (currentEditMentorTrackRecord) {
        const { id } = currentEditMentorTrackRecord;
        await api.editMentorTrack(id, body);
        setCurrentEditMentorTrackRecord(null);
      } else {
        await api.addMentorTrack(body);
      }
    } catch (error) {
      handleError(error);
    }
    getMentorTrackList();
    setDisplayMentorTrackModal(false);
  }

  async function updateTrainingRecord(values) {
    const {
      trainingDate: trainingDateMoment,
      trainingType,
      trainingStatus,
      trainingContent,
    } = values;
    const trainingDate = `${trainingDateMoment.format('YYYY-MM-DD')}T00:00:00`;
    const body = {
      user: userID,
      trainingDate,
      trainingType,
      trainingStatus,
      trainingContent,
    };
    try {
      if (currentEditTrainingRecord) {
        const { id } = currentEditTrainingRecord;
        await api.editTrainingRecord(id, body);
        setCurrentEditTrainingRecord(null);
      } else {
        await api.addTrainingRecord(body);
      }
    } catch (error) {
      handleError(error);
    }
    getTrainingRecordList();
    setDisplayTrainingRecordModal(false);
  }

  const KPIAttachmentUploadProps = {
    name: 'file',
    action: baseUrl + "/service/qiniubigupload?bucket=file",
  };

  const normFile = (e) => {
    console.log('Upload event:', e);
  
    if (Array.isArray(e)) {
      return e;
    }
  
    return e && e.fileList;
  };

  function getTitleName(titleID) {
    const filterTitle = props.title.filter(f => f.id === titleID);
    if (filterTitle.length > 0) {
      return filterTitle[0].name;
    }
    return '';
  }

  if (!userInfoDetails) return <LeftRightLayoutPure location={props.location} />;

  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>用户中心</Breadcrumb.Item>
        <Breadcrumb.Item>个人中心</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 280, marginRight: 20 }}>
          <Card bodyStyle={{ padding: 0 }}>
            <div style={{ padding: '40px 60px' }}>
              <div style={{ textAlign: 'center' }}>
                <img style={{ width: 100, height: 100, borderRadius: '50%' }} src={userInfoDetails.photourl} />
              </div>
              <div style={{ marginTop: 12, fontSize: 20, textAlign: 'center', lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>{userInfoDetails.username} {userInfoDetails.gender ? <WomanOutlined style={{ color: '#339bd2', marginLeft: 4, fontSize: 18 }} /> : <ManOutlined style={{ color: '#339bd2', marginLeft: 4, fontSize: 18 }} />}</div>
              <div style={{ marginTop: 20, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>职位：</span>{userInfoDetails.title ? userInfoDetails.title.name : '暂无'}</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门：</span>{userInfoDetails.indGroup ? userInfoDetails.indGroup.name : '暂无'}</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门主管：</span>{userInfoDetails.mentor ? userInfoDetails.mentor.username : '暂无'}</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>直属上级：</span>{userInfoDetails.directSupervisor ? userInfoDetails.directSupervisor.username : '暂无'}</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>入职日期：</span>{userInfoDetails.entryTime ? userInfoDetails.entryTime.slice(0, 10) : '暂无'}</div>
            </div>
            <div style={{ width: 240, margin: '0 auto', marginBottom: 100, padding: '20px 0', borderTop: '1px solid #E6E6E6' }}>
              <div style={{ marginBottom: 20, fontSize: 14, lineHeight: '20px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>基本信息</div>
              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/birthday.svg" />
                  <div>出生日期</div>
                </div>
                <div style={{ color: '#595959' }}>{userInfoDetails.bornTime ? userInfoDetails.bornTime.slice(0, 10) : '暂无'}</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/school.svg" />
                  <div>毕业学校</div>
                </div>
                <div style={{ color: '#595959' }}>{userInfoDetails.school || '暂无'}</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/education.svg" />
                  <div>学历</div>
                </div>
                <div style={{ color: '#595959' }}>{userInfoDetails.education ? userInfoDetails.education.name : '暂无'}</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/profession.svg" />
                  <div>专业</div>
                </div>
                <div style={{ color: '#595959' }}>{userInfoDetails.specialty || '暂无'}</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/specialty.svg" />
                  <div>特长爱好</div>
                </div>
                <div style={{ color: '#595959' }}>{userInfoDetails.specialtyhobby || '暂无'}</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/others.svg" />
                  <div>其他</div>
                </div>
                <div style={{ color: '#595959' }}>{userInfoDetails.remark || '暂无'}</div>
              </div>

            </div>
          </Card>
        </div>
        <div style={{ flex: 1 }}>
          <Card>
            <Tabs defaultActiveKey="1" onChange={tabChange} activeKey={currentActiveTab}>
              <TabPane tab="人事档案及绩效" key="1">
                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>岗位及晋升记录</div>
                  <Table columns={promotionHistoryColumn} dataSource={promotionHistory} pagination={false} rowKey={record => record.id} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />} onClick={() => {
                      setCurrentEditPromotionHistory(null);
                      setDisplayPromotionHistoryModal(true);
                    }}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>试用期内及年度考核记录</div>
                  <Table columns={KPIRecordColumns} dataSource={KPIRecordList} pagination={false} rowKey={record => record.id} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />} onClick={() => {
                      setCurrentEditPromotionHistory(null);
                      setDisplayAssessmentHistoryModal(true);
                    }}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职前工作经历</div>
                  {userInfoDetails.resumeurl ? <div><a href={userInfoDetails.resumeurl} target="_blank">查看简历</a></div> : <div>暂无</div>}
                  {/* <Table columns={columns3} dataSource={data3} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />}>新增记录</Button>
                  </div> */}
                </div>

                {/* <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职后工作概况<span style={{ fontWeight: 'normal', marginLeft: 10, fontSize: 14, color: '#989898' }}>推荐人：王大明/投资经理</span></div>
                  <Table columns={columns4} dataSource={data4} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />}>新增记录</Button>
                  </div>
                </div> */}

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职后导师计划跟踪记录</div>
                  <Table columns={mentorTrackColumns} dataSource={mentorTrackList} pagination={false} rowKey={record => record.id} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />} onClick={() => {
                      setCurrentEditMentorTrackRecord(null);
                      setDisplayMentorTrackModal(true);
                    }}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职后培训记录</div>
                  <Table columns={trainingRecordColumns} dataSource={trainingRecordList} pagination={false} rowKey={record => record.id} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />} onClick={() => {
                      setCurrentEditTrainingRecord(null);
                      setDisplayTrainingRecordModal(true);
                    }}>新增记录</Button>
                  </div>
                </div>

              </TabPane>
              <TabPane tab="参与过的项目" key="2">
                <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-18px 0 20px -18px' }}>
                  {projList.map(m => <div key={m.id} style={{ margin: '18px 0 0 18px' }}>
                    <ProjectCardForUserCenter record={m} country={props.country} currentUser={userID} />
                  </div>)}
                  {projList.length === 0 && <Empty style={{ margin: '20px auto' }} />}
                </div>
              </TabPane>
              <TabPane tab="职员列表" key="3">
                {allEmployeesWithGroups.map(m => (
                  <div key={m.id}>
                    <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>{m.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {m.employees.map(n => (
                        <Popover key={n.id} placement="right" content={popoverContent(n, m)} overlayClassName="popover-staff">
                          <div style={{ marginRight: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 190, height: 216, border: '1px solid #e6e6e6', borderRadius: 4 }}>
                            <img style={{ marginBottom: 24, width: 72, height: 72, borderRadius: '50%' }} src={n.photourl || '/images/avatar2.png'} />
                            <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)' }}>{n.username}</div>
                            <div style={{ fontSize: 14, lineHeight: '20px', color: '#989898' }}>{getTitleName(n.title)}</div>
                          </div>
                        </Popover>
                      ))}
                    </div>
                  </div>
                ))}
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      <Modal
        title="岗位及晋升记录"
        visible={displayPromotionHistoryModal}
        onCancel={() => setDisplayPromotionHistoryModal(false)}
        onOk={handlePromtionHistoryFormSubmit}
      >
        <Form
          style={{ width: 400 }}
          form={promotionHistoryForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="起止时间"
            name="duration"
            rules={[{ required: true, message: '请设定起止时间' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            label="任职部门"
            name="indGroup"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <SelectIndustryGroup size="middle" />
          </Form.Item>

          <Form.Item
            label="任职岗位"
            name="title"
            rules={[{ required: true, message: '请选择岗位' }]}
          >
            <SelectTitle size="middle" showSearch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="试用期内及年度考核记录"
        visible={displayAssessmentHistoryModal}
        onCancel={() => setDisplayAssessmentHistoryModal(false)}
        onOk={handleKPIFormSubmit}
      >
        <Form
          style={{ width: 400 }}
          form={KPIForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="年度"
            name="duration"
            rules={[{ required: true, message: '请设定起止时间' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            label="绩效考核结果"
            name="level"
            required
          >
            <Radio.Group>
              <Radio value={1}>合格</Radio>
              <Radio value={0}>未合格</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="上传附件"
            name="performanceTableKey"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload {...KPIAttachmentUploadProps}>
              <Button icon={<UploadOutlined />} type="link">上传附件</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

        </Form>
      </Modal>

      <Modal
        title="入职后导师计划跟踪记录"
        visible={displayMentorTrackModal}
        onCancel={() => setDisplayMentorTrackModal(false)}
        onOk={handleMentorTrackFormSubmit}
      >
        <Form
          style={{ width: 400 }}
          form={mentorTrackForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >

          <Form.Item
            label="日期"
            name="communicateDate"
            rules={[{ required: true, message: '请设定日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="沟通方式"
            name="communicateType"
          >
            <Input placeholder="请填写沟通方式" />
          </Form.Item>

          <Form.Item
            label="沟通人"
            name="communicateUser"
          >
            <SelectTrader placeholder="请选择沟通人" />
          </Form.Item>

          <Form.Item
            label="主要内容"
            name="communicateContent"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

        </Form>
      </Modal>

      <Modal
        title="入职后培训记录"
        visible={displayTrainingRecordModal}
        onCancel={() => setDisplayTrainingRecordModal(false)}
        onOk={handleTrainingRecordFormSubmit}
      >
        <Form
          style={{ width: 400 }}
          form={trainingRecordForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >

          <Form.Item
            label="日期"
            name="trainingDate"
            rules={[{ required: true, message: '请设定日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="培训形式"
            name="trainingType"
            required
          >
            <SelectTraingType />
          </Form.Item>

          <Form.Item
            label="培训内容"
            name="trainingContent"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="状态"
            name="trainingStatus"
          >
            <SelectTraingStatus />
          </Form.Item>

          

        </Form>
      </Modal>

    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { country, title } = state.app;
  return { country, title };
}

export default connect(mapStateToProps)(PersonalCenter);
