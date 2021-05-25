import { Card, Button, Popconfirm } from 'antd';
import { Link } from 'dva/router';
import { i18n, hasPerm } from '../utils/util';
import { DeleteOutlined } from '@ant-design/icons';

const cardStyle = {
  height: '100%',
  overflow: 'hidden',
}
const cardBodyStyle = {
  height: '100%',
  padding: 0,
}
const cardImageStyle = {
  height: '200px',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  cursor: 'pointer',
}
const cardTitleStyle = {
  fontSize: '15px',
  marginBottom: '8px',
  height: '20px',
  overflow: 'hidden'
}
const cardTimeStyle = {
  marginBottom: '8px',
  fontSize: 12, 
  color: '#999'
}
const cardActionStyle = {
  position: 'relative',
  textAlign: 'center',
}

export default function ProjectCard({ record }) {
  const dataroomId = record.id
  const projId = record.id
  const projTitle = record.projtitle
  const dataroomUrl = `/app/dataroom/detail?id=${dataroomId}&isClose=${record.isClose}&projectID=${projId}&projectTitle=${encodeURIComponent(projTitle)}`
  const imgUrl = (record.industries && record.industries.length) ? encodeURI(record.industries[0].url) : ''
  const dataroomTime = record.publishDate && record.publishDate.slice(0, 16).replace('T', ' ');

  function handleCloseDateRoom() {}
  function deleteDataRoom() {}

  return (
    <Card style={cardStyle} bodyStyle={cardBodyStyle}>

      <div style={{ ...cardImageStyle, backgroundImage: `url(${imgUrl})` }}></div>

      <div style={{ padding: '16px' }}>
        <div style={cardTitleStyle}>
          <Link to={`/app/projects/${projId}`} target="_blank"><span style={{ fontSize: 16, color: '#282828' }}>{projTitle}</span></Link>
        </div>
        <div style={cardTimeStyle}>{i18n('dataroom.created_time')}: {dataroomTime}</div>
        <div style={cardActionStyle}>
          <Button onClick={handleCloseDateRoom(record)} size="large" disabled={!hasPerm('dataroom.admin_closedataroom')} style={{ border: 'none', backgroundColor: '#ebf0f3', color: '#656565' }}>{record.isClose ? i18n('common.open') : i18n('common.close')}</Button>
          {hasPerm('dataroom.admin_deletedataroom') ?
            <Popconfirm title={i18n("delete_confirm")} onConfirm={deleteDataRoom(record)}>
              <DeleteOutlined />
            </Popconfirm>
            : null}
        </div>
      </div>

      <Link to={dataroomUrl}>
        <div className="dataroom-cell-banner-bg" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 200 }} />
      </Link>

      {record.isClose ?
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0, 0, 0, .5)', textAlign: 'center', paddingTop: 270 }}>
          <Button
            onClick={this.handleCloseDateRoom.bind(this, record)}
            size="large"
            disabled={!hasPerm('dataroom.admin_closedataroom')}
            style={{ border: 'none', backgroundColor: '#ebf0f3', color: '#237ccc' }}>
            {record.isClose ? i18n('common.open') : i18n('common.close')}
          </Button>
        </div>
        : null}

    </Card>
  )
}
