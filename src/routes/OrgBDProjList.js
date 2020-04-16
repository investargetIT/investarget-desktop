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
      page_size: pageSize, 
      page_index: page,
      manager: [],
    };
    this.setState({ loading: true })

    // 首先请求所有以项目分组的机构BD
    const reqProj = await api.getOrgBDProj(params);
    const { count: total } = reqProj.data;

    // // 其次根据项目ID获取项目详情
    // const reqProjList = await api.getProj({ 
    //   ids: reqProj.data.data.filter(f => f.proj).map(m => m.proj), 
    //   max_size: pageSize, 
    // });
    // const { data: list } = reqProjList.data;

    const list = reqProj.data.data.filter(f => f.proj).map(m => m.proj);

    // 最后请求当前用户的未读机构BD的统计数据
    const reqUnreadOrgBD = await api.getOrgBDProj({
      proj: list.map(m => m.id),
      isRead: false,
      manager: [getCurrentUser()],
      page_size: list.length,
    });
   
    // 将未读机构BD项目与所有项目做匹配
    list.forEach(element => {
      const index = reqUnreadOrgBD.data.data.map(m => m.proj).indexOf(element.id);
      if (index > -1) {
        element.unReadOrgBDNum = reqUnreadOrgBD.data.data[index].count;
      }
    });

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
      let dataroomUrl = `/app/org/bd?projId=${projId}`; 
      if (record.unReadOrgBDNum > 0) {
        dataroomUrl += '&showUnreadOnly=true';
      }
      const imgUrl = (record.industries && record.industries.length) ? encodeURI(record.industries[0].url) : ''
      // const dataroomTime = record.createdtime.slice(0, 16).replace('T', ' ')
      return (
        <div style={{ padding: 10, position: 'relative' }}>

        <Card style={cardStyle} bodyStyle={cardBodyStyle}>

          <div style={{ ...cardImageStyle, backgroundImage: `url(${imgUrl})` }}></div>

          <div style={{ padding: '16px' }}>
            <div style={cardTitleStyle}>
              <Link to={`/app/projects/${projId}`} target="_blank"><span style={{ fontSize: 16, color: '#282828' }}>{projTitle}</span></Link>
            </div>
            {/* <div style={cardTimeStyle}>{i18n('dataroom.created_time')}: {dataroomTime}</div> */}
          </div>

          <Link to={dataroomUrl}>
            <div className="orgbd-cell-banner-bg" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 200 }} />
          </Link>

        </Card>

        { record.unReadOrgBDNum > 0 ?
        <div style={{ position: 'absolute', right: 0, top: 0, width: 20, height: 20, borderRadius: 10, background: 'red', color: 'white', textAlign: 'center' }}>{record.unReadOrgBDNum}</div>
        : null }

        </div>
      )
    }

    return (
      <LeftRightLayout 
        location={location} 
        title="机构BD列表"
        right={<Search2 
          style={{width: 200}} 
          placeholder="项目名称"
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
