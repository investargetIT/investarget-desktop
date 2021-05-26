import React, { useEffect, useState } from 'react';
import { Calendar } from 'antd';
import moment from 'moment';
import { requestAllData, getCurrentUser, handleError } from '../utils/util';
import * as api from '../api';
// import styles from '../router/Schedule';

export default function MySchedule() {

  const [myScheduleList, setMyScheduleList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [calendarMode, setCalendarMode] = useState('month');

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

  function onPanelChange(date, mode) {
    setSelectedDate(date);
    setCalendarMode(mode);
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

    //   // 周报相关逻辑
    //   if (hasPerm('usersys.as_trader') && hasPerm('usersys.user_adduser')) {
    //     const firstDayOfLastMonth = this.state.selectedDate.clone().subtract(1, 'M').startOf('month');
    //     const firstDayOfNextTwoMonths = this.state.selectedDate.clone().add(2, 'M').startOf('month');
    //     const params = {
    //       user: getCurrentUser(),
    //       startTime: firstDayOfLastMonth.format('YYYY-MM-DD'),
    //       endTime: firstDayOfNextTwoMonths.format('YYYY-MM-DD'),
    //       page_size: 1000
    //     };
    //     const requestReport = await requestAllData(api.getWorkReport, params, 1000);
    //     const reportList = requestReport.data.data.map(m => {
    //       const scheduledtime = moment(m.startTime).startOf('week').add('days', 4).format('YYYY-MM-DD');
    //       const comments = '周报';
    //       const type = 5; // 5 means already filled weekly report
    //       return { ...m, scheduledtime, comments, type };
    //     });

    //     const day1 = 5;
    //     const result1 = [];
    //     const current1 = firstDayOfLastMonth.clone();
    //     result1.push(current1.clone().day(day1));
    //     while (current1.day(7 + day1).isBefore(firstDayOfNextTwoMonths)) {
    //       result1.push(current1.clone());
    //     }
    //     result1.forEach((element, index) => {
    //       const dateStr = element.format('YYYY-MM-DD');
    //       if (!reportList.map(m => m.scheduledtime).includes(dateStr)) {
    //         list.push({
    //           scheduledtime: dateStr,
    //           comments: '周报',
    //           type: 6,
    //           id: index,
    //         });
    //       }
    //     });
    //     list = list.concat(reportList);
    //   }

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
    return (
      <ul className="events">
        {
          listData.map(item => (
            <li
              style={{ lineHeight: '20px' }}
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
            </li>
          ))
        }
      </ul>
    );
  }

  return (
    <Calendar
      dateCellRender={dateCellRender}
      onPanelChange={onPanelChange}
      // onSelect={this.onSelect}
      // value={selectedDate}
    />
  );
}
