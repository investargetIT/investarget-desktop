import React, { useEffect, useState } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Breadcrumb, Card, Tabs, Table, Empty, Popover, Button, Modal, Form, Input, DatePicker, Select, Upload } from 'antd';
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
  customRequest,
} from '../utils/util';
import { SelectIndustryGroup, SelectKPIResult, SelectTitle, SelectTrader, SelectTraingStatus, SelectTraingType } from '../components/ExtraInput';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

function HumanResources(props) {
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
  const [mentorMenteeList, setMentorMenteeList] = useState([]);

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

  async function getEmployeeRelationList() {
    try {
      const res = await requestAllData(
        api.getEmployeeRelation,
        { supervisorOrMentor: userID },
        10,
      );
      setMentorMenteeList(res.data.data.map(m => m.user).filter(f => f.id !== userID));
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
    setUserInfoDetails(reqUser.data);
    getMentorMenteeList(reqUser.data);
  }

  async function getMentorMenteeList(user) {
    if (!user.mentor) {
      setMentorMenteeList([]);
      return;
    };
    if (user.mentor.id !== user.id) {
      // 当前用户是学员
      setMentorMenteeList([user.mentor]);  
    } else {
      getEmployeeRelationList();
    }
  }

  async function loadWorkingProjects() {
    const params = {
      max_size: 10,
      sort: 'publishDate',
      desc: 1,
    }
    if (!hasPerm('proj.admin_manageproj')) {
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
    const allGroups = await props.dispatch({ type: 'app/getIndustryGroup' });
    const allEmployees = await requestAllData(api.getUser, { indGroup: allGroups.map(m => m.id), onjob: true, userstatus: 2 }, 10);
    const emplyeesWithGroups = allGroups.map(m => {
      const employees = allEmployees.data.data.filter(f => f.indGroup && (f.indGroup.id === m.id));
      return { ...m, employees };
    });
    setAllEmployeesWithGroups(emplyeesWithGroups);
  }

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'title' });
    loadEmployees();
  }, []);

  function tabChange(key) {
    console.log(key);
    setCurrentActiveTab(key);
  }

  function handleEditPromotionHistoryBtnClick(record) {
    setCurrentEditPromotionHistory(record);
    const { startDate, endDate, indGroup, title } = record;
    const duration = [moment(startDate), endDate ? moment(endDate) : undefined];
    promotionHistoryForm.setFieldsValue({ duration, indGroup: indGroup.id, title: title.id });
    setDisplayPromotionHistoryModal(true);
  }

  function handleEditKPIRecordBtnClick(record) {
    setCurrentEditKPIRecord(record);
    const { startDate, endDate, level, remark } = record;
    const duration = [moment(startDate), moment(endDate)];
    KPIForm.setFieldsValue({ duration, level: level ? level.id : undefined, remark });
    setDisplayAssessmentHistoryModal(true);
  }

  function handleEditMentorTrackRecordBtnClick(record) {
    setCurrentEditMentorTrackRecord(record);
    const { communicateDate: date, communicateType, communicateUser, communicateContent } = record;
    const communicateDate = moment(date);
    mentorTrackForm.setFieldsValue({ communicateDate, communicateType, communicateUser: communicateUser && communicateUser.id, communicateContent });
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

  // const promotionHistoryColumn = [
  //   {
  //     title: '起止时间',
  //     key: 'duration',
  //     render: (_, record) => {
  //       const { startDate, endDate } = record;
  //       return `${startDate.slice(0, 10).replaceAll('-', '.')} - ${endDate ? endDate.slice(0, 10).replaceAll('-', '.') : '至今'}`;
  //     },
  //   },
  //   {
  //     title: '任职部门',
  //     dataIndex: ['indGroup', 'name'],
  //     key: 'indGroup',
  //   },
  //   {
  //     title: '任职岗位',
  //     dataIndex: ['title', 'name'],
  //     key: 'title',
  //   },
  //   {
  //     title: '操作',
  //     align: 'center',
  //     key: 'operation',
  //     render: (_, record) => (
  //       <div>
  //         <Button type="link" onClick={() => handleEditPromotionHistoryBtnClick(record)}>编辑</Button>
  //         <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeletePromotionHistoryBtnClick(record)}>删除</Button>
  //       </div>
  //     ),
  //   },
  // ];

  // const KPIRecordColumns = [
  //   {
  //     title: '年度',
  //     key: 'duration',
  //     render: (_, record) => {
  //       const { startDate, endDate } = record;
  //       return `${startDate.slice(0, 10).replaceAll('-', '.')} - ${endDate.slice(0, 10).replaceAll('-', '.')}`;
  //     },
  //   },
  //   {
  //     title: '绩效考核结果',
  //     dataIndex: ['level', 'name'],
  //     key: 'level',
  //     render: text => text || '暂无',
  //   },
  //   {
  //     title: '附件',
  //     dataIndex: 'performanceTableUrl',
  //     key: 'attachment',
  //     render: text => text ? <a target="_blank" href={text}>查看附件</a> : '暂无',
  //   },
  //   {
  //     title: '备注',
  //     dataIndex: 'remark',
  //     key: 'remark',
  //   },
  //   {
  //     title: '操作',
  //     align: 'center',
  //     key: 'operation',
  //     render: (_, record) => (
  //       <div>
  //         <Button type="link" onClick={() => handleEditKPIRecordBtnClick(record)}>编辑</Button>
  //         <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteKPIRecordBtnClick(record)}>删除</Button>
  //       </div>
  //     ),
  //   },
  // ];

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

  // const mentorTrackColumns = [
  //   {
  //     title: '日期',
  //     dataIndex: 'communicateDate',
  //     key: 'date',
  //     render: text => text.slice(0, 10).replaceAll('-', '.'),
  //   },
  //   {
  //     title: '沟通方式',
  //     dataIndex: 'communicateType',
  //     key: 'type',
  //     render: text => text || '暂无',
  //   },
  //   {
  //     title: '沟通人',
  //     dataIndex: ['communicateUser', 'username'],
  //     key: 'mentor',
  //     render: text => text || '暂无',
  //   },
  //   {
  //     title: '沟通主要内容',
  //     dataIndex: 'communicateContent',
  //     key: 'content',
  //     render: text => text || '暂无',
  //   },
  //   {
  //     title: '操作',
  //     align: 'center',
  //     key: 'operation',
  //     render: (_, record) => (
  //       <div>
  //         <Button type="link" onClick={() => handleEditMentorTrackRecordBtnClick(record)}>编辑</Button>
  //         <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteMentorTrackBtnClick(record)}>删除</Button>
  //       </div>
  //     ),
  //   },
  // ];

  // const trainingRecordColumns = [
  //   {
  //     title: '日期',
  //     dataIndex: 'trainingDate',
  //     key: 'date',
  //     render: text => text.slice(0, 10).replaceAll('-', '.'),
  //   },
  //   {
  //     title: '培训形式',
  //     dataIndex: ['trainingType', 'type'],
  //     key: 'type',
  //   },
  //   {
  //     title: '培训内容',
  //     dataIndex: 'trainingContent',
  //     key: 'content',
  //     render: text => text || '暂无',
  //   },
  //   {
  //     title: '状态',
  //     dataIndex: ['trainingStatus', 'status'],
  //     key: 'status',
  //   },
  //   {
  //     title: '操作',
  //     align: 'center',
  //     key: 'operation',
  //     render: (_, record) => (
  //       <div>
  //         <Button type="link" onClick={() => handleEditTrainingRecordBtnClick(record)}>编辑</Button>
  //         <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteTrainingRecordBtnClick(record)}>删除</Button>
  //       </div>
  //     ),
  //   },
  // ];

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
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门主管：</span>{indGroup.manager ? indGroup.manager.username : '暂无'}</div>
          {/* <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>直属上级：</span>Amy Zhao</div> */}
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>入职日期：</span>{user.entryTime ? user.entryTime.slice(0, 10) : '暂无'}</div>
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
    const endDate = end ? `${end.format('YYYY-MM-DD')}T23:59:59` : undefined;
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
      getPromotionHistory();
      setDisplayPromotionHistoryModal(false);
    } catch (error) {
      handleError(error);
    }
  }

  async function updateKPIRecords(values) {
    const { duration, level, performanceTableKey: performanceTableKeyObj, remark } = values;
    const [ start, end ] = duration;
    const startDate = `${start.format('YYYY-MM-DD')}T00:00:00`;
    const endDate = `${end.format('YYYY-MM-DD')}T23:59:59`;
    const performanceTableKey = performanceTableKeyObj && performanceTableKeyObj.length > 0 && performanceTableKeyObj[0].response ? performanceTableKeyObj[0].response.result.key : undefined;
    const body = {
      user: userID,
      level,
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
      communicateUser,
      communicateContent,
    } = values;
    const communicateDate = `${communicateDateMoment.format('YYYY-MM-DD')}T00:00:00`;
    const body = {
      user: userID,
      communicateDate,
      communicateType: '1v1线下沟通',
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
    customRequest,
    data: { bucket: 'file' },
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

  // if (!userInfoDetails) return <LeftRightLayoutPure location={props.location} />;

  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>人事管理</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Card>
            <Tabs defaultActiveKey="1" onChange={tabChange} activeKey={currentActiveTab}>
              <TabPane tab="职员列表" key="1">
                {allEmployeesWithGroups.map(m => (
                  <div key={m.id}>
                    <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>{m.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {m.employees.map(n => (
                        <Popover key={n.id} placement="right" content={popoverContent(n, m)} overlayClassName="popover-staff">
                          <div style={{ marginRight: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 190, height: 216, border: '1px solid #e6e6e6', borderRadius: 4 }}>
                            <Link to={`/app/personal-center/${n.id}`}>
                              <img style={{ marginBottom: 24, width: 72, height: 72, borderRadius: '50%' }} src={n.photourl || '/images/avatar2.png'} />
                            </Link>
                            <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)' }}>{n.username}</div>
                            <div style={{ fontSize: 14, lineHeight: '20px', color: '#989898' }}>{getTitleName(n.title)}</div>
                          </div>
                        </Popover>
                      ))}
                    </div>
                  </div>
                ))}
                {allEmployeesWithGroups.length === 0 && <Empty style={{ margin: '20px auto' }} />}
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { country, title, industryGroup } = state.app;
  return { country, title, industryGroup };
}

export default connect(mapStateToProps)(HumanResources);
