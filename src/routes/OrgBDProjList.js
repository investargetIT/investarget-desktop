import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, hasPerm, getCurrentUser, handleError } from '../utils/util'
import { Input, Icon, Table, Button, Pagination, Popconfirm, Card, Row, Col, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import * as api from '../api'
import { Search2 } from '../components/Search'

const rowStyle = {
  marginBottom: '24px',
}
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


class OrgBDProjList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      search: null,
      page: 1,
      pageSize: 12,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getOrgBDProjList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getOrgBDProjList)
  }

  getOrgBDProjList = () => {
    this.getData().catch(handleError);
  }

  getData = async () => {
    const { search, page, pageSize } = this.state;
    const params = {
      search,
      skip_count: (page - 1) * pageSize, 
      max_size: pageSize,
      bdm: [],
      projstatus: [4, 6, 7],
    };
    this.setState({ loading: true })

    const reqProj = await api.getProj(params);
    const { count: total, data: list } = reqProj.data;
    this.setState({ loading: false, total, list });
  }

  componentDidMount() {
    this.getOrgBDProjList()
  }

  render() {
    const { location } = this.props
    const { total, list, loading, search, page, pageSize } = this.state

    const count = list.length + 1
    const cols = 3
    const rows = Math.ceil(count / cols)

    function getRowCols(rowIndex) {
      if (rowIndex < rows - 1) {
        return cols
      } else {
        return count - cols * (rows - 1)
      }
    }

    const DataroomCard = ({ record }) => {

      const projId = record.id;
      const projTitle = record.projtitle
      const dataroomUrl = `/app/org/bd?projId=${projId}`;
      const imgUrl = (record.industries && record.industries.length) ? encodeURI(record.industries[0].url) : ''
      // const dataroomTime = record.createdtime.slice(0, 16).replace('T', ' ')
      return (
        <Card style={cardStyle} bodyStyle={cardBodyStyle}>

          <div style={{ ...cardImageStyle, backgroundImage: `url(${imgUrl})` }}></div>

          <div style={{ padding: '16px' }}>
            <div style={cardTitleStyle}>
              <Link to={`/app/projects/${projId}`} target="_blank"><span style={{ fontSize: 16, color: '#282828' }}>{projTitle}</span></Link>
            </div>
            {/* <div style={cardTimeStyle}>{i18n('dataroom.created_time')}: {dataroomTime}</div> */}
          </div>

          <Link to={dataroomUrl}>
            <div className="dataroom-cell-banner-bg" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 200 }} />
          </Link>

        </Card>
      )
    }

    return (
      <LeftRightLayout 
        location={location} 
        title="机构BD列表"
        right={<Search2 
          style={{width: 200}} 
          placeholder={!hasPerm('usersys.as_admin') && hasPerm('usersys.as_investor') ? i18n('dataroom.project_name') : [i18n('dataroom.project_name'), i18n('dataroom.investor')].join(' / ')} 
          defaultValue={search} 
          onSearch={this.handleSearch} 
        />}
      >
        <div>
          <div className="ant-spin-nested-loading">
            {/* Loading effect copied from antd Table Component */}
            {
              loading ? (
                <div>
                  <div className="ant-spin ant-spin-spinning ant-table-without-pagination ant-table-spin-holder">
                    <span className="ant-spin-dot"><i></i><i></i><i></i><i></i></span>
                  </div>
                </div>
              ) : null
            }

            <div className={loading ? 'ant-spin-blur ant-spin-container' : 'ant-spin-container'}>
              {
                _.range(rows).map(row =>
                  <Row gutter={24} key={row} style={rowStyle} type="flex" align="stretch">
                    {
                      _.range(getRowCols(row)).map(col => {
                          let index = cols * row + col // -1 减去 AddCard
                          let record = list[index]
                          return record ? <Col span={24/cols} key={col}><DataroomCard record={record} /></Col> : null
                      })
                    }
                  </Row>
                )
              }
            </div>
          </div>

          <Pagination
            style={{ marginTop: 50, marginBottom: 20, textAlign: 'center' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
          />
        </div>
      </LeftRightLayout>
    )
  }

}

export default connect()(OrgBDProjList)
