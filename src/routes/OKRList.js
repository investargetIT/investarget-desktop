import React from 'react'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router';
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


class OKRList extends React.Component {

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
    this.setState({ search, page: 1 }, this.getOKRList)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getOKRList)
  }

  // handlePageSizeChange = (current, pageSize) => {
  //   this.setState({ pageSize, page: 1 }, this.getOKRList)
  // }

  getOKRList = async () => {
    const { search, page, pageSize } = this.state;
    const params = { search, page_index: page, page_size: pageSize };
    this.setState({ loading: true });
    try {
      const result = await api.getOKRList(params);
      const { count: total, data: list } = result.data;
      // const okrResult = await Promise.all(list.map(m => api.getOKRResult({ okr: m.id })));

      this.setState({ total, list });
    } catch (error) {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    } finally {
      this.setState({ loading: false });
    }
  }


  deleteDataRoom (dataroom) {
    this.setState({ loading: true })
    const id = dataroom.id
    api.deleteDataRoom(id)
      .then(data => this.getOKRList())
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
    .then(data => this.getOKRList())
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

  handleAddOKRCardClick = () => {
    this.props.router.push('/app/okr/add');
  }

  componentDidMount() {
    this.getOKRList()
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

    const AddCard = (props) => {
      return (
        <Card style={addCardStyle} bodyStyle={addCardBodyStyle} onClick={props.onClick}>
          <Link to={'/app/projects/list'}>
            <div style={{ textAlign: 'center', cursor: 'pointer', color: 'rgba(0,0,0,.65)' }}>
              <Icon type="plus" style={{ fontSize: '84px', marginBottom: '16px', color: '#989898' }} />
              <br />
              <span style={{ fontSize: '16px', color: '#656565' }}>编辑OKR</span>
            </div>
          </Link>
        </Card>
      );
    };

    const OKRCard = ({ record }) => {
      const { year, quarter, okrType, target } = record;
      return (
        <Card style={cardStyle} bodyStyle={cardBodyStyle}>
          <div>{year}</div>
          <div>{quarter}</div>
          <div>{okrType}</div>
          <div>{target}</div>
        </Card>
      );
    };

    return (
      <LeftRightLayout 
        location={location} 
        title="OKR"
        // right={<Search2 
        //   style={{width: 200}} 
        //   placeholder={!hasPerm('usersys.as_admin') && hasPerm('usersys.as_investor') ? i18n('dataroom.project_name') : [i18n('dataroom.project_name'), i18n('dataroom.investor')].join(' / ')} 
        //   defaultValue={search} 
        //   onSearch={this.handleSearch} 
        // />}
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
                        if (row == 0 && col == 0) {
                          return <Col span={24/cols} key={col}><AddCard onClick={this.handleAddOKRCardClick} /></Col>
                        } else {
                          let index = cols * row + col - 1 // -1 减去 AddCard
                          let record = list[index]
                          return record ? <Col span={24/cols} key={col}>
                            <Link to={`/app/okr/edit/${record.id}`}>
                            <OKRCard record={record} />
                              </Link></Col> : null
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

export default connect()(withRouter(OKRList));
