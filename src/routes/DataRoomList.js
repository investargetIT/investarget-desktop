import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, hasPerm } from '../utils/util'
import { Input, Icon, Table, Button, Pagination, Popconfirm, Card, Row, Col } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import {
  RadioTrueOrFalse,
  CheckboxCurrencyType,
} from '../components/ExtraInput'
import { queryDataRoom, getUserBase, getProjLangDetail } from '../api'
import * as api from '../api'
import { Search2 } from '../components/Search'

const rowStyle = {
  marginBottom: '24px',
}
const addCardStyle = {
  height: '100%',
  borderRadius: '8px',
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
  borderRadius: '8px',
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
}
const cardTimeStyle = {
  marginBottom: '8px',
}
const cardUserStyle = {
  fontSize: '13px',
  marginBottom: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
}
const cardActionStyle = {
}


class DataRoomList extends React.Component {

  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

    this.state = {
      search,
      page,
      pageSize,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getDataRoomList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getDataRoomList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getDataRoomList)
  }

  getDataRoomList = () => {
    const { search, page, pageSize } = this.state
    const params = { search, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.queryDataRoom(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }


  deleteDataRoom (dataroom) {
    this.setState({ loading: true })
    const body = {
      proj: dataroom.proj.id,
      investor: dataroom.investor.id,
      trader: dataroom.trader.id
    }
    api.deleteDataRoom(body)
      .then(data => this.getDataRoomList())
      .catch(err => {
        this.setState({ loading: false })
        this.props.dispatch({ type: 'app/findError', payload: err })
      })
  }

  handleCloseDateRoom (dataroom) {
    this.setState({ loading: true })
    const body = {
      isClose: !dataroom.isClose,
      proj: dataroom.proj.id,
      investor: dataroom.investor.id,
      trader: dataroom.trader.id
    }
    api.editDataRoom(body)
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
              <Icon type="plus" style={{ fontSize: '64px', marginBottom: '16px' }} />
              <br />
              <span style={{ fontSize: '14px' }}>创建 DataRoom</span>
            </div>
          </Link>
        </Card>
      )
    }

    const DataroomCard = ({ record }) => {

      const dataroomId = record.id
      const projId = record.proj.id
      const investorId = record.investor.id
      const investorName = record.investor.username
      const traderId = record.trader.id
      const traderName = record.trader.username
      const supportorId = record.proj.supportUser.id
      const supportorName = record.proj.supportUser.username
      const projTitle = record.proj.projtitle
      const dataroomUrl = `/app/dataroom/detail?id=${dataroomId}&projectID=${projId}&investorID=${investorId}&traderID=${traderId}&projectOwnerID=${supportorId}&projectTitle=${encodeURIComponent(projTitle)}`
      const imgUrl = (record.proj.industries && record.proj.industries.length) ? record.proj.industries[0].url : ''
      const dataroomTime = record.createdtime.slice(0, 16).replace('T', ' ')

      return (
        <Card style={cardStyle} bodyStyle={cardBodyStyle}>
          <Link to={dataroomUrl}>
            <div style={{ ...cardImageStyle, backgroundImage: `url(${imgUrl})` }}></div>
          </Link>
          <div style={{ padding: '16px' }}>
            <div style={cardTitleStyle}>
              <Link to={`/app/projects/${projId}`} target="_blank">{projTitle}</Link>
            </div>
            <div style={cardTimeStyle}>创建时间: {dataroomTime}</div>
            <div style={cardUserStyle}>
              <span>投资人: <Link to={`/app/user/${investorId}`} target="_blank">{investorName}</Link></span>
              <span>交易师: <Link to={`/app/user/${traderId}`} target="_blank">{traderName}</Link></span>
              {
                hasPerm('usersys.as_investor') ? null : (
                  <span>项目方: <Link to={`/app/user/${supportorId}`} target="_blank">{supportorName}</Link></span>
                )
              }
            </div>
            <div style={cardActionStyle}>
              <Popconfirm title="Confirm to close ?" onConfirm={this.handleCloseDateRoom.bind(this, record)}>
                <Button size="small" disabled={!hasPerm('dataroom.admin_closedataroom')} style={{ marginRight: '8px' }}>{record.isClose ? '打开' : '关闭'}</Button>
              </Popconfirm>
              <Popconfirm title="Confirm to delete ?" onConfirm={this.deleteDataRoom.bind(this, record)}>
                <Button size="small" type="danger" disabled={!hasPerm('dataroom.admin_deletedataroom')}>{i18n("delete")}</Button>
              </Popconfirm>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <MainLayout location={location}>
        <div>
          <PageTitle title="Data Room" />

          <div style={{marginBottom: '16px'}}>
            <Search2 style={{width: 200}} placeholder={!hasPerm('usersys.as_admin') && hasPerm('usersys.as_investor') ? "项目名称" : "项目名称、投资人"} defaultValue={search} onSearch={this.handleSearch} />
          </div>

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

          <Pagination
            className="ant-table-pagination"
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handlePageSizeChange}
            showQuickJumper
          />
        </div>
      </MainLayout>
    )
  }

}

export default connect()(DataRoomList)
