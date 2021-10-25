import React, { useState } from 'react';
import { Card, Popover } from 'antd';
import { Link } from 'dva/router';
import { i18n, hasPerm, isShowCNY, formatMoney } from '../utils/util';
import {
  FolderFilled,
  LockFilled,
} from '@ant-design/icons';
import _ from 'lodash';

const cardStyle = {
  height: '100%',
  overflow: 'hidden',
  width: 250,
}
const cardBodyStyle = {
  height: '100%',
  padding: 0,
}
const cardImageStyle = {
  height: '200px',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  // cursor: 'pointer',
}
const cardTitleStyle = {
  fontSize: '15px',
  marginBottom: '16px',
  height: '50px',
  overflow: 'hidden'
}
const cardTimeStyle = {
  marginBottom: '2px',
  fontSize: 12, 
  color: '#999',
  display: 'flex',
}
const cardIconBgStyle = {
  width: 80,
  height: 80,
  margin: '0 auto',
  marginBottom: 8,
  backgroundColor: 'rgba(255, 255, 255, .3)',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

export default function ProjectCardForUserCenter({ record, country: allCountries, currentUser }) {
  const dataroomId = record.id
  const projId = record.id
  const projTitle = record.projtitle
  const projTraders = record.projTraders || [];
  const projTradersUsers= projTraders.map(m => m.user);
  const uniqProjTraders = _.uniqBy(projTradersUsers, 'id');
  const dataroomUrl = `/app/dataroom/detail?id=${dataroomId}&isClose=${record.isClose}&projectID=${projId}&projectTitle=${encodeURIComponent(projTitle)}`
  const imgUrl = (record.industries && record.industries.length) ? encodeURI(record.industries[0].url) : ''

  const [displayHoverContent, setDisplayHoverContent] = useState(false);

  function handleMouseEnter() {
    setDisplayHoverContent(true);
  }

  // function handleMouseLeave() {
  //   setDisplayHoverContent(false);
  // }

  function getUserFunction() {
    let roles = projTraders.filter(f => f.user && f.user.id === currentUser);
    roles = roles.map(m => m.type === 0 ? '承揽' : '承做');
    if (roles.length > 0) {
      return roles.join('、');
    }
    return '暂无';
  }

  function displayFullTraderAvatars() {
    return (
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
        {uniqProjTraders.map((m, i) => (
          <Link key={m.id} to={`/app/personal-center/${m.id}`}>
          <img  style={{ marginRight: i < uniqProjTraders.length -1 ? 10 : 0, width: 30, height: 30, borderRadius: '50%' }} src={m.photourl} />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Card style={cardStyle} bodyStyle={cardBodyStyle}>

      <div
        style={{ ...cardImageStyle, backgroundImage: `url(${imgUrl})` }}
        onMouseEnter={handleMouseEnter}
      />

      <div style={{ padding: '16px' }}>
        <div style={cardTitleStyle}>
          <Link to={`/app/projects/${projId}`} target="_blank"><span style={{ fontSize: 16, color: '#282828' }}>{projTitle}</span></Link>
        </div>
        <div style={cardTimeStyle}>创建时间：{record.createdtime.slice(0, 10)}</div>
        <div style={cardTimeStyle}>项目职能：{getUserFunction()}</div>
        
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <Popover content={displayFullTraderAvatars()}>
            {uniqProjTraders.map((m, i) => (
              <img key={m.id} style={{ marginRight: -6, zIndex: uniqProjTraders.length - i, width: 20, height: 20, borderRadius: '50%' }} src={m.photourl} />
            ))}
            </Popover>
          </div>
        
      </div>

      {/* {displayHoverContent &&
        <div onMouseLeave={handleMouseLeave} style={{ backgroundColor: 'rgba(0, 0, 0, .6)', position: 'absolute', left: 0, right: 0, top: 0, height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Link to={`/app/org/bd?projId=${projId}`} style={{ width: '50%', textAlign: 'center', color: 'white' }}>
            <div style={cardIconBgStyle}><FolderFilled style={{ fontSize: 32 }} /></div>
            <div>机构看板</div>
          </Link>
          <Link to={dataroomUrl} style={{ width: '50%', textAlign: 'center', color: 'white' }}>
            <div style={cardIconBgStyle}><LockFilled style={{ fontSize: 32 }} /></div>
            <div>Data Room</div>
          </Link>
        </div>
      } */}

    </Card>
  )
}
