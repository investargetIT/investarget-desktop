import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Select, Radio, Form, Modal } from 'antd';
import moment from 'moment';
import { requestAllData, getCurrentUser, handleError, hasPerm, i18n } from '../utils/util';
import * as api from '../api';
import {
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import ScheduleForm from './ScheduleForm';

export default function MySchedule() {

  const [myScheduleList, setMyScheduleList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [calendarMode, setCalendarMode] = useState('month');

  
  const [proj, setProj] = useState(); // 新增时选中的项目
  const [oldSelectedProj, setOldSelectedProj] = useState(); // 新增时原来选中的项目
  const [targetEmail, setTargetEmail] = useState(''); // 目标邮箱，发送提醒邮件的邮箱地址
  const [user, setUser] = useState(null); // 选择的投资人

  const [visibleAdd, setVisibleAdd] = useState(false);

  const formRef = useRef(null);

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
    // window.echo('my schedule list', myScheduleList);
  }, [myScheduleList]);

  useEffect(() => {
    if (formRef.current) {
      const newValues = setAddFormData();
      formRef.current.setFieldsValue(newValues);
    }
  }, [proj, targetEmail]);

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
      if (hasPerm('usersys.as_trader') && hasPerm('usersys.user_adduser')) {
        const firstDayOfLastMonth = selectedDate.clone().subtract(1, 'M').startOf('month');
        const firstDayOfNextTwoMonths = selectedDate.clone().add(2, 'M').startOf('month');
        const params = {
          user: getCurrentUser(),
          startTime: firstDayOfLastMonth.format('YYYY-MM-DD'),
          endTime: firstDayOfNextTwoMonths.format('YYYY-MM-DD'),
          page_size: 1000
        };
        const requestReport = await requestAllData(api.getWorkReport, params, 1000);
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
        // onClick={this.handleClickEvent.bind(this, item)}
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
    if (calendarMode == 'month' && date.diff(moment(), 'days') >= 0) {
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
          onChange(value.clone().subtract(1, 'month'));
          break;
        case 'next_month':
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

  return (
    <div>
      <Calendar
        className="my-calendar"
        dateFullCellRender={dateCellRender}
        onPanelChange={onPanelChange}
        headerRender={({ value, type, onChange, onTypeChange }) => myCalendarHeaderRender(value, type, onChange, onTypeChange)}
        onSelect={onSelect}
      // value={selectedDate}
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
          title={i18n('schedule.add_event')}
          // onOk={this.addEvent}
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

    </div>
  );
}
