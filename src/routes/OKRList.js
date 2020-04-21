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

  getOkrByUser = async () => {
    const result = await api.getOKRList();
    const { count: total } = result.data;
    if (total === 0) {
      return [];
    }
    const allOkrRes = await api.getOKRList({ page_size: total });
    const { data: allOkr } = allOkrRes.data;
    const allUserIds = allOkr.map(m => m.createuser);
    const uniqueUserIds = allUserIds.filter((v, i, a) => a.indexOf(v) === i);
    return uniqueUserIds.map((m) => {
      const okr = allOkr.filter(f => f.createuser === m);
      const { year, quarter } = okr[0];
      return { user: m, year, quarter, okr };
    });
  }

  getOKRList = async () => {
    const okrByUser = await this.getOkrByUser();

    for (let index = 0; index < okrByUser.length; index++) {
      const element = okrByUser[index];

      const userDetail = await api.getUserInfo(element.user);
      element.userDetail = userDetail.data;

      for (let index1 = 0; index1 < element.okr.length; index1++) {
        const element1 = element.okr[index1];
        const okrResult = await api.getOKRResult({ okr: element1.id });
        const { count } = okrResult.data;
        if (count === 0) {
          element1.okrResult = [];
        } else {
          const okrResult1 = await api.getOKRResult({ okr: element1.id, page_size: count });
          element1.okrResult = okrResult1.data.data;
        }
      }
    }
    window.echo('okr by user', okrByUser);
    this.setState({ list: okrByUser });
  }

  tryToGetOKRList = async () => {
    try {
      this.setState({ loading: true });
      await this.getOKRList();
    } catch (error) {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    } finally {
      this.setState({ loading: false });
    }
  }

  readSetting = () => {
    var data = localStorage.getItem('DataRooomList')
    return data ? JSON.parse(data) : null
  }

  handleAddOKRCardClick = () => {
    const index = this.state.list.map(m => m.user).indexOf(getCurrentUser());
    if (index > -1) {
      this.props.router.push(`/app/okr/edit/${getCurrentUser()}`);
    } else {
      this.props.router.push('/app/okr/add');
    }
  }

  componentDidMount() {
    this.tryToGetOKRList();
  }

  handleDeleteBtnClick = (record, e) => {
    e.preventDefault();
    window.echo('delete okr', record);
    Modal.confirm({
      title: '是否确定删除该OKR?',
      content: '一旦删除，无法撤销',
      onOk: this.handleConfirmDeleteOKR.bind(this, record),
    });
  }

  handleConfirmDeleteOKR = async (record) => {
    this.setState({ loading: true });
    const { okr } = record;
    for (let index = 0; index < okr.length; index++) {
      const element = okr[index];
      await Promise.all(element.okrResult.map(m => api.deleteOKRResult(m.id)));
      await api.deleteOKR(element.id);
    }
    this.tryToGetOKRList();
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
          <div style={{ textAlign: 'center', cursor: 'pointer', color: 'rgba(0,0,0,.65)' }}>
            <Icon type="plus" style={{ fontSize: '84px', marginBottom: '16px', color: '#989898' }} />
            <br />
            <span style={{ fontSize: '16px', color: '#656565' }}>编辑OKR</span>
          </div>
        </Card>
      );
    };

    const OKRCard = ({ record, onDelete }) => {
      const { year, quarter, userDetail, okr } = record;
      const { username, photourl, id: userId } = userDetail;
      return (
        <Card style={cardStyle} bodyStyle={cardBodyStyle}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 80 }}>
                <img style={{ width: 40, height: 40, margin: '20px auto', display: 'block', borderRadius: '50%' }} src={photourl} />
              </div>
              <div style={{ flex: 1, paddingTop: 20, paddingRight: 20, paddingBottom: 20 }}>
                <div style={{ color: 'black', fontWeight: 'bold' }}>
                  <span>{username}</span>
                  <span style={{ marginLeft: 10 }}>{year}年</span>
                  {quarter && <span style={{ marginLeft: 10 }}>第{quarter}季度</span>}
                </div>
                {okr.map((n) => {
                  return (
                    <div key={n.id}>
                      <div
                        style={{ marginTop: 10, color: '#333', fontWeight: 'bold' }}
                        dangerouslySetInnerHTML={{ __html: n.target ? n.target.replace(/\n/g, '<br>') : '' }}
                      />
                      {
                        n.okrResult.map(m => (
                          <div key={m.id} style={{ marginTop: 6, color: '#333' }}>
                            <span>关键结果：</span>
                            <span>{m.krs}</span>
                            <span style={{ marginLeft: 10 }}>信心指数：</span>
                            <span>{m.confidence}%</span>
                          </div>
                        ))
                      }
                    </div>
                  );
                })}
              </div>
            </div>
            {userId === getCurrentUser() && <div style={{ backgroundColor: '#f8f8f8', textAlign: 'center', lineHeight: 3, cursor: 'pointer' }} onClick={(e) => onDelete(record, e)}>删除</div>}
          </div>
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
                            {/* <Link to={`/app/okr/edit/${record.id}`}> */}
                            <OKRCard record={record} onDelete={this.handleDeleteBtnClick} />
                              {/* </Link> */}
                              </Col> : null
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
