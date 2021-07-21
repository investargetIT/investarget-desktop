import React from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import MySchedule from '../components/MySchedule';
import { connect } from 'dva';
import { Card } from 'antd';

function ScheduleNew(props) {
  return (
    <LeftRightLayoutPure location={props.location}>
      <Card title="工作日程">
        <MySchedule />
      </Card>
    </LeftRightLayoutPure>
  );
}

export default connect()(ScheduleNew);
