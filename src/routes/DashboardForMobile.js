import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Row, Col, Tooltip, Empty, Tabs, Carousel } from 'antd';
import LeftRightLayoutPureForMobile from '../components/LeftRightLayoutPureForMobile';
import {
  getUserInfo,
  i18n,
  trimTextIfExceedMaximumCount,
  getFilenameWithoutExt,
  formatBytes,
  getFileTypeByName,
  hasPerm,
  handleError,
  isLogin,
} from '../utils/util';
import ProjectCard from '../components/ProjectCard';
import * as api from '../api';
import { connect } from 'dva';
import { Link } from 'dva/router';
import ProjectBdTable from '../components/ProjectBdTable';
import OrgBdTable from '../components/OrgBdTable';
import {
  FilePdfFilled,
  FileWordFilled,
  FileFilled,
  FileImageFilled,
  FilePptFilled,
  FileExcelFilled,
  AudioFilled,
  VideoCameraFilled,
} from '@ant-design/icons';
import MySchedule from '../components/MySchedule';

const { TabPane } = Tabs;

function Dashboard(props) {

  return (
    <LeftRightLayoutPureForMobile location={props.location}>
      <div style={{ textAlign: 'center' }}>请使用手机扫描桌面版二维码</div>
    </LeftRightLayoutPureForMobile>
  );
}

function mapStateToProps(state) {
  const { country } = state.app
  return { country };
}

export default connect(mapStateToProps)(Dashboard);
