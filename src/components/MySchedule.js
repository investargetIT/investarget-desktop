import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Select, Radio, Modal, Row, Col, Popconfirm, Button } from 'antd';
import moment from 'moment';
import { requestAllData, getCurrentUser, handleError, hasPerm, i18n, getUserInfo, time } from '../utils/util';
import * as api from '../api';
import {
  RightOutlined,
  LeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import ScheduleForm from './ScheduleForm';
import { connect } from 'dva';
import { withRouter } from 'dva/router'

function MySchedule(props) {

  const [myScheduleList, setMyScheduleList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [calendarMode, setCalendarMode] = useState('month');
  let selectDateCausedByMonthChange = false;
  
  const [proj, setProj] = useState(); // 新增时选中的项目
  const [oldSelectedProj, setOldSelectedProj] = useState(); // 新增时原来选中的项目
  const [targetEmail, setTargetEmail] = useState(''); // 目标邮箱，发送提醒邮件的邮箱地址
  const [user, setUser] = useState(null); // 选择的投资人

  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEvent, setVisibleEvent] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [event, setEvent] = useState({});

  const formRef = useRef(null);
  const editFormRef = useRef(null);

  useEffect(() => {
    getEvents();
  }, []);

  useEffect(() => {
    // 只在月历模式下请求数据
    if (calendarMode == 'month') {
      getEvents();
    }
  }, [calendarMode, selectedDate]);

  useEffect(() => {
    if (formRef.current) {
      const newValues = setAddFormData();
      formRef.current.setFieldsValue(newValues);
    }
  }, [proj, targetEmail]);

  useEffect(() => {
    if (editFormRef.current) {
      const values = toFormData(event);
      editFormRef.current.setFieldsValue(values);
    }
  }, [visibleEdit]);

  function onPanelChange(date, mode) {
    setSelectedDate(date);
    setCalendarMode(mode);
  }

  function setAddFormData() {
    let maxKey = 0;
    let keys = [];
    if (formRef.current && formRef.current.getFieldValue('keys')) {
      keys = formRef.current.getFieldValue('keys');
      maxKey = keys.length > 0 ? Math.max(...keys) : 0;
      const originValues = formRef.current.getFieldsValue();
      const data = {};
      for (let prop in originValues) {
        data[prop] = originValues[prop];
      }

      // 自动设置发送邮件提醒的目标邮箱为选中的投资人邮箱
      if (targetEmail) {
        data.targetEmail = targetEmail;
      }

      // 剔除原来选中的项目的联系人姓名和邮箱
      if (oldSelectedProj) {
        const oldContact = Object.keys(originValues)
          .filter(f => f.startsWith('email'))
          .map(m => {
            const key = m.split('-')[1]; 
            return {
              email: originValues[m],
              key,
            };
          })
          .filter(f => f.email === oldSelectedProj.contactEmail);
        if (oldContact.length > 0) {
          keys = keys.filter(f => f !== oldContact[0].key);
        }
      }

      // 增加现在新选中的项目的联系人姓名和邮箱
      if (proj) {
        data.keys = keys.concat(`${maxKey + 1}`);
        data[`name-${maxKey + 1}`] = proj.contactUsername;
        data[`email-${maxKey + 1}`] = proj.contactEmail;
      }
      return data;
    }
  }

  async function getEvents() {
    // 加载前后三个月的日程
    const lastMonth = selectedDate.clone().subtract(1, 'M');
    const nextMonth = selectedDate.clone().add(1, 'M');

    const requestThreeMonthsSchedule = [lastMonth, selectedDate, nextMonth].map(m => requestAllData(
      api.getSchedule,
      {
        manager: getCurrentUser(),
        date: m.format('YYYY-MM-DD'),
      },
      100,
    ));

    try {
      const result = await Promise.all(requestThreeMonthsSchedule);
      let list = result.reduce((prev, curr) => prev.concat(curr.data.data), []);

    //   const webexFromSchedule = list.filter(f => f.type === 4 && f.meeting);
    //   const webexScheduleMeetingKeys = webexFromSchedule.map(m => m.meeting.meetingKey);

    //   const startFrom = 1;
    //   const maximumNum = 100;
    //   const listMethod = 'AND';
    //   const orderBy = 'STARTTIME';
    //   const orderAD = 'ASC';
    //   const startDateStart = lastMonth.format('MM/DD/YYYY HH:mm:ss');
    //   const endDateEnd = nextMonth.format('MM/DD/YYYY HH:mm:ss');

    //   const webExReqBody = { startFrom, maximumNum, listMethod, orderBy, orderAD, startDateStart, endDateEnd };
    //   const webexReq = await api.getWebexMeetingList(webExReqBody);
    //   const webexData = webexReq.data.meetings;
    //   list = list.concat(
    //     webexData.filter(f => !webexScheduleMeetingKeys.includes(f.meetingKey)).map(m => ({
    //       id: m.meetingUUID,
    //       comments: m.confName,
    //       type: 4,
    //       scheduledtime: moment(m.startDate, 'MM/DD/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
    //     })));

    //   // Webex 相关逻辑
    //   for (let index = 0; index < list.length; index++) {
    //     const element = list[index];
    //     if (element.type === 4 && element.meeting) {
    //       const webexUser = await api.getWebexUser({ meeting: element.meeting.id });
    //       const currentAttendee = webexUser.data.data.filter(f => f.user === getCurrentUser())[0];
    //       element.currentAttendee = currentAttendee;
    //     }
    //   }

      // 周报相关逻辑
      if (hasPerm('usersys.as_trader')) {
        const firstDayOfLastMonth = selectedDate.clone().subtract(1, 'M').startOf('month');
        const firstDayOfNextTwoMonths = selectedDate.clone().add(2, 'M').startOf('month');
        const params = {
          user: getCurrentUser(),
          startTime: firstDayOfLastMonth.format('YYYY-MM-DD'),
          endTime: firstDayOfNextTwoMonths.format('YYYY-MM-DD'),
        };
        const requestReport = await requestAllData(api.getWorkReport, params, 99);
        const reportList = requestReport.data.data.map(m => {
          const scheduledtime = moment(m.startTime).startOf('week').add('days', 4).format('YYYY-MM-DD');
          const comments = '周报';
          const type = 5; // 5 means already filled weekly report
          return { ...m, scheduledtime, comments, type };
        });

        const day1 = 5;
        const result1 = [];
        const current1 = firstDayOfLastMonth.clone();
        result1.push(current1.clone().day(day1));
        while (current1.day(7 + day1).isBefore(firstDayOfNextTwoMonths)) {
          result1.push(current1.clone());
        }
        result1.forEach((element, index) => {
          const dateStr = element.format('YYYY-MM-DD');
          if (!reportList.map(m => m.scheduledtime).includes(dateStr)) {
            list.push({
              scheduledtime: dateStr,
              comments: '周报',
              type: 6,
              id: index,
            });
          }
        });
        list = list.concat(reportList);
      }

    //   try {
    //     // 获取 zoom 视频会议列表
    //     if (hasPerm('usersys.as_trader')) {
    //       const requestZoom = await api.getZoomMeetingList();
    //       const { data: zoomMeetingList } = requestZoom;

    //       let zoomList = [];
    //       for (const email in zoomMeetingList) {
    //         // skip loop if the property is from prototype
    //         if (!zoomMeetingList.hasOwnProperty(email)) continue;
    //         const listForThisEmail = zoomMeetingList[email];
    //         zoomList = zoomList.concat(listForThisEmail.map(m => ({
    //           ...m,
    //           email,
    //           scheduledtime: m.start_time.slice(0, 19),
    //           timezone: '+08:00',
    //           comments: m.topic,
    //           type: 7,
    //         })));
    //       }
    //       list = list.concat(zoomList);
    //     }
    //   } catch (error) {
    //     console.error(error);
    //   }

      list.sort((a, b) => {
        return new Date(a.scheduledtime) - new Date(b.scheduledtime)
      });
      setMyScheduleList(list);
    } catch (error) {
      handleError(error)
    }

  }

  function getListData(value) {
    const date = value.format('YYYY-MM-DD');
    return myScheduleList.filter(item => {
      return item.scheduledtime.slice(0,10) == date;
    });
  }

  const handleClickEvent = (item, e) => {
    e.stopPropagation()

    const { id, type, scheduledtime } = item;
    if (type === 7) {
      return;
    }

    if (type === 4 && !item.meeting) {
      return;
    }

    if (hasPerm('BD.admin_getWorkReport') && (type === 5 || type === 6)) {
      const url = `/app/report/list?date=${scheduledtime}`;
      props.history.push(url);
      return;
    }
    if (type === 5) {
      const url = `/app/report/${id}`;
      props.history.push(url);
      return;
    }
    if (type === 6) {
      const url = `/app/report/add?date=${scheduledtime}`;
      props.history.push(url);
      return;
    }

    const event = myScheduleList.filter(item => item.id == id)[0] || {};
    setVisibleEvent(true);
    setEvent(event);
    eventEl = e.target;
    eventEl.classList.add('event-selected');
  }

  let eventEl = null;

  function dateCellRender(value) {
    const listData = getListData(value);
    const isToday = value.isSame(moment(), 'day');
    const isFirstDayOfMonth = value.date() == 1;

    function singleEventRender(item) {
      return (
        <div
          className={`my-calendar__date-event${item.type ? ` my-calendar__date-event-${item.type}` : ''}`}
          // className={styles['event-type' + (item.type ? `-${item.type}` : '-3')]}
          key={`${item.type}-${item.id}`}
          onClick={e => handleClickEvent(item, e)}
        >

          {/* Webex */}
          {/* {item.type === 4 &&
                <Popover title="Webex视频会议" content={this.getWebexPopoverContent(item)}>
                  <span>
                    <img style={{ marginRight: 8, width: 20 }} src="/images/webex.png" alt="" />
                    <span>{item.comments}</span>
                  </span>
                </Popover>
              } */}

          {/* Zoom */}
          {/* {item.type === 7 &&
                <Popover title="Zoom视频会议" content={this.getZoomPopoverContent(item)}>
                  <span>
                    <img style={{ marginRight: 8, width: 20 }} src="/images/zoom.png" alt="" />
                    <span>{item.comments}</span>
                  </span>
                </Popover>
              } */}

          {/* Others */}
          {item.type !== 4 && item.type !== 7 && item.comments}
        </div>
      );
    }

    return (
      <div className="my-calendar__date">

        <div className="my-calendar__date-header">
          {isFirstDayOfMonth && <div>{`${value.month()+1}月`}</div>}
          {
            isToday ?
              <div className={`my-calendar__date-header__value${isToday ? ' my-calendar__date-header__value-active' : ''}`}>{value.date()}</div>
              :
              <div>{value.date()}</div>
          }
          <div>日</div>
        </div>

        <div className="my-calendar__date-content">
          {
            listData.length <= 4 ?
              listData.map(item => singleEventRender(item))
              :
              <div>
                {listData.slice(0, 3).map(item => singleEventRender(item))}
                <div className="my-calendar__date-event" style={{ color: '#989898' }}>还有{listData.length - 3}项...</div>
              </div>
          }
        </div>

      </div>
    );
  }

  function onValuesChange(changedValues, allValues) {
    if (changedValues.proj) {
      handleProjChange(changedValues.proj);
    }
    if (changedValues.user) {
      handleUserChange(changedValues.user);
    }
  }

  function handleProjChange(projID) {
    api.getProjDetail(projID)
      .then((response) => {
        if (!response.data.email) return;
        setOldSelectedProj(proj);
        setProj({
          id: projID,
          contactUsername: response.data.contactPerson,
          contactEmail: response.data.email,
        });
      });
  }

  function handleUserChange(userId) {
    api.getUserInfo(userId).then(res => {
      const { email } = res.data;
      setUser(res.data);
      setTargetEmail(email);
    });
  }

  function onSelect(date) {
    if (calendarMode == 'month' && date.diff(moment(), 'days') >= 0 && !selectDateCausedByMonthChange) {
      setVisibleAdd(true);
      setSelectedDate(date.startOf('hour'));
    } else {
      setSelectedDate(date);
    }
  }

  function hideAddModal() {
    setVisibleAdd(false);
    setProj(undefined);
    setOldSelectedProj(undefined);
    setUser(null);
    setTargetEmail('');
  }

  function toData(formData) {
    var data = {...formData}
    data['scheduledtimeOrigin'] = data.scheduledtime.clone();
    data['scheduledtime'] = data['scheduledtime'].format('YYYY-MM-DDTHH:mm:ss')
    if (!['中国', 'China'].includes(formData.country && formData.country.label)) {
      data['location'] = null;
    }
    data.country = formData.country && formData.country.value;
    return data
  }

  // 
  function addEvent() {
    formRef.current.validateFields()
      .then(values => {
        let param = toData(values);
        addEventAsync(param)
          .then(() => {
            hideAddModal();
            getEvents();
          })
          .catch(handleError);
      });
  }

  const editEvent = () => {
    editFormRef.current.validateFields()
    .then(values => {
      if (values.type !== 4) {
        let param = toData(values)
        let id = event.id
        api.editSchedule(id, param).then(() => {
          hideEditModal();
          getEvents();
        }).catch(error => {
          hideEditModal();
          handleError(error);
        });
      } else {
        const meetingID = event.meeting.id;
        const startDate = values.scheduledtime.format('YYYY-MM-DDTHH:mm:ss');
        const { password, duration, comments: title } = values;
        const body = { password, duration, title, startDate };
        api.editWebexMeeting(meetingID, body).then(() => {
          hideEditModal();
          getEvents();
        }).catch(error => {
          hideEditModal();
          handleError(error);
        });
      }
    });
  }

  const addEventAsync = async (param) => {
    const body = { ...param, title: param.comments };
    await api.getUserSession();
    const meetingResult = await api.addSchedule([body]);
    const { sendEmail } = body;
    if (sendEmail) {
      const {
        targetEmail: destination,
        scheduledtime: startDate,
        comments: summary,
        address: location,
        scheduledtimeOrigin,
        username,
      } = body;
      const sendEmailBody = {
        destination,
        html: `<div><p>${user ? user.username : username}，您好</p><p>标题：${summary}</p><p>时间：${startDate.replace('T', ' ')}</p></div>`,
        subject: '日程邮件推送',
        startDate,
        endDate: scheduledtimeOrigin.add(1, 'h').format('YYYY-MM-DDTHH:mm:ss'),
        summary,
        description: summary,
        location,
      };
      await api.sendScheduleReminderEmail(sendEmailBody);
    }
    if (param.type === 4) {
      const { id: meeting, meetingKey } = meetingResult.data[0].meeting;
      const attendee = formatAttendee(param);
      const userBody = attendee.map(m => ({ ...m, meeting, meetingKey }));
      await api.addWebexUser(userBody);

      // 为在库里的参会人创建日程
      const existAttendees = attendee.filter(f => f.user !== undefined && f.user !== getCurrentUser());
      const attendeeBody = existAttendees.map(m => ({ ...body, manager: m.user, meeting }));
      await api.getUserSession();
      await api.addSchedule(attendeeBody);
    }
  }

  const formatAttendee = param => {
    const existAttendees = param['investor-attendee'].concat(param['trader-attendee']).map(m => {
      const user = parseInt(m.key, 10);
      const nameAndEmail = m.label.split('\n');
      const name = nameAndEmail[0];
      const email = nameAndEmail[1];
      return { user, name, email };
    });
    const manualAttendees = Object.keys(param).filter(f => f.startsWith('name')).map(m => {
      const name = param[m];
      const emailKey = `email-${m.split('-')[1]}`;
      const email = param[emailKey];
      return { name, email };
    });
    const currentUser = getUserInfo();
    const meetingHost = {
      user: currentUser.id,
      name: currentUser.username,
      email: currentUser.email,
      meetingRole: true,
    };
    return existAttendees.concat(meetingHost, manualAttendees);
  }

  function myCalendarHeaderRender(value, type, onChange, onTypeChange) {
    const start = 0;
    const end = 12;
    const monthOptions = [];

    const current = value.clone();
    const localeData = value.localeData();
    const months = [];
    for (let i = 0; i < 12; i++) {
      current.month(i);
      months.push(localeData.monthsShort(current));
    }

    for (let index = start; index < end; index++) {
      monthOptions.push(
        <Select.Option className="month-item" key={`${index}`}>
          {months[index]}
        </Select.Option>,
      );
    }
    const month = value.month();

    const year = value.year();
    const options = [];
    for (let i = year - 10; i < year + 10; i += 1) {
      options.push(
        <Select.Option key={i} value={i} className="year-item">
          {i}
        </Select.Option>,
      );
    }

    function onMonthSwitch(switchValue) {
      switch (switchValue) {
        case 'last_month':
          selectDateCausedByMonthChange = true;
          onChange(value.clone().subtract(1, 'month'));
          break;
        case 'next_month':
          selectDateCausedByMonthChange = true;
          onChange(value.clone().add(1, 'month'));
          break;
        default:
          onChange(moment());
          break;
      }
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <div>
          <Select
            size="large"
            dropdownMatchSelectWidth={false}
            className="my-year-select"
            onChange={newYear => {
              const now = value.clone().year(newYear);
              onChange(now);
            }}
            value={String(year)}
          >
            {options}
          </Select>

          <Select
            size="large"
            style={{ marginLeft: 10 }}
            dropdownMatchSelectWidth={false}
            value={String(month)}
            onChange={selectedMonth => {
              const newValue = value.clone();
              newValue.month(parseInt(selectedMonth, 10));
              onChange(newValue);
            }}
          >
            {monthOptions}
          </Select>
        </div>

        <div>
          <Radio.Group onChange={e => onTypeChange(e.target.value)} value={type}>
            <Radio.Button value="month">月</Radio.Button>
            <Radio.Button value="year">年</Radio.Button>
          </Radio.Group>
          <Radio.Group style={{ marginLeft: 20 }} onChange={e => onMonthSwitch(e.target.value)} value={type}>
            <Radio.Button className="my-calendar__month" style={{ padding: '0 8px' }} value="last_month"><LeftOutlined /></Radio.Button>
            <Radio.Button value="today">今天</Radio.Button>
            <Radio.Button className="my-calendar__month" style={{ padding: '0 8px' }} value="next_month"><RightOutlined /></Radio.Button>
          </Radio.Group>
        </div>

      </div>
    );
  }

  /**
   * 删除日程，现在的逻辑是这样的
   * 如果是非视频会议日程正常删除
   * 如果是视频会议日程且当前用户是参会人，也是正常删除
   * 如果是视频会议日程且当前用户是主持人，调用删除会议接口，服务端应该会把相关日程、参会人员等一起删除
   */
  const deleteEventAsync = async () => {
    if (event.type === 4 && event.createuser.id === getCurrentUser()) {
      const meetingID = event.meeting.id;
      await api.deleteWebexMeeting(meetingID);
    } else {
      const scheduleID = event.id;
      await api.deleteSchedule(scheduleID);
    }
  }

  const deleteEvent = () => {
    deleteEventAsync()
      .then(getEvents)
      .catch(handleError)
      .finally(hideEventModal);
  }

  const eventTitleStyle = {
    float: 'right',
    fontWeight: 'normal',
  }

  const isEventEditable = () => {
    if (moment(event.scheduledtime + event.timezone) < moment().startOf('day')){
      return false;
    }
    const isMeetingSchedule = event.type === 4;
    const isCurrentUserAttendee = isMeetingSchedule && event.createuser.id !== getCurrentUser();
    if (isCurrentUserAttendee) {
      return false;
    }
    return true;
  }

  const showEditModal = () => {
    setVisibleEdit(true);
    setVisibleEvent(false);
    if (eventEl) {
      eventEl.classList.remove('event-selected');
    }
  }

  const hideEditModal = () => {
    setVisibleEdit(false);
    setEvent({});
  }

  const eventTitle = (
    <div style={{ marginRight: 32 }}>
      {i18n('schedule.event')}
      <Popconfirm title={i18n('delete_confirm')} onConfirm={deleteEvent}>
        <Button type="link" style={eventTitleStyle}><DeleteOutlined /></Button>
      </Popconfirm>
      {isEventEditable() &&
        <Button type="link" style={eventTitleStyle} onClick={showEditModal}><EditOutlined /></Button>
      }
    </div>
  );

  const hideEventModal = () => {
    setVisibleEvent(false);
    if (eventEl) {
      eventEl.classList.remove('event-selected');
    }
  }



  return (
    <div>
      <Calendar
        className="my-calendar"
        dateFullCellRender={dateCellRender}
        onPanelChange={onPanelChange}
        headerRender={({ value, type, onChange, onTypeChange }) => myCalendarHeaderRender(value, type, onChange, onTypeChange)}
        onSelect={onSelect}
        value={selectedDate}
      />
      <div style={{ display: 'flex', fontSize: 14, lineHeight: '20px', color: '#262626', marginTop: 40 }}>
        <div>会议类型：</div>
        <div className="my-calendar-tag" style={{ backgroundColor: '#bfbfbf', marginLeft: 4 }}></div>
        <div style={{ marginLeft: 5 }}>周期性会议</div>
        <div className="my-calendar-tag" style={{ backgroundColor: '#339bd2' }}></div>
        <div style={{ marginLeft: 5 }}>约见投资人</div>
        <div className="my-calendar-tag" style={{ backgroundColor: '#7db32a' }}></div>
        <div style={{ marginLeft: 5 }}>约见公司</div>
        <div className="my-calendar-tag" style={{ backgroundColor: '#e6b217' }}></div>
        <div style={{ marginLeft: 5 }}>路演会议</div> 
      </div>

      {visibleAdd &&
        <Modal
          className="another-btn"
          title={i18n('schedule.add_event')}
          onOk={addEvent}
          onCancel={hideAddModal}
          maskStyle={{ backgroundColor: 'rgba(0,0,0,.38)' }}
          maskClosable={false}
          visible
        >
          <ScheduleForm
            ref={formRef}
            onValuesChange={onValuesChange}
            isAdd
            date={selectedDate}
            country={{ label: 'China', value: 42 }}
          />
        </Modal>
      }

      {visibleEvent &&
        <Modal
          title={eventTitle}
          visible
          onCancel={hideEventModal}
          maskStyle={maskStyle}
          footer={null}
        >
          <Event {...event} />
        </Modal>
      }

      <Modal
        title={i18n('schedule.edit_event')}
        visible={visibleEdit}
        onOk={editEvent}
        onCancel={hideEditModal}
        maskStyle={maskStyle}
        maskClosable={false}
      >
        <ScheduleForm ref={editFormRef} />
      </Modal>

    </div>
  );
}
function toFormData(data) {
  var formData = {
    comments: data.comments,
    scheduledtime: data.scheduledtime && moment(data.scheduledtime),
    country: data.country && {label:data.country.country, value:data.country.id, areaCode:data.country.areaCode},
    location: data.location &&data.location.id,
    address: data.address,
    proj: data.proj && data.proj.id,
    user: data.user && data.user.id,
    type: data.type || 3,
  }
  if (data.type === 4 && data.meeting) {
    formData.password = data.meeting.password;
    formData.duration = data.meeting.duration;
  }
  for (let prop in formData) {
    formData[prop] = formData[prop];
  }
  return formData;
}

const maskStyle = {
  backgroundColor: 'rgba(0,0,0,.38)',
};
class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attendees: '',
      currentAttendee: {
        name: '',
        email: '',
        meetingRole: false,
      },
    };
  }
  componentDidMount() {
    if (this.props.type === 4 && this.props.meeting) {
      api.getWebexUser({ meeting: this.props.meeting.id })
        .then(data => {
          const content = data.data.data.map(m => `${m.name} ${m.email}`).join('\n');
          const currentAttendee = data.data.data.filter(f => f.user === getCurrentUser())[0];
          this.setState({ attendees: content, currentAttendee });
        });
    }
  }

  getWID = (url) => {
    const wid = url.match(/WID=(.*)&/)[1];
    return wid;
  }

  getPW = (url) => {
    const pw = url.match(/PW=(.*)/)[1];
    return pw;
  }

  render() {
    const isHost = this.state.currentAttendee && this.state.currentAttendee.meetingRole;
    const props = this.props;
    return (
      <div>
        <Field title={i18n('schedule.title')} content={props.comments} />
        <Field title={i18n('schedule.schedule_time')} content={props.scheduledtime ? time(props.scheduledtime + props.timezone) : ''} />
        {props.type !== 4 && <Field title={i18n('user.country')} content={props.country && props.country.country} />}
        {props.location ? <Field title={i18n('schedule.area')} content={props.location.name} /> : null}
        <Field title={i18n('schedule.address')} content={props.address} />
        <Field title={i18n('schedule.project')} content={props.projtitle} />
        {props.type !== 4 || !props.meeting ?
          <Field title={i18n('schedule.investor')} content={props.user && props.user.username} />
          :
          <div>
            <Field title="会议密码" content={props.meeting.password} />
            <Field title="持续时间" content={`${props.meeting.duration}分钟`} />
            <Field title="参会人" content={this.state.attendees} />
            {props.manager === props.meeting.createuser && <Field title="主持人密钥" content={props.meeting.hostKey} />}
            <Field title="音频连接" content="4006140081 China2(400)" />
            <Field title="会议号" content={`<span style="color: red;font-weight: bold">${props.meeting.meetingKey}</span>`} />
            {props.meeting.status && props.meeting.status.status !== 0 && this.state.currentAttendee && <div>
              {isHost ?
                <Field title="会议日程" content={`<a target="_blank" href="${props.meeting.url_host}">${props.meeting.url_host}</a>`} />
                :
                <Field title="会议日程" content={`<a target="_blank" href="${props.meeting.url_attendee}">${props.meeting.url_attendee}</a>`} />
              }
              {isHost ?
                <Row><Col span={6} /><Col span={18}><a target="_blank" href={`/webex.html?wid=${this.getWID(props.meeting.url)}&pw=${this.getPW(props.meeting.url)}&mk=${props.meeting.meetingKey}`}><Button size="large" type="primary">启动会议</Button></a></Col></Row>
                :
                <Row><Col span={6} /><Col span={18}><a target="_blank" href={`https://investarget.webex.com.cn/investarget/m.php?AT=JM&MK=${props.meeting.meetingKey}&AN=${this.state.currentAttendee.name}&AE=${this.state.currentAttendee.email}`}><Button size="large" type="primary">加入会议</Button></a></Col></Row>
              }
            </div>}
          </div>
        }
      </div>
    );
  }
}

const rowStyle = {
  padding: '8px 0',
  fontSize: '13px',
}
const leftStyle = {
}
const rightStyle = {
  overflow: 'hidden',
}

const Field = (props) => {
  return (
    <Row style={rowStyle} gutter={24}>
      <Col span={6} style={leftStyle}>
        <div style={{textAlign: 'right'}}>{props.title}</div>
      </Col>
      <Col span={18} style={rightStyle}>
        <div dangerouslySetInnerHTML={{ __html: props.content && props.content.replace(/\n/g, '<br>') }} />
      </Col>
    </Row>
  )
}

export default connect()(withRouter(MySchedule));
