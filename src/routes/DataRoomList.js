import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, hasPerm, getCurrentUser } from '../utils/util'
import { Input, Icon, Table, Button, Pagination, Popconfirm, Card, Row, Col, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import {
  RadioTrueOrFalse,
  CheckboxCurrencyType,
} from '../components/ExtraInput'
import { queryDataRoom, getProjLangDetail } from '../api'
import * as api from '../api'
import { Search2 } from '../components/Search'

const rowStyle = {
  marginBottom: '24px',
}
const addCardStyle = {
  height: '100%',
  overflow: 'hidden',
}
const addCardBodyStyle = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
// ...
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
const cardUserStyle = {
  fontSize: '13px',
  marginBottom: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
}
const cardActionStyle = {
  position: 'relative',
  textAlign: 'center',
}


class DataRoomList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = 11

    this.state = {
      search,
      page,
      pageSize,
      total: 0,
      list: [],
      loading: false,
      hint: '',
    }
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getDataRoomList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getDataRoomList)
  }

  // handlePageSizeChange = (current, pageSize) => {
  //   this.setState({ pageSize, page: 1 }, this.getDataRoomList)
  // }

  getDataRoomList = () => {
    const { search, page, pageSize } = this.state
    const params = { search, page_index: page, page_size: pageSize }
    this.setState({ loading: true })

    // if (hasPerm('usersys.as_admin')) {
      api.queryDataRoom(params).then(result => {
        const { count: total, data: list } = result.data
        this.setState({ loading: false, total, list, hint: total === 0 ? '暂无对您开放的DataRoom' : '' });
      }).catch(error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    // } else {
    //   api.queryUserDataRoom(params).then(result => {
    //     const { count: total, data: list } = result.data
    //     this.setState({ loading: false, total, list: list.map(item=>item.dataroom) })
    //   }).catch(error => {
    //     this.setState({ loading: false })
    //     this.props.dispatch({
    //       type: 'app/findError',
    //       payload: error
    //     })
    //   })
    // }

    this.writeSetting()
  }


  deleteDataRoom (dataroom) {
    this.setState({ loading: true })
    const id = dataroom.id
    api.deleteDataRoom(id)
      .then(data => this.getDataRoomList())
      .catch(err => {
        this.setState({ loading: false })
        this.props.dispatch({ type: 'app/findError', payload: err })
      })
  }

  handleCloseDateRoom (dataroom) {
    this.setState({ loading: true })
    const id = dataroom.id
    const body = {
      isClose: !dataroom.isClose,
    }
    api.editDataRoom(id, body)
    .then(data => this.getDataRoomList())
    .catch(err => {
      this.setState({ loading: false })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('DataRooomList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('DataRooomList')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getDataRoomList()
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

    const AddCard = function AddCard() {
      return (
        <Card style={addCardStyle} bodyStyle={addCardBodyStyle}>
          <Link to={'/app/projects/list'}>
            <div style={{ textAlign: 'center', cursor: 'pointer', color: 'rgba(0,0,0,.65)' }}>
              <Icon type="plus" style={{ fontSize: '84px', marginBottom: '16px', color: '#989898' }} />
              <br />
              <span style={{ fontSize: '16px', color: '#656565' }}>{i18n('dataroom.create_dataroom')}</span>
            </div>
          </Link>
        </Card>
      )
    }

    const DataroomCard = ({ record }) => {

      const dataroomId = record.id
      const projId = record.proj.id
      const projTitle = record.proj.projtitle
      const createUserID = record.createuser
      // const dataroomUrl = `/app/dataroom/detail?id=${dataroomId}&projectID=${projId}&investorID=${investorId}&traderID=${traderId}&projectOwnerID=${supportorId}&projectTitle=${encodeURIComponent(projTitle)}&isClose=${record.isClose}&createUserID=${createUserID}`
      const dataroomUrl = `/app/dataroom/detail?id=${dataroomId}&isClose=${record.isClose}&projectID=${projId}&projectTitle=${encodeURIComponent(projTitle)}`
      const imgUrl = (record.proj.industries && record.proj.industries.length) ? encodeURI(record.proj.industries[0].url) : ''
      const dataroomTime = record.createdtime.slice(0, 16).replace('T', ' ')
      return (
        <Card style={cardStyle} bodyStyle={cardBodyStyle}>

          <div style={{ ...cardImageStyle, backgroundImage: `url(${imgUrl})` }}></div>

          <div style={{ padding: '16px' }}>
            <div style={cardTitleStyle}>
              <Link to={`/app/projects/${projId}`} target="_blank"><span style={{ fontSize: 16, color: '#282828' }}>{projTitle}</span></Link>
            </div>
            <div style={cardTimeStyle}>{i18n('dataroom.created_time')}: {dataroomTime}</div>
            <div style={cardActionStyle}>
                <Button onClick={this.handleCloseDateRoom.bind(this, record)} size="large" disabled={!hasPerm('dataroom.admin_closedataroom')} style={{ border: 'none', backgroundColor: '#ebf0f3', color: '#656565' }}>{record.isClose ? i18n('common.open') : i18n('common.close')}</Button>
              { hasPerm('dataroom.admin_deletedataroom') ? 
              <Popconfirm title={i18n("delete_confirm")} onConfirm={this.deleteDataRoom.bind(this, record)}>
                <Icon type="delete" style={{ position: 'absolute', right: 0, lineHeight: '32px', cursor: 'pointer' }} />
              </Popconfirm>
              : null }
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

    return (
      <LeftRightLayout 
        location={location} 
        title={i18n('dataroom.dataroom_list')} 
        right={<Search2 
          style={{width: 200}} 
          placeholder={!hasPerm('usersys.as_admin') && hasPerm('usersys.as_investor') ? i18n('dataroom.project_name') : [i18n('dataroom.project_name'), i18n('dataroom.investor')].join(' / ')} 
          defaultValue={search} 
          onSearch={this.handleSearch} 
        />}
      >
        <div>{this.state.hint}</div>
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
                        if (!hasPerm('dataroom.admin_adddataroom')) {
                          let index = cols * row + col // -1 减去 AddCard
                          let record = list[index]
                          return record ? <Col span={24/cols} key={col}><DataroomCard record={record} /></Col> : null
                        }
                        if (row == 0 && col == 0) {
                          return <Col span={24/cols} key={col}><AddCard /></Col>
                        } else {
                          let index = cols * row + col - 1 // -1 减去 AddCard
                          let record = list[index]
                          return record ? <Col span={24/cols} key={col}><DataroomCard record={record} /></Col> : null
                        }
                      })
                    }
                  </Row>
                )
              }
            </div>
          </div>
          { total > 0 &&
          <Pagination
            style={{ marginTop: 50, marginBottom: 20, textAlign: 'center' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
          />
          }
        </div>
      </LeftRightLayout>
    )
  }

}

export default connect()(DataRoomList)
