import React, { useState } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';;
import { Breadcrumb } from 'antd';
import { getURLParamValue } from '../utils/util';

function DataroomDetails(props) {

  const id = getURLParamValue(props, 'id');
  const isClose = getURLParamValue(props, 'isClose');
  const projectID = getURLParamValue(props, 'projectID');
  const projectTitle = getURLParamValue(props, 'projectTitle');
  const parentID = getURLParamValue(props, 'parentID');

  const [projTitle, setProjectTitle] = useState(projectTitle);

  return (
    <LeftRightLayoutPure location={props.location}>
      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Data Room</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/app/dataroom/project/list">Data Room 列表</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>项目文件</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginLeft: 20, fontSize: 20, lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 'bold' }}>{projTitle}</div>

    </LeftRightLayoutPure>
  );
}

export default connect()(DataroomDetails);
