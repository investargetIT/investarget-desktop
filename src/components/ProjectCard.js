import { Card, Button, Progress } from 'antd';
import { Link } from 'dva/router';
import { i18n, hasPerm, isShowCNY, formatMoney } from '../utils/util';
import {
  FolderFilled,
  LockFilled,
} from '@ant-design/icons';

const cardStyle = {
  height: '100%',
  overflow: 'hidden',
  width: 260,
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

export default function ProjectCard({ record, country: allCountries }) {
  const dataroomId = record.id
  const projId = record.id
  const projTitle = record.projtitle
  const dataroomUrl = `/app/dataroom/detail?id=${dataroomId}&isClose=${record.isClose}&projectID=${projId}&projectTitle=${encodeURIComponent(projTitle)}`
  const imgUrl = (record.industries && record.industries.length) ? encodeURI(record.industries[0].url) : ''
  const dataroomTime = record.publishDate && record.publishDate.slice(0, 16).replace('T', ' ');

  function handleCloseDateRoom() {}

  function projectArea(record) {
    const country = record.country
    const countryName = country ? country.country : ''
    let imgUrl = country && country.key && country.url
    if (country && !imgUrl) {
      const parentCountry = allCountries.filter(f => f.id === country.parent)[0]
      if (parentCountry && parentCountry.url) {
        imgUrl = parentCountry.url
      }
    }
    return (
      <span style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        { imgUrl ? <img src={imgUrl} style={{ width: '20px', height: '14px', marginRight: '4px' }} /> : null}
        <span>{countryName}</span>
      </span>
    )
  }

  function transactionAmount(record) {
    if (allCountries.length == 0) return;
    if (isShowCNY(record, allCountries)) {
      return record.financeAmount ? formatMoney(record.financeAmount, 'CNY') : 'N/A';
    } else {
      return record.financeAmount_USD ? formatMoney(record.financeAmount_USD) : 'N/A';
    }
  }

  return (
    <Card style={cardStyle} bodyStyle={cardBodyStyle}>

      <div style={{ ...cardImageStyle, backgroundImage: `url(${imgUrl})` }}></div>

      <div style={{ padding: '16px' }}>
        <div style={cardTitleStyle}>
          <Link to={`/app/projects/${projId}`} target="_blank"><span style={{ fontSize: 16, color: '#282828' }}>{projTitle}</span></Link>
        </div>
        <div style={cardTimeStyle}>地区：{projectArea(record)}</div>
        <div style={cardTimeStyle}>拟交易规模：{transactionAmount(record)}</div>
        <Progress percent={50} size="small" strokeColor="#339bd2" />
      </div>


      <div style={{ backgroundColor: 'rgba(0, 0, 0, .6)', position: 'absolute', left: 0, right: 0, top: 0, height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

        <Link to={dataroomUrl} style={{ width: '50%', textAlign: 'center', color: 'white' }}>
          <div style={cardIconBgStyle}><FolderFilled style={{ fontSize: 32 }} /></div>
          <div>机构BD</div>
        </Link>

        <Link to={dataroomUrl} style={{ width: '50%', textAlign: 'center', color: 'white' }}>
          <div style={cardIconBgStyle}><LockFilled style={{ fontSize: 32 }} /></div>
          <div>Data Room</div>
        </Link>

      </div>

      {record.isClose ?
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0, 0, 0, .5)', textAlign: 'center', paddingTop: 270 }}>
          <Button
            onClick={handleCloseDateRoom(record)}
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
