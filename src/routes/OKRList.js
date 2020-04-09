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
      for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const okrResult = await api.getOKRResult({ okr: element.id });
        const userDetail = await api.getUserInfo(element.createUser);
        element.okrResult = okrResult.data.data;
        element.userDetail = userDetail.data;
      }
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
    this.getOKRList();
  }

  handleDeleteBtnClick = (record) => {
    window.echo('delete okr', record);
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

    const OKRCard = ({ record, onDelete }) => {
      const { year, quarter, okrType, target, okrResult, userDetail } = record;
      const { username, photourl } = userDetail;
      return (
        <Card style={cardStyle} bodyStyle={cardBodyStyle}>
          <div style={{ display: 'flex' }}>
            <div><img style={{ width: 40, height: 40 }} src={photourl} /></div>
            <div>
              <div>
                <span>{username}</span>
                <span>{year}</span>
                <span>{quarter}</span>
              </div>
              <div>{target}</div>
              {okrResult.map(m => (
                <div key={m.id}>
                  <span>目标：</span>
                  <span>{m.krs}</span>
                  <span style={{ marginLeft: 10 }}>信心：</span>
                  <span>{m.confidence}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: '#f8f8f8', textAlign: 'center', lineHeight: 2 }} onClick={() => onDelete(record)}>删除</div>
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
                            <OKRCard record={record} onDelete={this.handleDeleteBtnClick} />
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
