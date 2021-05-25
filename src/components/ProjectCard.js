import { Card, Button, Popconfirm, Progress } from 'antd';
import { Link } from 'dva/router';
import { i18n, hasPerm, isShowCNY, formatMoney } from '../utils/util';
import { DeleteOutlined } from '@ant-design/icons';

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
const cardActionStyle = {
  position: 'relative',
  textAlign: 'center',
}

export default function ProjectCard({ record, country: allCountries }) {
  const dataroomId = record.id
  const projId = record.id
  const projTitle = record.projtitle
  const dataroomUrl = `/app/dataroom/detail?id=${dataroomId}&isClose=${record.isClose}&projectID=${projId}&projectTitle=${encodeURIComponent(projTitle)}`
  const imgUrl = (record.industries && record.industries.length) ? encodeURI(record.industries[0].url) : ''
  const dataroomTime = record.publishDate && record.publishDate.slice(0, 16).replace('T', ' ');

  function handleCloseDateRoom() {}
  function deleteDataRoom() {}

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
        {/* <div style={cardActionStyle}>
          <Button onClick={handleCloseDateRoom(record)} size="large" disabled={!hasPerm('dataroom.admin_closedataroom')} style={{ border: 'none', backgroundColor: '#ebf0f3', color: '#656565' }}>{record.isClose ? i18n('common.open') : i18n('common.close')}</Button>
          {hasPerm('dataroom.admin_deletedataroom') ?
            <Popconfirm title={i18n("delete_confirm")} onConfirm={deleteDataRoom(record)}>
              <DeleteOutlined />
            </Popconfirm>
            : null}
        </div> */}
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
