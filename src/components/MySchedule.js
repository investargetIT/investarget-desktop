import React, { useState } from 'react';
import { Calendar } from 'antd';

export default function MySchedule() {

  const [myScheduleList, setMyScheduleList] = useState([]);

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
              className={styles['event-type' + (item.type ? `-${item.type}` : '-3')]}
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
              {/* {item.type !== 4 && item.type !== 7 && item.comments} */}
            </li>
          ))
        }
      </ul>
    );
  }

  return (
    <Calendar
      dateCellRender={dateCellRender}
      // onPanelChange={this.onPanelChange}
      // onSelect={this.onSelect}
      // value={selectedDate}
    />
  );
}
